#include "relay_controller.h"

#include "config.h"
#include "driver/gpio.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/task.h"
#include "hal/gpio_types.h"
#include "helpers.h"

#define TAG "RELAY_CONTROLLER"

TaskHandle_t RelayController;
EventGroupHandle_t RelayControllerFlags;

int RelayDevices[] = {
    INDICATOR_LIGHT_PIN, TOP_HEATING_ELEMENT_PIN, BOTTOM_HEATING_ELEMENT_PIN, CONVECTION_FAN_PIN, ROTISERRIE_PIN,
};

void RelayControllerTask(void *PvParams) {
  int i;
  const int length = NELEMS(RelayDevices);
  EventBits_t bits;
  while (true) {
    bits = xEventGroupWaitBits(DeviceStatus, EMERGENCY_STOP, pdFALSE, pdFALSE, pdMS_TO_TICKS(1000));

    // When emergency stop
    if (bits & EMERGENCY_STOP) {
      for (i = 0; i < length; i++) {
        ESP_LOGV(TAG, "EMERGENCY STOP --> INDEX: %d - VALUE: 1", i);
        gpio_set_level(RelayDevices[i], 0);
      }

      // Waiting for emergency stop to lift
      while (true) {
        vTaskDelay(pdMS_TO_TICKS(500));
        bits = xEventGroupWaitBits(DeviceStatus, EMERGENCY_STOP, pdFALSE, pdFALSE, pdMS_TO_TICKS(1000));
        if (bits & EMERGENCY_STOP) {
          ESP_LOGE(TAG, "Emergency stopped");
          break;
        }
      }
    }

    // When not cooking
    bits = xEventGroupWaitBits(DeviceStatus, IS_COOKING, pdFALSE, pdFALSE, pdMS_TO_TICKS(1000));
    if (!(bits & IS_COOKING)) {
      for (i = 0; i < length; i++) {
        ESP_LOGV(TAG, "NOT COOKING --> INDEX: %d - VALUE: 1", i);
        gpio_set_level(RelayDevices[i], 0);
      }
      continue;
    }

    // Regular operation
    bits = xEventGroupGetBits(RelayControllerFlags);
    static bool is_set;
    for (i = 0; i < length; i++) {
      is_set = ~bits & (1 << i);
      ESP_LOGV(TAG, "REGULAR --> INDEX: %d - VALUE: %d", i, is_set);
      gpio_set_level(RelayDevices[i], is_set);
    }
  }
}

void SetupRelayController(void) {
  ESP_LOGD(TAG, "Setting up relay controller");
  int pin_mask = 0;
  for (int i = 0; i < NELEMS(RelayDevices); i++) {
    BIT_SET(pin_mask, RelayDevices[i]);
  }

  gpio_config_t relay_gpio_config = {.pin_bit_mask = pin_mask,
                                     .mode = GPIO_MODE_OUTPUT,
                                     .pull_up_en = GPIO_PULLUP_DISABLE,
                                     .pull_down_en = GPIO_PULLDOWN_ENABLE,
                                     .intr_type = GPIO_INTR_DISABLE};

  gpio_config(&relay_gpio_config);

  RelayControllerFlags = xEventGroupCreate();

  BaseType_t task = xTaskCreate(RelayControllerTask, "RelayControllerTask", 4096, NULL, 5, &RelayController);

  if (task == pdFALSE) ESP_LOGE(TAG, "Failed to create relay controller task");
  ESP_LOGD(TAG, "Relay controller task created");
}
