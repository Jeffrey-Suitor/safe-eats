#ifndef CONFIG
#define CONFIG

#include <driver/gpio.h>
#include <freertos/FreeRTOS.h>
#include <freertos/event_groups.h>

extern char ID[64];
#define ID_KEY "ID"
extern char APPLIANCE_TYPE[64];
#define APPLIANCE_TYPE_KEY "APPLIANCE_TYPE"
#define DEFAULT_APPLIANCE_TYPE "Toaster_Oven"

#define WIFI_SSID_KEY "WIFI_SSID"
#define WIFI_PASS_KEY "WIFI_PASS"
#define DEFAULT_WIFI_PASS "class1509finish"
#define DEFAULT_WIFI_SSID "SHAW-05C9"

#define MAXIMUM_RETRY 10

#define PROMPT_STR CONFIG_IDF_TARGET

#define INDICATOR_LIGHT BIT0
#define TOP_HEATING_ELEMENT BIT1
#define BOTTOM_HEATING_ELEMENT BIT2
#define CONVECTION_FAN BIT3
#define ROTISERRIE BIT4

#define EMERGENCY_STOP BIT0
#define WIFI_CONNECTED BIT1
#define WEBSOCKET_READY BIT2
#define DEFINED_IN_DB BIT3
#define IS_COOKING BIT4

extern EventGroupHandle_t DeviceStatus;
#endif
