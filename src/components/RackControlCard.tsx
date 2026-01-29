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
    
    // Notify about the movement
    notificationService.notifyMovement('extended', 'manual');
  };

  const handleRetract = async () => {
    if (onRetract) {
      await onRetract();
    }
    setLocalPosition("retracted");
    
    // Notify about the movement
    notificationService.notifyMovement('retracted', 'manual');
  };

  const handleToggleAutoMode = (enabled: boolean) => {
    if (onToggleAutoMode) {
      onToggleAutoMode(enabled);
    }
    setLocalAutoMode(enabled);
  };

  return (
    <Card className="p-6 bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-700/50">
      <h2 className="text-2xl font-semibold text-white mb-5">Rack Control</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-2">
          <span className="text-base font-medium text-gray-200">Auto Mode</span>
          <Switch checked={effectiveAutoMode} onCheckedChange={handleToggleAutoMode} className="data-[state=checked]:bg-orange-500" />
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleExtend}
            disabled={effectivePosition === "extended" || effectiveAutoMode}
            className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl uppercase"
          >
            EXTEND
          </Button>
          <Button
            onClick={handleRetract}
            disabled={effectivePosition === "retracted" || effectiveAutoMode}
            variant="secondary"
            className="w-full h-14 bg-slate-600 hover:bg-slate-700 text-gray-400 font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed relative rounded-2xl uppercase border border-slate-700/50"
          >
            RETRACT
            {(effectivePosition === "retracted" || effectiveAutoMode) && (
              <Lock className="h-4 w-4 ml-2 absolute right-4" />
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-gray-400 pt-2">
          <span className="text-gray-500">Current Position:</span> <span className="font-bold uppercase text-gray-200">{effectivePosition}</span>
        </div>
      </div>
    </Card>
  );
};
