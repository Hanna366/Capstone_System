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
};

class BlynkService {
  private static instance: BlynkService;
  private apiKey: string | null = null;
  private deviceData: DeviceData = MOCK_DEVICE_DATA;
  private subscribers: Array<(data: DeviceData) => void> = [];
  private pollingInterval: NodeJS.Timeout | null = null;
  
  // In a real application, these would be actual Blynk server endpoints
  private readonly BASE_URL = 'https://blynk.cloud';
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
        const newData = await this.fetchDeviceData();
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

  private async fetchDeviceData(): Promise<DeviceData> {
    if (!this.apiKey) {
      // Return mock data if no API key
      console.log('No Blynk API key provided, using mock data');
      return this.getMockDeviceData();
    }

    try {
      // Check if we have a real API key (not the placeholder)
      if (this.apiKey === '8017448785254d2f8e4b8b6b8a5c4d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c') {
        console.log('Using mock data for testing (placeholder API key detected)');
        return this.getMockDeviceData();
      }

      // Try different Blynk endpoints
      let response: Response;
      
      try {
        // Try primary endpoint
        response = await fetch(`${this.BASE_URL}/external/api/get?token=${this.apiKey}&V0,V1,V2,V3,V4,V5,V6,V7,V8,V9`);
      } catch (primaryError) {
        console.warn('Primary Blynk endpoint failed, trying backup:', primaryError);
        try {
          // Try backup endpoint
          response = await fetch(`https://blynk.cloud/external/api/get?token=${this.apiKey}&V0,V1,V2,V3,V4,V5,V6,V7,V8,V9`);
        } catch (backupError) {
          console.error('Both Blynk endpoints failed:', backupError);
          throw new Error('Unable to connect to Blynk servers');
        }
      }
      
      if (!response.ok) {
        if (response.status === 400) {
          console.error('❌ Blynk Auth Token Error (400 Bad Request)');
          console.error('This means:');
          console.error('1. Auth token is invalid or expired');
          console.error('2. Device not properly configured in Blynk');
          console.error('3. Wrong device template or settings');
          throw new Error('Invalid Blynk Auth Token or device configuration');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      
      // Parse Blynk response from ESP32
      const deviceData: DeviceData = {
        temperature: parseFloat(data.V0) || this.deviceData.temperature,
        humidity: parseFloat(data.V1) || this.deviceData.humidity,
        uvIndex: parseInt(data.V2) || this.deviceData.uvIndex,
        windSpeed: parseFloat(data.V3) || this.deviceData.windSpeed,
        batteryLevel: parseInt(data.V4) || this.deviceData.batteryLevel,
        isCharging: data.V5 === 1,
        currentOutput: parseFloat(data.V6) || this.deviceData.currentOutput,
        rackPosition: data.V7 === 'extended' ? 'extended' : 'retracted', // ESP32 sends string values
        autoMode: data.V8 === 1,
        connected: true,
        lastUpdate: new Date(),
      };

      console.log('✅ Real ESP32 data received:', deviceData);
      return deviceData;
      
    } catch (error) {
      console.error('❌ Error fetching Blynk data:', error);
      // Fall back to mock data with connection status false
      return {
        ...this.getMockDeviceData(),
        connected: false,
        lastUpdate: new Date(),
      };
    }
  }

  private updateDeviceData(newData: DeviceData): void {
    this.deviceData = newData;
    this.notifySubscribers(newData);
  }

  private notifySubscribers(newData: DeviceData): void {
    // Ensure we're passing a valid DeviceData object
    if (!newData || typeof newData !== 'object') {
      console.error('Invalid data passed to notifySubscribers:', newData);
      return;
    }
    
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(newData);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  public subscribe(callback: (data: DeviceData) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  public unsubscribe(callback: (data: DeviceData) => void): void {
    const index = this.subscribers.indexOf(callback);
    if (index > -1) {
      this.subscribers.splice(index, 1);
    }
  }

  public disconnect(): void {
    this.stopPolling();
    this.subscribers = [];
    this.deviceData = {
      ...this.deviceData,
      connected: false,
      lastUpdate: new Date()
    };
    console.log('BlynkService disconnected');
  }

  public getDeviceData(): DeviceData {
    return this.deviceData;
  }

  public async sendCommand(command: string, value: any): Promise<void> {
    if (!this.apiKey) {
      console.warn('No Blynk API key provided, cannot send command');
      return;
    }

    try {
      const virtualPin = this.getVirtualPinForCommand(command);
      const url = `${this.BASE_URL}/external/api/update?token=${this.apiKey}&${virtualPin}=${value}`;
      
      console.log(`📤 Sending command to ESP32: ${command} = ${value}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`✅ Command sent successfully: ${command}`);
      
      notificationService.notify(
        'hardware_control',
        'Command Sent to ESP32',
        `${command}: ${value}`,
        'success',
        { command, value, timestamp: new Date() }
      );
      
    } catch (error) {
      console.error('❌ Error sending command to ESP32:', error);
      
      notificationService.notify(
        'hardware_control',
        'Command Failed',
        `Failed to send ${command}: ${error}`,
        'error',
        { command, value, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      
      throw error;
    }
  }

  private getVirtualPinForCommand(command: string): string {
    switch (command) {
      case 'extendRack': return 'V7'; // ESP32 uses V7 for rack position
      case 'retractRack': return 'V7'; // Same pin with different value
      case 'toggleAutoMode': return 'V8'; // ESP32 uses V8 for auto mode
      case 'toggleManualControl': return 'V9'; // ESP32 uses V9 for manual control
      default: throw new Error(`Unknown command: ${command}`);
    }
  }

  public async extendRack(): Promise<void> {
    await this.sendCommand('extendRack', 'extended'); // ESP32 expects string "extended"
    this.updateDeviceData({
      ...this.deviceData,
      rackPosition: 'extended',
      lastUpdate: new Date(),
    });
  }

  public async retractRack(): Promise<void> {
    await this.sendCommand('retractRack', 'retracted'); // ESP32 expects string "retracted"
    this.updateDeviceData({
      ...this.deviceData,
      rackPosition: 'retracted',
      lastUpdate: new Date(),
    });
  }

  public async toggleAutoMode(enabled: boolean): Promise<void> {
    await this.sendCommand('toggleAutoMode', enabled ? 1 : 0); // ESP32 expects boolean as 0/1
    this.updateDeviceData({
      ...this.deviceData,
      autoMode: enabled,
      lastUpdate: new Date(),
    });
  }

  public async controlRack(position: 'extend' | 'retract'): Promise<boolean> {
    try {
      if (position === 'extend') {
        await this.extendRack();
      } else {
        await this.retractRack();
      }
      return true;
    } catch (error) {
      console.error('Failed to control rack:', error);
      return false;
    }
  }

  private getMockDeviceData(): DeviceData {
    return { ...MOCK_DEVICE_DATA };
  }
}

export const blynkService = BlynkService.getInstance();
