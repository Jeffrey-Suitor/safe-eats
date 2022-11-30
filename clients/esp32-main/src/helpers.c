#include "helpers.h"

#include <ctype.h>
#include <stdio.h>
#include <string.h>

#include "esp_system.h"

void GetUniqueID(char *str) {
  uint8_t mac[6] = {0};
  esp_efuse_mac_get_default(mac);
  sprintf(str, "%02X%02X%02X%02X%02X%02X", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
}