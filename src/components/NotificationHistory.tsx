import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { notificationService, NotificationEvent } from "@/services/notificationService";
import { useState } from "react";

interface NotificationHistoryProps {
  limit?: number;
}

export const NotificationHistory = ({ limit = 10 }: NotificationHistoryProps) => {
  const [events] = useState<NotificationEvent[]>(() => 
    notificationService.getRecentEvents(limit)
  );

  const getSeverityIcon = (severity: NotificationEvent['severity']) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeBadgeVariant = (type: NotificationEvent['type']) => {
    switch (type) {
      case 'movement':
        return 'outline';
      case 'transaction':
        return 'secondary';
      case 'weather_alert':
        return 'destructive';
      case 'system_status':
        return 'default';
      case 'connection':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <Card className="p-6 bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-700/50">
      <h2 className="text-2xl font-semibold text-white mb-5">Notification History</h2>
      
      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 flex items-start gap-3"
            >
              <div className="mt-0.5">
                {getSeverityIcon(event.severity)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-white truncate">{event.title}</h3>
                  <Badge 
                    variant={getTypeBadgeVariant(event.type)} 
                    className="text-xs capitalize shrink-0"
                  >
                    {event.type}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-300 mb-2">{event.message}</p>
                
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(event.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};