'use client';

import { useState } from 'react';
import { HuaweiPoweredBy } from "@/components/huawei/huawei-badge";
import SimulatorControls from "@/components/dashboard/simulator-controls";
import { TransactionGenerator, DEFAULT_SIMULATOR_CONFIG, type SimulatorConfig } from '@/lib/simulator/transaction-generator';
import { RealTimeProcessor } from '@/lib/simulator/real-time-processor';
import { Card } from "@/components/ui/card";

export default function LiveDemoPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState<SimulatorConfig>(DEFAULT_SIMULATOR_CONFIG);
  const [stats, setStats] = useState({ generated: 0, fraudDetected: 0, alertsTriggered: 0 });

  const handleStart = async () => {
    setIsRunning(true);
    setStats({ generated: 0, fraudDetected: 0, alertsTriggered: 0 });
    
    const generator = new TransactionGenerator(config);
    const processor = new RealTimeProcessor();
    
    const interval = setInterval(async () => {
      try {
        // Generate transaction
        const rawTransaction = generator.generateTransaction();
        
        // Process for fraud
        const processedTransaction = await processor.processTransaction(rawTransaction);
        
        // Save to database via API
        try {
          const dbTransaction = processor.toDBTransaction(processedTransaction);
          const response = await fetch('/api/transactions/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dbTransaction),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`💾 Transaction saved to ${result.database}:`, result.id);
          }
        } catch (saveError) {
          console.warn('Failed to save transaction:', saveError);
        }
        
        // Update stats
        setStats(prev => ({
          generated: prev.generated + 1,
          fraudDetected: prev.fraudDetected + (processedTransaction.riskScore > 70 ? 1 : 0),
          alertsTriggered: prev.alertsTriggered + (processedTransaction.riskScore > 60 ? 1 : 0),
        }));
        
        // Generate alert if needed
        const alert = processor.generateAlert(processedTransaction);
        if (alert) {
          try {
            const dbAlert = processor.toDBAlert(alert);
            const response = await fetch('/api/alerts/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(dbAlert),
            });
            
            if (response.ok) {
              const result = await response.json();
              console.log(`🚨 Alert saved to ${result.database}:`, result.id);
            }
          } catch (saveError) {
            console.warn('Failed to save alert:', saveError);
          }
        }
      } catch (error) {
        console.error('Error processing transaction:', error);
      }
    }, (60 * 1000) / config.transactionsPerMinute);

    // Store interval for cleanup
    (window as any).fraudSimulatorInterval = interval;
  };

  const handleStop = () => {
    setIsRunning(false);
    if ((window as any).fraudSimulatorInterval) {
      clearInterval((window as any).fraudSimulatorInterval);
      (window as any).fraudSimulatorInterval = null;
    }
  };

  const handleConfigChange = (newConfig: SimulatorConfig) => {
    setConfig(newConfig);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl">
            🔴 Live Demo - Transaction Simulator
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate realistic transactions and save them to the database
          </p>
        </div>
        <HuaweiPoweredBy />
      </div>

      <SimulatorControls
        isRunning={isRunning}
        config={config}
        onStart={handleStart}
        onStop={handleStop}
        onConfigChange={handleConfigChange}
      />

      {/* Statistics Display */}
      {isRunning && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Real-Time Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.generated}</div>
              <div className="text-sm text-muted-foreground">Transactions Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.alertsTriggered}</div>
              <div className="text-sm text-muted-foreground">Alerts Triggered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.fraudDetected}</div>
              <div className="text-sm text-muted-foreground">High Risk Detected</div>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-2">💡 How It Works</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Click <strong>"Start Simulator"</strong> to begin generating transactions</li>
          <li>• Transactions are automatically analyzed by Huawei Pangu AI</li>
          <li>• High-risk transactions trigger fraud alerts</li>
          <li>• All data is saved to <strong>GaussDB</strong> (or Firebase as fallback)</li>
          <li>• View results in the <strong>Dashboard</strong> tab</li>
          <li>• Check browser console for detailed logs</li>
        </ul>
      </Card>
    </div>
  );
}

