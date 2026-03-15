import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO for real-time communication
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Device state storage (in production, use a database)
let deviceState = {
  batteryLevel: 85,
  isCharging: true,
  currentOutput: 102.8,
  temperature: 26,
  humidity: 58,
  uvIndex: 7,
  windSpeed: 10,
  rackPosition: 'extended' as 'extended' | 'retracted',
  autoMode: true,
  connected: false,
  lastUpdate: new Date(),
  esp32Connected: false,
  lastESP32Ping: new Date()
};

// WebSocket connections storage
const connectedClients = new Set();
const esp32Device = new Set();

// REST API Routes

// Get current device data
app.get('/api/device/data', (req, res) => {
  res.json({
    success: true,
    data: deviceState
  });
});

// Update device data (from ESP32)
app.post('/api/device/data', (req, res) => {
  try {
    const newData = req.body;
    
    // Update device state
    deviceState = {
      ...deviceState,
      ...newData,
      lastUpdate: new Date(),
      esp32Connected: true,
      lastESP32Ping: new Date(),
      connected: true
    };

    // Broadcast to all connected web clients
    io.emit('device-data-update', deviceState);

    // Log the update
    console.log(`📡 ESP32 Data Received:`, {
      temperature: newData.temperature,
      humidity: newData.humidity,
      battery: newData.batteryLevel,
      rackPosition: newData.rackPosition
    });

    res.json({ success: true, message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating device data:', error);
    res.status(500).json({ success: false, error: 'Failed to update data' });
  }
});

// Control rack (from web app)
app.post('/api/device/control/rack', (req: any, res: any): void => {
  try {
    const { position } = req.body; // 'extend' or 'retract'
    
    if (!['extend', 'retract'].includes(position)) {
      res.status(400).json({ success: false, error: 'Invalid position' });
      return;
    }

    // Update rack position
    deviceState.rackPosition = position === 'extend' ? 'extended' : 'retracted';
    deviceState.lastUpdate = new Date();

    // Send command to ESP32
    io.emit('rack-control', { position, timestamp: new Date() });

    // Broadcast to all web clients
    io.emit('device-data-update', deviceState);

    console.log(`🎛️ Rack Control: ${position} - Sent to ESP32`);

    res.json({ 
      success: true, 
      message: `Rack ${position} command sent`,
      position: deviceState.rackPosition
    });
  } catch (error) {
    console.error('Error controlling rack:', error);
    res.status(500).json({ success: false, error: 'Failed to control rack' });
  }
});

// Toggle auto mode (from web app)
app.post('/api/device/control/auto-mode', (req, res) => {
  try {
    const { enabled } = req.body;
    
    // Update auto mode
    deviceState.autoMode = enabled;
    deviceState.lastUpdate = new Date();

    // Send command to ESP32
    io.emit('auto-mode-toggle', { enabled, timestamp: new Date() });

    // Broadcast to all web clients
    io.emit('device-data-update', deviceState);

    console.log(`🔄 Auto Mode: ${enabled ? 'ON' : 'OFF'} - Sent to ESP32`);

    res.json({ 
      success: true, 
      message: `Auto mode ${enabled ? 'enabled' : 'disabled'}`,
      autoMode: deviceState.autoMode
    });
  } catch (error) {
    console.error('Error toggling auto mode:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle auto mode' });
  }
});

// Get system status
app.get('/api/status', (req, res) => {
  const now = new Date();
  const esp32LastPing = new Date(deviceState.lastESP32Ping);
  const timeSinceLastPing = now.getTime() - esp32LastPing.getTime();
  
  // Consider ESP32 disconnected if no ping for 30 seconds
  const isESP32Online = timeSinceLastPing < 30000;

  res.json({
    success: true,
    status: {
      serverOnline: true,
      esp32Online: isESP32Online,
      connectedClients: connectedClients.size,
      esp32Connected: esp32Device.size > 0,
      lastESP32Ping: deviceState.lastESP32Ping,
      uptime: process.uptime()
    }
  });
});

// WebSocket Connection Handling

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  connectedClients.add(socket.id);

  // Send current device state to new client
  socket.emit('device-data-update', deviceState);

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    connectedClients.delete(socket.id);
  });

  // Handle ESP32 identification
  socket.on('esp32-identify', () => {
    console.log(`🎯 ESP32 identified: ${socket.id}`);
    esp32Device.add(socket.id);
    deviceState.esp32Connected = true;
    deviceState.lastESP32Ping = new Date();
    
    // Broadcast ESP32 connection status
    io.emit('esp32-status', { connected: true });
    io.emit('device-data-update', deviceState);
  });

  // Handle ESP32 disconnection
  socket.on('esp32-disconnect', () => {
    console.log(`🎯 ESP32 disconnected: ${socket.id}`);
    esp32Device.delete(socket.id);
    deviceState.esp32Connected = false;
    
    // Broadcast ESP32 disconnection status
    io.emit('esp32-status', { connected: false });
    io.emit('device-data-update', deviceState);
  });

  // Handle ESP32 ping (keep-alive)
  socket.on('esp32-ping', () => {
    deviceState.lastESP32Ping = new Date();
    deviceState.esp32Connected = true;
    socket.emit('esp32-pong', { timestamp: new Date() });
  });
});

// Check ESP32 connection status every 10 seconds
setInterval(() => {
  const now = new Date();
  const esp32LastPing = new Date(deviceState.lastESP32Ping);
  const timeSinceLastPing = now.getTime() - esp32LastPing.getTime();
  
  if (timeSinceLastPing > 30000 && deviceState.esp32Connected) {
    // ESP32 hasn't pinged for 30 seconds, mark as disconnected
    deviceState.esp32Connected = false;
    deviceState.connected = false;
    
    console.log('⚠️ ESP32 connection timeout - marking as disconnected');
    io.emit('esp32-status', { connected: false });
    io.emit('device-data-update', deviceState);
  }
}, 10000);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Smart Drying Rack Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for ESP32 and web client connections`);
  console.log(`🌐 API endpoints available:`);
  console.log(`   GET  /api/device/data - Get device data`);
  console.log(`   POST /api/device/data - Update device data (ESP32)`);
  console.log(`   POST /api/device/control/rack - Control rack`);
  console.log(`   POST /api/device/control/auto-mode - Toggle auto mode`);
  console.log(`   GET  /api/status - Get system status`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
