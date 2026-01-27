import { Sun, Battery } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SolarPowerCardProps {
  batteryLevel: number;
  isCharging: boolean;
  currentOutput: number;
}

export const SolarPowerCard = ({ batteryLevel, isCharging, currentOutput }: SolarPowerCardProps) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (batteryLevel / 100) * circumference;

  return (
    <Card className="p-6 bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-700/50">
      <h2 className="text-2xl font-semibold text-white mb-5">Solar Power</h2>

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
