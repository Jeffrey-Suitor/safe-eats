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

#define MAXIMUM_RETRY 10

#define PROMPT_STR CONFIG_IDF_TARGET

#define INDICATOR_LIGHT BIT0
#define TOP_HEATING_ELEMENT BIT1
#define BOTTOM_HEATING_ELEMENT BIT2
#define CONVECTION_FAN BIT3
#define ROTISERRIE BIT4

#define EMERGENCY_STOP BIT0
#define WIFI_CONNECTED BIT1
#define WEBSOCKET_CONNECTED BIT2
#define WEBSOCKET_READY BIT3
#define IS_COOKING BIT4

extern EventGroupHandle_t DeviceStatus;
#endif
