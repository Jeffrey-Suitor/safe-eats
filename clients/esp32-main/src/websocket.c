#include "websocket.h"

#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <stdio.h>
#include <string.h>

#include "cJSON.h"
#include "config.h"
#include "cooking_controller.h"
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
#define WEBSOCKET_TIMEOUT 5
esp_websocket_client_handle_t CLIENT;
TimerHandle_t RESTART_TIMER;
QueueHandle_t WebsocketQueue;
TaskHandle_t Websocket;

static void restart_signaler(TimerHandle_t xTimer) {
  ESP_LOGI(TAG, "No data received for %d seconds, signaling shutdown", WEBSOCKET_TIMEOUT);
  esp_websocket_client_stop(CLIENT);
  esp_websocket_client_start(CLIENT);
}

static void websocket_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
  esp_websocket_event_data_t *data = (esp_websocket_event_data_t *)event_data;
  switch (event_id) {
    case WEBSOCKET_EVENT_CONNECTED:
      ESP_LOGI(TAG, "WEBSOCKET_EVENT_CONNECTED");
      xEventGroupSetBits(DeviceStatus, WEBSOCKET_CONNECTED);
      break;
    case WEBSOCKET_EVENT_DISCONNECTED:
      ESP_LOGI(TAG, "WEBSOCKET_EVENT_DISCONNECTED");
      xEventGroupClearBits(DeviceStatus, WEBSOCKET_CONNECTED);
      esp_websocket_client_start(CLIENT);
      break;
    case WEBSOCKET_EVENT_DATA:
      ESP_LOGI(TAG, "WEBSOCKET_EVENT_DATA");
      ESP_LOGI(TAG, "Received opcode=%d", data->op_code);
      ESP_LOGW(TAG, "Received=%.*s", data->data_len, (char *)data->data_ptr);
      ESP_LOGW(TAG, "Total payload length=%d, data_len=%d, current payload offset=%d\r\n", data->payload_len, data->data_len,
               data->payload_offset);

      xTimerReset(RESTART_TIMER, portMAX_DELAY);
      break;
    case WEBSOCKET_EVENT_ERROR:
      ESP_LOGI(TAG, "WEBSOCKET_EVENT_ERROR");
      break;
  }
}

void WebsocketTask(void *pvParameters) {
  esp_websocket_client_config_t websocket_cfg = {
      .uri = "ws://10.0.0.154",
      .port = 3001,
  };
  ESP_LOGI(TAG, "Connecting to %s:%d", websocket_cfg.uri, websocket_cfg.port);

  CLIENT = esp_websocket_client_init(&websocket_cfg);
  esp_websocket_register_events(CLIENT, WEBSOCKET_EVENT_ANY, websocket_event_handler, (void *)CLIENT);
  esp_websocket_client_start(CLIENT);

  RESTART_TIMER = xTimerCreate("Websocket shutdown timer", WEBSOCKET_TIMEOUT * 1000 / portTICK_PERIOD_MS, pdFALSE, NULL, restart_signaler);
  xTimerStart(RESTART_TIMER, portMAX_DELAY);

  char id[120];
  GetUniqueID(id);
  WebSocketMessage msg;
  while (true) {
    xQueueReceive(WebsocketQueue, &msg, portMAX_DELAY);
    ESP_LOGE(TAG, "Received");
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
    cJSON_AddStringToObject(output, "id", id);
    cJSON *params = cJSON_CreateObject();
    cJSON_AddItemToObject(output, "params", params);
    cJSON *input = cJSON_CreateObject();
    cJSON_AddItemToObject(params, "input", input);
    cJSON_AddStringToObject(output, "method", msg.method);
    cJSON_AddStringToObject(params, "path", msg.path);
    cJSON_AddItemToObject(input, "json", msg.data);

    char *json_str = cJSON_Print(output);
    int len = strlen(json_str);
    int sent = esp_websocket_client_send_text(CLIENT, json_str, len, portMAX_DELAY);
    ESP_LOGI(TAG, "SENT method: %s path: %s bytes: %d", msg.method, msg.path, len);
    ESP_LOGD(TAG, "data: %s", json_str);
    cJSON_free(json_str);
    cJSON_Delete(output);
  }
  esp_websocket_client_stop(CLIENT);
  ESP_LOGE(TAG, "Websocket Stopped");
  esp_websocket_client_destroy(CLIENT);
}

void SetupWebsocket() {
  WebsocketQueue = xQueueCreate(1, sizeof(WebSocketMessage));
  if (WebsocketQueue == NULL) {
    ESP_LOGE(TAG, "Failed to create WebsocketQueue");
  }

  xTaskCreate(WebsocketTask, "WebsocketTask", 4096 * 2, NULL, 1, &Websocket);
}
