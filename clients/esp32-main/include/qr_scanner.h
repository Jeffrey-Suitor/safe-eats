#ifndef QR_Scanner
#define QR_Scanner
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>

void SetupQRScanner(void);
extern QueueHandle_t QRCodeQueue;

#define QR_CODE_LENGTH 1024
#define UART_BAUD 9600
#define UART_TXD GPIO_NUM_10
#define UART_RXD GPIO_NUM_9
#define UART_PORT UART_NUM_1

#endif
