#ifndef WEBSOCKET
#define WEBSOCKET

#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>

#include "cJSON.h"

extern void SetupWebsocket(void);
extern QueueHandle_t WebsocketQueue;
extern TaskHandle_t Websocket;

typedef struct JSONString {
  char string[1024];
  int length;
} JSONString;

typedef struct WebSocketMessage {
  char path[32];
  char method[16];
  JSONString dataString;
} WebSocketMessage;

#endif
