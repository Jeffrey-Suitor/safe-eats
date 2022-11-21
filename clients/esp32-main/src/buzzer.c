#include "buzzer.h"

#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>

#include "argtable3/argtable3.h"
#include "config.h"
#include "driver/ledc.h"
#include "esp_console.h"
#include "esp_log.h"

#define TAG "BUZZER"

QueueHandle_t BuzzerQueue;
TaskHandle_t Buzzer;
BuzzerNote ThermalRunAwayAlarm = {aH_NOTE, 500, 3};
BuzzerNote MealStarted = {a_NOTE, 100, 6};
BuzzerNote MealFinished = {b_NOTE, 100, 6};
BuzzerNote EmergencyStop = {gSH_NOTE, 250, 12};

#define LEDC_TIMER LEDC_TIMER_0
#define LEDC_MODE LEDC_LOW_SPEED_MODE
#define LEDC_CHANNEL LEDC_CHANNEL_0
#define LEDC_DUTY_RES LEDC_TIMER_10_BIT  // Set duty resolution to 10 bits
#define LEDC_DUTY 511                    // Set duty to 50%. ((2 ** 10) - 1) * 50% = 511
#define LEDC_FREQUENCY (5000)            // Frequency in Hertz. Set frequency at 5 kHz

void sound(uint32_t freq, uint32_t duration, uint32_t repeats) {
  static int i = 0;

  // Prepare and then apply the LEDC PWM timer configuration
  ledc_timer_config_t ledc_timer = {.speed_mode = LEDC_MODE,
                                    .timer_num = LEDC_TIMER,
                                    .duty_resolution = LEDC_DUTY_RES,
                                    .freq_hz = LEDC_FREQUENCY,  // Set output frequency at 5 kHz
                                    .clk_cfg = LEDC_AUTO_CLK};
  ESP_ERROR_CHECK(ledc_timer_config(&ledc_timer));

  // Prepare and then apply the LEDC PWM channel configuration
  ledc_channel_config_t ledc_channel = {.speed_mode = LEDC_MODE,
                                        .channel = LEDC_CHANNEL,
                                        .timer_sel = LEDC_TIMER,
                                        .intr_type = LEDC_INTR_DISABLE,
                                        .gpio_num = BUZZER_PIN,
                                        .duty = 0,  // Set duty to 0%
                                        .hpoint = 0};
  ESP_ERROR_CHECK(ledc_channel_config(&ledc_channel));

  for (i = 0; i < repeats; i++) {
    // start
    ESP_ERROR_CHECK(ledc_set_duty(LEDC_MODE, LEDC_CHANNEL, LEDC_DUTY));
    ESP_ERROR_CHECK(ledc_update_duty(LEDC_MODE, LEDC_CHANNEL));
    vTaskDelay(pdMS_TO_TICKS(duration));

    // stop
    ESP_ERROR_CHECK(ledc_set_duty(LEDC_MODE, LEDC_CHANNEL, 0));
    ESP_ERROR_CHECK(ledc_update_duty(LEDC_MODE, LEDC_CHANNEL));
    vTaskDelay(pdMS_TO_TICKS(duration));
  }
}

void BuzzerTask(void *pvParameters) {
  BuzzerNote note;
  while (true) {
    xQueueReceive(BuzzerQueue, &note, portMAX_DELAY);
    ESP_LOGI(TAG, "duration: %d, freq: %d, repeats: %d", note.duration, note.freq, note.repeats);
    sound(note.freq, note.duration, note.repeats);
  }
}

static struct {
  struct arg_int *freq;
  struct arg_int *duration;
  struct arg_int *repeats;
  struct arg_end *end;
} console_note_args;

static int BuzzerConsoleCmd(int argc, char **argv) {
  int nerrors = arg_parse(argc, argv, (void **)&console_note_args);
  if (nerrors != 0) {
    arg_print_errors(stderr, console_note_args.end, argv[0]);
    return 1;
  }
  sound(console_note_args.freq->ival[0], console_note_args.duration->ival[0], console_note_args.repeats->ival[0]);
  return 0;
}

void RegisterBuzzer(void) {
  console_note_args.freq = arg_int1(NULL, NULL, "<freq>", "Frequency of the sounds");
  console_note_args.duration = arg_int1(NULL, NULL, "<duration>", "Duration of sound in ms");
  console_note_args.repeats = arg_int1(NULL, NULL, "<repeats>", "Number of times the sound repeats");
  console_note_args.end = arg_end(4);
  const esp_console_cmd_t buzzer_cmd = {
      .command = "buzzer", .help = "Play a sound via the buzzer", .hint = NULL, .func = &BuzzerConsoleCmd, .argtable = &console_note_args};

  ESP_ERROR_CHECK(esp_console_cmd_register(&buzzer_cmd));
}

void SetupBuzzer(void) {
  BuzzerQueue = xQueueCreate(3, sizeof(BuzzerNote));
  xTaskCreate(BuzzerTask, "BuzzerTask", 4096, NULL, 1, &Buzzer);
  vTaskDelay(pdMS_TO_TICKS(1000));
  RegisterBuzzer();
}