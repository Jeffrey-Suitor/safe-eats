#ifndef COOKING_CONTROLLER
#define COOKING_CONTROLLER

#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>

extern QueueHandle_t RecipeQueue;
void SetupCookingController(void);

typedef struct Recipe {
  char appliance_mode[64];
  int appliance_temp;
  char appliance_temp_unit;
  char appliance_type[64];
  double duration;
  double expiry_date;
  char id[256];
} Recipe;

#endif
