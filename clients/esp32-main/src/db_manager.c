#include "db_manager.h"

#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <string.h>

#include "cJSON.h"
#include "config.h"
#include "cooking_controller.h"
#include "esp_crt_bundle.h"
#include "esp_http_client.h"
#include "esp_log.h"
#include "esp_tls.h"
#include "esp_wifi.h"
#include "helpers.h"
#include "qr_scanner.h"
#include "temperature_sensor.h"
#include "websocket.h"

#define TAG "DB_MANAGER"
#define BASE_URL "https://capstone-29ebb-default-rtdb.firebaseio.com"

void PostTemperatureTask(void *args) {
  Temperature temp;
  cJSON *data = cJSON_CreateObject();
  cJSON_AddNumberToObject(data, "temperatureC", 0);
  cJSON_AddNumberToObject(data, "temperatureF", 0);
  cJSON_AddStringToObject(data, "id", ID);

  while (true) {
    xQueueReceive(TempSensorQueue, &temp, portMAX_DELAY);
    cJSON_ReplaceItemInObjectCaseSensitive(data, "temperatureC", cJSON_CreateNumber(temp.c));
    cJSON_ReplaceItemInObjectCaseSensitive(data, "temperatureF", cJSON_CreateNumber(temp.f));
    WebSocketMessage msg = {.method = "mutation", .path = "appliance.updateTemperature", .data = data};
    xQueueSend(WebsocketQueue, &msg, portMAX_DELAY);
  }
  cJSON_Delete(data);
}

void UpdateStatusTask(void *args) {
  cJSON *data = cJSON_CreateObject();
  cJSON_AddStringToObject(data, "id", ID);
  cJSON_AddStringToObject(data, "type", "unknown");
  cJSON_AddStringToObject(data, "message", "unknown");
  StatusMessage msg;

  while (true) {
    xQueueReceive(StatusMessageQueue, &msg, portMAX_DELAY);
    cJSON_ReplaceItemInObjectCaseSensitive(data, "type", cJSON_CreateString(msg.type));
    cJSON_ReplaceItemInObjectCaseSensitive(data, "message", cJSON_CreateString(msg.message));
    WebSocketMessage msg = {.method = "mutation", .path = "appliance.updateStatus", .data = data};
    xQueueSend(WebsocketQueue, &msg, portMAX_DELAY);
  }
  cJSON_Delete(data);
}

void SetRecipeTask(void *args) {
  cJSON *data = cJSON_CreateObject();
  cJSON_AddStringToObject(data, "id", ID);
  cJSON_AddStringToObject(data, "qrCode", "unknown");
  char qrCode[QR_CODE_LENGTH];
  ESP_LOGE(TAG, "SetRecipeTask started");

  while (true) {
    xQueueReceive(QRCodeQueue, &qrCode, portMAX_DELAY);
    cJSON_ReplaceItemInObjectCaseSensitive(data, "qrCode", cJSON_CreateString(qrCode));
    WebSocketMessage msg = {.method = "mutation", .path = "appliance.setRecipe", .data = data};
    xQueueSend(WebsocketQueue, &msg, portMAX_DELAY);
  }
  cJSON_Delete(data);
}

void MonitorCookingStatusTask(void *args) {
  cJSON *data = cJSON_CreateObject();
  cJSON_AddStringToObject(data, "id", ID);
  EventBits_t bits;
  bool cookingStatus = false;
  bool newestCookingStatus = false;
  WebSocketMessage msg = {.method = "mutation", .data = data};

  while (true) {
    bits = xEventGroupGetBits(DeviceStatus);
    newestCookingStatus = bits & IS_COOKING;
    if (cookingStatus != newestCookingStatus) {
      cookingStatus = newestCookingStatus;
      strcpy(msg.path, cookingStatus ? "appliance.startCooking" : "appliance.stopCooking");
      xQueueSend(WebsocketQueue, &msg, portMAX_DELAY);
    } else {
      vTaskDelay(pdMS_TO_TICKS(1000));
    }
  }
  cJSON_Delete(data);
}

void SetupDBManager(void) {
  xTaskCreate(PostTemperatureTask, "PostTemperatureTask", 1024, NULL, 3, NULL);
  xTaskCreate(UpdateStatusTask, "UpdateStatusTask", 1024, NULL, 2, NULL);
  // xTaskCreate(SetRecipeTask, "SetRecipeTask", 1024, NULL, 2, NULL);
  xTaskCreate(MonitorCookingStatusTask, "MonitorCookingStatusTask", 1024, NULL, 2, NULL);
}