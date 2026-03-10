#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <DHT.h>
#include <ArduinoJson.h>

// WiFi Credentials - UPDATE THESE
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Blynk Auth Token - UPDATE THIS
#define BLYNK_AUTH_TOKEN "YOUR_BLYNK_AUTH_TOKEN"
#define BLYNK_TEMPLATE_ID "TMPL6XX-7p9uG"
#define BLYNK_TEMPLATE_NAME "LilyGo T PCIe"

// Pin Definitions
#define DHT_PIN 4
#define UV_PIN 34
#define WIND_PIN 35
#define RAIN_DIGITAL 27
#define RAIN_ANALOG 26
#define MOTOR_IN1 2
#define MOTOR_IN2 5
#define MOTOR_ENA 25
#define BATTERY_PIN 33
#define CHARGING_PIN 32
#define BUTTON_PIN 12
#define LED_RED 15
#define LED_GREEN 4

// Sensor Objects
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// Motor control variables
#define MOTOR_SPEED 200  // PWM value (0-255)
#define MOTOR_RUN_TIME 5000  // Time to run motor in milliseconds

// Global Variables
float temperature = 0;
float humidity = 0;
int uvIndex = 0;
int windSpeed = 0;
int batteryLevel = 0;
bool isCharging = false;
float currentOutput = 0;
String rackPosition = "extended";
bool autoMode = true;
bool manualControl = false;
bool motorRunning = false;
bool isRaining = false;
unsigned long motorStartTime = 0;

// Timing variables
unsigned long lastSensorRead = 0;
const long SENSOR_INTERVAL = 5000; // Read sensors every 5 seconds
unsigned long lastBlynkUpdate = 0;
const long BLYNK_UPDATE_INTERVAL = 10000; // Update Blynk every 10 seconds

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(MOTOR_IN1, OUTPUT);
  pinMode(MOTOR_IN2, OUTPUT);
  pinMode(MOTOR_ENA, OUTPUT);
  pinMode(RAIN_DIGITAL, INPUT);
  pinMode(CHARGING_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  
  // Initialize motor driver
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, LOW);
  digitalWrite(MOTOR_ENA, LOW);
  
  // Initialize sensors
  dht.begin();
  
  // Initialize LEDs
  digitalWrite(LED_GREEN, HIGH); // System ready
  digitalWrite(LED_RED, LOW);
  
  // Connect to WiFi and Blynk
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Blynk.begin(BLYNK_AUTH_TOKEN);
  
  Serial.println("Smart Drying Rack ESP32 Initialized with DC Motor");
}

void loop() {
  Blynk.run();
  
  // Check motor timeout
  if (motorRunning && (millis() - motorStartTime > MOTOR_RUN_TIME)) {
    stopMotor();
  }
  
  // Read sensors periodically
  if (millis() - lastSensorRead > SENSOR_INTERVAL) {
    readSensors();
    lastSensorRead = millis();
  }
  
  // Update Blynk periodically
  if (millis() - lastBlynkUpdate > BLYNK_UPDATE_INTERVAL) {
    updateBlynkData();
    lastBlynkUpdate = millis();
  }
  
  // Auto mode logic
  if (autoMode && !manualControl && !motorRunning) {
    checkWeatherConditions();
  }
  
  delay(100);
}

void readSensors() {
  // Read DHT22
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  
  // Handle DHT reading errors
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  
  // Read rain sensor (digital and analog)
  isRaining = digitalRead(RAIN_DIGITAL) == LOW; // Active LOW
  int rainAnalog = analogRead(RAIN_ANALOG);
  
  // Read UV sensor (simplified)
  int uvRaw = analogRead(UV_PIN);
  uvIndex = map(uvRaw, 0, 4095, 0, 11);
  
  // Read wind speed (simplified)
  int windRaw = analogRead(WIND_PIN);
  windSpeed = map(windRaw, 0, 4095, 0, 50);
  
  // Read battery level
  int batteryRaw = analogRead(BATTERY_PIN);
  batteryLevel = map(batteryRaw, 0, 4095, 0, 100);
  
  // Read charging status
  isCharging = digitalRead(CHARGING_PIN) == HIGH;
  
  // Calculate current output (simplified)
  currentOutput = calculatePowerOutput();
  
  // Update LEDs based on status
  digitalWrite(LED_RED, isRaining ? HIGH : LOW);
  digitalWrite(LED_GREEN, !isRaining ? HIGH : LOW);
  
  Serial.printf("Temp: %.1f°C, Hum: %.1f%%, UV: %d, Wind: %d km/h, Rain: %s, Battery: %d%%\n",
                temperature, humidity, uvIndex, windSpeed, isRaining ? "YES" : "NO", batteryLevel);
}

void updateBlynkData() {
  Blynk.virtualWrite(V0, (int)temperature);
  Blynk.virtualWrite(V1, (int)humidity);
  Blynk.virtualWrite(V2, uvIndex);
  Blynk.virtualWrite(V3, windSpeed);
  Blynk.virtualWrite(V4, batteryLevel);
  Blynk.virtualWrite(V5, isCharging ? 1 : 0);
  Blynk.virtualWrite(V6, (int)currentOutput);
  Blynk.virtualWrite(V7, rackPosition);
  Blynk.virtualWrite(V8, autoMode ? 1 : 0);
  Blynk.virtualWrite(V9, manualControl ? 1 : 0);
  Blynk.virtualWrite(V13, isRaining ? 1 : 0); // Rain status
}

void checkWeatherConditions() {
  // Auto-retract logic based on weather conditions
  bool shouldRetract = false;
  String reason = "";
  
  // Primary trigger: Rain detection
  if (isRaining) {
    shouldRetract = true;
    reason = "Rain detected";
  } else if (windSpeed > 25) {
    shouldRetract = true;
    reason = "High wind detected";
  } else if (humidity > 80) {
    shouldRetract = true;
    reason = "High humidity detected";
  } else if (uvIndex > 10) {
    shouldRetract = true;
    reason = "Extreme UV radiation";
  }
  
  if (shouldRetract && rackPosition == "extended") {
    retractRack();
    Serial.println("Auto-retracting rack: " + reason);
  } else if (!shouldRetract && rackPosition == "retracted" && !isRaining) {
    extendRack();
    Serial.println("Auto-extending rack: Conditions favorable");
  }
}

// Motor control functions
void extendRack() {
  if (motorRunning) {
    Serial.println("Motor already running, cannot extend");
    return;
  }
  
  Serial.println("Extending rack with DC motor");
  rackPosition = "extended";
  
  // Set motor direction forward
  digitalWrite(MOTOR_IN1, HIGH);
  digitalWrite(MOTOR_IN2, LOW);
  
  // Set motor speed
  analogWrite(MOTOR_ENA, MOTOR_SPEED);
  
  motorRunning = true;
  motorStartTime = millis();
  
  Serial.println("Motor running forward - Rack extending");
}

void retractRack() {
  if (motorRunning) {
    Serial.println("Motor already running, cannot retract");
    return;
  }
  
  Serial.println("Retracting rack with DC motor");
  rackPosition = "retracted";
  
  // Set motor direction reverse
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, HIGH);
  
  // Set motor speed
  analogWrite(MOTOR_ENA, MOTOR_SPEED);
  
  motorRunning = true;
  motorStartTime = millis();
  
  Serial.println("Motor running reverse - Rack retracting");
}

void stopMotor() {
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, LOW);
  digitalWrite(MOTOR_ENA, LOW);
  motorRunning = false;
  Serial.println("Motor stopped");
}

float calculatePowerOutput() {
  // Simplified power calculation based on solar panel and battery
  float solarPower = uvIndex * 10; // Simplified: 10W per UV index point
  float batteryPower = isCharging ? batteryLevel * 0.5 : 0;
  return solarPower + batteryPower;
}

// Blynk Virtual Pin Handlers
BLYNK_WRITE(V8) { // Auto Mode toggle
  autoMode = param.asInt() == 1;
  Serial.println("Auto mode: " + String(autoMode ? "ON" : "OFF"));
}

BLYNK_WRITE(V9) { // Manual Control
  manualControl = param.asInt() == 1;
  if (manualControl) {
    Serial.println("Manual control activated");
  }
}

// Manual control buttons in Blynk app
BLYNK_WRITE(V10) { // Extend button
  if (manualControl && !motorRunning) {
    extendRack();
  }
}

BLYNK_WRITE(V11) { // Retract button
  if (manualControl && !motorRunning) {
    retractRack();
  }
}

// Terminal for debugging (optional)
BLYNK_WRITE(V12) {
  String command = param.asStr();
  if (command == "status") {
    Blynk.virtualWrite(V12, "Status: " + rackPosition + ", Auto: " + String(autoMode ? "ON" : "OFF") + ", Motor: " + String(motorRunning ? "RUNNING" : "STOPPED"));
  }
}
