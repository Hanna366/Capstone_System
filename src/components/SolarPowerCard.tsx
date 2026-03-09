import { Sun, Battery } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SolarPowerCardProps {
  batteryLevel?: number;
  isCharging?: boolean;
  currentOutput?: number;
  isConnected?: boolean;
}

export const SolarPowerCard = ({ batteryLevel = 0, isCharging = false, currentOutput = 0, isConnected = false }: SolarPowerCardProps) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (batteryLevel / 100) * circumference;

  return (
    <Card className={`p-6 backdrop-blur-sm rounded-3xl shadow-2xl border transition-all duration-300 hover:scale-[1.02] ${
      isConnected 
        ? 'bg-slate-800/50 border-slate-700/50 hover:border-orange-500/30 hover:shadow-orange-500/20'
        : 'bg-red-900/30 border-red-800/50 hover:border-red-700/30 hover:shadow-red-500/20'
    }`}>
      <h2 className={`text-2xl font-semibold mb-5 bg-clip-text text-transparent ${
        isConnected
          ? 'bg-gradient-to-r from-orange-400 to-amber-400'
          : 'bg-gradient-to-r from-red-400 to-rose-400'
      }`}>Solar Power</h2>

      <div className="space-y-5">
        {/* Circular Progress and Output - Side by side */}
        <div className="flex items-center justify-between">
          {/* Circular Progress */}
          <div className="relative">
            <svg className="w-28 h-28 transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="#334155"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress Circle */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="#f97316"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{batteryLevel}%</span>
            </div>
          </div>

          {/* Output Info */}
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{currentOutput.toFixed(2)}W</div>
            <div className="text-sm text-gray-400">Output</div>
          </div>
        </div>

        {/* Simple Chart Representation */}
        <div className="h-16 bg-slate-700/30 rounded-xl p-2 flex items-end gap-1 border border-slate-700/50">
          {[0.3, 0.5, 0.4, 0.6, 0.7, 0.5, 0.8, 0.9, 0.7, 0.6, 0.8, 0.85].map((height, index) => (
            <div
              key={index}
              className="flex-1 bg-gradient-to-t from-orange-600 to-orange-400 rounded-sm transition-all"
              style={{ height: `${height * 100}%` }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};
