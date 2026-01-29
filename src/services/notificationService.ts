import { toast } from "sonner";

export interface NotificationEvent {
  id: string;
  type: 'movement' | 'transaction' | 'weather_alert' | 'system_status' | 'connection';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'success';
  data?: Record<string, any>;
}

class NotificationService {
  private static instance: NotificationService;
  private eventHistory: NotificationEvent[] = [];
  private maxHistorySize = 100;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public notify(eventType: NotificationEvent['type'], title: string, message: string, severity: NotificationEvent['severity'] = 'info', data?: Record<string, any>): void {
    const event: NotificationEvent = {
      id: `event-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      type: eventType,
      title,
      message,
      timestamp: new Date(),
      severity,
      data
    };

    // Add to history
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize);
    }

    // Show toast notification based on severity
    switch (severity) {
      case 'success':
        toast.success(title, { description: message });
        break;
      case 'error':
        toast.error(title, { description: message });
        break;
      case 'warning':
        toast.warning(title, { description: message });
        break;
      case 'info':
      default:
        toast.info(title, { description: message });
        break;
    }
  }

  public notifyMovement(position: 'extended' | 'retracted', triggeredBy: 'manual' | 'auto' | 'weather_condition' = 'manual'): void {
    const title = `Rack ${position === 'extended' ? 'Extended' : 'Retracted'}`;
    const triggerText = triggeredBy === 'manual' 
      ? 'Manually' 
      : triggeredBy === 'auto' 
        ? 'Automatically' 
        : 'Due to Weather';
    
    const message = `Rack position changed to ${position}. Triggered ${triggerText}.`;
    
    this.notify(
      'movement',
      title,
      message,
      position === 'extended' ? 'info' : 'success',
      { position, triggeredBy, action: position }
    );
  }

  public notifyTransaction(action: string, details: string, severity: NotificationEvent['severity'] = 'info'): void {
    const title = `${action.charAt(0).toUpperCase() + action.slice(1)} Transaction`;
    const message = details;
    
    this.notify(
      'transaction',
      title,
      message,
      severity,
      { action, details }
    );
  }

  public notifyWeatherAlert(condition: string, recommendation: string): void {
    const title = `Weather Alert: ${condition}`;
    const message = recommendation;
    
    this.notify(
      'weather_alert',
      title,
      message,
      'warning',
      { condition, recommendation }
    );
  }

  public notifySystemStatus(status: string, details: string, severity: NotificationEvent['severity'] = 'info'): void {
    const title = `System ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const message = details;
    
    this.notify(
      'system_status',
      title,
      message,
      severity,
      { status, details }
    );
  }

  public notifyConnectionStatus(connected: boolean, details?: string): void {
    const title = connected ? 'Connected to IoT Device' : 'Disconnected from IoT Device';
    const message = details || (connected ? 'Successfully established connection' : 'Connection lost');
    
    this.notify(
      'connection',
      title,
      message,
      connected ? 'success' : 'error',
      { connected, details }
    );
  }

  public getRecentEvents(limit: number = 10): NotificationEvent[] {
    return this.eventHistory.slice(0, limit);
  }

  public getEventsByType(type: NotificationEvent['type'], limit: number = 10): NotificationEvent[] {
    return this.eventHistory
      .filter(event => event.type === type)
      .slice(0, limit);
  }

  public clearHistory(): void {
    this.eventHistory = [];
  }
}

export const notificationService = NotificationService.getInstance();