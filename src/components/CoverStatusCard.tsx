import { Card } from "@/components/ui/card";
import { Shield, Wind, Droplets, Sun } from "lucide-react";

interface CoverStatusCardProps {
  windSpeed: number;
  humidity: number;
  temperature: number;
}

export const CoverStatusCard = ({ windSpeed, humidity, temperature }: CoverStatusCardProps) => {
  // Determine which cover is currently active
  let coverType = 'none';
  let coverDescription = 'No special cover needed';
  let coverColor = 'text-gray-400';
  let coverBgColor = 'bg-gray-800/20';
  
  if (windSpeed > 15 && humidity > 60) {
    coverType = 'solid';
    coverDescription = 'Solid cover engaged for protection';
    coverColor = 'text-blue-400';
    coverBgColor = 'bg-blue-900/20 border-blue-700/30';
  } else if (windSpeed > 15 && humidity <= 60) {
    coverType = 'perforated';
    coverDescription = 'Perforated cover engaged for airflow';
    coverColor = 'text-orange-400';
    coverBgColor = 'bg-orange-900/20 border-orange-700/30';
  }

  return (
    <Card className={`p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 ${coverBgColor} transition-all duration-500 hover:shadow-orange-500/30 hover:scale-[1.03]`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-br from-slate-700/70 to-slate-800/70 rounded-xl border border-slate-600/40 shadow-inner">
          {coverType === 'solid' ? (
            <Shield className={`h-6 w-6 ${coverColor.replace('text-blue-400', 'text-orange-400').replace('text-orange-400', 'text-orange-500')}`} />
          ) : coverType === 'perforated' ? (
            <Wind className={`h-6 w-6 ${coverColor.replace('text-blue-400', 'text-orange-400').replace('text-orange-400', 'text-orange-500')}`} />
          ) : (
            <Sun className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <h2 className="text-2xl font-semibold text-white bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Cover Status</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl border border-slate-600/40 shadow-inner">
          <span className="text-gray-300">Active Cover</span>
          <span className={`font-bold ${coverColor.replace('text-blue-400', 'text-orange-400').replace('text-orange-400', 'text-orange-500')} capitalize`}>
            {coverType === 'none' ? 'Standard' : coverType}
          </span>
        </div>

        <div className="p-4 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl border border-slate-600/40 shadow-inner">
          <p className={`text-sm ${coverColor.replace('text-blue-400', 'text-orange-400').replace('text-orange-400', 'text-orange-500')}`}>
            {coverDescription}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl text-center border border-slate-600/40 shadow-inner">
            <div className="text-3xl font-bold text-white">{windSpeed}</div>
            <div className="text-xs text-gray-400">Wind km/h</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl text-center border border-slate-600/40 shadow-inner">
            <div className="text-3xl font-bold text-white">{humidity}%</div>
            <div className="text-xs text-gray-400">Humidity</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl text-center border border-slate-600/40 shadow-inner">
            <div className="text-3xl font-bold text-white">{temperature}°C</div>
            <div className="text-xs text-gray-400">Temp</div>
          </div>
        </div>
      </div>
    </Card>
  );
};