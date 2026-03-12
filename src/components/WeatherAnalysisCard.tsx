import { Sun, Thermometer, Droplets, Wind } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { fetchLiveWeatherData, fetchSensorData } from "@/services/weatherService";

interface WeatherAnalysisCardProps {
  temperature: number | null;
  humidity: number | null;
  uvIndex: number | null;
  windSpeed: number | null;
  isLiveWeatherData?: boolean;
  dataSource: 'sensor' | 'api';
  onDataSourceChange: (newSource: 'sensor' | 'api') => void;
}

export const WeatherAnalysisCard = ({ 
  temperature, 
  humidity, 
  uvIndex, 
  windSpeed,
  isLiveWeatherData = false,
  dataSource = 'sensor',
  onDataSourceChange
}: WeatherAnalysisCardProps) => {
  const [selectedDataSource, setSelectedDataSource] = useState<'sensor' | 'api'>(dataSource);

  useEffect(() => {
    if (selectedDataSource === 'api') {
      fetchLiveWeatherData().then(data => {
        // Update state with live weather data
      });
    } else {
      fetchSensorData().then(data => {
        // Update state with sensor data
      });
    }
  }, [selectedDataSource]);

  const handleDataSourceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSource = event.target.value as 'sensor' | 'api';
    setSelectedDataSource(newSource);
    onDataSourceChange(newSource);
  };

  const displayData = selectedDataSource === 'sensor' ? {
    temperature: 'No data (Sensor not connected)',
    humidity: 'No data (Sensor not connected)',
    uvIndex: 'No data (Sensor not connected)',
    windSpeed: 'No data (Sensor not connected)'
  } : {
    temperature: temperature !== null ? `${temperature}°C` : 'N/A',
    humidity: humidity !== null ? `${humidity}%` : 'N/A',
    uvIndex: uvIndex !== null ? uvIndex : 'N/A',
    windSpeed: windSpeed !== null ? `${windSpeed} km/h` : 'N/A'
  };

  return (
    <Card className="p-6 bg-[hsl(var(--card))] backdrop-blur-md rounded-3xl shadow-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-all duration-300 hover:shadow-[0_4px_15px_hsl(var(--primary))] hover:scale-[1.02]">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold text-[hsl(var(--card-foreground))] bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">Weather Analysis</h2>
        <select 
          value={selectedDataSource} 
          onChange={handleDataSourceChange} 
          className="p-2 border rounded-md bg-[hsl(var(--input))] text-[hsl(var(--card-foreground))] text-sm hover:border-[hsl(var(--primary))]" 
        >
          <option value="sensor">Rain Sensor</option>
          <option value="api">Weather Forecast</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:shadow-[0_4px_15px_hsl(var(--primary))]">
          <div className="flex items-center gap-3 mb-2">
            <Thermometer className="h-5 w-5 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Temperature</span>
          </div>
          <div className="text-2xl font-bold text-[hsl(var(--card-foreground))]">{displayData.temperature}</div>
        </div>

        <div className="p-4 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:shadow-[0_4px_15px_hsl(var(--primary))]">
          <div className="flex items-center gap-3 mb-2">
            <Droplets className="h-5 w-5 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Humidity</span>
          </div>
          <div className="text-2xl font-bold text-[hsl(var(--card-foreground))]">{displayData.humidity}</div>
        </div>

        <div className="p-4 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:shadow-[0_4px_15px_hsl(var(--primary))]">
          <div className="flex items-center gap-3 mb-2">
            <Sun className="h-5 w-5 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">UV Index</span>
          </div>
          <div className="text-2xl font-bold text-[hsl(var(--card-foreground))]">{displayData.uvIndex}</div>
        </div>

        <div className="p-4 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:shadow-[0_4px_15px_hsl(var(--primary))]">
          <div className="flex items-center gap-3 mb-2">
            <Wind className="h-5 w-5 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Wind Speed</span>
          </div>
          <div className="text-2xl font-bold text-[hsl(var(--card-foreground))]">{displayData.windSpeed}</div>
        </div>
      </div>
    </Card>
  );
};