// Service for connecting to your own web server and ESP32
import { toast } from "sonner";
import { notificationService } from "./notificationService";
import { weatherService } from "./weatherService";

// Define types for our IoT device data
export interface DeviceData {
  batteryLevel: number;
  isCharging: boolean;
  currentOutput: number;
  temperature: number;
  humidity: number;
  uvIndex: number;
  windSpeed: number;
  rackPosition: 'extended' | 'retracted';
  autoMode: boolean;
  connected: boolean;
  lastUpdate: Date;
  dataSource: 'mock' | 'real'; // Track data source
  esp32Connected: boolean;
}

// Mock initial data - used when ESP32 is not connected
const MOCK_DEVICE_DATA: DeviceData = {
  batteryLevel: 85,
  isCharging: true,
  currentOutput: 102.79829981950481,
  temperature: 26,
  humidity: 58,
  uvIndex: 7,
  windSpeed: 10,
  rackPosition: 'extended',
  autoMode: true,
  connected: false,
  lastUpdate: new Date(),
  dataSource: 'mock',
  esp32Connected: false,
};

class SmartDryingService {
  private static instance: SmartDryingService;
  private serverUrl: string | null = null;
  private deviceData: DeviceData = MOCK_DEVICE_DATA;
  private subscribers: Array<(data: DeviceData) => void> = [];
  private pollingInterval: NodeJS.Timeout | null = null;
  private websocketConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  // Server configuration
  private readonly BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' // Your production server URL
    : 'http://localhost:3001'; // Local development server
  private readonly WS_URL = process.env.NODE_ENV === 'production'
    ? 'wss://your-domain.com'
    : 'ws://localhost:3001';
  private readonly POLLING_INTERVAL = 5000; // 5 seconds
  
  private constructor() {
    // Initialize with mock data
    this.deviceData = { ...MOCK_DEVICE_DATA };
  }

  public static getInstance(): SmartDryingService {
    if (!SmartDryingService.instance) {
      SmartDryingService.instance = new SmartDryingService();
    }
    return SmartDryingService.instance;
  }

  public async initialize(serverUrl?: string): Promise<boolean> {
    try {
      this.serverUrl = serverUrl || this.BASE_URL;
      
      // Test server connection
      const isConnected = await this.testServerConnection();
      
      if (isConnected) {
        // Start WebSocket connection for real-time updates
        this.connectWebSocket();
        
        // Start polling for device updates
        this.startPolling();
        
        notificationService.notifyConnectionStatus(true, "Successfully connected to Smart Drying Rack Server");
        console.log('✅ Smart Drying Service initialized successfully');
        return true;
      } else {
        throw new Error("Cannot connect to server");
      }
    } catch (error) {
      console.error('Failed to initialize Smart Drying service:', error);
      notificationService.notifyConnectionStatus(false, "Failed to connect to Smart Drying Rack Server");
      console.log('⚠️ Using mock data - server not available');
      return false;
    }
  }

  private async testServerConnection(): Promise<boolean> {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });

      // Create the fetch promise
      const fetchPromise = fetch(`${this.serverUrl}/api/status`, {
        method: 'GET'
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      return response.ok;
    } catch (error) {
      console.log('Server connection test failed:', error);
      return false;
    }
  }

  private connectWebSocket(): void {
    try {
      if (this.websocketConnection) {
        this.websocketConnection.close();
      }

      this.websocketConnection = new WebSocket(this.WS_URL);

      this.websocketConnection.onopen = () => {
        console.log('🔌 WebSocket connected to server');
        this.reconnectAttempts = 0;
      };

      this.websocketConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'device-data-update':
              this.handleDeviceDataUpdate(data.payload);
              break;
            case 'esp32-status':
              this.handleESP32Status(data.payload);
              break;
            default:
              console.log('Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.websocketConnection.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.attemptReconnect();
      };

      this.websocketConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connectWebSocket();
      }, 2000 * this.reconnectAttempts); // Exponential backoff
    } else {
      console.log('❌ Max reconnection attempts reached');
      notificationService.notifyConnectionStatus(false, "Lost connection to server");
    }
  }

  private handleDeviceDataUpdate(data: DeviceData): void {
    const updatedData = {
      ...data,
      dataSource: 'real' as const,
      lastUpdate: new Date(data.lastUpdate)
    };
    
    this.updateDeviceData(updatedData);
    
    // Check for weather-triggered rack movements
    this.checkWeatherTriggers(updatedData);
  }

  private handleESP32Status(status: { connected: boolean }): void {
    this.updateDeviceData({
      ...this.deviceData,
      esp32Connected: status.connected,
      connected: status.connected,
      lastUpdate: new Date()
    });

    if (status.connected) {
      console.log('🎯 ESP32 is online and connected');
      notificationService.notifyConnectionStatus(true, "ESP32 device connected");
    } else {
      console.log('⚠️ ESP32 is offline');
      notificationService.notifyConnectionStatus(false, "ESP32 device disconnected");
    }
  }

  private checkWeatherTriggers(data: DeviceData): void {
    // If high wind or high humidity and rack is extended, auto-retract
    if ((data.windSpeed > 20 || data.humidity > 75) && data.rackPosition === 'extended' && data.autoMode) {
      this.controlRack('retract');
      notificationService.notifyMovement('retracted', 'weather_condition');
      notificationService.notifyTransaction(
        'auto_retract', 
        `Rack automatically retracted due to weather conditions (wind: ${data.windSpeed}km/h, humidity: ${data.humidity}%)`, 
        'warning'
      );
    }
    
    // If low humidity and good conditions and rack is retracted, suggest extending
    if (data.humidity < 40 && data.windSpeed < 15 && data.temperature > 20 && data.rackPosition === 'retracted' && data.autoMode) {
      this.controlRack('extend');
      notificationService.notifyMovement('extended', 'weather_condition');
      notificationService.notifyTransaction(
        'auto_extend', 
        `Rack automatically extended due to favorable conditions (temp: ${data.temperature}°C, humidity: ${data.humidity}%)`, 
        'info'
      );
    }
  }

  private startPolling(): void {
    this.stopPolling(); // Stop any existing polling
    
    this.pollingInterval = setInterval(async () => {
      try {
        if (!this.deviceData.esp32Connected) {
          // Only poll via HTTP if WebSocket is not connected to ESP32
          const newData = await this.fetchDeviceData();
          this.updateDeviceData(newData);
        }
      } catch (error) {
        console.error('Error polling device data:', error);
        // Mark device as disconnected if we can't get data
        this.updateDeviceData({
          ...this.deviceData,
          connected: false,
          esp32Connected: false,
          lastUpdate: new Date()
        });
      }
    }, this.POLLING_INTERVAL);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private async fetchDeviceData(): Promise<DeviceData> {
    try {
      const response = await fetch(`${this.serverUrl}/api/device/data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          ...result.data,
          dataSource: 'real',
          lastUpdate: new Date(result.data.lastUpdate)
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching device data:', error);
      // Return mock data if server is unavailable
      return {
        ...this.deviceData,
        dataSource: 'mock',
        connected: false,
        esp32Connected: false,
        lastUpdate: new Date()
      };
    }
  }

  private updateDeviceData(newData: DeviceData): void {
    const oldDataSource = this.deviceData.dataSource;
    this.deviceData = newData;
    
    // Notify subscribers
    this.notifySubscribers(newData);
    
    // Log data source changes
    if (oldDataSource !== newData.dataSource) {
      if (newData.dataSource === 'real') {
        console.log('🟢 Switched to real ESP32 data');
      } else {
        console.log('🟡 Switched to mock data');
      }
    }
  }

  public subscribe(callback: (data: DeviceData) => void): () => void {
    this.subscribers.push(callback);
    
    // Immediately send current data
    callback(this.deviceData);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(data: DeviceData): void {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  public getDeviceData(): DeviceData {
    return { ...this.deviceData };
  }

  public async controlRack(position: 'extend' | 'retract'): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/api/device/control/rack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ position })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state immediately
        this.updateDeviceData({
          ...this.deviceData,
          rackPosition: position === 'extend' ? 'extended' : 'retracted',
          lastUpdate: new Date()
        });

        // Notify about the movement
        notificationService.notifyMovement(
          position === 'extend' ? 'extended' : 'retracted', 
          'manual'
        );
        
        notificationService.notifyTransaction(
          'rack_control', 
          `Rack ${position === 'extend' ? 'extended' : 'retracted'} successfully`, 
          'success'
        );
        
        console.log(`🎛️ Rack control: ${position} - Command sent successfully`);
        return true;
      } else {
        throw new Error(result.error || 'Failed to control rack');
      }
    } catch (error) {
      console.error('Error controlling rack:', error);
      notificationService.notify(
        'movement', 
        `Failed to ${position} rack`, 
        `An error occurred while attempting to ${position} the rack`, 
        'error'
      );
      
      notificationService.notifyTransaction(
        'rack_control_failed', 
        `Failed to ${position} rack`, 
        'error'
      );
      return false;
    }
  }

  public async toggleAutoMode(enabled: boolean): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/api/device/control/auto-mode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state immediately
        this.updateDeviceData({
          ...this.deviceData,
          autoMode: enabled,
          lastUpdate: new Date()
        });

        // Notify about the auto mode change
        notificationService.notify(
          'system_status', 
          `Auto mode ${enabled ? 'enabled' : 'disabled'}`, 
          `Automatic rack control has been ${enabled ? 'enabled' : 'disabled'}`, 
          enabled ? 'info' : 'warning'
        );
        
        notificationService.notifyTransaction(
          'auto_mode_toggle', 
          `Auto mode ${enabled ? 'enabled' : 'disabled'}`, 
          enabled ? 'info' : 'warning'
        );
        
        console.log(`🔄 Auto mode: ${enabled ? 'ON' : 'OFF'} - Command sent successfully`);
        return true;
      } else {
        throw new Error(result.error || 'Failed to toggle auto mode');
      }
    } catch (error) {
      console.error('Error toggling auto mode:', error);
      notificationService.notify(
        'system_status', 
        `Failed to ${enabled ? 'enable' : 'disable'} auto mode`, 
        `An error occurred while changing auto mode status`, 
        'error'
      );
      
      notificationService.notifyTransaction(
        'auto_mode_toggle_failed', 
        `Failed to ${enabled ? 'enable' : 'disable'} auto mode`, 
        'error'
      );
      
      return false;
    }
  }

  public disconnect(): void {
    this.stopPolling();
    
    if (this.websocketConnection) {
      this.websocketConnection.close();
      this.websocketConnection = null;
    }
    
    this.serverUrl = null;
    this.deviceData = {
      ...this.deviceData,
      connected: false,
      esp32Connected: false,
    };
    
    notificationService.notifyConnectionStatus(false, "Disconnected from Smart Drying Rack Server");
    console.log('🔌 Smart Drying Service disconnected');
  }

  // Get server status
  public async getServerStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.serverUrl}/api/status`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting server status:', error);
      return null;
    }
  }
}

export const smartDryingService = SmartDryingService.getInstance();
