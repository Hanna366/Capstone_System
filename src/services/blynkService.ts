// Service for connecting to Blynk IoT platform and handling real-time data
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
  rainDetected: boolean;
}

// Mock initial data - in a real application, this would come from Blynk API
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
  connected: true,
  lastUpdate: new Date(),
  rainDetected: false,
};

class BlynkService {
  private static instance: BlynkService;
  private apiKey: string | null = null;
  private deviceData: DeviceData = MOCK_DEVICE_DATA;
  private subscribers: Array<(data: DeviceData) => void> = [];
  private pollingInterval: NodeJS.Timeout | null = null;
  
  // In a real application, these would be actual Blynk server endpoints
  private readonly BASE_URL = 'https://api.blynk.cloud';
  private readonly POLLING_INTERVAL = 5000; // 5 seconds
  
  private constructor() {
    // Initialize with mock data
    this.deviceData = { ...MOCK_DEVICE_DATA };
  }

  public static getInstance(): BlynkService {
    if (!BlynkService.instance) {
      BlynkService.instance = new BlynkService();
    }
    return BlynkService.instance;
  }

  public async initialize(apiKey: string): Promise<boolean> {
    try {
      this.apiKey = apiKey;
      
      // Validate API key with Blynk cloud
      const isValid = await this.validateApiKey();
      
      if (isValid) {
        // Start polling for device updates
        this.startPolling();
        notificationService.notifyConnectionStatus(true, "Successfully connected to Blynk IoT Platform");
        return true;
      } else {
        throw new Error("Invalid API key");
      }
    } catch (error) {
      console.error('Failed to initialize Blynk service:', error);
      notificationService.notifyConnectionStatus(false, "Failed to connect to Blynk IoT Platform");
      return false;
    }
  }

  private async validateApiKey(): Promise<boolean> {
    // Simulate API key validation
    // In a real app, this would make an actual API call to Blynk
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.apiKey !== null && this.apiKey.length > 0);
      }, 500);
    });
  }

  private startPolling(): void {
    this.stopPolling(); // Stop any existing polling
    
    this.pollingInterval = setInterval(async () => {
      try {
        const newData = await this.fetchDeviceData('sensor'); // Added the required 'source' argument
        this.updateDeviceData(newData);
      } catch (error) {
        console.error('Error fetching device data:', error);
        // Mark device as disconnected if we can't get data
        this.updateDeviceData({
          ...this.deviceData,
          connected: false,
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

  public async fetchDeviceData(source: 'sensor' | 'api'): Promise<DeviceData> {
    const isRainSensorConnected = await this.isRainSensorConnected();

    if (isRainSensorConnected) {
      const isRaining = await this.getRainSensorStatus();

      const updatedData: DeviceData = {
        ...this.deviceData,
        rackPosition: isRaining ? 'retracted' : this.deviceData.rackPosition,
        rainDetected: isRaining,
        lastUpdate: new Date(),
      };

      if (isRaining) {
        notificationService.notifyMovement('retracted', 'auto');
        notificationService.notifyTransaction(
          'auto_retract',
          `Rack automatically retracted due to rain detected by the rain sensor`,
          'warning'
        );
      }

      this.updateDeviceData(updatedData);
      return updatedData;
    } else {
      console.warn("Rain sensor not connected. Using weather API as backup.");
      const weatherData = await weatherService.getCurrentWeather('Manila,PH');

      const newData: DeviceData = {
        ...this.deviceData,
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        uvIndex: weatherData.uvIndex,
        windSpeed: weatherData.windSpeed,
        rainDetected: weatherData.humidity > 80, // Assume rain if humidity is high
        connected: true,
        lastUpdate: new Date(),
      };

      this.updateDeviceData(newData);
      return newData;
    }
  }

  private updateDeviceData(newData: DeviceData): void {
    this.deviceData = newData;
    this.notifySubscribers(newData);
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
      // Simulate sending command to IoT device via Blynk
      // In a real app, this would make an API call to Blynk
      const response = await new Promise<{ success: boolean }>((resolve) => {
        setTimeout(() => {
          // Simulate the action
          const newPosition = position === 'extend' ? 'extended' : 'retracted';
          
          this.updateDeviceData({
            ...this.deviceData,
            rackPosition: newPosition,
            lastUpdate: new Date(),
          });

          resolve({ success: true });
        }, 1000);
      });

      if (response.success) {
        // Notify about the movement
        notificationService.notifyMovement(
          position === 'extend' ? 'extended' : 'retracted', 
          'manual'
        );
        
        // Also notify as a transaction
        notificationService.notifyTransaction(
          'rack_control', 
          `Rack ${position === 'extend' ? 'extended' : 'retracted'} successfully`, 
          'success'
        );
        
        return true;
      } else {
        throw new Error('Failed to control rack');
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
      // Simulate sending command to IoT device via Blynk
      const response = await new Promise<{ success: boolean }>((resolve) => {
        setTimeout(() => {
          this.updateDeviceData({
            ...this.deviceData,
            autoMode: enabled,
            lastUpdate: new Date(),
          });

          resolve({ success: true });
        }, 500);
      });

      if (response.success) {
        // Notify about the auto mode change
        notificationService.notify(
          'system_status', 
          `Auto mode ${enabled ? 'enabled' : 'disabled'}`, 
          `Automatic rack control has been ${enabled ? 'enabled' : 'disabled'}`, 
          enabled ? 'info' : 'warning'
        );
        
        // Also notify as a transaction
        notificationService.notifyTransaction(
          'auto_mode_toggle', 
          `Auto mode ${enabled ? 'enabled' : 'disabled'}`, 
          enabled ? 'info' : 'warning'
        );
        
        return true;
      } else {
        throw new Error('Failed to toggle auto mode');
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

  public async toggleRackAutoMode(enabled: boolean): Promise<boolean> {
    try {
      // Simulate sending command to IoT device via Blynk
      const response = await new Promise<{ success: boolean }>((resolve) => {
        setTimeout(() => {
          this.updateDeviceData({
            ...this.deviceData,
            autoMode: enabled,
            lastUpdate: new Date(),
          });

          resolve({ success: true });
        }, 500);
      });

      if (response.success) {
        // Notify about the auto mode change
        notificationService.notify(
          'system_status', 
          `Rack Auto mode ${enabled ? 'enabled' : 'disabled'}`, 
          `Automatic rack control has been ${enabled ? 'enabled' : 'disabled'}`, 
          enabled ? 'info' : 'warning'
        );

        notificationService.notifyTransaction(
          'rack_auto_mode_toggle', 
          `Rack Auto mode ${enabled ? 'enabled' : 'disabled'}`, 
          enabled ? 'info' : 'warning'
        );

        return true;
      } else {
        throw new Error('Failed to toggle rack auto mode');
      }
    } catch (error) {
      console.error('Error toggling rack auto mode:', error);
      notificationService.notify(
        'system_status', 
        `Failed to ${enabled ? 'enable' : 'disable'} rack auto mode`, 
        `An error occurred while changing rack auto mode status`, 
        'error'
      );

      notificationService.notifyTransaction(
        'rack_auto_mode_toggle_failed', 
        `Failed to ${enabled ? 'enable' : 'disable'} rack auto mode`, 
        'error'
      );

      return false;
    }
  }

  public disconnect(): void {
    this.stopPolling();
    this.apiKey = null;
    this.deviceData = {
      ...this.deviceData,
      connected: false,
    };
    notificationService.notifyConnectionStatus(false, "Disconnected from Blynk IoT Platform");
  }

  // Check if the rain sensor is connected
  public async isRainSensorConnected(): Promise<boolean> {
    try {
      const response = await fetch("/api/rain-sensor/status"); // Replace with actual endpoint
      const data = await response.json();
      return data.connected;
    } catch (error) {
      console.error("Error checking rain sensor connection:", error);
      return false;
    }
  }

  // Get the rain sensor status
  public async getRainSensorStatus(): Promise<boolean> {
    try {
      const response = await fetch("/api/rain-sensor/rain-status"); // Replace with actual endpoint

      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response format: Expected JSON");
      }

      const data = await response.json();
      return data.isRaining;
    } catch (error) {
      console.error("Error retrieving rain sensor status:", error);
      return false;
    }
  }
}

export const blynkService = BlynkService.getInstance();