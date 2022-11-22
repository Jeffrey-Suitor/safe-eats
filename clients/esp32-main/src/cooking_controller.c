#include "cooking_controller.h"

#include <string.h>

#include "buzzer.h"
#include "config.h"
#include "cooking_controller.h"
#include "driver/gpio.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/queue.h"
#include "lcd.h"
#include "relay_controller.h"
#include "temperature_sensor.h"
#include "time.h"
#define TAG "COOKING_CONTROLLER"

TaskHandle_t CookingController;
QueueHandle_t RecipeQueue;

void CookingControllerTask(void *PvParams) {
  float temperature = 0.0;
  Recipe recipe;
  Temperature temp_reading;
  EventBits_t heat_element_mask;
  EventBits_t bits;
  int count = 0;
  int hours;
  int minutes;
  int seconds;
  LCDMessage msg = {
      .row = 2,
      .col = 0,
      .text = "Time Left: ",
  };
  while (true) {
    xQueueReceive(RecipeQueue, &recipe, portMAX_DELAY);
    time_t startTime = time(NULL);
    while ((long long)startTime < 30000) {
      ESP_LOGW(TAG, "Time not yet synced. Waiting");
      vTaskDelay(1000);
      startTime = time(NULL);
    }
    msg.col = 0;
    strcpy(msg.text, "Time Left: ");
    xQueueSend(LCDQueue, &msg, portMAX_DELAY);
    msg.col = 11;
    xQueueSend(BuzzerQueue, (void *)&MealStarted, 100);
    xEventGroupSetBits(DeviceStatus, IS_COOKING);
    xEventGroupSetBits(RelayControllerFlags, INDICATOR_LIGHT);

    heat_element_mask = TOP_HEATING_ELEMENT | BOTTOM_HEATING_ELEMENT;
    if (strcmp(recipe.applianceMode, "Broil") == 0) {
      heat_element_mask = TOP_HEATING_ELEMENT;
    } else if (strcmp(recipe.applianceMode, "Convection") == 0) {
      xEventGroupSetBits(RelayControllerFlags, CONVECTION_FAN);
    } else if (strcmp(recipe.applianceMode, "Rotisserie") == 0) {
      xEventGroupSetBits(RelayControllerFlags, ROTISERRIE);
    }
    ESP_LOGV("Appliance mode", "%s", recipe.applianceMode);

    time_t remainingTime = time(NULL) - startTime;
    while (remainingTime < (recipe.cookingTime / 1000)) {  // convert to seconds
      if (!xQueuePeek(TempSensorQueue, &temp_reading, pdMS_TO_TICKS(1000))) {
        count++;
        if (count > 10) {
          ESP_LOGE(TAG, "Unable to read temperature sensor");
          break;
        }
      } else {
        count = 0;
      }

      temperature = strcmp(recipe.temperatureUnit, "C") == 0 ? temp_reading.c : temp_reading.f;
      if (abs(temperature - recipe.temperature) < 5) {
        continue;
      } else if (temperature < recipe.temperature) {
        xEventGroupSetBits(RelayControllerFlags, heat_element_mask);
      } else {
        xEventGroupClearBits(RelayControllerFlags, heat_element_mask);
      }

      // If we get a replacement recipe
      if (uxQueueMessagesWaiting(RecipeQueue)) {
        ESP_LOGW(TAG, "Received new recipe");
        break;
      }

      bits = xEventGroupWaitBits(DeviceStatus, EMERGENCY_STOP, pdFALSE, pdFALSE, pdMS_TO_TICKS(10));
      if (bits & EMERGENCY_STOP) {
        ESP_LOGE(TAG, "EMERGENCY STOP: STOPPING COOKING");
        break;
      }
      remainingTime = time(NULL) - startTime;

      // convert time in seconds to HH:MM:SS string
      hours = remainingTime / 3600;
      minutes = (remainingTime % 3600) / 60;
      seconds = remainingTime % 60;
      ESP_LOGI(TAG, "Remaining time: %02d:%02d:%02d", hours, minutes, seconds);
      sprintf(msg.text, "%02d:%02d:%02d", hours, minutes, seconds);
      xQueueSend(LCDQueue, &msg, pdMS_TO_TICKS(100));
    }
    xEventGroupClearBits(RelayControllerFlags, INDICATOR_LIGHT | TOP_HEATING_ELEMENT | BOTTOM_HEATING_ELEMENT | CONVECTION_FAN | ROTISERRIE);
    xEventGroupClearBits(DeviceStatus, IS_COOKING);
    xQueueSend(BuzzerQueue, (void *)&MealFinished, 100);
    vTaskDelay(5000);
  }
}

void SetupCookingController(void) {
  ESP_LOGD(TAG, "Setting up cooking controller");
  RecipeQueue = xQueueCreate(1, sizeof(Recipe));
  BaseType_t task = xTaskCreate(CookingControllerTask, "CookingControllerTask", 2048, NULL, 5, &CookingController);
  if (task == pdFALSE) ESP_LOGE(TAG, "Failed to create cooking controller task");
  ESP_LOGD(TAG, "Finished setting up cooking controller");
}
