#include "Arduino.h"
#include "max6675.h"

int thermoDO = 19;
int thermoCS = 5;
int thermoCLK = 18;

MAX6675 thermocouple(thermoCLK, thermoCS, thermoDO);

void setup() {
    Serial.begin(115200);
    Serial.println("MAX6675 test");
    delay(500);
}

void loop() {
    // basic readout test, just print the current temp

    Serial.print("C = ");
    Serial.println(thermocouple.readCelsius());
    Serial.print("F = ");
    Serial.println(thermocouple.readFahrenheit());

    delay(1000);
}