'use client';

/**
 * Database Status Indicator
 * Shows which database is currently active
 */

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Database, Cloud, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface HealthStatus {
  status: string;
  platform: string;
  services: {
    gaussdb: { available: boolean; status: string; type: string };
    pangu?: { available: boolean; status: string; type: string };
    modelarts?: { available: boolean; status: string; type: string };
  };
  database: string;
  huawei_cloud_integration: string;
}

export function DatabaseStatusIndicator() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setHealth(data);
      } catch (error) {
        console.error('Health check failed:', error);
      } finally {
        setLoading(false);
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Badge variant="outline" className="gap-1">
        <Database className="h-3 w-3 animate-pulse" />
        <span>Checking...</span>
      </Badge>
    );
  }

  if (!health) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        <span>Offline</span>
      </Badge>
    );
  }

  const isConnected = health.services.gaussdb.available;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isConnected ? "default" : "destructive"} 
        className="gap-1"
      >
        <Cloud className="h-3 w-3" />
        <span>Huawei GaussDB</span>
      </Badge>
      
      <Badge variant="outline" className="text-xs">
        🇨🇳 100% Huawei Cloud
      </Badge>
    </div>
  );
}

export function DatabaseStatusCard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setHealth(data);
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }

    checkHealth();
  }, []);

  if (!health) return null;

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">🇨🇳 Huawei Cloud Status</h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            <span className="text-sm">GaussDB</span>
          </div>
          <Badge variant={health.services.gaussdb.available ? "default" : "destructive"}>
            {health.services.gaussdb.status}
          </Badge>
        </div>

        {health.services.pangu && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm">Pangu Models</span>
            </div>
            <Badge variant={health.services.pangu.available ? "default" : "secondary"}>
              {health.services.pangu.status}
            </Badge>
          </div>
        )}

        {health.services.modelarts && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm">ModelArts</span>
            </div>
            <Badge variant={health.services.modelarts.available ? "default" : "secondary"}>
              {health.services.modelarts.status}
            </Badge>
          </div>
        )}

        <div className="pt-2 border-t mt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Platform:</span>
            <Badge variant="outline">
              🇨🇳 100% Huawei Cloud
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

