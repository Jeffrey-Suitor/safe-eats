#ifndef LCD
#define LCD
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
void SetupLCD(void);
extern QueueHandle_t LCDQueue;

typedef struct LCDMessage {
  char text[20];
  int row;
  int col;
} LCDMessage;

#endif
