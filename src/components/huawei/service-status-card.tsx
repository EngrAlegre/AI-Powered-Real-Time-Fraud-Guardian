/**
 * Huawei Cloud Service Status Card
 * Shows connection status and health of Huawei Cloud services
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HuaweiServiceBadge, type HuaweiService } from './huawei-badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ServiceStatus = 'connected' | 'disconnected' | 'degraded';

interface ServiceStatusItem {
  service: HuaweiService;
  status: ServiceStatus;
  message?: string;
}

interface ServiceStatusCardProps {
  services: ServiceStatusItem[];
}

export function ServiceStatusCard({ services }: ServiceStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Huawei Cloud Services</CardTitle>
        <CardDescription>Integration status and health monitoring</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map(({ service, status, message }) => (
            <div key={service} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusIcon status={status} />
                <HuaweiServiceBadge service={service} variant="secondary" />
              </div>
              <span className="text-xs text-muted-foreground">
                {message || getDefaultMessage(status)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: ServiceStatus }) {
  switch (status) {
    case 'connected':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'disconnected':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'degraded':
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  }
}

function getDefaultMessage(status: ServiceStatus): string {
  switch (status) {
    case 'connected':
      return 'Operational';
    case 'disconnected':
      return 'Not configured';
    case 'degraded':
      return 'Partial availability';
  }
}

