#include "bluetooth.h"

#include <stdio.h>

#include "cJSON.h"
#include "config.h"
#include "esp_event.h"  //"esp_event_loop.h"
#include "esp_log.h"
#include "esp_nimble_hci.h"
#include "flash.h"
#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/task.h"
#include "host/ble_hs.h"
#include "lcd.h"
#include "nimble/nimble_port.h"
#include "nimble/nimble_port_freertos.h"
#include "nvs_flash.h"
#include "sdkconfig.h"
#include "services/gap/ble_svc_gap.h"
#include "services/gatt/ble_svc_gatt.h"
#include "wifi.h"

#define DEVICE_INFO_SERVICE_UUID 0x180A
#define SET_WIFI_CHAR 0x0000
#define PAIR_APPLIANCE_CHAR 0x0001
#define GET_DEVICE_NAME_CHAR 0x0002

#define TAG "BLE"

uint8_t ble_addr_type;

char *wifi_ssid;
char *wifi_pass;
char *ble_device_name;

void Advertise(void);

static int ble_gap_event(struct ble_gap_event *event, void *arg) {
  switch (event->type) {
    case BLE_GAP_EVENT_CONNECT:
      ESP_LOGI("GAP", "BLE GAP EVENT CONNECT %s", event->connect.status == 0 ? "OK!" : "FAILED!");
      if (event->connect.status != 0) {
        Advertise();
      }
      break;
    case BLE_GAP_EVENT_DISCONNECT:
      ESP_LOGI("GAP", "BLE GAP EVENT");
      Advertise();
      break;
    case BLE_GAP_EVENT_ADV_COMPLETE:
      ESP_LOGI("GAP", "BLE GAP EVENT");
      Advertise();
      break;
    case BLE_GAP_EVENT_SUBSCRIBE:
      ESP_LOGI("GAP", "BLE GAP EVENT");
      break;
    default:
      break;
  }
  return 0;
}

void Advertise(void) {
  struct ble_hs_adv_fields fields;
  char manuf_data[] = "SafeEats";
  memset(&fields, 0, sizeof(fields));
  fields.flags = BLE_HS_ADV_F_DISC_GEN | BLE_HS_ADV_F_DISC_LTD;
  fields.tx_pwr_lvl_is_present = 1;
  fields.tx_pwr_lvl = BLE_HS_ADV_TX_PWR_LVL_AUTO;
  fields.name = (uint8_t *)ble_svc_gap_device_name();
  fields.name_len = strlen(ble_svc_gap_device_name());
  fields.name_is_complete = 1;
  fields.mfg_data = (uint8_t *)&manuf_data;
  fields.mfg_data_len = strlen(manuf_data);
  ble_gap_adv_set_fields(&fields);
  struct ble_gap_adv_params adv_params;
  memset(&adv_params, 0, sizeof(adv_params));
  adv_params.conn_mode = BLE_GAP_CONN_MODE_UND;
  adv_params.disc_mode = BLE_GAP_DISC_MODE_GEN;
  ble_gap_adv_start(ble_addr_type, NULL, BLE_HS_FOREVER, &adv_params, ble_gap_event, NULL);
}

void OnSync(void) {
  ble_hs_id_infer_auto(0, &ble_addr_type);  // determines automatic address.
  Advertise();                              // start advertising the services -->
  uint8_t mac[6] = {0};
  ble_hs_id_copy_addr(ble_addr_type, mac, NULL);
  char BLEId[64];
  sprintf(BLEId, "%02X:%02X:%02X:%02X:%02X:%02X", mac[5], mac[4], mac[3], mac[2], mac[1], mac[0]);
  FlashSet(NVS_TYPE_STR, BLE_DEVICE_ID_KEY, BLEId, 64);
}

void HostTask(void *param) { nimble_port_run(); }

void SetBLEDeviceName(char *name) {
  LCDMessage msg = {
      .row = 0,
      .col = 0,
  };
  FlashSet(NVS_TYPE_STR, BLE_DEVICE_NAME_KEY, name, 32);
  ble_svc_gap_device_name_set(name);
  strcpy(msg.text, name);
  xQueueSend(LCDQueue, &msg, portMAX_DELAY);
  ESP_LOGI(TAG, "BLE Device Name Set to %s", name);
}

// callback from characteristic 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff
static int SetWifiBLECmd(uint16_t conn_handle, uint16_t attr_handle, struct ble_gatt_access_ctxt *ctxt, void *arg) {
  // data pattern {"SSID": "PUT_YOUR_WIFI_NAME", "PASS": "PUT_YOUR_WIFI_PASS", "NAME": "PUT_YOUR_DEVICE_NAME"}
  char *incoming_data = (char *)ctxt->om->om_data;
  ESP_LOGI(TAG, "incoming message: %s\n", incoming_data);
  cJSON *payload = cJSON_Parse(incoming_data);
  cJSON *ssid = cJSON_GetObjectItem(payload, "ssid");
  cJSON *pass = cJSON_GetObjectItem(payload, "name");
  cJSON *name = cJSON_GetObjectItem(payload, "pass");
  wifi_ssid = ssid->valuestring;
  wifi_pass = pass->valuestring;
  ble_device_name = name->valuestring;
  if (strlen(wifi_ssid) > 0 && strlen(wifi_pass) > 0) {
    SetWifiCreds(wifi_ssid, wifi_pass);
  }
  SetBLEDeviceName(ble_device_name);
  cJSON_Delete(payload);
  return 0;
}

static int PairApplianceBLECmd(uint16_t con_handle, uint16_t attr_handle, struct ble_gatt_access_ctxt *ctxt, void *arg) {
  os_mbuf_append(ctxt->om, ID, strlen(ID));
  return 0;
}

static int GetApplianceNameBLECmd(uint16_t con_handle, uint16_t attr_handle, struct ble_gatt_access_ctxt *ctxt, void *arg) {
  char *name = (char *)malloc(32);
  FlashGet(NVS_TYPE_STR, BLE_DEVICE_NAME_KEY, name, 32);
  os_mbuf_append(ctxt->om, name, strlen(name));
  free(name);
  return 0;
}

static const struct ble_gatt_svc_def gatt_svcs[] = {
    {
        .type = BLE_GATT_SVC_TYPE_PRIMARY,
        .uuid = BLE_UUID16_DECLARE(DEVICE_INFO_SERVICE_UUID),
        .characteristics =
            (struct ble_gatt_chr_def[]){
                {
                    .uuid = BLE_UUID16_DECLARE(SET_WIFI_CHAR),
                    .flags = BLE_GATT_CHR_F_WRITE,
                    .access_cb = SetWifiBLECmd,
                },
                {
                    .uuid = BLE_UUID16_DECLARE(PAIR_APPLIANCE_CHAR),
                    .flags = BLE_GATT_CHR_F_READ,
                    .access_cb = PairApplianceBLECmd,
                },
                {
                    .uuid = BLE_UUID16_DECLARE(GET_DEVICE_NAME_CHAR),
                    .flags = BLE_GATT_CHR_F_READ,
                    .access_cb = GetApplianceNameBLECmd,
                },
                {0},
            },
    },
    {0},
};

void SetupBluetooth() {
  esp_nimble_hci_and_controller_init();  // initialize bluetooth controller.
  nimble_port_init();                    // nimble library initialization.
  char deviceName[32];
  FlashStringFallback(NVS_TYPE_STR, BLE_DEVICE_NAME_KEY, deviceName, 32, BLE_DEVICE_NAME_DEFAULT);
  SetBLEDeviceName(deviceName);    // set the device name.
  ble_svc_gap_init();              // initialize the gap service.
  ble_svc_gatt_init();             // initailize the gatt service.
  ble_gatts_count_cfg(gatt_svcs);  // config all the gatt services that wanted to be used.
  ble_gatts_add_svcs(gatt_svcs);   // queues all services.
  ble_hs_cfg.sync_cb = OnSync;
  nimble_port_freertos_init(HostTask);
}