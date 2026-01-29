import { Sun, Thermometer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { notificationService } from "@/services/notificationService";

interface WeatherAnalysisCardProps {
  temperature: number;
  humidity: number;
  uvIndex: number;
  windSpeed: number;
}

export const WeatherAnalysisCard = ({ 
  temperature, 
  humidity, 
  uvIndex, 
  windSpeed 
}: WeatherAnalysisCardProps) => {
  // Calculate comfort level based on various factors
  
  // Send weather alerts when conditions change
  useEffect(() => {
    if (humidity > 70) {
      notificationService.notifyWeatherAlert(
        "High Humidity", 
        "Humidity levels are above 70%. Consider retracting the rack to prevent moisture absorption."
      );
    }
    
    if (uvIndex > 8) {
      notificationService.notifyWeatherAlert(
        "High UV Levels", 
        "UV index is above 8. Clothes will dry faster but colors may fade."
      );
    }
    
    if (windSpeed > 20) {
      notificationService.notifyWeatherAlert(
        "High Wind Speed", 
        "Wind speeds are above 20 km/h. Rack may have been retracted automatically for safety."
      );
      
      // Engage perforated cover in high winds
      notificationService.notifyHardwareControl(
        "cover_switch",
        "Perforated cover engaged for high wind conditions (wind: " + windSpeed + " km/h)",
        "info"
      );
    }
    
    if (windSpeed > 15 && humidity > 60) {
      // Engage solid cover when windy and rainy/humid
      notificationService.notifyHardwareControl(
        "cover_switch",
        "Solid cover engaged for windy and humid conditions (wind: " + windSpeed + " km/h, humidity: " + humidity + "%)",
        "info"
      );
    } else if (windSpeed > 15 && humidity <= 60) {
      // Engage perforated cover in windy but dry conditions
      notificationService.notifyHardwareControl(
        "cover_switch",
        "Perforated cover engaged for windy and dry conditions (wind: " + windSpeed + " km/h, humidity: " + humidity + "%)",
        "info"
      );
    }
    
    if (temperature < 15) {
      notificationService.notifyWeatherAlert(
        "Low Temperature", 
        "Temperatures are below 15°C. Drying will be slower than usual."
      );
    }
  }, [humidity, uvIndex, windSpeed, temperature]);
  
  
  const calculateComfortLevel = (): { level: string; description: string; color: string; bgColor: string } => {
    // Temperature comfort calculation
    const tempComfort = Math.abs(temperature - 22); // 22°C is ideal
    const humComfort = Math.abs(humidity - 50); // 50% is ideal
    
    if (tempComfort <= 3 && humComfort <= 10 && uvIndex <= 5 && windSpeed <= 15) {
      return { 
        level: "OPTIMAL", 
        description: "Perfect conditions for outdoor drying", 
        color: "text-green-600",
        bgColor: "bg-green-50"
      };
    } else if (tempComfort <= 5 && humComfort <= 15 && uvIndex <= 7 && windSpeed <= 20) {
      return { 
        level: "GOOD", 
        description: "Acceptable conditions for outdoor drying", 
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      };
    } else if (tempComfort <= 8 && humComfort <= 20 && uvIndex <= 9 && windSpeed <= 25) {
      return { 
        level: "MODERATE", 
        description: "Conditions are acceptable but monitor closely", 
        color: "text-yellow-600",
        bgColor: "bg-yellow-50"
      };
    } else {
      return { 
        level: "POOR", 
        description: "Not suitable for drying due to high wind.", 
        color: "text-red-600",
        bgColor: "bg-red-50"
      };
    }
  };

  const comfort = calculateComfortLevel();

  // Calculate recommendations
  const getRecommendations = () => {
    const recs = [];
    
    if (humidity > 70) {
      recs.push("High humidity - consider retracting rack");
    }
    
    if (uvIndex > 8) {
      recs.push("High UV levels - clothes will dry faster but colors may fade");
    }
    
    if (windSpeed > 20) {
      recs.push("High winds detected - rack may retract automatically. Perforated cover engaged.");
    }
    
    if (temperature < 15) {
      recs.push("Low temperatures - drying will be slower");
    }
    
    // Dual-cover system recommendations
    if (windSpeed > 15 && humidity > 60) {
      recs.push("Windy and humid - solid cover engaged for protection.");
    } else if (windSpeed > 15 && humidity <= 60) {
      recs.push("Windy conditions - perforated cover engaged for airflow.");
    }
    
    if (recs.length === 0) {
      recs.push("Optimal conditions for drying");
    }
    
    return recs;
  };

  const recommendations = getRecommendations();

  return (
    <Card className="p-6 bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.02]">
      <h2 className="text-2xl font-semibold text-white mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Weather Analysis & Recommendation</h2>

      <div className="space-y-4">
        {/* Main Status Alert */}
        <div className={`p-4 rounded-2xl ${comfort.bgColor.replace('bg-red-50', 'bg-red-900/30').replace('bg-green-50', 'bg-green-900/30').replace('bg-blue-50', 'bg-blue-900/30').replace('bg-yellow-50', 'bg-yellow-900/30')} flex items-start gap-4 border ${comfort.color.includes('red') ? 'border-red-800/50' : 'border-slate-700/50'}`}>
          <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
            {/* Wind Icon SVG */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8h7a3 3 0 1 1 0 6M3 12h10a4 4 0 1 0 0-8M3 16h6a3 3 0 1 0 0-6" 
                stroke={comfort.color === 'text-red-600' ? '#ef4444' : '#3b82f6'} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className={`text-4xl font-bold ${comfort.color.replace('text-red-600', 'text-red-400').replace('text-green-600', 'text-green-400').replace('text-blue-600', 'text-blue-400')} mb-1 leading-none`}>{comfort.level}</div>
            <div className="text-sm text-gray-300">{comfort.description}</div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/50"></div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <Thermometer className="h-6 w-6 text-orange-400" />
              <span className="text-sm font-medium text-gray-300">Temp</span>
            </div>
            <div className="text-4xl font-bold text-white leading-none mb-1">{temperature}°C</div>
            <div className="text-xs text-gray-400">(Internal)</div>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              {/* Wind Turbine Icon SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="2" fill="#60a5fa"/>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 10l-4-7 1 7z" fill="#60a5fa"/>
                <path d="M12 10l6-3-3 6z" fill="#60a5fa"/>
                <path d="M12 10l-2 7 1-7z" fill="#60a5fa"/>
              </svg>
              <span className="text-sm font-medium text-gray-300">Wind</span>
            </div>
            <div className="text-4xl font-bold text-white leading-none">{windSpeed} km/h</div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/50"></div>

        <div className="p-4 bg-slate-700/30 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Sun className="h-6 w-6 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">UV Index</span>
          </div>
          <div className="text-4xl font-bold text-white leading-none">{uvIndex}</div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/50"></div>

        {/* Recommendation */}
        <div className="pb-0">
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-white">Recommendation:</span> {recommendations[0]}
          </p>
        </div>
      </div>
    </Card>
  );
};