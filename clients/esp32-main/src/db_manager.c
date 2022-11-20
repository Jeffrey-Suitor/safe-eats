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

void createDataString(JSONString *jsonString, cJSON *data) {
  char *dataString = cJSON_Print(data);
  strcpy(jsonString->string, dataString);
  jsonString->length = strlen(dataString);
  cJSON_free(dataString);
}

void PostTemperatureTask(void *args) {
  Temperature temp;
  cJSON *data = cJSON_CreateObject();
  cJSON_AddNumberToObject(data, "temperatureC", 0);
  cJSON_AddNumberToObject(data, "temperatureF", 0);
  cJSON_AddStringToObject(data, "id", ID);
  WebSocketMessage msg = {.method = "mutation", .path = "appliance.updateTemperature"};
  while (true) {
    xQueueReceive(TempSensorQueue, &temp, portMAX_DELAY);
    cJSON_ReplaceItemInObjectCaseSensitive(data, "temperatureC", cJSON_CreateNumber(temp.c));
    cJSON_ReplaceItemInObjectCaseSensitive(data, "temperatureF", cJSON_CreateNumber(temp.f));
    createDataString(&msg.dataString, data);
    ESP_LOGV(TAG, "Sending temperature data: %s", msg.dataString.string);
    xQueueSend(WebsocketQueue, &msg, portMAX_DELAY);
  }
  cJSON_Delete(data);
}

void UpdateStatusTask(void *args) {
  cJSON *data = cJSON_CreateObject();
  cJSON_AddStringToObject(data, "id", ID);
  cJSON_AddStringToObject(data, "type", "unknown");
  cJSON_AddStringToObject(data, "message", "unknown");
  WebSocketMessage msg = {.method = "mutation", .path = "appliance.updateStatus"};
  StatusMessage status;

  while (true) {
    xQueueReceive(StatusMessageQueue, &status, portMAX_DELAY);
    cJSON_ReplaceItemInObjectCaseSensitive(data, "type", cJSON_CreateString(status.type));
    cJSON_ReplaceItemInObjectCaseSensitive(data, "message", cJSON_CreateString(status.message));
    createDataString(&msg.dataString, data);
    ESP_LOGV(TAG, "Sending status update: %s", msg.dataString.string);
    xQueueSend(WebsocketQueue, &msg, portMAX_DELAY);
  }
  cJSON_Delete(data);
}

void SetQRCodeTask(void *args) {
  cJSON *data = cJSON_CreateObject();
  cJSON_AddStringToObject(data, "id", ID);
  cJSON_AddStringToObject(data, "qrCode", "unknown");
  char qrCode[QR_CODE_LENGTH] = "";
  WebSocketMessage msg = {.method = "mutation", .path = "appliance.setRecipe"};

  while (true) {
    xQueueReceive(QRCodeQueue, &qrCode, portMAX_DELAY);
    cJSON_ReplaceItemInObjectCaseSensitive(data, "qrCode", cJSON_CreateString(qrCode));
    createDataString(&msg.dataString, data);
    ESP_LOGV(TAG, "Sending QR Code: %s", qrCode);
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

  WebSocketMessage msg = {.method = "mutation"};
  createDataString(&msg.dataString, data);
  while (true) {
    bits = xEventGroupGetBits(DeviceStatus);
    newestCookingStatus = bits & IS_COOKING;
    if (cookingStatus != newestCookingStatus) {
      cookingStatus = newestCookingStatus;
      strcpy(msg.path, cookingStatus ? "appliance.cookingStart" : "appliance.cookingStop");
      ESP_LOGV(TAG, "Setting cooking status to %s", cookingStatus ? "true" : "false");
      xQueueSend(WebsocketQueue, &msg, portMAX_DELAY);
    } else {
      vTaskDelay(pdMS_TO_TICKS(1000));
    }
  }
  cJSON_Delete(data);
}

void SetRecipeTask(void *args) {
  JSONString jsonString;
  Recipe recipe;
  const cJSON *result = NULL;
  const cJSON *data = NULL;
  const cJSON *recipeJson = NULL;
  const cJSON *applianceMode = NULL;
  const cJSON *temperature = NULL;
  const cJSON *temperatureUnit = NULL;
  const cJSON *applianceType = NULL;
  const cJSON *cookingTime = NULL;
  const cJSON *expiryDate = NULL;
  const cJSON *id = NULL;

  while (true) {
    xQueueReceive(DecodeRecipeQueue, &jsonString, portMAX_DELAY);
    cJSON *json = cJSON_ParseWithLength(jsonString.string, jsonString.length);

    result = cJSON_GetObjectItemCaseSensitive(json, "result");
    data = cJSON_GetObjectItemCaseSensitive(result, "data");
    recipeJson = cJSON_GetObjectItemCaseSensitive(data, "json");

    applianceMode = cJSON_GetObjectItemCaseSensitive(recipeJson, "applianceMode");
    strcpy(recipe.applianceMode, applianceMode->valuestring);
    ESP_LOGV(TAG, "applianceMode: %s", recipe.applianceMode);

    temperature = cJSON_GetObjectItemCaseSensitive(recipeJson, "temperature");
    recipe.temperature = temperature->valuedouble;
    ESP_LOGV(TAG, "temperature: %d", recipe.temperature);

    temperatureUnit = cJSON_GetObjectItemCaseSensitive(recipeJson, "temperatureUnit");
    strcpy(recipe.temperatureUnit, temperatureUnit->valuestring);
    ESP_LOGV(TAG, "temperatureUnit: %s", recipe.temperatureUnit);

    applianceType = cJSON_GetObjectItemCaseSensitive(recipeJson, "applianceType");
    strcpy(recipe.applianceType, applianceType->valuestring);
    ESP_LOGV(TAG, "applianceType: %s", recipe.applianceType);

    cookingTime = cJSON_GetObjectItemCaseSensitive(recipeJson, "cookingTime");
    recipe.cookingTime = cookingTime->valuedouble;
    ESP_LOGV(TAG, "cookingTime: %f", recipe.cookingTime);

    expiryDate = cJSON_GetObjectItemCaseSensitive(recipeJson, "expiryDate");
    recipe.expiryDate = expiryDate->valuedouble;
    ESP_LOGV(TAG, "expiryDate: %f", recipe.expiryDate);

    id = cJSON_GetObjectItemCaseSensitive(recipeJson, "id");
    strcpy(recipe.id, id->valuestring);
    ESP_LOGV(TAG, "id: %s", recipe.id);

    xQueueSend(RecipeQueue, &recipe, portMAX_DELAY);
    cJSON_Delete(json);
  }
}

void SetupDBManager(void) {
  DecodeRecipeQueue = xQueueCreate(1, sizeof(JSONString));
  xTaskCreate(PostTemperatureTask, "PostTemperatureTask", 4096, NULL, 2, NULL);
  xTaskCreate(UpdateStatusTask, "UpdateStatusTask", 4096, NULL, 3, NULL);
  xTaskCreate(SetQRCodeTask, "SetQRCodeTask", 4096, NULL, 1, NULL);
  xTaskCreate(MonitorCookingStatusTask, "MonitorCookingStatusTask", 4096, NULL, 3, NULL);
  xTaskCreate(SetRecipeTask, "SetRecipeTask", 4096, NULL, 1, NULL);
}