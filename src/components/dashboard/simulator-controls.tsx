'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings,
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import type { SimulatorConfig } from '@/lib/simulator/transaction-generator';

interface SimulatorControlsProps {
  isRunning: boolean;
  config: SimulatorConfig;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onConfigChange: (config: Partial<SimulatorConfig>) => void;
  stats?: {
    totalTransactions: number;
    fraudTransactions: number;
    avgProcessingTime: number;
  };
}

export default function SimulatorControls({
  isRunning,
  config,
  onStart,
  onPause,
  onReset,
  onConfigChange,
  stats
}: SimulatorControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSpeedChange = (value: number[]) => {
    onConfigChange({ transactionsPerMinute: value[0] });
  };

  const handleFraudRateChange = (value: number[]) => {
    onConfigChange({ fraudRate: value[0] / 100 });
  };

  const toggleScenario = (scenario: keyof SimulatorConfig['enableScenarios']) => {
    onConfigChange({
      enableScenarios: {
        ...config.enableScenarios,
        [scenario]: !config.enableScenarios[scenario],
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Transaction Simulator
        </CardTitle>
        <CardDescription>
          Control live transaction generation and fraud scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Controls */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={onStart} className="flex-1" size="lg">
              <Play className="h-4 w-4 mr-2" />
              Start Simulation
            </Button>
          ) : (
            <Button onClick={onPause} variant="secondary" className="flex-1" size="lg">
              <Pause className="h-4 w-4 mr-2" />
              Pause Simulation
            </Button>
          )}
          <Button onClick={onReset} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <div className="text-xs text-muted-foreground">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.fraudTransactions}</div>
              <div className="text-xs text-muted-foreground">Fraud Detected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.avgProcessingTime.toFixed(0)}ms
              </div>
              <div className="text-xs text-muted-foreground">Avg Processing</div>
            </div>
          </div>
        )}

        {/* Speed Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Transaction Speed
            </Label>
            <span className="text-sm font-mono text-muted-foreground">
              {config.transactionsPerMinute} tx/min
            </span>
          </div>
          <Slider
            value={[config.transactionsPerMinute]}
            onValueChange={handleSpeedChange}
            min={6}
            max={120}
            step={6}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Slow (6/min)</span>
            <span>Medium (60/min)</span>
            <span>Fast (120/min)</span>
          </div>
        </div>

        {/* Fraud Rate Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Fraud Rate
            </Label>
            <span className="text-sm font-mono text-muted-foreground">
              {(config.fraudRate * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[config.fraudRate * 100]}
            onValueChange={handleFraudRateChange}
            min={0}
            max={50}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>No Fraud (0%)</span>
            <span>Realistic (8%)</span>
            <span>High (50%)</span>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} Fraud Scenarios
          </Button>

          {showAdvanced && (
            <div className="mt-4 space-y-3">
              <Label className="text-sm font-semibold">Enable Specific Fraud Patterns</Label>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                  <div>
                    <Label htmlFor="highAmount" className="cursor-pointer">
                      High Amount Transactions
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      $1,000+ purchases
                    </p>
                  </div>
                  <Switch
                    id="highAmount"
                    checked={config.enableScenarios.highAmount}
                    onCheckedChange={() => toggleScenario('highAmount')}
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                  <div>
                    <Label htmlFor="riskyMerchant" className="cursor-pointer">
                      Risky Merchant Categories
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Crypto, gaming, gift cards
                    </p>
                  </div>
                  <Switch
                    id="riskyMerchant"
                    checked={config.enableScenarios.riskyMerchant}
                    onCheckedChange={() => toggleScenario('riskyMerchant')}
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                  <div>
                    <Label htmlFor="unusualTime" className="cursor-pointer">
                      Unusual Time Patterns
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      2-6 AM transactions
                    </p>
                  </div>
                  <Switch
                    id="unusualTime"
                    checked={config.enableScenarios.unusualTime}
                    onCheckedChange={() => toggleScenario('unusualTime')}
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                  <div>
                    <Label htmlFor="velocitySpike" className="cursor-pointer">
                      Velocity Spikes
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Rapid sequential purchases
                    </p>
                  </div>
                  <Switch
                    id="velocitySpike"
                    checked={config.enableScenarios.velocitySpike}
                    onCheckedChange={() => toggleScenario('velocitySpike')}
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                  <div>
                    <Label htmlFor="locationAnomaly" className="cursor-pointer">
                      Location Anomalies
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Suspicious countries
                    </p>
                  </div>
                  <Switch
                    id="locationAnomaly"
                    checked={config.enableScenarios.locationAnomaly}
                    onCheckedChange={() => toggleScenario('locationAnomaly')}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`h-2 w-2 rounded-full ${isRunning ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-muted-foreground">
            {isRunning ? 'Simulator running' : 'Simulator paused'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

