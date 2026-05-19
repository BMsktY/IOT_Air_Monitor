#include <Arduino.h>

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHTesp.h>
#include <LiquidCrystal_I2C.h>

// ======================
// WIFI
// ======================

const char* ssid = "Wokwi-GUEST";
const char* password = "";

// ======================
// MQTT
// ======================

const char* mqtt_server = "broker.mqttdashboard.com";

WiFiClient espClient;
PubSubClient client(espClient);

// ======================
// SENSORS
// ======================

DHTesp dhtSensor;
const int DHT_PIN = 15;
const int GAS_PIN = 34;
const int LED_PIN = 2;

// ======================
// LCD
// ======================
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ======================
// LAST VALUES (To prevent duplicate sending)
// ======================
float last_temp = -999.0;
float last_hum = -999.0;
int last_aqi = -999;

// ======================
// CONNECT WIFI
// ======================

void setup_wifi() {
  Serial.println();
  Serial.print("Connecting to WiFi");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi Connected");
  Serial.println(WiFi.localIP());
}

// ======================
// CONNECT MQTT
// ======================

void reconnect_mqtt() {
  while (!client.connected()) {
    Serial.print("Connecting MQTT...");

    if (client.connect("ESP32Client_MonitoringUdara")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying...");
      delay(2000);
    }
  }
}

// ======================
// SETUP
// ======================

void setup() {
  Serial.begin(115200);

  Serial.println("ESP32 START");

  // LCD Setup
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");

  dhtSensor.setup(DHT_PIN, DHTesp::DHT22);
  pinMode(GAS_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);

  setup_wifi();

  client.setServer(mqtt_server, 1883);
}

// ======================
// LOOP
// ======================

void loop() {

  if (!client.connected()) {
    reconnect_mqtt();
  }

  client.loop();

  TempAndHumidity data = dhtSensor.getTempAndHumidity();

  float temperature = data.temperature;
  float humidity = data.humidity;
  int aqi_raw = analogRead(GAS_PIN);
  
  // Convert analog (0-4095) to a 0-200 scale for AQI
  int aqi = map(aqi_raw, 0, 4095, 0, 200);

  // Jika tidak ada perubahan data, abaikan dan tunggu
  if (temperature == last_temp && humidity == last_hum && aqi == last_aqi) {
    delay(3000);
    return;
  }

  // Update last values
  last_temp = temperature;
  last_hum = humidity;
  last_aqi = aqi;

  // Determine status for Serial
  String aqiStatus = "Berbahaya";
  if (aqi <= 50) aqiStatus = "Baik / Good";
  else if (aqi <= 100) aqiStatus = "Sedang / Moderate";
  else if (aqi <= 150) aqiStatus = "Tidak Sehat";
  else if (aqi <= 200) aqiStatus = "Tidak Sehat";
  else if (aqi <= 300) aqiStatus = "Sangat Tidak Sehat";

  Serial.println("====== SENSOR ======");
  Serial.print("Temperature: ");
  Serial.println(temperature);

  Serial.print("Humidity: ");
  Serial.println(humidity);

  Serial.print("AQI: ");
  Serial.print(aqi);
  Serial.print(" (");
  Serial.print(aqiStatus);
  Serial.println(")");

  // MQTT Publish
  String payload =
    String("{\"temperature\":") + temperature +
    ",\"humidity\":" + humidity + 
    ",\"aqi\":" + aqi + "}";

  client.publish("monitoring-udara", payload.c_str());

  // Blink LED
  digitalWrite(LED_PIN, HIGH);
  delay(100);
  digitalWrite(LED_PIN, LOW);

  // Update LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(temperature, 1);
  lcd.print(" H:");
  lcd.print(humidity, 1);
  lcd.print("%");
  
  lcd.setCursor(0, 1);
  lcd.print("AQI:");
  lcd.print(aqi);
  lcd.print(" ");
  // Shorten for LCD 16 chars limit
  if (aqi <= 50) lcd.print("Baik");
  else if (aqi <= 100) lcd.print("Sedang");
  else if (aqi <= 200) lcd.print("TdkSehat");
  else if (aqi <= 300) lcd.print("Sangat TS");
  else lcd.print("Bahaya");

  Serial.println("MQTT Published");
  Serial.println(payload);

  delay(3000);
}