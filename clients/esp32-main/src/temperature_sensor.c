#include "temperature_sensor.h"

#include <driver/spi_master.h>
#include <math.h>

#include "config.h"
#include "esp_err.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"

#define TAG "TEMPERATURE_SENSOR"

QueueHandle_t TempSensorQueue;
TaskHandle_t TempSensor;
spi_device_handle_t temp_spi_handle;

float TempSensorRead() {
  uint16_t data = 0;
  spi_transaction_t trans = {
      .tx_buffer = NULL,
      .rx_buffer = &data,
      .length = TEMP_SENSOR_DATA_LEN,
      .rxlength = TEMP_SENSOR_DATA_LEN,
  };

  spi_device_acquire_bus(temp_spi_handle, portMAX_DELAY);
  spi_device_transmit(temp_spi_handle, &trans);
  spi_device_release_bus(temp_spi_handle);

  int16_t res = (int16_t)SPI_SWAP_DATA_RX(data, TEMP_SENSOR_DATA_LEN);

  if (res & (1 << 2)) {
    ESP_LOGE(TAG, "Sensor is not connected\n");
    return 1000;
  } else {
    res >>= 3;
    return res * 0.25;
  }
}

void TempSensorTask(void *pvParams) {
  Temperature temp;
  while (true) {
    temp.c = TempSensorRead();
    temp.f = roundf(temp.c * 1.8 + 32.0);
    ESP_LOGI(TAG, "C: %f, F: %f", temp.c, temp.f);
    xQueueOverwrite(TempSensorQueue, &temp);
    vTaskDelay(pdMS_TO_TICKS(1000)); // 1 second delay
  }
}

void SetupTempSensor(void) {
  ESP_LOGD(TAG, "Setting up temperature sensor");
  spi_bus_config_t busCfg = {
      .miso_io_num = SPI_MISO,
      .mosi_io_num = -1,
      .sclk_io_num = SPI_CLK,
      .quadwp_io_num = -1,
      .quadhd_io_num = -1,
      .max_transfer_sz = TEMP_SENSOR_DATA_LEN,
  };

  ESP_ERROR_CHECK(spi_bus_initialize(VSPI_HOST, &busCfg, SPI_DMA_CH_AUTO));

  // Temp sensor must be first
  spi_device_interface_config_t temp_sensor_cfg = {
      .mode = 0,
      .clock_speed_hz = 2 * 1000 * 1000,
      .spics_io_num = TEMP_SENSOR_CS,
      .queue_size = 1,
      .cs_ena_posttrans = 3,
      .cs_ena_pretrans = 3,
  };
  ESP_ERROR_CHECK(
      spi_bus_add_device(VSPI_HOST, &temp_sensor_cfg, &temp_spi_handle));

  TempSensorQueue = xQueueCreate(1, sizeof(Temperature));
  BaseType_t task = xTaskCreate(TempSensorTask, "TemperatureTask", 4096, NULL,
                                3, &TempSensor);
  if (task == pdFALSE)
    ESP_LOGE(TAG, "Failed to create temperature sensor task");
  ESP_LOGD(TAG, "Temperature sensor setup complete");
}
