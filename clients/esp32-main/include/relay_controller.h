#ifndef RELAY_CONTROLLER
#define RELAY_CONTROLLER

#include <freertos/FreeRTOS.h>
#include <freertos/event_groups.h>

void SetupRelayController(void);
extern TaskHandle_t RelayController;
extern EventGroupHandle_t RelayControllerFlags;

#define INDICATOR_LIGHT_PIN GPIO_NUM_27
#define TOP_HEATING_ELEMENT_PIN GPIO_NUM_33
#define BOTTOM_HEATING_ELEMENT_PIN GPIO_NUM_32
#define CONVECTION_FAN_PIN GPIO_NUM_26
#define ROTISERRIE_PIN GPIO_NUM_25

#endif
