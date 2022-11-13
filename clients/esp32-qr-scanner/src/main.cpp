/*
 * There are three serial ports on the ESP known as U0UXD, U1UXD and U2UXD.
 *
 * U0UXD is used to communicate with the ESP32 for programming and during reset/boot.
 * U1UXD is unused and can be used for your projects. Some boards use this port for SPI Flash access though
 * U2UXD is unused and can be used for your projects.
 *
 */

#include <Arduino.h>
#include <driver/i2c.h>
#include <string.h>

#include "driver/gpio.h"
#include "driver/spi_slave.h"
#include "esp_log.h"

#define RXD2 9
#define TXD2 10

void setup() {
    // Note the format for setting a serial port is as follows: Serial2.begin(baud-rate, protocol, RX pin, TX pin);
    Serial.begin(115200);
    // Serial1.begin(9600, SERIAL_8N1, RXD2, TXD2);
    Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);
    Serial.println("Serial Txd is on pin: " + String(TX));
    Serial.println("Serial Rxd is on pin: " + String(RX));
    Serial.println("Serial2 Txd is on pin: " + String(TXD2));
    Serial.println("Serial2 Rxd is on pin: " + String(RXD2));
}

void loop() {  // Choose Serial1 or Serial2 as required
    while (Serial2.available()) {
        Serial.print(char(Serial2.read()));
    }
}