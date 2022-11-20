#ifndef COOKING_CONTROLLER
#define COOKING_CONTROLLER

#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>

extern QueueHandle_t RecipeQueue;
void SetupCookingController(void);

typedef struct Recipe {
  char applianceMode[64];
  int temperature;
  char temperatureUnit[4];
  char applianceType[64];
  double cookingTime;
  double expiryDate;
  char id[256];
} Recipe;

#endif
