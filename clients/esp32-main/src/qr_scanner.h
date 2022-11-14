#ifndef QR_Scanner
#define QR_Scanner
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>

void SetupQRScanner(void);
extern QueueHandle_t QRCodeQueue;
#endif
