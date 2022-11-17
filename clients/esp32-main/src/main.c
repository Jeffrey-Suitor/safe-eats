/* ESP HTTP Client Example

   This example code is in the Public Domain (or CC0 licensed, at your option.)

   Unless required by applicable law or agreed to in writing, this
   software is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
   CONDITIONS OF ANY KIND, either express or implied.
*/

#include "cJSON.h"
#include "esp_event.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "nvs_flash.h"
#include <stdio.h>

#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/semphr.h"
#include "freertos/task.h"

#include "esp_event.h"
#include "esp_log.h"
#include "esp_websocket_client.h"

#define NO_DATA_TIMEOUT_SEC 20

static const char *TAG = "WEBSOCKET";

static TimerHandle_t shutdown_signal_timer;
static SemaphoreHandle_t shutdown_sema;

static void shutdown_signaler(TimerHandle_t xTimer) {
  ESP_LOGI(TAG, "No data received for %d seconds, signaling shutdown",
           NO_DATA_TIMEOUT_SEC);
  xSemaphoreGive(shutdown_sema);
}

static void websocket_event_handler(void *handler_args, esp_event_base_t base,
                                    int32_t event_id, void *event_data) {
  esp_websocket_event_data_t *data = (esp_websocket_event_data_t *)event_data;
  switch (event_id) {
  case WEBSOCKET_EVENT_CONNECTED:
    ESP_LOGI(TAG, "WEBSOCKET_EVENT_CONNECTED");
    break;
  case WEBSOCKET_EVENT_DISCONNECTED:
    ESP_LOGI(TAG, "WEBSOCKET_EVENT_DISCONNECTED");
    break;
  case WEBSOCKET_EVENT_DATA:
    ESP_LOGI(TAG, "WEBSOCKET_EVENT_DATA");
    ESP_LOGI(TAG, "Received opcode=%d", data->op_code);
    ESP_LOGW(TAG, "Received=%.*s", data->data_len, (char *)data->data_ptr);
    ESP_LOGW(
        TAG,
        "Total payload length=%d, data_len=%d, current payload offset=%d\r\n",
        data->payload_len, data->data_len, data->payload_offset);

    xTimerReset(shutdown_signal_timer, portMAX_DELAY);
    break;
  case WEBSOCKET_EVENT_ERROR:
    ESP_LOGI(TAG, "WEBSOCKET_EVENT_ERROR");
    break;
  }
}

static void format_ws_obj(cJSON *output, char *path, char *method,
                          cJSON *data) {
  //   "method" : *method,
  //   "params" : {
  //     "input" : {
  //       "json" : {
  //         *data
  //       }
  //     },
  //     "path" : *path
  //   }
  // }
  char id[120] = "";
  sprintf(id, "%s-%s", path, method);
  cJSON_AddItemToObject(output, "id", cJSON_CreateString(id));
  cJSON_AddItemToObject(output, "method", cJSON_CreateString(method));
  cJSON *params = cJSON_CreateObject();
  cJSON_AddItemToObject(output, "params", params);
  cJSON_AddItemToObject(params, "path", cJSON_CreateString(path));
  cJSON *input = cJSON_CreateObject();
  cJSON_AddItemToObject(params, "input", input);
  cJSON_AddItemToObject(input, "json", data);
}

static void websocket_app_start(void) {
  esp_websocket_client_config_t websocket_cfg = {
      .uri = "ws://10.0.0.154",
      .port = 3001,
  };

  shutdown_signal_timer =
      xTimerCreate("Websocket shutdown timer",
                   NO_DATA_TIMEOUT_SEC * 1000 / portTICK_PERIOD_MS, pdFALSE,
                   NULL, shutdown_signaler);
  shutdown_sema = xSemaphoreCreateBinary();

  ESP_LOGI(TAG, "Connecting to %s...", websocket_cfg.uri);

  esp_websocket_client_handle_t client =
      esp_websocket_client_init(&websocket_cfg);
  esp_websocket_register_events(client, WEBSOCKET_EVENT_ANY,
                                websocket_event_handler, (void *)client);

  esp_websocket_client_start(client);
  xTimerStart(shutdown_signal_timer, portMAX_DELAY);

  cJSON *data = cJSON_CreateObject();
  cJSON_AddNumberToObject(data, "temperatureC", 30);
  cJSON_AddNumberToObject(data, "temperatureF", 30);
  cJSON_AddStringToObject(data, "id", "e689efaa-59d6-48cf-88f9-fbd346e60e76");
  cJSON *output = cJSON_CreateObject();
  format_ws_obj(output, "appliance.updateTemperature", "mutation", data);
  char *json_str = cJSON_Print(output);

  while (1) {
    if (esp_websocket_client_is_connected(client)) {
      int len = strlen(json_str);
      int sent =
          esp_websocket_client_send_text(client, json_str, len, portMAX_DELAY);
      ESP_LOGE(TAG, "Sent %d bytes", sent);
    }
    vTaskDelay(1000 / portTICK_RATE_MS);
  }

  ESP_LOGE(TAG, "%s", json_str);
  cJSON_Delete(output);
  cJSON_free(json_str);

  vTaskDelay(1000 / portTICK_RATE_MS);

  xSemaphoreTake(shutdown_sema, portMAX_DELAY);
  esp_websocket_client_stop(client);
  ESP_LOGI(TAG, "Websocket Stopped");
  esp_websocket_client_destroy(client);
}

static void WifiEventHandler(void *arg, esp_event_base_t event_base,
                             int32_t event_id, void *event_data) {
  switch (event_id) {
  case WIFI_EVENT_STA_START:
    ESP_LOGI(TAG, "WIFI STARTED");
    esp_wifi_connect();
    break;
  case WIFI_EVENT_STA_DISCONNECTED:
    ESP_LOGI(TAG, "WIFI DISCONNECTED");
    esp_wifi_connect();
    // xEventGroupClearBits(DeviceStatus, WIFI_CONNECTED);
    break;
  case IP_EVENT_STA_GOT_IP:
    ESP_LOGI(TAG, "WIFI ACTIVE");
    // xEventGroupSetBits(DeviceStatus, WIFI_CONNECTED);
    break;
  default:
    break;
  }
}

void app_main(void) {
  ESP_LOGI(TAG, "[APP] Startup..");
  ESP_LOGI(TAG, "[APP] Free memory: %d bytes", esp_get_free_heap_size());
  ESP_LOGI(TAG, "[APP] IDF version: %s", esp_get_idf_version());
  // esp_log_level_set("*", ESP_LOG_INFO);
  // esp_log_level_set("WEBSOCKET_CLIENT", ESP_LOG_DEBUG);
  // esp_log_level_set("TRANS_TCP", ESP_LOG_DEBUG);

  ESP_ERROR_CHECK(nvs_flash_init());
  // ESP_ERROR_CHECK(esp_netif_init());
  // ESP_ERROR_CHECK(esp_event_loop_create_default());

  /* This helper function configures Wi-Fi or Ethernet, as selected in
   * menuconfig. Read "Establishing Wi-Fi or Ethernet Connection" section in
   * examples/protocols/README.md for more information about this function.
   */
  ESP_LOGD(TAG, "Setting up wifi");
  ESP_ERROR_CHECK(esp_netif_init());
  ESP_ERROR_CHECK(esp_event_loop_create_default());
  esp_netif_create_default_wifi_sta();

  wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
  ESP_ERROR_CHECK(esp_wifi_init(&cfg));

  ESP_ERROR_CHECK(esp_event_handler_instance_register(
      ESP_EVENT_ANY_BASE, ESP_EVENT_ANY_ID, &WifiEventHandler, NULL, NULL));

  char wifi_ssid[32] = "SHAW-05C9";
  char wifi_pass[32] = "class1509finish";

  wifi_config_t wifi_config = {
      .sta = {.threshold.authmode = WIFI_AUTH_WPA2_PSK,
              .pmf_cfg = {.capable = true, .required = false}}};
  memcpy(wifi_config.sta.ssid, wifi_ssid, sizeof(wifi_ssid));
  memcpy(wifi_config.sta.password, wifi_pass, sizeof(wifi_pass));

  ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
  ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
  ESP_ERROR_CHECK(esp_wifi_start());
  ESP_LOGD(TAG, "Wifi setup complete");

  websocket_app_start();
}