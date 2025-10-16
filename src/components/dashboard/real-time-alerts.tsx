'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Bell,
  X,
  Check,
  Eye
} from 'lucide-react';
import type { FraudAlert } from '@/lib/simulator/real-time-processor';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface RealTimeAlertsProps {
  alerts: FraudAlert[];
  onAlertClick?: (alert: FraudAlert) => void;
  onAlertDismiss?: (alertId: string) => void;
  enableNotifications?: boolean;
}

export default function RealTimeAlerts({ 
  alerts, 
  onAlertClick,
  onAlertDismiss,
  enableNotifications = true
}: RealTimeAlertsProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'new' | 'investigating'>('all');
  const [notifiedAlerts, setNotifiedAlerts] = useState<Set<string>>(new Set());

  // Show toast for new critical/high alerts
  useEffect(() => {
    if (!enableNotifications) return;

    const newAlerts = alerts.filter(
      alert => 
        !notifiedAlerts.has(alert.id) && 
        (alert.severity === 'critical' || alert.severity === 'high') &&
        alert.status === 'new'
    );

    newAlerts.forEach(alert => {
      const severityConfig = {
        critical: {
          icon: '🚨',
          variant: 'destructive' as const,
          sound: true,
        },
        high: {
          icon: '⚠️',
          variant: 'default' as const,
          sound: true,
        },
      };

      const config = severityConfig[alert.severity];

      toast({
        variant: config.variant,
        title: `${config.icon} ${alert.title}`,
        description: alert.message,
        duration: 8000,
      });

      // Play sound for critical alerts (optional)
      if (config.sound && typeof Audio !== 'undefined') {
        try {
          // You can add a custom alert sound file here
          // const audio = new Audio('/sounds/alert.mp3');
          // audio.play().catch(() => {});
        } catch (e) {
          // Ignore audio errors
        }
      }

      setNotifiedAlerts(prev => new Set(prev).add(alert.id));
    });
  }, [alerts, enableNotifications, notifiedAlerts, toast]);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.status === filter;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'outline' => {
    switch (status) {
      case 'new':
        return 'default';
      case 'investigating':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const newAlertsCount = alerts.filter(a => a.status === 'new').length;
  const investigatingCount = alerts.filter(a => a.status === 'investigating').length;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className={cn(
                'h-5 w-5',
                newAlertsCount > 0 && 'text-red-600 animate-pulse'
              )} />
              Real-Time Fraud Alerts
            </CardTitle>
            <CardDescription>
              {newAlertsCount > 0 ? (
                <span className="text-red-600 font-medium">
                  {newAlertsCount} new alert{newAlertsCount !== 1 ? 's' : ''} requiring attention
                </span>
              ) : (
                'Live fraud detection alerts'
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({alerts.length})
            </Button>
            <Button
              variant={filter === 'new' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('new')}
            >
              New ({newAlertsCount})
            </Button>
            <Button
              variant={filter === 'investigating' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('investigating')}
            >
              Active ({investigatingCount})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-50" />
              <p>No alerts to display</p>
              <p className="text-sm mt-2">
                {filter === 'all' 
                  ? 'High-risk transactions will appear here'
                  : `No ${filter} alerts`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert, index) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all',
                    'animate-in slide-in-from-right-5 fade-in duration-300',
                    getSeverityColor(alert.severity),
                    'hover:shadow-lg cursor-pointer'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm leading-tight">
                            {alert.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant={getStatusBadgeVariant(alert.status)} className="text-xs">
                          {alert.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-sm">
                      {alert.message}
                    </p>

                    {/* Transaction Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2">
                      <div>
                        <span className="text-muted-foreground">Transaction ID:</span>
                        <p className="font-mono">{alert.transactionId}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p className="font-semibold">${alert.transaction.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Merchant:</span>
                        <p>{alert.transaction.merchantName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p>{alert.transaction.location}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAlertClick?.(alert);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Investigate
                      </Button>
                      {alert.status === 'new' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Mark as investigating
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAlertDismiss?.(alert.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

