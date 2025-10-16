/**
 * Real-Time Transaction Processor
 * Handles streaming fraud detection and alert generation
 */

import { panguModelsService } from '@/lib/huawei';
import type { GeneratedTransaction } from './transaction-generator';

export interface ProcessedTransaction extends GeneratedTransaction {
  riskScore: number;
  fraudProbability: number;
  confidence: number;
  riskFactors: Array<{
    factor: string;
    impact: number;
    description: string;
    evidence: string;
  }>;
  aiAnalysis: string;
  processingTime: number;
  modelVersion: string;
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  riskScore: number;
  transaction: ProcessedTransaction;
  status: 'new' | 'investigating' | 'resolved' | 'false-positive';
}

export class RealTimeProcessor {
  private alertThresholds = {
    low: 40,
    medium: 60,
    high: 75,
    critical: 90,
  };
  
  /**
   * Process a single transaction for fraud detection
   */
  async processTransaction(transaction: GeneratedTransaction): Promise<ProcessedTransaction> {
    const startTime = Date.now();
    
    try {
      // Call Huawei Pangu Models for fraud analysis
      const analysis = await panguModelsService.analyzeFraudTransaction({
        transactionId: transaction.id,
        amount: transaction.amount,
        merchantType: transaction.merchantType,
        location: transaction.location,
        timestamp: transaction.timestamp,
        userId: transaction.userId,
        paymentMethod: transaction.paymentMethod,
        historicalData: {
          avgTransactionAmount: 120, // Mock historical data
          transactionCount: 45,
          unusualPatterns: transaction.isSimulatedFraud ? ['rapid-velocity'] : [],
        },
      });
      
      const processingTime = Date.now() - startTime;
      
      return {
        ...transaction,
        riskScore: analysis.riskScore,
        fraudProbability: analysis.fraudProbability,
        confidence: analysis.confidence,
        riskFactors: analysis.explanation.primaryRiskFactors,
        aiAnalysis: analysis.explanation.decisionPath.pangModelAnalysis,
        processingTime,
        modelVersion: analysis.modelVersion,
      };
    } catch (error) {
      console.error('Error processing transaction:', error);
      
      // Fallback to basic risk calculation
      const riskScore = this.calculateBasicRiskScore(transaction);
      const processingTime = Date.now() - startTime;
      
      return {
        ...transaction,
        riskScore,
        fraudProbability: riskScore / 100,
        confidence: 0.75,
        riskFactors: this.generateBasicRiskFactors(transaction, riskScore),
        aiAnalysis: `Transaction analyzed using rule-based system. Risk score: ${riskScore}/100.`,
        processingTime,
        modelVersion: 'fallback-v1.0',
      };
    }
  }
  
  /**
   * Generate alert if transaction is high-risk
   */
  generateAlert(transaction: ProcessedTransaction): FraudAlert | null {
    if (transaction.riskScore < this.alertThresholds.low) {
      return null; // No alert for low-risk transactions
    }
    
    const severity = this.getSeverity(transaction.riskScore);
    const title = this.getAlertTitle(severity, transaction);
    const message = this.getAlertMessage(transaction);
    
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transactionId: transaction.id,
      severity,
      title,
      message,
      timestamp: new Date().toISOString(),
      riskScore: transaction.riskScore,
      transaction,
      status: 'new',
    };
  }
  
  /**
   * Calculate basic risk score (fallback)
   */
  private calculateBasicRiskScore(transaction: GeneratedTransaction): number {
    let score = 0;
    
    // High amount
    if (transaction.amount > 1000) score += 30;
    else if (transaction.amount > 500) score += 20;
    else if (transaction.amount > 200) score += 10;
    
    // Risky merchant
    const riskyMerchants = ['crypto-exchange', 'online-gaming', 'gift-card', 'wire-transfer'];
    if (riskyMerchants.some(m => transaction.merchantType.includes(m))) {
      score += 25;
    }
    
    // Suspicious locations
    const suspiciousCountries = ['Nigeria', 'Russia', 'Tor Network'];
    if (suspiciousCountries.includes(transaction.country)) {
      score += 20;
    }
    
    // Unusual time (2-6 AM)
    const hour = new Date(transaction.timestamp).getHours();
    if (hour >= 2 && hour < 6) {
      score += 15;
    }
    
    // Simulated fraud flag
    if (transaction.isSimulatedFraud) {
      score = Math.max(score, 70); // Ensure simulated fraud is at least medium risk
    }
    
    return Math.min(Math.max(score, 0), 100);
  }
  
  /**
   * Generate basic risk factors (fallback)
   */
  private generateBasicRiskFactors(
    transaction: GeneratedTransaction,
    riskScore: number
  ): Array<{ factor: string; impact: number; description: string; evidence: string }> {
    const factors = [];
    
    if (transaction.amount > 500) {
      factors.push({
        factor: 'High Transaction Amount',
        impact: Math.min(transaction.amount / 5000, 0.4),
        description: `Transaction amount of $${transaction.amount} is higher than typical.`,
        evidence: `Amount: $${transaction.amount}`,
      });
    }
    
    const riskyMerchants = ['crypto-exchange', 'online-gaming', 'gift-card'];
    if (riskyMerchants.some(m => transaction.merchantType.includes(m))) {
      factors.push({
        factor: 'High-Risk Merchant Category',
        impact: 0.35,
        description: `${transaction.merchantType} has elevated fraud rates.`,
        evidence: `Merchant: ${transaction.merchantName}`,
      });
    }
    
    const hour = new Date(transaction.timestamp).getHours();
    if (hour >= 2 && hour < 6) {
      factors.push({
        factor: 'Unusual Transaction Time',
        impact: 0.2,
        description: 'Transaction occurred during unusual hours.',
        evidence: `Time: ${new Date(transaction.timestamp).toLocaleTimeString()}`,
      });
    }
    
    if (transaction.fraudReason) {
      factors.push({
        factor: 'Pattern Anomaly',
        impact: 0.25,
        description: transaction.fraudReason,
        evidence: 'Automated fraud detection',
      });
    }
    
    return factors.slice(0, 4);
  }
  
  /**
   * Determine alert severity based on risk score
   */
  private getSeverity(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= this.alertThresholds.critical) return 'critical';
    if (riskScore >= this.alertThresholds.high) return 'high';
    if (riskScore >= this.alertThresholds.medium) return 'medium';
    return 'low';
  }
  
  /**
   * Get alert title based on severity
   */
  private getAlertTitle(severity: string, transaction: ProcessedTransaction): string {
    const emoji = {
      critical: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: '📊',
    }[severity] || '📊';
    
    return `${emoji} ${severity.toUpperCase()} Risk Transaction - $${transaction.amount.toFixed(2)}`;
  }
  
  /**
   * Get alert message
   */
  private getAlertMessage(transaction: ProcessedTransaction): string {
    const topFactor = transaction.riskFactors[0];
    
    return `Transaction from ${transaction.userName} at ${transaction.merchantName}. ${topFactor?.description || 'Multiple risk factors detected.'}`;
  }
}

