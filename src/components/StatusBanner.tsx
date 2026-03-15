import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeProvider";

interface StatusBannerProps {
  title: string;
  message: string;
  variant?: "warning" | "success" | "info";
  isCharging?: boolean;
  esp32Connected?: boolean;
}

export const StatusBanner = ({ title, message, variant = "warning", isCharging = false, esp32Connected = false }: StatusBannerProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Card className={`p-6 backdrop-blur-sm rounded-3xl shadow-2xl border hover:scale-[1.02] transition-all duration-300 ${
      isDark 
        ? 'bg-slate-800/50 border-slate-700/50 hover:border-green-500/30 hover:shadow-green-500/20'
        : 'bg-white/80 border-slate-200/50 hover:border-green-400/30 hover:shadow-green-400/20'
    }`}>
      <h2 className={`text-2xl font-semibold mb-5 bg-clip-text ${
        isDark 
          ? 'text-transparent bg-gradient-to-r from-green-400 to-emerald-400'
          : 'text-transparent bg-gradient-to-r from-green-600 to-emerald-600'
      }`}>System Status</h2>
      
      <div className="space-y-3">
        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors duration-300 ${
          isDark 
            ? (esp32Connected ? 'bg-green-900/30 border-green-800/50' : 'bg-red-900/30 border-red-800/50')
            : (esp32Connected ? 'bg-green-100/50 border-green-300/50' : 'bg-red-100/50 border-red-300/50')
        }`}>
          {esp32Connected ? (
            <CheckCircle className={`h-5 w-5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <div>
            <span className={`text-sm font-medium ${
              isDark 
                ? (esp32Connected ? 'text-gray-200' : 'text-red-400')
                : (esp32Connected ? 'text-green-700' : 'text-red-700')
            }`}>
              {esp32Connected ? 'ESP32 Connected' : 'ESP32 Offline'}
            </span>
          </div>
        </div>
        
        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors duration-300 ${
          isDark 
            ? (isCharging ? 'bg-green-900/30 border-green-800/50' : 'bg-red-900/30 border-red-800/50')
            : (isCharging ? 'bg-green-100/50 border-green-300/50' : 'bg-red-100/50 border-red-300/50')
        }`}>
          {isCharging ? (
            <CheckCircle className={`h-5 w-5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <div>
            <span className={`text-sm font-medium ${
              isDark 
                ? (isCharging ? 'text-gray-200' : 'text-red-400')
                : (isCharging ? 'text-green-700' : 'text-red-700')
            }`}>
              {isCharging ? 'Solar Charging' : 'Solar Not Connected'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
