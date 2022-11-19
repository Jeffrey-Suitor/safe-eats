#ifndef DB_MANAGER
#define DB_MANAGER
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
extern void SetupDBManager(void);
extern QueueHandle_t StatusMessageQueue;
extern QueueHandle_t DecodeRecipeQueue;

typedef struct StatusMessage {
  char *type;
  char *message;
} StatusMessage;

typedef struct JSONString {
  char *string;
  int length;
} JSONString;

#endif
