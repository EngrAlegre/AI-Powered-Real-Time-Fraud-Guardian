'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TransactionGenerator, DEFAULT_SIMULATOR_CONFIG, type SimulatorConfig } from '@/lib/simulator/transaction-generator';
import { RealTimeProcessor, type ProcessedTransaction, type FraudAlert } from '@/lib/simulator/real-time-processor';
import LiveTransactionFeed from './live-transaction-feed';
import RealTimeAlerts from './real-time-alerts';
import SimulatorControls from './simulator-controls';
import ExplainableAICard from './explainable-ai-card';

export default function LiveDemoDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState<SimulatorConfig>(DEFAULT_SIMULATOR_CONFIG);
  const [transactions, setTransactions] = useState<ProcessedTransaction[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<ProcessedTransaction | null>(null);
  
  const generatorRef = useRef<TransactionGenerator | null>(null);
  const processorRef = useRef<RealTimeProcessor | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize generator and processor
  useEffect(() => {
    generatorRef.current = new TransactionGenerator(config);
    processorRef.current = new RealTimeProcessor();
  }, []);

  // Update generator config when config changes
  useEffect(() => {
    if (generatorRef.current) {
      generatorRef.current.updateConfig(config);
    }
  }, [config]);

  // Generate and process transactions
  const processNextTransaction = useCallback(async () => {
    if (!generatorRef.current || !processorRef.current) return;

    try {
      // Generate transaction
      const rawTransaction = generatorRef.current.generateTransaction();
      
      // Process for fraud
      const processedTransaction = await processorRef.current.processTransaction(rawTransaction);
      
      // Add to transactions list
      setTransactions(prev => [...prev, processedTransaction]);
      
      // Generate alert if needed
      const alert = processorRef.current.generateAlert(processedTransaction);
      if (alert) {
        setAlerts(prev => [alert, ...prev]);
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
    }
  }, []);

  // Start/stop simulator
  useEffect(() => {
    if (isRunning) {
      // Calculate interval in milliseconds
      const intervalMs = (60 * 1000) / config.transactionsPerMinute;
      
      intervalRef.current = setInterval(() => {
        processNextTransaction();
      }, intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, config.transactionsPerMinute, processNextTransaction]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTransactions([]);
    setAlerts([]);
    setSelectedTransaction(null);
    if (generatorRef.current) {
      generatorRef.current = new TransactionGenerator(config);
    }
  };

  const handleConfigChange = (newConfig: Partial<SimulatorConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleTransactionClick = (transaction: ProcessedTransaction) => {
    setSelectedTransaction(transaction);
  };

  const handleAlertClick = (alert: FraudAlert) => {
    setSelectedTransaction(alert.transaction);
  };

  const handleAlertDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Calculate stats
  const stats = {
    totalTransactions: transactions.length,
    fraudTransactions: alerts.length,
    avgProcessingTime: transactions.length > 0
      ? transactions.reduce((sum, t) => sum + t.processingTime, 0) / transactions.length
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Simulator Controls */}
      <SimulatorControls
        isRunning={isRunning}
        config={config}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onConfigChange={handleConfigChange}
        stats={stats}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Live Feed - 2 columns */}
        <div className="lg:col-span-2">
          <LiveTransactionFeed 
            transactions={transactions}
            onTransactionClick={handleTransactionClick}
          />
        </div>

        {/* Alerts - 1 column */}
        <div className="lg:col-span-1">
          <RealTimeAlerts
            alerts={alerts}
            onAlertClick={handleAlertClick}
            onAlertDismiss={handleAlertDismiss}
            enableNotifications={isRunning}
          />
        </div>
      </div>

      {/* Explainable AI Card */}
      {selectedTransaction && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <ExplainableAICard
            initialTransaction={{
              id: selectedTransaction.id,
              riskScore: selectedTransaction.riskScore,
              explanation: {
                primaryRiskFactors: selectedTransaction.riskFactors,
                decisionPath: {
                  pangModelAnalysis: selectedTransaction.aiAnalysis,
                  confidenceLevel: selectedTransaction.confidence,
                  alternativeScenarios: [
                    'Legitimate high-value purchase',
                    'Authorized user behavior change',
                    'Potential fraud attempt'
                  ],
                },
                summary: selectedTransaction.aiAnalysis,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

