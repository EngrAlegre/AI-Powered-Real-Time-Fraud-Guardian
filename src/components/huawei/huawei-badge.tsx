/**
 * Huawei Cloud Service Badge Component
 * Displays which Huawei Cloud services are being used
 */

import { Badge } from '@/components/ui/badge';
import { Cloud, Cpu, Database, Zap, Brain, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export type HuaweiService = 
  | 'pangu-models' 
  | 'modelarts' 
  | 'gaussdb' 
  | 'functiongraph' 
  | 'obs'
  | 'cloudmatrix384';

interface HuaweiServiceBadgeProps {
  service: HuaweiService;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
  showIcon?: boolean;
}

const serviceConfig = {
  'pangu-models': {
    label: 'Pangu AI',
    icon: Brain,
    color: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  'modelarts': {
    label: 'ModelArts',
    icon: Cpu,
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  'gaussdb': {
    label: 'GaussDB',
    icon: Database,
    color: 'bg-green-600 hover:bg-green-700 text-white',
  },
  'functiongraph': {
    label: 'FunctionGraph',
    icon: Zap,
    color: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
  'obs': {
    label: 'OBS Storage',
    icon: Cloud,
    color: 'bg-cyan-600 hover:bg-cyan-700 text-white',
  },
  'cloudmatrix384': {
    label: 'CloudMatrix384',
    icon: Activity,
    color: 'bg-red-600 hover:bg-red-700 text-white',
  },
};

export function HuaweiServiceBadge({ 
  service, 
  variant = 'default', 
  className,
  showIcon = true 
}: HuaweiServiceBadgeProps) {
  const config = serviceConfig[service];
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={variant} 
      className={cn(
        variant === 'default' && config.color,
        'gap-1',
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

export function HuaweiPoweredBy({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <span>Powered by</span>
      <span className="font-semibold text-[#FF0000]">Huawei Cloud</span>
    </div>
  );
}

export function HuaweiServicesStack({ 
  services,
  className 
}: { 
  services: HuaweiService[];
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {services.map((service) => (
        <HuaweiServiceBadge key={service} service={service} />
      ))}
    </div>
  );
}

