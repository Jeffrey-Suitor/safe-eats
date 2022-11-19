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

QueueHandle_t DecodeRecipeQueue;

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

void SetQRCodeTask(void *args) {
  cJSON *data = cJSON_CreateObject();
  cJSON_AddStringToObject(data, "id", ID);
  cJSON_AddStringToObject(data, "qrCode", "unknown");
  char qrCode[QR_CODE_LENGTH];
  while (true) {
    xQueueReceive(QRCodeQueue, qrCode, portMAX_DELAY);
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

void SetRecipeTask(void *args) {
  JSONString jsonString = {.string = NULL, .length = 0};
  Recipe recipe;
  const cJSON *result = NULL;
  const cJSON *data = NULL;
  const cJSON *recipeJson = NULL;
  const cJSON *appliance_mode = NULL;
  const cJSON *appliance_temp = NULL;
  const cJSON *appliance_temp_unit = NULL;
  const cJSON *appliance_type = NULL;
  const cJSON *duration = NULL;
  const cJSON *expiry_date = NULL;
  const cJSON *id = NULL;

  while (true) {
    xQueueReceive(DecodeRecipeQueue, &jsonString, portMAX_DELAY);
    cJSON *json = cJSON_ParseWithLength(jsonString.string, jsonString.length);

    char *string = cJSON_Print(json);
    ESP_LOGW(TAG, "Received JSON: %s", string);
    cJSON_free(string);

    result = cJSON_GetObjectItemCaseSensitive(json, "result");
    data = cJSON_GetObjectItemCaseSensitive(result, "data");
    recipeJson = cJSON_GetObjectItemCaseSensitive(data, "json");

    char *string = cJSON_Print(recipeJson);
    ESP_LOGW(TAG, "Received JSON: %s", string);
    cJSON_free(string);

    appliance_mode = cJSON_GetObjectItemCaseSensitive(recipeJson, "appliance_mode");
    strcpy(recipe.appliance_mode, appliance_mode->valuestring);
    ESP_LOGE(TAG, "appliance_mode: %s", recipe.appliance_mode);

    appliance_temp = cJSON_GetObjectItemCaseSensitive(recipeJson, "appliance_temp");
    recipe.appliance_temp = appliance_temp->valuedouble;
    ESP_LOGE(TAG, "appliance_temp: %d", recipe.appliance_temp);

    appliance_temp_unit = cJSON_GetObjectItemCaseSensitive(recipeJson, "appliance_temp_unit");
    strcpy(recipe.appliance_temp_unit, appliance_temp_unit->valuestring);
    ESP_LOGE(TAG, "appliance_temp_unit: %s", recipe.appliance_temp_unit);

    appliance_type = cJSON_GetObjectItemCaseSensitive(recipeJson, "appliance_type");
    strcpy(recipe.appliance_type, appliance_type->valuestring);
    ESP_LOGE(TAG, "appliance_type: %s", recipe.appliance_type);

    duration = cJSON_GetObjectItemCaseSensitive(recipeJson, "duration");
    recipe.duration = duration->valuedouble;
    ESP_LOGE(TAG, "duration: %f", recipe.duration);

    expiry_date = cJSON_GetObjectItemCaseSensitive(recipeJson, "expiry_date");
    recipe.expiry_date = expiry_date->valuedouble;
    ESP_LOGE(TAG, "expiry_date: %f", recipe.expiry_date);

    id = cJSON_GetObjectItemCaseSensitive(recipeJson, "id");
    strcpy(recipe.id, id->valuestring);
    ESP_LOGE(TAG, "id: %s", recipe.id);

    cJSON_Delete(json);
  }
}

void SetupDBManager(void) {
  DecodeRecipeQueue = xQueueCreate(1, sizeof(JSONString));
  xTaskCreate(PostTemperatureTask, "PostTemperatureTask", 2048, NULL, 3, NULL);
  xTaskCreate(UpdateStatusTask, "UpdateStatusTask", 2048, NULL, 2, NULL);
  xTaskCreate(SetQRCodeTask, "SetQRCodeTask", 4096, NULL, 2, NULL);
  xTaskCreate(MonitorCookingStatusTask, "MonitorCookingStatusTask", 4096, NULL, 2, NULL);
  xTaskCreate(SetRecipeTask, "SetRecipeTask", 4096, NULL, 2, NULL);
}