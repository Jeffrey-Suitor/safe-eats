#ifndef WIFI
#define WIFI

extern void SetupWifi(void);
extern void SetWifiCreds(char *ssid, char *pass);

#define WIFI_SSID_KEY "WIFI_SSID"
#define WIFI_PASS_KEY "WIFI_PASS"
#define DEFAULT_WIFI_PASS ""
#define DEFAULT_WIFI_SSID ""

#endif
