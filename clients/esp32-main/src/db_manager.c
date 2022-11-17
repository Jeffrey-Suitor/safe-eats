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
#define MAX_REQ_LEN 1024
#define URL_LEN MAX_REQ_LEN * 2
#define BASE_URL "https://capstone-29ebb-default-rtdb.firebaseio.com"

void PostTemperatureTask(void *args) {
  Temperature temp;
  EventBits_t bits;
  while (true) {
    xQueuePeek(TempSensorQueue, &temp, portMAX_DELAY);
    ESP_LOGD(TAG, "Queue temperature C: %f, F: %f", temp.c, temp.f);
    bits = xEventGroupWaitBits(DeviceStatus, WEBSOCKET_CONNECTED, pdFALSE, pdTRUE, pdMS_TO_TICKS(1000));

    if (!(bits & WEBSOCKET_CONNECTED)) {
      ESP_LOGW(TAG, "Cannot post temperature because websocket not connected");
      continue;
    }

    cJSON *data = cJSON_CreateObject();
    cJSON_AddNumberToObject(data, "temperatureC", temp.c);
    cJSON_AddNumberToObject(data, "temperatureF", temp.f);
    cJSON_AddStringToObject(data, "id", ID);
    char *json_string = cJSON_Print(data);

    WebSocketMessage msg = {.method = "mutation", .path = "appliance.updateTemperature", .data = data};

    xQueueSend(WebsocketQueue, &msg, portMAX_DELAY);
    cJSON_free(json_string);
    cJSON_Delete(data);
  }
}

// void DefineInDatabaseTask(void *args) {
//   EventBits_t bits;
//   char url[URL_LEN] = {0};
//   char buf[MAX_REQ_LEN] = {0};
//   while (true) {
//     bits = xEventGroupWaitBits(DeviceStatus, WIFI_CONNECTED, pdFALSE,
//     pdFALSE,
//                                pdMS_TO_TICKS(1000));
//     if (!(bits & WIFI_CONNECTED)) {
//       ESP_LOGW(TAG, "Cannot define in databse: WIFI %d", bits &
//       WIFI_CONNECTED); continue;
//     }

//     sprintf(url, "%s/appliances/%s.json?print=pretty", BASE_URL, ID);
//     request(url, "GET", HTTP_METHOD_GET, "", buf);
//     TrimWhitespace(buf, MAX_REQ_LEN, buf);

//     if (strcmp(buf, "null") != 0) {
//       ESP_LOGI(TAG, "Device already defined in database");
//       xEventGroupSetBits(DeviceStatus, DEFINED_IN_DB);
//       vTaskDelay(pdMS_TO_TICKS(1000 * 60 * 60));
//       continue;
//     }

//     cJSON *request_data;
//     request_data = cJSON_CreateObject();
//     time_t now = time(NULL);
//     cJSON_AddNumberToObject(request_data, "cookingStartTime", 0);
//     cJSON_AddStringToObject(request_data, "id", ID);
//     cJSON_AddBoolToObject(request_data, "isCooking", false);
//     cJSON_AddNumberToObject(request_data, "temperatureC", 0);
//     cJSON_AddNumberToObject(request_data, "temperatureF", 0);
//     cJSON_AddNumberToObject(request_data, "timestamp", now);
//     cJSON_AddStringToObject(request_data, "type", APPLIANCE_TYPE);
//     char *json_string = cJSON_Print(request_data);
//     sprintf(url, "%s/appliances/%s.json", BASE_URL, ID);
//     request(url, "PATCH", HTTP_METHOD_PATCH, json_string, buf);
//     cJSON_Delete(request_data);
//     cJSON_free(json_string);
//     vTaskDelay(pdMS_TO_TICKS(5000));
//   }
// }

// void FetchRecipeTask(void *args) {
//   char qr_code[QR_CODE_LENGTH] = {0};
//   char url[URL_LEN] = {0};
//   char buf[MAX_REQ_LEN] = {0};
//   EventBits_t bits;
//   Recipe recipe;
//   while (true) {
//     xQueueReceive(QRCodeQueue, &qr_code, portMAX_DELAY);
//     ESP_LOGD(TAG, "Received QR code: %s", qr_code);
//     // bits = xEventGroupWaitBits(DeviceStatus, WIFI_CONNECTED |
//     DEFINED_IN_DB,
//     //                            pdFALSE, pdTRUE, pdMS_TO_TICKS(1000));

//     // if (!(bits & (WIFI_CONNECTED | DEFINED_IN_DB))) {
//     //   ESP_LOGE(TAG, "Failed to fetch recipe: WIFI: %d, DEFINED_IN_DB: %d",
//     //            bits & WIFI_CONNECTED, bits & DEFINED_IN_DB);
//     //   continue;
//     // }

//     // sprintf(url, "%s/qrCodes/%s.json?print=pretty", BASE_URL, qr_code);
//     // request(url, "GET", HTTP_METHOD_GET, "", buf);

//     // if (strcmp(buf, "null\n") == 0) { // TODO: Add a sound for bad qr
//     code.
//     //   ESP_LOGE(TAG, "QR code not defined in database");
//     //   vTaskDelay(5000);
//     //   continue;
//     // }

//     // cJSON *recipe_json = cJSON_Parse(buf);
//     // cJSON *str;

//     // str = cJSON_GetObjectItemCaseSensitive(recipe_json, "applianceMode");
//     // strcpy(recipe.appliance_mode, str->valuestring);

//     // str = cJSON_GetObjectItemCaseSensitive(recipe_json, "applianceTemp");
//     // recipe.appliance_temp = str->valuedouble;

//     // str = cJSON_GetObjectItemCaseSensitive(recipe_json,
//     "applianceTempUnit");
//     // strcpy(recipe.appliance_temp_unit, str->valuestring);

//     // str = cJSON_GetObjectItemCaseSensitive(recipe_json, "applianceType");
//     // strcpy(recipe.appliance_type, str->valuestring);

//     // str = cJSON_GetObjectItemCaseSensitive(recipe_json, "description");
//     // strcpy(recipe.description, str->valuestring);

//     // str = cJSON_GetObjectItemCaseSensitive(recipe_json, "duration");
//     // recipe.duration = str->valueint;

//     // str = cJSON_GetObjectItemCaseSensitive(recipe_json, "expiryDate");
//     // recipe.expiry_date = str->valueint;

//     // str = cJSON_GetObjectItemCaseSensitive(recipe_json, "id");
//     // strcpy(recipe.id, str->valuestring);

//     // str = cJSON_GetObjectItemCaseSensitive(recipe_json, "name");
//     // strcpy(recipe.name, str->valuestring);

//     Recipe recipe = {
//         .appliance_mode = "Bake",
//         .appliance_temp = 350,
//         .appliance_temp_unit = "F",
//         .appliance_type = "Toaster_Oven",
//         .description = "Bake a cake",
//         .duration = 60,
//         .expiry_date = 0,
//         .id = "123",
//         .name = "Cake",
//     };

//     xQueueOverwrite(RecipeQueue, &recipe);

//     ESP_LOGI(TAG, "Recipe: %s", buf);

//     // sprintf(url, "%s/appliances/%s/qrCode.json", BASE_URL, ID);
//     // request(url, "PATCH", HTTP_METHOD_PATCH, buf, buf);

//     // sprintf(url, "%s/qrCodes/%s.json", BASE_URL, qr_code);
//     // request(url, "DELETE", HTTP_METHOD_DELETE, buf, buf);

//     // cJSON_Delete(recipe_json);
//   }
// }

// void IsRunningTask(void *args) {
//   char url[URL_LEN] = {0};
//   char buf[MAX_REQ_LEN] = {0};
//   bool previous_status = false;
//   bool current_status = false;
//   EventBits_t bits;
//   while (true) {
//     bits = xEventGroupWaitBits(DeviceStatus, WIFI_CONNECTED | DEFINED_IN_DB,
//                                pdFALSE, pdTRUE, pdMS_TO_TICKS(1000));
//     if (!(bits & (WIFI_CONNECTED | DEFINED_IN_DB))) {
//       ESP_LOGW(TAG, "Cannot notify recipe status: WIFI: %d, DEFINED_IN_DB:
//       %d",
//                bits & WIFI_CONNECTED, bits & DEFINED_IN_DB);
//       continue;
//     }
//     bits = xEventGroupGetBits(DeviceStatus);
//     current_status = bits & IS_COOKING;
//     if (current_status == previous_status) {
//       vTaskDelay(1000);
//       continue;
//     }
//     previous_status = current_status;
//     cJSON *request_data;
//     request_data = cJSON_CreateObject();
//     time_t now = time(NULL);
//     cJSON_AddNumberToObject(request_data, "cookingStartTime",
//                             current_status ? now : 0);
//     cJSON_AddBoolToObject(request_data, "isCooking", current_status);
//     cJSON_AddNumberToObject(request_data, "timestamp", now);
//     char *json_string = cJSON_Print(request_data);

//     sprintf(url, "%s/appliances/%s.json", BASE_URL, ID);
//     request(url, "PATCH", HTTP_METHOD_PATCH, json_string, buf);

//     if (!current_status) {
//       sprintf(url, "%s/appliances/%s/qrCode.json", BASE_URL, ID);
//       request(url, "DELETE", HTTP_METHOD_DELETE, buf, buf);
//     }

//     cJSON_Delete(request_data);
//     cJSON_free(json_string);
//     vTaskDelay(1000 * 5);
//   }
// }

void SetupDBManager(void) {
  // xTaskCreate(FetchRecipeTask, "FetchRecipeTask", 4096 * 3, NULL, 2, NULL);
  xTaskCreate(PostTemperatureTask, "PostTemperatureTask", 4096 * 2, NULL, 3, NULL);
  // xTaskCreate(DefineInDatabaseTask, "DefineInDatabaseTask", 4096 * 2, NULL,
  // 2,
  //             NULL);
  // xTaskCreate(IsRunningTask, "IsRunningTask", 4096 * 2, NULL, 2, NULL);
}