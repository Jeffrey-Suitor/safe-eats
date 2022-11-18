#ifndef CONFIG
#define CONFIG

#include <driver/gpio.h>
#include <freertos/FreeRTOS.h>
#include <freertos/event_groups.h>

extern char ID[64];
#define ID_KEY "ID"
extern char APPLIANCE_TYPE[64];
#define APPLIANCE_TYPE_KEY "APPLIANCE_TYPE"
#define DEFAULT_APPLIANCE_TYPE "Toaster Oven"

#define WIFI_SSID_KEY "WIFI_SSID"
#define WIFI_PASS_KEY "WIFI_PASS"
#define DEFAULT_WIFI_PASS "class1509finish"
#define DEFAULT_WIFI_SSID "SHAW-05C9"

#define MAXIMUM_RETRY 10

#define PROMPT_STR CONFIG_IDF_TARGET

#define INDICATOR_LIGHT BIT0
#define INDICATOR_LIGHT_PIN GPIO_NUM_26
#define TOP_HEATING_ELEMENT BIT1
#define TOP_HEATING_ELEMENT_PIN GPIO_NUM_25
#define BOTTOM_HEATING_ELEMENT BIT2
#define BOTTOM_HEATING_ELEMENT_PIN GPIO_NUM_23
#define CONVECTION_FAN BIT3
#define CONVECTION_FAN_PIN GPIO_NUM_22
#define ROTISERRIE BIT4
#define ROTISERRIE_PIN GPIO_NUM_21

#define EMERGENCY_STOP BIT0
#define WIFI_CONNECTED BIT1
#define WEBSOCKET_READY BIT2
#define DEFINED_IN_DB BIT3
#define IS_COOKING BIT4

extern EventGroupHandle_t DeviceStatus;

typedef struct Recipe {
  char appliance_mode[64];
  double appliance_temp;
  char appliance_temp_unit[64];
  char appliance_type[64];
  char description[1024];
  time_t duration;
  time_t expiry_date;
  char id[1024];
  char name[64];
} Recipe;

#endif