#ifndef WIFI
#define WIFI

extern void SetupWifi(void);
extern void SetWifiCreds(char *ssid, char *pass);

#define WIFI_SSID_KEY "WIFI_SSID"
#define WIFI_PASS_KEY "WIFI_PASS"
#define DEFAULT_WIFI_PASS "class1509finish"
#define DEFAULT_WIFI_SSID "SHAW-05C9"

#endif
