import { Sun, Thermometer, Droplets } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { notificationService } from "@/services/notificationService";

interface WeatherAnalysisCardProps {
  temperature: number;
  humidity: number;
  uvIndex: number;
  windSpeed: number;
  isLiveWeatherData?: boolean;
}

export const WeatherAnalysisCard = ({ 
  temperature, 
  humidity, 
  uvIndex, 
  windSpeed,
  isLiveWeatherData = false
}: WeatherAnalysisCardProps) => {
  // Get current theme
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const isDark = theme === 'dark';

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
    <div className={`p-6 backdrop-blur-md rounded-3xl shadow-2xl border hover:scale-[1.01] transition-all duration-300 ${
      isDark 
        ? 'bg-slate-800/40 border-slate-700/50 hover:border-blue-500/40 hover:shadow-blue-500/20'
        : 'bg-white/80 border-slate-200/50 hover:border-blue-400/40 hover:shadow-blue-400/20'
    }`}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold leading-tight bg-clip-text ${
            isDark 
              ? 'text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500'
              : 'text-transparent bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700'
          }`}>
            Weather Analysis
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Real-time environmental monitoring
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
          isDark 
            ? 'bg-slate-700/50 border-slate-600/50'
            : 'bg-slate-100/50 border-slate-300/50'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isLiveWeatherData ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`}></div>
          <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {isLiveWeatherData ? 'Live API' : 'Internal Sensor'}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Enhanced Status Alert */}
        <div className={`p-5 rounded-2xl flex items-start gap-4 border backdrop-blur-sm transition-colors duration-300 ${
          isDark 
            ? `${comfort.bgColor.replace('bg-red-50', 'bg-red-900/20').replace('bg-green-50', 'bg-green-900/20').replace('bg-blue-50', 'bg-blue-900/20').replace('bg-yellow-50', 'bg-yellow-900/20')} ${comfort.color.includes('red') ? 'border-red-800/30' : 'border-slate-700/50'}`
            : `${comfort.bgColor.replace('bg-red-50', 'bg-red-100/50').replace('bg-green-50', 'bg-green-100/50').replace('bg-blue-50', 'bg-blue-100/50').replace('bg-yellow-50', 'bg-yellow-100/50')} ${comfort.color.includes('red') ? 'border-red-300/50' : 'border-slate-300/50'}`
        }`}>
          <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
            {/* Enhanced Weather Icon */}
            <div className={`p-3 rounded-2xl ${
              isDark 
                ? `${comfort.color.includes('red') ? 'bg-red-800/50' : comfort.color.includes('green') ? 'bg-green-800/50' : comfort.color.includes('blue') ? 'bg-blue-800/50' : 'bg-yellow-800/50'}`
                : `${comfort.color.includes('red') ? 'bg-red-200/50' : comfort.color.includes('green') ? 'bg-green-200/50' : comfort.color.includes('blue') ? 'bg-blue-200/50' : 'bg-yellow-200/50'}`
            }`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8h7a3 3 0 1 1 0 6M3 12h10a4 4 0 1 0 0-8M3 16h6a3 3 0 1 0 0-6" 
                  stroke={isDark 
                    ? (comfort.color === 'text-red-600' ? '#ef4444' : comfort.color.includes('green') ? '#10b981' : comfort.color.includes('blue') ? '#3b82f6' : '#eab308')
                    : (comfort.color === 'text-red-600' ? '#dc2626' : comfort.color.includes('green') ? '#059669' : comfort.color.includes('blue') ? '#2563eb' : '#ca8a04')
                  } 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <div className={`text-3xl font-bold mb-2 leading-none ${
              isDark 
                ? comfort.color.replace('text-red-600', 'text-red-400').replace('text-green-600', 'text-green-400').replace('text-blue-600', 'text-blue-400').replace('text-yellow-600', 'text-yellow-400')
                : comfort.color.replace('text-red-600', 'text-red-700').replace('text-green-600', 'text-green-700').replace('text-blue-600', 'text-blue-700').replace('text-yellow-600', 'text-yellow-700')
            }`}>
              {comfort.level}
            </div>
            <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {comfort.description}
            </div>
          </div>
        </div>

        {/* Enhanced Weather Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-2xl border transition-all duration-300 group ${
            isDark 
              ? 'bg-slate-700/30 border-slate-600/50 hover:border-orange-500/30'
              : 'bg-slate-50/30 border-slate-200/50 hover:border-orange-400/30'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl transition-colors ${
                isDark 
                  ? 'bg-orange-500/20 group-hover:bg-orange-500/30'
                  : 'bg-orange-100/50 group-hover:bg-orange-200/50'
              }`}>
                <Thermometer className={`h-5 w-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Temperature
              </span>
            </div>
            <div className={`text-3xl font-bold leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {temperature}°C
            </div>
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              Current reading
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all duration-300 group ${
            isDark 
              ? 'bg-slate-700/30 border-slate-600/50 hover:border-blue-500/30'
              : 'bg-slate-50/30 border-slate-200/50 hover:border-blue-400/30'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl transition-colors ${
                isDark 
                  ? 'bg-blue-500/20 group-hover:bg-blue-500/30'
                  : 'bg-blue-100/50 group-hover:bg-blue-200/50'
              }`}>
                {/* Enhanced Wind Icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="2" fill={isDark ? '#60a5fa' : '#3b82f6'}/>
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={isDark ? '#60a5fa' : '#3b82f6'} strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M12 10l-4-7 1 7z" fill={isDark ? '#60a5fa' : '#3b82f6'}/>
                  <path d="M12 10l6-3-3 6z" fill={isDark ? '#60a5fa' : '#3b82f6'}/>
                  <path d="M12 10l-2 7 1-7z" fill={isDark ? '#60a5fa' : '#3b82f6'}/>
                </svg>
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Wind Speed
              </span>
            </div>
            <div className={`text-3xl font-bold leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {windSpeed} km/h
            </div>
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              Real-time
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all duration-300 group ${
            isDark 
              ? 'bg-slate-700/30 border-slate-600/50 hover:border-yellow-500/30'
              : 'bg-slate-50/30 border-slate-200/50 hover:border-yellow-400/30'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl transition-colors ${
                isDark 
                  ? 'bg-yellow-500/20 group-hover:bg-yellow-500/30'
                  : 'bg-yellow-100/50 group-hover:bg-yellow-200/50'
              }`}>
                <Sun className={`h-5 w-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                UV Index
              </span>
            </div>
            <div className={`text-3xl font-bold leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {uvIndex}
            </div>
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              Time-based
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all duration-300 group ${
            isDark 
              ? 'bg-slate-700/30 border-slate-600/50 hover:border-cyan-500/30'
              : 'bg-slate-50/30 border-slate-200/50 hover:border-cyan-400/30'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl transition-colors ${
                isDark 
                  ? 'bg-cyan-500/20 group-hover:bg-cyan-500/30'
                  : 'bg-cyan-100/50 group-hover:bg-cyan-200/50'
              }`}>
                <Droplets className={`h-5 w-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Humidity
              </span>
            </div>
            <div className={`text-3xl font-bold leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {humidity}%
            </div>
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              Moisture level
            </div>
          </div>
        </div>

        {/* Enhanced Recommendation */}
        <div className={`p-4 rounded-2xl border backdrop-blur-sm transition-colors duration-300 ${
          isDark 
            ? 'bg-slate-700/20 border-slate-600/40'
            : 'bg-slate-50/20 border-slate-200/40'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl ${
              isDark 
                ? 'bg-blue-500/20'
                : 'bg-blue-100/50'
            }`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  stroke={isDark ? '#3b82f6' : '#2563eb'} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Recommendation
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {recommendations[0]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};