#include "websocket.h"

#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <stdio.h>
#include <string.h>

#include "cJSON.h"
#include "config.h"
#include "cooking_controller.h"
#include "db_manager.h"
#include "esp_crt_bundle.h"
#include "esp_event.h"
#include "esp_http_client.h"
#include "esp_log.h"
#include "esp_system.h"
#include "esp_tls.h"
#include "esp_websocket_client.h"
#include "esp_wifi.h"
#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/semphr.h"
#include "freertos/task.h"
#include "freertos/timers.h"
#include "helpers.h"
#include "nvs_flash.h"
#include "qr_scanner.h"
#include "temperature_sensor.h"

#define TAG "WEBSOCKET"
#define WEBSOCKET_TIMEOUT 10
esp_websocket_client_handle_t CLIENT;
TimerHandle_t SHUTDOWN_TIMER;
TimerHandle_t START_TIMER;
QueueHandle_t WebsocketQueue;
TaskHandle_t Websocket;

static void shutdown_signaler(TimerHandle_t xTimer) {
  EventBits_t bits = xEventGroupGetBits(DeviceStatus);
  if (!(bits & WEBSOCKET_READY)) {
    return;
  }

  ESP_LOGI(TAG, "No data received for %d seconds, signaling shutdown", WEBSOCKET_TIMEOUT);
  esp_websocket_client_stop(CLIENT);
  xEventGroupClearBits(DeviceStatus, WEBSOCKET_READY);
  xTimerStart(START_TIMER, 0);
  xTimerStop(SHUTDOWN_TIMER, 0);
}

static void start_signaler(TimerHandle_t xTimer) {
  EventBits_t bits = xEventGroupGetBits(DeviceStatus);
  if (bits & WEBSOCKET_READY) {
    return;
  }

  UBaseType_t msgCount = uxQueueMessagesWaiting(WebsocketQueue);
  if (msgCount == 0) {
    return;
  }

  ESP_LOGI(TAG, "Message waiting in queue, restarting websocket");
  esp_websocket_client_start(CLIENT);
  xTimerStart(SHUTDOWN_TIMER, 0);
  xTimerStop(START_TIMER, 0);
}

static void websocket_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
  esp_websocket_event_data_t *data = (esp_websocket_event_data_t *)event_data;
  switch (event_id) {
    case WEBSOCKET_EVENT_CONNECTED:
      ESP_LOGD(TAG, "WEBSOCKET_EVENT_CONNECTED");
      xEventGroupSetBits(DeviceStatus, WEBSOCKET_READY);
      break;
    case WEBSOCKET_EVENT_DISCONNECTED:
      ESP_LOGD(TAG, "WEBSOCKET_EVENT_DISCONNECTED");
      xEventGroupClearBits(DeviceStatus, WEBSOCKET_READY);
      break;
    case WEBSOCKET_EVENT_DATA:

      // Pong frame received
      if (data->op_code == 10) {
        break;
      }

      ESP_LOGD(TAG, "WEBSOCKET_EVENT_DATA");

      cJSON *json = cJSON_ParseWithLength(data->data_ptr, data->data_len);
      if (json == NULL) {
        const char *error_ptr = cJSON_GetErrorPtr();
        if (error_ptr != NULL) {
          ESP_LOGE(TAG, "Error before: %s", error_ptr);
        }
        cJSON_Delete(json);
        break;
      }

      cJSON *error = cJSON_GetObjectItemCaseSensitive(json, "error");
      if (cJSON_IsObject(error)) {
        char *errorJson = cJSON_Print(error);
        ESP_LOGE(TAG, "Error: %s", errorJson);
        cJSON_free(errorJson);
        cJSON_Delete(json);
        break;
      }

      char *requestId = cJSON_GetObjectItemCaseSensitive(json, "id")->valuestring;
      requestId = strtok(requestId, "::");
      requestId = strtok(NULL, "::");
      ESP_LOGI(TAG, "Request ID: %s", requestId);

      if (strcmp(requestId, "appliance.setRecipe") == 0) {
        JSONString json;
        json.length = data->data_len;
        strncpy(json.string, data->data_ptr, data->data_len);
        xQueueOverwrite(DecodeRecipeQueue, &json);
      }

      cJSON_Delete(json);
      xTimerReset(SHUTDOWN_TIMER, portMAX_DELAY);
      break;
    case WEBSOCKET_EVENT_ERROR:
      ESP_LOGI(TAG, "WEBSOCKET_EVENT_ERROR");
      break;
  }
}

void WebsocketTask(void *pvParameters) {
  esp_websocket_client_config_t websocket_cfg = {
      .uri = "ws://10.0.0.146",
      .port = 3001,
  };
  ESP_LOGI(TAG, "Connecting to %s:%d", websocket_cfg.uri, websocket_cfg.port);

  CLIENT = esp_websocket_client_init(&websocket_cfg);
  esp_websocket_register_events(CLIENT, WEBSOCKET_EVENT_ANY, websocket_event_handler, (void *)CLIENT);
  esp_websocket_client_start(CLIENT);

  WebSocketMessage msg;

  //{
  //   "id": "unique appliance id"
  //   "method" : *method,
  //   "params" : {
  //     "input" : {
  //       "json" : {
  //         *data
  //       }
  //     },
  //     "path" : *path
  //   }
  //}

  cJSON *output = cJSON_CreateObject();
  cJSON_AddStringToObject(output, "id", ID);
  cJSON *params = cJSON_CreateObject();
  cJSON_AddItemToObject(output, "params", params);
  cJSON *input = cJSON_CreateObject();
  cJSON_AddItemToObject(params, "input", input);
  cJSON_AddStringToObject(output, "method", "unknown");
  cJSON_AddStringToObject(params, "path", "unknown");
  cJSON_AddStringToObject(input, "json", "unknown");
  char id[256] = "";

  while (true) {
    xEventGroupWaitBits(DeviceStatus, WEBSOCKET_READY, pdFALSE, pdTRUE, portMAX_DELAY);
    xQueueReceive(WebsocketQueue, &msg, portMAX_DELAY);  // Guaranteed to have an item
    sprintf(id, "%s::%s", ID, msg.path);
    cJSON_ReplaceItemInObjectCaseSensitive(output, "id", cJSON_CreateString(id));
    cJSON_ReplaceItemInObjectCaseSensitive(output, "method", cJSON_CreateString(msg.method));
    cJSON_ReplaceItemInObjectCaseSensitive(params, "path", cJSON_CreateString(msg.path));

    cJSON *data = cJSON_ParseWithLength(msg.dataString.string, msg.dataString.length);
    cJSON_ReplaceItemInObjectCaseSensitive(input, "json", data);

    char *json_str = cJSON_Print(output);
    int len = strlen(json_str);
    int sent = esp_websocket_client_send_text(CLIENT, json_str, len, portMAX_DELAY);
    ESP_LOGI(TAG, "%s --> %s = %d bytes", msg.method, msg.path, sent);
    cJSON_free(json_str);
  }
  cJSON_Delete(output);
  esp_websocket_client_stop(CLIENT);
  ESP_LOGE(TAG, "Websocket Stopped");
  esp_websocket_client_destroy(CLIENT);
}

void SetupWebsocket() {
  WebsocketQueue = xQueueCreate(1, sizeof(WebSocketMessage));
  if (WebsocketQueue == NULL) {
    ESP_LOGE(TAG, "Failed to create WebsocketQueue");
  }

  xTaskCreate(WebsocketTask, "WebsocketTask", 4096, NULL, 3, &Websocket);

  SHUTDOWN_TIMER = xTimerCreate("Websocket shutdown timer", pdMS_TO_TICKS(WEBSOCKET_TIMEOUT * 1000), pdTRUE, NULL, shutdown_signaler);
  START_TIMER = xTimerCreate("Websocket start timer", pdMS_TO_TICKS(1000), pdTRUE, NULL, start_signaler);
  xTimerStart(START_TIMER, portMAX_DELAY);
}
