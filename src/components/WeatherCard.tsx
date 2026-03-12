import { Cloud, Thermometer, Droplets, Sun, Wind, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WeatherCardProps {
  temperature: number;
  humidity: number;
  uvIndex: number;
  windSpeed: number;
  location?: string;
  description?: string;
}

export const WeatherCard = ({ temperature, humidity, uvIndex, windSpeed, location, description }: WeatherCardProps) => {
  return (
    <Card className="p-6 bg-[hsl(var(--card))] backdrop-blur-sm rounded-3xl shadow-2xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-all duration-300 hover:shadow-[hsl(var(--primary))] hover:scale-[1.02]">
      <h2 className="text-2xl font-semibold text-[hsl(var(--card-foreground))] mb-5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">Live Weather</h2>
      
      {location && (
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-[hsl(var(--primary))]" />
          <span className="text-sm text-[hsl(var(--muted-foreground))]">{location}</span>
        </div>
      )}
      
      {description && (
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-5 capitalize">{description}</p>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
            <div className="flex items-center gap-3 mb-2">
              <Thermometer className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Temperature</span>
            </div>
            <div className="text-2xl font-bold text-[hsl(var(--card-foreground))]">{temperature}°C</div>
          </div>

          <div className="p-4 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Humidity</span>
            </div>
            <div className="text-2xl font-bold text-[hsl(var(--card-foreground))]">{humidity}%</div>
          </div>

          <div className="p-4 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
            <div className="flex items-center gap-3 mb-2">
              <Sun className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">UV Index</span>
            </div>
            <div className="text-2xl font-bold text-[hsl(var(--card-foreground))]">{uvIndex}</div>
          </div>

          <div className="p-4 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
            <div className="flex items-center gap-3 mb-2">
              <Wind className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Wind Speed</span>
            </div>
            <div className="text-2xl font-bold text-[hsl(var(--card-foreground))]">{windSpeed} km/h</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          Real-time data from OpenWeatherMap API
        </div>
      </div>
    </Card>
  );
};
