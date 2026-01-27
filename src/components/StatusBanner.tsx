import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatusBannerProps {
  title: string;
  message: string;
  variant?: "warning" | "success" | "info";
  isCharging?: boolean;
}

export const StatusBanner = ({ title, message, variant = "warning", isCharging = false }: StatusBannerProps) => {
  return (
    <Card className="p-6 bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-700/50">
      <h2 className="text-2xl font-semibold text-white mb-5">System Status</h2>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-green-900/30 rounded-xl border border-green-800/50">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <div>
            <span className="text-sm font-medium text-gray-200">Connected to Blynk (ESP82)</span>
          </div>
        </div>
        
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${
          isCharging ? 'bg-green-900/30 border-green-800/50' : 'bg-slate-700/30 border-slate-700/50'
        }`}>
          <CheckCircle className={`h-5 w-5 flex-shrink-0 ${
            isCharging ? 'text-green-400' : 'text-gray-500'
          }`} />
          <div>
            <span className={`text-sm font-medium ${
              isCharging ? 'text-gray-200' : 'text-gray-500'
            }`}>Solar Charging</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
