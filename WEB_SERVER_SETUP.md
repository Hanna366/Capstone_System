# 🌐 Smart Drying Rack - Web Server Setup Guide

## 🎯 **Why Switch from Blynk to Your Own Server?**

| Feature | Blynk | Your Web Server |
|---------|-------|-----------------|
| **Cost** | Free tier limited, paid for more | ✅ Completely FREE |
| **Control** | Limited to Blynk features | ✅ Full control over everything |
| **Latency** | Through Blynk servers (slower) | ✅ Direct connection (faster) |
| **Privacy** | Data goes through Blynk | ✅ Your data stays private |
| **Customization** | Limited widgets | ✅ Unlimited customization |
| **Reliability** | Depends on Blynk uptime | ✅ You control the uptime |

---

## 🚀 **Setup Instructions**

### **1. Install Server Dependencies**

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# For development (with auto-restart)
npm run dev

# For production
npm run build
npm start
```

### **2. Update ESP32 Configuration**

In `esp32_web_server/smart_drying_rack.ino`, update these lines:

```cpp
// Update with your computer's IP address
#define SERVER_HOST "192.168.1.100"  // Your computer's IP
#define SERVER_PORT 3001
```

**To find your computer's IP:**
- **Windows**: Open Command Prompt and type `ipconfig`
- **Mac/Linux**: Open Terminal and type `ifconfig` or `ip addr`

### **3. Install ESP32 Libraries**

Install these libraries in Arduino IDE:
1. **WiFi** (built-in)
2. **HTTPClient** (built-in)
3. **ArduinoJson** by Benoit Blanchon
4. **WebSocketsClient** by Markus Sattler
5. **Ticker** (built-in)
6. **DHT sensor library** by Adafruit

### **4. Upload ESP32 Code**

1. Open `esp32_web_server/smart_drying_rack.ino` in Arduino IDE
2. Select your ESP32 board
3. Select the correct COM port
4. Upload the code

### **5. Start Your Web Server**

```bash
# In the server directory
npm run dev
```

You should see:
```
🚀 Smart Drying Rack Server running on port 3001
📡 WebSocket server ready for ESP32 and web client connections
🌐 API endpoints available:
   GET  /api/device/data - Get device data
   POST /api/device/data - Update device data (ESP32)
   POST /api/device/control/rack - Control rack
   POST /api/device/control/auto-mode - Toggle auto mode
   GET  /api/status - Get system status
```

### **6. Start Your Web Application**

```bash
# In the main project directory
npm run dev
```

---

## 🔧 **How It Works**

### **Architecture Overview**
```
ESP32 Device ←→ Your Web Server ←→ Web Application
     ↓              ↓                    ↓
  Sensors      Node.js + Express      React Frontend
  Motors       Socket.io WebSocket    Real-time UI
  WiFi         REST API              Status Updates
```

### **Data Flow**
1. **ESP32 → Server**: Sends sensor data every 10 seconds via WebSocket + HTTP
2. **Server → Web App**: Broadcasts real-time updates to all connected clients
3. **Web App → Server**: Sends control commands (extend/retract rack)
4. **Server → ESP32**: Forwards commands to ESP32 via WebSocket

### **Connection Status**
- 🟢 **Green**: ESP32 connected and sending real data
- 🟡 **Yellow**: Using mock data (ESP32 offline)
- 🔴 **Red**: Server disconnected

---

## 📡 **API Endpoints**

### **Get Device Data**
```http
GET /api/device/data
```

**Response:**
```json
{
  "success": true,
  "data": {
    "temperature": 26.5,
    "humidity": 58.2,
    "uvIndex": 7,
    "windSpeed": 10.5,
    "batteryLevel": 85,
    "isCharging": true,
    "currentOutput": 102.8,
    "rackPosition": "extended",
    "autoMode": true,
    "connected": true,
    "esp32Connected": true,
    "lastUpdate": "2026-03-15T12:07:00.000Z"
  }
}
```

### **Control Rack**
```http
POST /api/device/control/rack
Content-Type: application/json

{
  "position": "extend"  // or "retract"
}
```

### **Toggle Auto Mode**
```http
POST /api/device/control/auto-mode
Content-Type: application/json

{
  "enabled": true  // or false
}
```

### **Get System Status**
```http
GET /api/status
```

---

## 🔌 **WebSocket Events**

### **From ESP32 to Server**
- `esp32-identify`: ESP32 announces itself
- `esp32-ping`: Keep-alive heartbeat
- Device data JSON updates

### **From Server to ESP32**
- `esp32-pong`: Response to ping
- `rack-control`: { position: "extend"|"retract" }
- `auto-mode-toggle`: { enabled: true|false }

### **From Server to Web App**
- `device-data-update`: Real-time sensor data
- `esp32-status`: { connected: true|false }

---

## 🛠️ **Troubleshooting**

### **ESP32 Cannot Connect to Server**

1. **Check IP Address**: Make sure `SERVER_HOST` matches your computer's IP
2. **Check Firewall**: Allow port 3001 through your firewall
3. **Check WiFi**: Ensure ESP32 is connected to the same network
4. **Check Server**: Make sure the server is running on port 3001

**ESP32 Serial Monitor should show:**
```
=== WIFI CONNECTION SUCCESSFUL ===
Connected to: ELBH2025
IP Address: 192.168.1.105
🔌 WebSocket connected to server
📊 Sensor data sent to server
```

### **Web App Shows Mock Data**

1. **Check Server**: Ensure server is running (`npm run dev`)
2. **Check ESP32**: Look for "WebSocket connected" in Serial Monitor
3. **Check Browser Console**: Look for WebSocket connection errors
4. **Check Network**: Verify both devices are on same WiFi network

### **Rack Control Not Working**

1. **Check ESP32 Motors**: Verify motor wiring and power
2. **Check Commands**: Look for "Rack control" messages in ESP32 Serial Monitor
3. **Check WebSocket**: Ensure bidirectional communication is working

---

## 🎮 **Testing Your System**

### **1. Test Server API**
```bash
# Test server status
curl http://localhost:3001/api/status

# Test device data
curl http://localhost:3001/api/device/data
```

### **2. Test Rack Control**
```bash
# Extend rack
curl -X POST http://localhost:3001/api/device/control/rack \
  -H "Content-Type: application/json" \
  -d '{"position":"extend"}'

# Retract rack
curl -X POST http://localhost:3001/api/device/control/rack \
  -H "Content-Type: application/json" \
  -d '{"position":"retract"}'
```

### **3. Monitor ESP32**
Open Arduino Serial Monitor (115200 baud) to see:
- WiFi connection status
- Server connection status
- Sensor readings
- Motor control commands

---

## 🌟 **Benefits of Your New System**

✅ **No Dependencies**: You control everything  
✅ **Better Performance**: Direct connection, no middleman  
✅ **Complete Privacy**: Your data stays on your network  
✅ **Unlimited Customization**: Add any features you want  
✅ **Free Forever**: No subscription costs  
✅ **Reliable**: Only depends on your network and hardware  

---

## 🚀 **Next Steps**

1. **Deploy Server**: For production, deploy to a cloud service
2. **Add Database**: Store historical data with MongoDB or PostgreSQL
3. **Add Authentication**: Secure your API endpoints
4. **Add Mobile App**: Create a mobile app using the same API
5. **Add More Sensors**: Expand with additional IoT sensors

Your Smart Drying Rack is now completely independent and under your full control! 🎉
