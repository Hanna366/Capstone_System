/*
  Smart Drying Rack ESP32 Code
  Connects to your own web server instead of Blynk
  
  Hardware Connections:
  - DHT22 Sensor: GPIO 4
  - Rain Sensor Digital: GPIO 2, Analog: GPIO 34
  - UV Sensor: GPIO 35
  - Wind Sensor: GPIO 32
  - Battery Monitor: GPIO 33
  - Motor Driver IN1: GPIO 25, IN2: GPIO 26
  - LED Green: GPIO 12, LED Red: GPIO 13
  - Charging Detection: GPIO 27
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include <DHT.h>
#include <Ticker.h>

// WiFi Credentials
#define WIFI_SSID "ELBH2025"
#define WIFI_PASSWORD "JEIS08192004"

// Server Configuration
#define SERVER_HOST "192.168.1.100"  // Your computer's IP address
#define SERVER_PORT 3001
#define SERVER_URL "http://192.168.1.100:3001"
#define WS_URL "ws://192.168.1.100:3001"

// Pin Definitions
#define DHT_PIN 4
#define RAIN_DIGITAL_PIN 2
#define RAIN_ANALOG_PIN 34
#define UV_PIN 35
#define WIND_PIN 32
#define BATTERY_PIN 33
#define MOTOR_IN1 25
#define MOTOR_IN2 26
#define LED_GREEN 12
#define LED_RED 13
#define CHARGING_PIN 27

// DHT Sensor
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// Global Variables
WebSocketsClient webSocket;
Ticker websocketTicker;
Ticker sensorTicker;
Ticker heartbeatTicker;

bool wifiConnected = false;
bool serverConnected = false;
bool autoMode = true;
String rackPosition = "retracted";

// Sensor Data
struct SensorData {
  float temperature;
  float humidity;
  int uvIndex;
  float windSpeed;
  int batteryLevel;
  bool isCharging;
  float currentOutput;
  unsigned long lastUpdate;
};

SensorData sensorData;

// Function Prototypes
void connectToWiFi();
void connectToServer();
void readSensors();
void sendSensorData();
void handleWebSocketEvent(WStype_t type, uint8_t * payload, size_t length);
void sendHeartbeat();
void controlMotor(String command);
void extendRack();
void retractRack();
void stopMotor();
void updateLEDs();

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SMART DRYING RACK ESP32 STARTING ===");
  
  // Initialize Pins
  pinMode(RAIN_DIGITAL_PIN, INPUT);
  pinMode(CHARGING_PIN, INPUT);
  pinMode(MOTOR_IN1, OUTPUT);
  pinMode(MOTOR_IN2, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  
  // Initialize Motor
  stopMotor();
  
  // Initialize LEDs
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, LOW);
  
  // Initialize DHT Sensor
  dht.begin();
  
  // Initialize sensor data
  sensorData = {0, 0, 0, 0, 0, false, 0, 0};
  
  Serial.println("Hardware initialization complete");
  
  // Connect to WiFi
  connectToWiFi();
  
  // Connect to server
  connectToServer();
  
  // Setup periodic tasks
  sensorTicker.attach(5.0, readSensors);        // Read sensors every 5 seconds
  websocketTicker.attach(10.0, sendSensorData); // Send data every 10 seconds
  heartbeatTicker.attach(30.0, sendHeartbeat);  // Send heartbeat every 30 seconds
  
  Serial.println("=== SYSTEM READY ===");
}

void loop() {
  // Handle WebSocket events
  webSocket.loop();
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED && wifiConnected) {
    wifiConnected = false;
    Serial.println("WiFi connection lost!");
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, HIGH);
    connectToWiFi();
  }
  
  // Check server connection
  if (!webSocket.isConnected() && serverConnected) {
    serverConnected = false;
    Serial.println("Server connection lost!");
    connectToServer();
  }
  
  delay(100);
}

void connectToWiFi() {
  Serial.println("=== WIFI CONNECTION ATTEMPT ===");
  Serial.print("Target SSID: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    
    // Flash red LED during connection attempts
    digitalWrite(LED_RED, HIGH);
    delay(200);
    digitalWrite(LED_RED, LOW);
    delay(300);
    
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("\n=== WIFI CONNECTION SUCCESSFUL ===");
    Serial.print("Connected to: ");
    Serial.println(WIFI_SSID);
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    
    // Turn on green LED
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, LOW);
  } else {
    Serial.println("\n=== WIFI CONNECTION FAILED ===");
    Serial.println("Unable to connect to WiFi");
    
    // Rapid red flash for failure
    for (int i = 0; i < 10; i++) {
      digitalWrite(LED_RED, HIGH);
      delay(100);
      digitalWrite(LED_RED, LOW);
      delay(100);
    }
  }
}

void connectToServer() {
  if (!wifiConnected) {
    Serial.println("Cannot connect to server - WiFi not connected");
    return;
  }
  
  Serial.println("=== CONNECTING TO SERVER ===");
  Serial.print("Server URL: ");
  Serial.println(WS_URL);
  
  // Configure WebSocket
  webSocket.begin(SERVER_HOST, SERVER_PORT, "/");
  webSocket.onEvent(handleWebSocketEvent);
  webSocket.setReconnectInterval(5000);
  webSocket.enableHeartbeat(15000, 3000, 2);
  
  Serial.println("WebSocket connection initiated");
}

void handleWebSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("🔌 WebSocket disconnected");
      serverConnected = false;
      digitalWrite(LED_GREEN, LOW);
      break;
      
    case WStype_CONNECTED:
      Serial.println("🔌 WebSocket connected to server");
      serverConnected = true;
      digitalWrite(LED_GREEN, HIGH);
      
      // Identify as ESP32
      webSocket.sendTXT("esp32-identify");
      break;
      
    case WStype_TEXT:
      Serial.printf("📨 Received message: %s\n", payload);
      
      // Parse JSON commands
      DynamicJsonDocument doc(1024);
      DeserializationError error = deserializeJson(doc, payload);
      
      if (!error) {
        if (doc.containsKey("position")) {
          String position = doc["position"];
          if (position == "extend") {
            extendRack();
          } else if (position == "retract") {
            retractRack();
          }
        }
        
        if (doc.containsKey("enabled")) {
          bool enabled = doc["enabled"];
          autoMode = enabled;
          Serial.printf("🔄 Auto mode: %s\n", enabled ? "ON" : "OFF");
        }
      }
      break;
      
    case WStype_PONG:
      Serial.println("🏓 Pong received");
      break;
      
    default:
      break;
  }
}

void readSensors() {
  // Read DHT22
  sensorData.temperature = dht.readTemperature();
  sensorData.humidity = dht.readHumidity();
  
  // Read UV sensor (simplified calculation)
  int uvRaw = analogRead(UV_PIN);
  sensorData.uvIndex = map(uvRaw, 0, 4095, 0, 11);
  
  // Read wind sensor (simplified calculation)
  int windRaw = analogRead(WIND_PIN);
  sensorData.windSpeed = map(windRaw, 0, 4095, 0, 50);
  
  // Read battery level
  int batteryRaw = analogRead(BATTERY_PIN);
  sensorData.batteryLevel = map(batteryRaw, 0, 4095, 0, 100);
  
  // Read charging status
  sensorData.isCharging = digitalRead(CHARGING_PIN) == HIGH;
  
  // Calculate current output (simulated)
  sensorData.currentOutput = sensorData.isCharging ? 102.8 : 0.0;
  
  sensorData.lastUpdate = millis();
  
  // Print sensor readings
  Serial.printf("🌡️ Temp: %.1f°C, 💧 Hum: %.1f%%, ☀️ UV: %d, 💨 Wind: %.1f km/h\n", 
                sensorData.temperature, sensorData.humidity, sensorData.uvIndex, sensorData.windSpeed);
  Serial.printf("🔋 Battery: %d%%, ⚡ Charging: %s, 🔌 Power: %.1fW\n", 
                sensorData.batteryLevel, sensorData.isCharging ? "YES" : "NO", sensorData.currentOutput);
}

void sendSensorData() {
  if (!serverConnected) {
    Serial.println("Cannot send data - server not connected");
    return;
  }
  
  // Create JSON document
  DynamicJsonDocument doc(1024);
  
  doc["temperature"] = sensorData.temperature;
  doc["humidity"] = sensorData.humidity;
  doc["uvIndex"] = sensorData.uvIndex;
  doc["windSpeed"] = sensorData.windSpeed;
  doc["batteryLevel"] = sensorData.batteryLevel;
  doc["isCharging"] = sensorData.isCharging;
  doc["currentOutput"] = sensorData.currentOutput;
  doc["rackPosition"] = rackPosition;
  doc["autoMode"] = autoMode;
  doc["connected"] = true;
  doc["lastUpdate"] = sensorData.lastUpdate;
  
  // Send via WebSocket
  String jsonString;
  serializeJson(doc, jsonString);
  webSocket.sendTXT(jsonString);
  
  // Also send via HTTP for backup
  HTTPClient http;
  http.begin(SERVER_URL + "/api/device/data");
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.printf("📡 Data sent via HTTP: %d\n", httpResponseCode);
  } else {
    Serial.printf("❌ HTTP send failed: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  
  http.end();
  
  Serial.println("📊 Sensor data sent to server");
}

void sendHeartbeat() {
  if (serverConnected) {
    webSocket.sendTXT("esp32-ping");
    Serial.println("💓 Heartbeat sent");
  }
}

void controlMotor(String command) {
  Serial.printf("🎛️ Motor control: %s\n", command.c_str());
  
  if (command == "extend") {
    digitalWrite(MOTOR_IN1, HIGH);
    digitalWrite(MOTOR_IN2, LOW);
    rackPosition = "extended";
  } else if (command == "retract") {
    digitalWrite(MOTOR_IN1, LOW);
    digitalWrite(MOTOR_IN2, HIGH);
    rackPosition = "retracted";
  } else if (command == "stop") {
    stopMotor();
  }
  
  // Run motor for 3 seconds then stop
  delay(3000);
  stopMotor();
}

void extendRack() {
  Serial.println("🔼 Extending rack");
  controlMotor("extend");
}

void retractRack() {
  Serial.println("🔽 Retracting rack");
  controlMotor("retract");
}

void stopMotor() {
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, LOW);
}

void updateLEDs() {
  if (wifiConnected && serverConnected) {
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, LOW);
  } else {
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, HIGH);
  }
}
