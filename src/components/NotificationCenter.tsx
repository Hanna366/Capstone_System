import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  BellRing, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle,
  Filter,
  X
} from "lucide-react";
import { notificationService, NotificationEvent } from "@/services/notificationService";

interface NotificationCenterProps {
  compact?: boolean;
}

export const NotificationCenter = ({ compact = false }: NotificationCenterProps) => {
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | NotificationEvent['type']>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to new events
  useEffect(() => {
    const updateEvents = () => {
      const allEvents = notificationService.getRecentEvents(20);
      setEvents(allEvents);
      
      // Count unread events (for demo, we'll consider all events as unread)
      setUnreadCount(allEvents.length);
    };

    // Initial load
    updateEvents();

    // We could set up a real-time subscription here if needed
    const interval = setInterval(updateEvents, 2000);

    return () => clearInterval(interval);
  }, []);

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

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.type === filter);

  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // Reset unread count when opened
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleNotificationCenter}
        className="relative"
      >
        {unreadCount > 0 ? (
          <>
            <BellRing className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center text-white">
              {unreadCount}
            </span>
          </>
        ) : (
          <Bell className="h-4 w-4" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-50">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notifications
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNotificationCenter}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-2">
            <div className="flex gap-2 mb-3">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'movement' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('movement')}
                className="flex items-center gap-1"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Movements
              </Button>
              <Button
                variant={filter === 'transaction' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('transaction')}
                className="flex items-center gap-1"
              >
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Transactions
              </Button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="p-3 bg-slate-700/50 rounded-lg border border-slate-600/30 flex items-start gap-3 hover:bg-slate-700/70 transition-colors"
                    >
                      <div className="mt-0.5">
                        {getSeverityIcon(event.severity)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white truncate text-sm">{event.title}</h4>
                          <Badge 
                            variant={getTypeBadgeVariant(event.type)} 
                            className="text-xs capitalize shrink-0"
                          >
                            {event.type}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-gray-300 mb-1">{event.message}</p>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(event.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};