import { useState } from "react";
import { Shirt, ChevronUp, ChevronDown, Check, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/services/notificationService";

interface RackControlCardProps {
  onExtend: () => void;
  onRetract: () => void;
  position?: 'extended' | 'retracted';
  autoMode?: boolean;
  onToggleAutoMode?: (enabled: boolean) => void;
}

export const RackControlCard = ({ onExtend, onRetract, position: propPosition, autoMode: propAutoMode, onToggleAutoMode }: RackControlCardProps) => {
  // Get current theme
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const isDark = theme === 'dark';

  const [localAutoMode, setLocalAutoMode] = useState(true);
  const [localPosition, setLocalPosition] = useState<"extended" | "retracted">("extended");

  // Use props if provided, otherwise fall back to local state
  const effectivePosition = propPosition ?? localPosition;
  const effectiveAutoMode = propAutoMode ?? localAutoMode;

  const handleExtend = async () => {
    if (onExtend) {
      await onExtend();
    }
    setLocalPosition("extended");
    
    // Notify about movement
    notificationService.notifyMovement('extended', 'manual');
  };

  const handleRetract = async () => {
    if (onRetract) {
      await onRetract();
    }
    setLocalPosition("retracted");
    
    // Notify about movement
    notificationService.notifyMovement('retracted', 'manual');
  };

  const handleToggleAutoMode = (enabled: boolean) => {
    if (onToggleAutoMode) {
      onToggleAutoMode(enabled);
    }
    setLocalAutoMode(enabled);
  };

  return (
    <Card className={`p-6 backdrop-blur-sm rounded-3xl shadow-2xl border hover:scale-[1.02] transition-all duration-300 ${
      isDark 
        ? 'bg-slate-800/50 border-slate-700/50 hover:border-orange-500/30 hover:shadow-orange-500/20'
        : 'bg-white/80 border-slate-200/50 hover:border-orange-400/30 hover:shadow-orange-400/20'
    }`}>
      <h2 className={`text-2xl font-semibold mb-5 bg-clip-text ${
        isDark 
          ? 'text-transparent bg-gradient-to-r from-orange-400 to-amber-300'
          : 'text-transparent bg-gradient-to-r from-orange-600 to-amber-500'
      }`}>Rack Control</h2>

      <div className="space-y-4">
        <div className={`flex items-center justify-between py-3 px-4 rounded-2xl transition-colors duration-200 ${
          isDark 
            ? 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/40'
            : 'bg-slate-100/30 border-slate-200/50 hover:bg-slate-100/40'
        }`}>
          <span className={`text-base font-medium flex items-center gap-2 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4m-6 4v4m6-4h4" />
            </svg>
            Auto Mode
          </span>
          <Switch 
            checked={effectiveAutoMode} 
            onCheckedChange={handleToggleAutoMode} 
            className={`data-[state=checked]:${
              isDark 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 data-[state=unchecked]:bg-slate-600'
                : 'bg-gradient-to-r from-orange-500 to-amber-400 data-[state=unchecked]:bg-slate-400'
            }`}
          />
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleExtend}
            disabled={effectivePosition === "extended" || effectiveAutoMode}
            className={`w-full h-14 font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl uppercase shadow-lg hover:scale-105 relative overflow-hidden group transition-all duration-300 ${
              isDark 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-orange-500/30 hover:shadow-orange-500/30'
                : 'bg-gradient-to-r from-orange-400 to-amber-300 hover:from-orange-500 hover:to-amber-400 text-slate-800 border-orange-400/30 hover:shadow-orange-400/30'
            }`}
          >
            <span className="relative z-10">EXTEND</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
          <Button
            onClick={handleRetract}
            disabled={effectivePosition === "retracted" || effectiveAutoMode}
            variant="secondary"
            className={`w-full h-14 font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed relative rounded-2xl uppercase border shadow-lg hover:scale-105 group transition-all duration-300 ${
              isDark 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-blue-500/30 hover:shadow-blue-500/30'
                : 'bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-slate-800 border-blue-400/30 hover:shadow-blue-400/30'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              RETRACT
              {(effectivePosition === "retracted" || effectiveAutoMode) && (
                <Lock className="h-4 w-4" />
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
        </div>

        <div className={`text-center py-3 px-4 rounded-2xl transition-colors duration-200 ${
          isDark 
            ? 'bg-slate-700/20 border-slate-600/30'
            : 'bg-slate-100/20 border-slate-200/30'
        }`}>
          <div className={`flex items-center justify-center gap-2 ${
            isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'
          }`}>
            Current Position:
          </div>
          <span className={`font-bold uppercase px-3 py-1 rounded-full text-sm ${
            isDark 
              ? (effectivePosition === 'extended' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-slate-600/30 text-slate-300 border-slate-500/30')
              : (effectivePosition === 'extended' 
                  ? 'bg-green-400/50 text-green-600 border-green-400/30' 
                  : 'bg-slate-400/30 text-slate-600 border-slate-400/30')
          }`}>
            {effectivePosition}
          </span>
        </div>
      </div>
    </Card>
  );
};
