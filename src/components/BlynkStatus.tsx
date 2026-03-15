import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeviceData } from '@/services/blynkService';

interface BlynkStatusProps {
  deviceData: DeviceData | null;
}

export const BlynkStatus = ({ deviceData }: BlynkStatusProps) => {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'mock' | 'real'>('disconnected');
  const [lastStatusChange, setLastStatusChange] = useState<Date>(new Date());

  useEffect(() => {
    if (!deviceData) {
      setConnectionStatus('disconnected');
      return;
    }

    // Detect data source and update status
    if (deviceData.dataSource === 'real') {
      if (connectionStatus !== 'real') {
        setConnectionStatus('real');
        setLastStatusChange(new Date());
        console.log('🟢 Blynk Status: Connected to real ESP32 device');
      }
    } else if (deviceData.dataSource === 'mock') {
      if (connectionStatus !== 'mock') {
        setConnectionStatus('mock');
        setLastStatusChange(new Date());
        console.log('🟡 Blynk Status: Using mock data (ESP32 not connected)');
      }
    } else {
      if (connectionStatus !== 'disconnected') {
        setConnectionStatus('disconnected');
        setLastStatusChange(new Date());
        console.log('🔴 Blynk Status: Disconnected');
      }
    }
  }, [deviceData, connectionStatus]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'real': return 'bg-green-500';
      case 'mock': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'real': return 'Connected to ESP32';
      case 'mock': return 'Using Mock Data';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  const getStatusDescription = () => {
    switch (connectionStatus) {
      case 'real':
        return 'System is receiving real data from your ESP32 device. All controls are fully functional.';
      case 'mock':
        return 'System is using simulated data. ESP32 device is not connected or Blynk token is invalid.';
      case 'disconnected':
        return 'No connection to Blynk service. Please check your network and Blynk configuration.';
      default:
        return 'Status unknown. Please refresh the page.';
    }
  };

  const getBadgeVariant = () => {
    switch (connectionStatus) {
      case 'real': return 'default';
      case 'mock': return 'secondary';
      case 'disconnected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
          Blynk Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={getBadgeVariant()}>
            {getStatusText()}
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">{getStatusDescription()}</p>
          <p className="text-xs">
            Last updated: {lastStatusChange.toLocaleTimeString()}
          </p>
        </div>

        {deviceData && (
          <div className="border-t pt-3">
            <div className="text-sm font-medium mb-2">Device Information:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Data Source:</span>
                <span className="ml-1 font-mono">{deviceData.dataSource || 'unknown'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Connected:</span>
                <span className="ml-1">{deviceData.connected ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Update:</span>
                <span className="ml-1">{deviceData.lastUpdate.toLocaleTimeString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Auto Mode:</span>
                <span className="ml-1">{deviceData.autoMode ? 'On' : 'Off'}</span>
              </div>
            </div>
          </div>
        )}

        {connectionStatus === 'mock' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm">
              <div className="font-medium text-yellow-800 mb-1">⚠️ Mock Data Active</div>
              <div className="text-yellow-700">
                To connect to your real ESP32:
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Create a new device in Blynk.cloud</li>
                  <li>Get your valid Auth Token</li>
                  <li>Update the token in your ESP32 code</li>
                  <li>Ensure ESP32 is connected to WiFi</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {connectionStatus === 'real' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm">
              <div className="font-medium text-green-800 mb-1">✅ Real ESP32 Connected</div>
              <div className="text-green-700">
                Your Smart Drying Rack is fully operational! You can control the rack remotely and monitor real sensor data.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
