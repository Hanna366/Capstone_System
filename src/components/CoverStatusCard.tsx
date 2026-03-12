import { Card } from "@/components/ui/card";
import { Shield, Wind, Droplets, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";

interface CoverStatusCardProps {
  windSpeed: number;
  humidity: number;
  temperature: number;
}

export const CoverStatusCard = ({ windSpeed, humidity, temperature }: CoverStatusCardProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Determine which cover is currently active
  let coverType = 'none';
  let coverDescription = 'No special cover needed';
  let coverColor = isDark ? 'text-gray-400' : 'text-gray-600';
  let coverBgColor = isDark ? 'bg-gray-800/20' : 'bg-gray-100/20';
  
  if (windSpeed > 15 && humidity > 60) {
    coverType = 'solid';
    coverDescription = 'Solid cover engaged for protection';
    coverColor = isDark ? 'text-blue-400' : 'text-blue-600';
    coverBgColor = isDark ? 'bg-blue-900/20 border-blue-700/30' : 'bg-blue-100/50 border-blue-300/30';
  } else if (windSpeed > 15 && humidity <= 60) {
    coverType = 'perforated';
    coverDescription = 'Perforated cover engaged for airflow';
    coverColor = isDark ? 'text-orange-400' : 'text-orange-600';
    coverBgColor = isDark ? 'bg-orange-900/20 border-orange-700/30' : 'bg-orange-100/50 border-orange-300/30';
  }

  return (
    <Card className={`p-7 backdrop-blur-md rounded-3xl shadow-2xl border-2 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] group ${
      isDark 
        ? 'bg-gradient-to-br from-slate-800/70 to-slate-900/70 border-slate-700/50'
        : 'bg-gradient-to-br from-white/70 to-slate-50/70 border-slate-200/50'
    } ${coverBgColor}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 group-hover:scale-110 ${
          isDark 
            ? (coverType === 'solid' 
                ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/50 shadow-lg' 
                : coverType === 'perforated' 
                ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/50 shadow-lg' 
                : 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/50')
            : (coverType === 'solid' 
                ? 'bg-gradient-to-br from-slate-100/50 to-slate-200/50 border-slate-300/50 shadow-lg' 
                : coverType === 'perforated' 
                ? 'bg-gradient-to-br from-slate-100/50 to-slate-200/50 border-slate-300/50 shadow-lg' 
                : 'bg-gradient-to-br from-slate-100/50 to-slate-200/50 border-slate-300/50')
        }`}>
          {coverType === 'solid' ? (
            <Shield className={`h-7 w-7 ${coverColor}`} />
          ) : coverType === 'perforated' ? (
            <Wind className={`h-7 w-7 ${coverColor}`} />
          ) : (
            <Sun className={`h-7 w-7 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          )}
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Cover Status</h2>
          <p className={`text-sm font-medium ${coverColor}`}>
            {coverType === 'none' ? 'Standard Protection' : 
             coverType === 'solid' ? 'Full Protection Mode' : 'Ventilation Mode'}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className={`p-5 rounded-2xl transition-colors duration-300 ${
          isDark 
            ? 'bg-slate-700/50 border-slate-600/50'
            : 'bg-slate-100/50 border-slate-200/50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Current Cover</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${
              isDark 
                ? coverColor.replace('text-blue-400', 'text-blue-500').replace('text-orange-400', 'text-orange-500')
                : coverColor.replace('text-blue-400', 'text-blue-600').replace('text-orange-400', 'text-orange-600')
            }`}>
              {coverType === 'none' ? 'Standard' : coverType}
            </span>
          </div>
          <p className={`text-sm ${coverColor}`}>
            {coverDescription}
          </p>
        </div>

        <div className={`grid grid-cols-3 gap-3`}>
          <div className={`p-4 rounded-2xl text-center border transition-all duration-300 ${
            isDark 
              ? 'bg-slate-700/50 border-slate-600/50 hover:from-slate-700/60 hover:to-slate-800/60'
              : 'bg-slate-100/50 border-slate-200/50 hover:from-slate-100/60 hover:to-slate-200/60'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wind className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{windSpeed}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Wind km/h</div>
          </div>

          <div className={`p-4 rounded-2xl text-center border transition-all duration-300 ${
            isDark 
              ? 'bg-slate-700/50 border-slate-600/50 hover:from-slate-700/60 hover:to-slate-800/60'
              : 'bg-slate-100/50 border-slate-200/50 hover:from-slate-100/60 hover:to-slate-200/60'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Droplets className={`h-5 w-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{humidity}%</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Humidity</div>
          </div>

          <div className={`p-4 rounded-2xl text-center border transition-all duration-300 ${
            isDark 
              ? 'bg-slate-700/50 border-slate-600/50 hover:from-slate-700/60 hover:to-slate-800/60'
              : 'bg-slate-100/50 border-slate-200/50 hover:from-slate-100/60 hover:to-slate-200/60'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sun className={`h-5 w-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{temperature}°</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Temp</div>
          </div>
        </div>
      </div>
    </Card>
  );
};