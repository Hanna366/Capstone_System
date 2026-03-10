# ESP32 Configuration for Smart Drying Rack System

## Overview
This guide will help you connect your ESP32 to the Smart Drying Rack system using Blynk IoT platform for real-time communication and control.

## Hardware Requirements

### Hardware Components Needed:
- ESP32 Development Board (ESP32-DevKitC or similar)
- DHT22 Temperature & Humidity Sensor
- YL-83 Rain Sensor Module
- LDR or UV Sensor (for UV index)
- Anemometer (Wind Speed Sensor)
- 12V DC Gear Motor (main rack drive)
- L298N Motor Driver Module (for DC motor)
- PWM Solar Charge Controller
- LiFePO₄ Battery (12V, 20Ah)
- Monocrystalline Solar Panel (30-50W)
- Battery Management System (BMS)
- Momentary Push Button Switch
- LED Indicators (Red/Green)
- Weatherproof Control Box (IP65+)
- Transparent Plastic Sheet / Polycarbonate
- Jumper Wires
- Breadboard
- Terminal Blocks / Screw Connectors
- DC Power Cables

### Pin Configuration:
```
// Main DC Motor (Rack Drive)
Motor Driver IN1:  GPIO 2
Motor Driver IN2:  GPIO 5
Motor Driver ENA:  GPIO 25 (PWM for speed control)

// Sensors
DHT22 Sensor:      GPIO 4
Rain Sensor:       GPIO 27 (Digital)
Rain Sensor A0:    GPIO 26 (Analog)
LDR/UV Sensor:     GPIO 34 (ADC1_CH6)
Anemometer:        GPIO 35 (ADC1_CH7)

// Power & Control
Battery Monitor:   GPIO 33 (ADC1_CH3)
Charging Status:   GPIO 32
Manual Button:      GPIO 12
LED Red:           GPIO 15
LED Green:         GPIO 4
```

## Software Setup

### 1. Blynk IoT Setup
1. Create account at [Blynk.cloud](https://blynk.cloud)
2. Create new device: "Smart Drying Rack ESP32"
3. Get your **Auth Token** from device settings
4. Configure data streams:

#### Blynk Data Streams Setup:
| Virtual Pin | Data Type | Name | Unit |
|-------------|-----------|------|------|
| V0 | Integer | Temperature | °C |
| V1 | Integer | Humidity | % |
| V2 | Integer | UV Index | Index |
| V3 | Integer | Wind Speed | km/h |
| V4 | Integer | Battery Level | % |
| V5 | Boolean | Charging Status | - |
| V6 | Integer | Current Output | W |
| V7 | String | Rack Position | extended/retracted |
| V8 | Boolean | Auto Mode | - |
| V9 | Boolean | Manual Control | - |

### 2. Arduino IDE Setup
1. Install ESP32 Board Manager
2. Install required libraries:
   - Blynk library
   - DHT sensor library
   - WiFi library

## L298N Motor Driver Wiring

### Connections:
```
ESP32        L298N Motor Driver
GPIO 2   --> IN1
GPIO 5   --> IN2  
GPIO 25  --> ENA (PWM)
5V       --> 12V (for motor power)
GND      --> GND

L298N Motor Driver    12V DC Motor
OUT1      --> Motor Terminal +
OUT2      --> Motor Terminal -
```

### Motor Control Logic:
```
IN1  IN2  ENA  Motor Action
HIGH LOW  PWM  Forward (Extend)
LOW  HIGH PWM  Reverse (Retract)
LOW  LOW  PWM  Stop
HIGH HIGH PWM  Brake (Not Used)
```

## ESP32 Code

### Complete ESP32 Sketch:

```cpp
#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <DHT.h>
#include <Servo.h>
#include <ArduinoJson.h>

// WiFi Credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Blynk Auth Token
#define BLYNK_AUTH_TOKEN "YOUR_BLYNK_AUTH_TOKEN"
#define BLYNK_TEMPLATE_ID "TMPL6XX-7p9uG"
#define BLYNK_TEMPLATE_NAME "LilyGo T PCIe"

// Pin Definitions
#define DHT_PIN 4
#define UV_PIN 34
#define WIND_PIN 35
#define SERVO_PIN 2
#define RELAY_PIN 5
#define BATTERY_PIN 33
#define CHARGING_PIN 32

// Sensor Objects
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);
Servo rackServo;

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

// Motor control variables (replaces servo positions)
#define MOTOR_SPEED 200      // PWM value (0-255)
#define MOTOR_RUN_TIME 5000  // Time to run motor in milliseconds

// Timing variables
unsigned long lastSensorRead = 0;
const long SENSOR_INTERVAL = 5000; // Read sensors every 5 seconds
unsigned long lastBlynkUpdate = 0;
const long BLYNK_UPDATE_INTERVAL = 10000; // Update Blynk every 10 seconds

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SMART DRYING RACK ESP32 STARTING ===");
  
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
  
  Serial.println("Hardware initialization complete");
  
  // Enhanced WiFi connection with detailed logging
  connectToWiFi();
  
  // Initialize Blynk
  Blynk.begin(BLYNK_AUTH_TOKEN);
  Serial.println("Blynk initialization started");
}

// WiFi connection tracking
int connectionAttempts = 0;
const int MAX_CONNECTION_ATTEMPTS = 10;
unsigned long wifiStartTime = 0;

void connectToWiFi() {
  Serial.println("\n=== WIFI CONNECTION ATTEMPT ===");
  Serial.print("Target SSID: ");
  Serial.println(WIFI_SSID);
  Serial.print("Password Length: ");
  Serial.println(strlen(WIFI_PASSWORD));
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  connectionAttempts = 0;
  wifiStartTime = millis();
  
  while (WiFi.status() != WL_CONNECTED && connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
    connectionAttempts++;
    delay(2000); // Wait 2 seconds between attempts
    
    Serial.print("Connection Attempt ");
    Serial.print(connectionAttempts);
    Serial.print("/");
    Serial.print(MAX_CONNECTION_ATTEMPTS);
    Serial.print(" - Status: ");
    Serial.print(getWiFiStatusText(WiFi.status()));
    Serial.print(" - Signal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    
    // Flash LED to show connection attempts
    digitalWrite(LED_RED, connectionAttempts % 2 == 0 ? HIGH : LOW);
    delay(100);
    digitalWrite(LED_RED, LOW);
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n=== WIFI CONNECTION SUCCESSFUL ===");
    Serial.print("Connected to: ");
    Serial.println(WIFI_SSID);
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    Serial.print("Connection Time: ");
    Serial.print((millis() - wifiStartTime) / 1000);
    Serial.println(" seconds");
    
    digitalWrite(LED_GREEN, HIGH); // Success
    digitalWrite(LED_RED, LOW);
    
    // Wait for Blynk connection
    unsigned long blynkStartTime = millis();
    Serial.println("\n=== WAITING FOR BLYNK CONNECTION ===");
    
    while (millis() - blynkStartTime < 15000) { // 15 second timeout
      Blynk.run();
      if (Blynk.connected()) {
        Serial.println("✅ Blynk connection established!");
        break;
      }
      delay(500);
      Serial.print("Blynk Status: ");
      Serial.println(Blynk.connected() ? "CONNECTING..." : "DISCONNECTED");
    }
    
    if (!Blynk.connected()) {
      Serial.println("❌ Blynk connection failed - timeout reached");
    }
    
  } else {
    Serial.println("\n=== WIFI CONNECTION FAILED ===");
    Serial.print("Final Status: ");
    Serial.println(getWiFiStatusText(WiFi.status()));
    Serial.print("Total Attempts: ");
    Serial.println(connectionAttempts);
    Serial.print("Time Elapsed: ");
    Serial.print((millis() - wifiStartTime) / 1000);
    Serial.println(" seconds");
    
    // Flash red LED rapidly to indicate failure
    for (int i = 0; i < 10; i++) {
      digitalWrite(LED_RED, HIGH);
      delay(200);
      digitalWrite(LED_RED, LOW);
      delay(200);
    }
  }
  
  Serial.println("\n=== SYSTEM READY ===");
}

String getWiFiStatusText(wl_status_t status) {
  switch (status) {
    case WL_IDLE_STATUS: return "IDLE";
    case WL_NO_SSID_AVAIL: return "SSID NOT AVAILABLE";
    case WL_SCAN_COMPLETED: return "SCAN COMPLETED";
    case WL_CONNECT_FAILED: return "CONNECTION FAILED";
    case WL_CONNECTION_LOST: return "CONNECTION LOST";
    case WL_DISCONNECTED: return "DISCONNECTED";
    case WL_CONNECTED: return "CONNECTED";
    default: return "UNKNOWN";
  }
}

void loop() {
  Blynk.run();
  
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
  if (autoMode && !manualControl) {
    checkWeatherConditions();
  }
  
  delay(100);
}

void readSensors() {
  // Read DHT22
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  
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
  
  Serial.printf("Temp: %.1f°C, Hum: %.1f%%, UV: %d, Wind: %d km/h, Battery: %d%%\n",
                temperature, humidity, uvIndex, windSpeed, batteryLevel);
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
}

void checkWeatherConditions() {
  // Auto-retract logic based on weather conditions
  bool shouldRetract = false;
  String reason = "";
  
  if (windSpeed > 25) {
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
  } else if (!shouldRetract && rackPosition == "retracted") {
    extendRack();
    Serial.println("Auto-extending rack: Conditions favorable");
  }
}

void extendRack() {
  rackServo.write(SERVO_EXTENDED);
  rackPosition = "extended";
  digitalWrite(RELAY_PIN, HIGH); // Turn on power
}

void retractRack() {
  rackServo.write(SERVO_RETRACTED);
  rackPosition = "retracted";
  digitalWrite(RELAY_PIN, LOW); // Turn off power
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

BLYNK_WRITE(V7) { // Manual rack control
  if (manualControl) {
    String position = param.asStr();
    if (position == "extended") {
      extendRack();
    } else if (position == "retracted") {
      retractRack();
    }
  }
}

// Manual control buttons in Blynk app
BLYNK_WRITE(V10) { // Extend button
  if (manualControl) {
    extendRack();
  }
}

BLYNK_WRITE(V11) { // Retract button
  if (manualControl) {
    retractRack();
  }
}
```

## Web Dashboard Integration

### Update your BlynkService.ts to use real Blynk API:

```typescript
// Replace the mock data fetching with real Blynk API calls
private async fetchDeviceData(): Promise<DeviceData> {
  if (!this.apiKey) {
    throw new Error('No Blynk API key provided');
  }

  try {
    const response = await fetch(`${this.BASE_URL}/external/api/get?token=${this.apiKey}&V0,V1,V2,V3,V4,V5,V6,V7,V8,V9`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      temperature: data.V0 || 0,
      humidity: data.V1 || 0,
      uvIndex: data.V2 || 0,
      windSpeed: data.V3 || 0,
      batteryLevel: data.V4 || 0,
      isCharging: data.V5 === 1,
      currentOutput: data.V6 || 0,
      rackPosition: data.V7 === 1 ? 'extended' : 'retracted',
      autoMode: data.V8 === 1,
      connected: true,
      lastUpdate: new Date(),
    };
  } catch (error) {
    console.error('Error fetching Blynk data:', error);
    throw error;
  }
}

// Add method to send commands to ESP32
public async sendCommand(command: string, value: any): Promise<void> {
  if (!this.apiKey) {
    throw new Error('No Blynk API key provided');
  }

  try {
    const virtualPin = this.getVirtualPinForCommand(command);
    await fetch(`${this.BASE_URL}/external/api/update?token=${this.apiKey}&${virtualPin}=${value}`);
  } catch (error) {
    console.error('Error sending command to ESP32:', error);
    throw error;
  }
}

private getVirtualPinForCommand(command: string): string {
  switch (command) {
    case 'extendRack': return 'V10';
    case 'retractRack': return 'V11';
    case 'toggleAutoMode': return 'V8';
    case 'toggleManualControl': return 'V9';
    default: throw new Error(`Unknown command: ${command}`);
  }
}
```

## Setup Instructions

### 1. Hardware Assembly
1. Connect all sensors to ESP32 as per pin configuration
2. Connect servo motor to GPIO 2
3. Connect relay module to GPIO 5
4. Connect battery monitoring circuit
5. Power up the ESP32

### 2. Software Configuration
1. Install Arduino IDE and ESP32 board support
2. Install required libraries
3. Update WiFi credentials and Blynk auth token
4. Upload the sketch to ESP32

### 3. Blynk App Setup
1. Install Blynk app on your smartphone
2. Add device with your auth token
3. Create dashboard with widgets for all data streams
4. Add control buttons for manual rack control

### 4. Web Dashboard Integration
1. Update your web application's Blynk settings
2. Enter your Blynk API key
3. Test connection with ESP32
4. Verify real-time data display

## Troubleshooting

### Common Issues:
1. **WiFi Connection**: Check credentials and signal strength
2. **Blynk Connection**: Verify auth token and internet connectivity
3. **Sensor Readings**: Check wiring and sensor functionality
4. **Servo Movement**: Verify power supply and servo connections
5. **Data Updates**: Check virtual pin assignments in Blynk

### Debug Tips:
- Use Serial Monitor for debugging
- Check Blynk console for connection status
- Verify sensor readings separately
- Test individual components before full integration

## Security Considerations

1. **WiFi Security**: Use WPA2/WPA3 encryption
2. **Blynk Security**: Keep auth token secure
3. **Network Security**: Consider VPN for remote access
4. **Firmware Updates**: Implement OTA updates for security patches

## Next Steps

1. Add more sensors (rain detection, air quality)
2. Implement machine learning for weather prediction
3. Add camera monitoring
4. Implement energy optimization algorithms
5. Add mobile app notifications

This setup provides a complete IoT solution for your smart drying rack system with real-time monitoring and control capabilities.
