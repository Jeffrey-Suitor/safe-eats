#include <driver/gpio.h>
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <stdio.h>

#include "buzzer.h"
#include "config.h"
#include "console.h"
#include "cooking_controller.h"
#include "db_manager.h"
#include "esp_log.h"
#include "esp_sntp.h"
#include "flash.h"
#include "helpers.h"
#include "qr_scanner.h"
#include "relay_controller.h"
#include "temperature_sensor.h"
#include "websocket.h"
#include "wifi.h"

QueueHandle_t StatusMessageQueue;
EventGroupHandle_t DeviceStatus;
char ID[64];
char APPLIANCE_TYPE[64];
#define TAG "Main"

void app_main() {
  DeviceStatus = xEventGroupCreate();
  gpio_install_isr_service(0);
  SetupConsole();
  SetupFlash();

  // Get the device ID from the flash
  if (FlashGet(NVS_TYPE_STR, ID_KEY, ID, 64) != ESP_OK) {
    RESET_STRING_BUF(ID);
    GetUniqueID(ID);
    FlashSet(NVS_TYPE_STR, ID_KEY, ID, 64);
  }
  ESP_LOGI(TAG, "Device ID: %s", ID);

  FlashStringFallback(NVS_TYPE_STR, APPLIANCE_TYPE_KEY, APPLIANCE_TYPE, 64, DEFAULT_APPLIANCE_TYPE);
  ESP_LOGI(TAG, "Appliance Type: %s", APPLIANCE_TYPE);

  // Setup timesync
  sntp_setoperatingmode(SNTP_OPMODE_POLL);
  sntp_setservername(0, "pool.ntp.org");
  sntp_init();
  ESP_LOGD(TAG, "Time synced setup");

  StatusMessageQueue = xQueueCreate(3, sizeof(StatusMessage));

  SetupWifi();
  SetupTempSensor();
  SetupQRScanner();
  SetupWebsocket();
  SetupRelayController();
  SetupBuzzer();
  SetupCookingController();
  SetupDBManager();
}
