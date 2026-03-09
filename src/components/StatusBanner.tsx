import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatusBannerProps {
  title: string;
  message: string;
  variant?: "warning" | "success" | "info";
  isCharging?: boolean;
  isBlynkConnected?: boolean;
}

export const StatusBanner = ({ title, message, variant = "warning", isCharging = false, isBlynkConnected = false }: StatusBannerProps) => {
  return (
    <Card className="p-6 bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 hover:border-green-500/30 transition-all duration-300 hover:shadow-green-500/20 hover:scale-[1.02]">
      <h2 className="text-2xl font-semibold text-white mb-5 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">System Status</h2>
      
      <div className="space-y-3">
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${
          isBlynkConnected ? 'bg-green-900/30 border-green-800/50' : 'bg-red-900/30 border-red-800/50'
        }`}>
          {isBlynkConnected ? (
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <div>
            <span className={`text-sm font-medium ${
              isBlynkConnected ? 'text-gray-200' : 'text-red-400'
            }`}>
              {isBlynkConnected ? 'Connected to Blynk (ESP32)' : 'Not Connected to Blynk'}
            </span>
          </div>
        </div>
        
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${
          isCharging ? 'bg-green-900/30 border-green-800/50' : 'bg-red-900/30 border-red-800/50'
        }`}>
          {isCharging ? (
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <div>
            <span className={`text-sm font-medium ${
              isCharging ? 'text-gray-200' : 'text-red-400'
            }`}>
              {isCharging ? 'Solar Charging' : 'Solar Not Connected'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
