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
    <Card className="p-6 bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.02]">
      <h2 className="text-2xl font-semibold text-white mb-5 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Live Weather</h2>
      
      {location && (
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-gray-300">{location}</span>
        </div>
      )}
      
      {description && (
        <p className="text-sm text-gray-400 mb-5 capitalize">{description}</p>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <Thermometer className="h-5 w-5 text-orange-400" />
              <span className="text-sm font-medium text-gray-300">Temperature</span>
            </div>
            <div className="text-2xl font-bold text-white">{temperature}°C</div>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Humidity</span>
            </div>
            <div className="text-2xl font-bold text-white">{humidity}%</div>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <Sun className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">UV Index</span>
            </div>
            <div className="text-2xl font-bold text-white">{uvIndex}</div>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <Wind className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Wind Speed</span>
            </div>
            <div className="text-2xl font-bold text-white">{windSpeed} km/h</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          Real-time data from OpenWeatherMap API
        </div>
      </div>
    </Card>
  );
};
