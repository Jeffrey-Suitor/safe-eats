#include "qr_scanner.h"

#include <driver/uart.h>
#include <stdio.h>
#include <string.h>

#include "config.h"
#include "db_manager.h"
#include "driver/gpio.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define TAG "QR_SCANNER"

void ReadUARTTask(void *args) {
    uint8_t *data = (uint8_t *)malloc(QR_CODE_LENGTH);
    int size = 0;
    char *qr_code;

    while (true) {
        size = uart_read_bytes(UART_PORT, data, (QR_CODE_LENGTH - 1), 20 / portTICK_PERIOD_MS);
        if (size) {
            data[size] = '\0';
            qr_code = (char *)data;
            ESP_LOGI(TAG, "Receiver QR code: %s", qr_code);
            xQueueOverwrite(QRCodeQueue, (void *)qr_code);
        }
    }
}

void SetupQRScanner(void) {
    ESP_LOGI(TAG, "Setting up QR Scanner");
    uart_config_t uart_config = {
        .baud_rate = UART_BAUD,
        .data_bits = UART_DATA_8_BITS,
        .parity = UART_PARITY_DISABLE,
        .stop_bits = UART_STOP_BITS_1,
        .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
        .source_clk = UART_SCLK_REF_TICK,
    };

    ESP_ERROR_CHECK(uart_driver_install(UART_PORT, QR_CODE_LENGTH * 2, 0, 0, NULL, 0));
    ESP_ERROR_CHECK(uart_param_config(UART_PORT, &uart_config));
    ESP_ERROR_CHECK(uart_set_pin(UART_PORT, UART_TXD, UART_RXD, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE));

    ESP_LOGI(TAG, "Starting ReadUARTTask");

    xTaskCreate(ReadUARTTask, "uart_read_task", 1024 * 2, NULL, 6, NULL);
}
