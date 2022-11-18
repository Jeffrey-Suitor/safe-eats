#ifndef TEMP_SENSOR
#define TEMP_SENSOR

#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>

extern void SetupTempSensor(void);
extern QueueHandle_t TempSensorQueue;
extern TaskHandle_t TempSensor;

#define SPI_CLK GPIO_NUM_18
#define SPI_MISO GPIO_NUM_19
#define TEMP_SENSOR_CS GPIO_NUM_5
#define TEMP_SENSOR_DATA_LEN 16
typedef struct Temperature {
  int c;  // celcius
  int f;  // farenheit
} Temperature;

#endif
