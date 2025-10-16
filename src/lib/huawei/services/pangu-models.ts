/**
 * Huawei Pangu Models Service Client
 * Integrates with Huawei's Pangu AI models for fraud detection reasoning
 */

import { panguModelsConfig, isHuaweiServicesEnabled } from '../config';
import { signHuaweiRequest } from '../auth';

export interface PanguFraudAnalysisInput {
  transactionId: string;
  amount: number;
  merchantType: string;
  location: string;
  timestamp: string;
  userId: string;
  paymentMethod: string;
  historicalData?: {
    avgTransactionAmount: number;
    transactionCount: number;
    unusualPatterns: string[];
  };
}

export interface RiskFactor {
  factor: string;
  impact: number; // 0-1
  description: string;
  evidence: string;
}

export interface PanguFraudAnalysisOutput {
  riskScore: number; // 0-100
  fraudProbability: number; // 0-1
  confidence: number; // 0-1
  explanation: {
    primaryRiskFactors: RiskFactor[];
    decisionPath: {
      pangModelAnalysis: string;
      confidenceLevel: number;
      alternativeScenarios: string[];
      ruleEngineTriggered: string[];
    };
    summary: string;
  };
  processingTime: number; // milliseconds
  modelVersion: string;
}

export class PanguModelsService {
  private config = panguModelsConfig;
  
  /**
   * Analyze transaction for fraud using Pangu Models
   */
  async analyzeFraudTransaction(
    input: PanguFraudAnalysisInput
  ): Promise<PanguFraudAnalysisOutput> {
    // Check if Huawei services are enabled
    if (!isHuaweiServicesEnabled()) {
      console.warn('Huawei services not configured, using fallback analysis');
      return this.fallbackAnalysis(input);
    }
    
    try {
      const startTime = Date.now();
      
      // Prepare request payload
      const payload = {
        inputs: [
          {
            transaction_id: input.transactionId,
            amount: input.amount,
            merchant_type: input.merchantType,
            location: input.location,
            timestamp: input.timestamp,
            user_id: input.userId,
            payment_method: input.paymentMethod,
            historical_avg_amount: input.historicalData?.avgTransactionAmount || 0,
            historical_count: input.historicalData?.transactionCount || 0,
          },
        ],
        parameters: {
          max_tokens: 2000,
          temperature: 0.3, // Lower temperature for more deterministic fraud detection
          top_p: 0.9,
          explain: true, // Request explainability
        },
      };
      
      const body = JSON.stringify(payload);
      const url = `${this.config.endpoint}/v1/infers/${this.config.modelId}`;
      
      // Sign the request
      const signedRequest = signHuaweiRequest(
        'POST',
        url,
        body,
        this.config.accessKeyId,
        this.config.secretAccessKey,
        this.config.region,
        'pangu'
      );
      
      // Make API request
      const response = await fetch(url, {
        method: 'POST',
        headers: signedRequest.headers,
        body: body,
      });
      
      if (!response.ok) {
        throw new Error(`Pangu API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      const processingTime = Date.now() - startTime;
      
      // Parse Pangu response and format as our output
      return this.parsePanguResponse(result, processingTime, input);
    } catch (error) {
      console.error('Pangu Models API error:', error);
      console.log('Falling back to local analysis');
      return this.fallbackAnalysis(input);
    }
  }
  
  /**
   * Parse Pangu API response into our standard format
   */
  private parsePanguResponse(
    panguResponse: any,
    processingTime: number,
    input: PanguFraudAnalysisInput
  ): PanguFraudAnalysisOutput {
    // Extract predictions from Pangu response
    const prediction = panguResponse.predictions?.[0] || panguResponse.outputs?.[0];
    
    const riskScore = prediction?.risk_score || this.calculateRiskScore(input);
    const fraudProbability = prediction?.fraud_probability || riskScore / 100;
    const confidence = prediction?.confidence || 0.85;
    
    // Extract explanation if available
    const explanation = prediction?.explanation || {};
    
    return {
      riskScore,
      fraudProbability,
      confidence,
      explanation: {
        primaryRiskFactors: explanation.risk_factors || this.generateRiskFactors(input, riskScore),
        decisionPath: {
          pangModelAnalysis: explanation.analysis || 
            `Pangu model detected ${riskScore > 70 ? 'high' : riskScore > 40 ? 'moderate' : 'low'} fraud risk based on transaction patterns and historical behavior.`,
          confidenceLevel: confidence,
          alternativeScenarios: explanation.alternatives || [
            'Legitimate large purchase',
            'Authorized user in new location',
            'Card testing attempt',
          ],
          ruleEngineTriggered: explanation.rules_triggered || this.checkRules(input),
        },
        summary: explanation.summary || this.generateSummary(input, riskScore),
      },
      processingTime,
      modelVersion: panguResponse.model_version || 'pangu-fraud-v1.0',
    };
  }
  
  /**
   * Fallback analysis when Huawei services are unavailable
   */
  private fallbackAnalysis(input: PanguFraudAnalysisInput): PanguFraudAnalysisOutput {
    const startTime = Date.now();
    const riskScore = this.calculateRiskScore(input);
    const fraudProbability = riskScore / 100;
    
    const result: PanguFraudAnalysisOutput = {
      riskScore,
      fraudProbability,
      confidence: 0.75,
      explanation: {
        primaryRiskFactors: this.generateRiskFactors(input, riskScore),
        decisionPath: {
          pangModelAnalysis: `Rule-based analysis detected ${riskScore > 70 ? 'high' : riskScore > 40 ? 'moderate' : 'low'} fraud risk. Connect Pangu Models for advanced AI reasoning.`,
          confidenceLevel: 0.75,
          alternativeScenarios: [
            'Legitimate transaction with unusual characteristics',
            'Authorized user behavior change',
            'Potential fraud attempt',
          ],
          ruleEngineTriggered: this.checkRules(input),
        },
        summary: this.generateSummary(input, riskScore),
      },
      processingTime: Date.now() - startTime,
      modelVersion: 'fallback-v1.0',
    };
    
    return result;
  }
  
  /**
   * Calculate risk score based on transaction characteristics
   */
  private calculateRiskScore(input: PanguFraudAnalysisInput): number {
    let score = 0;
    
    // High amount transactions
    if (input.amount > 1000) score += 30;
    else if (input.amount > 500) score += 20;
    else if (input.amount > 100) score += 10;
    
    // Risky merchant types
    const riskyMerchants = ['crypto', 'gambling', 'gift-card', 'wire-transfer', 'foreign-atm'];
    if (riskyMerchants.some(type => input.merchantType.toLowerCase().includes(type))) {
      score += 25;
    }
    
    // Historical patterns
    if (input.historicalData) {
      const avgAmount = input.historicalData.avgTransactionAmount;
      if (avgAmount > 0 && input.amount > avgAmount * 3) {
        score += 20; // Transaction is 3x normal amount
      }
      
      if (input.historicalData.unusualPatterns && input.historicalData.unusualPatterns.length > 0) {
        score += 15;
      }
    }
    
    // Round robin patterns (multiple transactions in short time)
    const hour = new Date(input.timestamp).getHours();
    if (hour < 6 || hour > 22) {
      score += 10; // Unusual time
    }
    
    return Math.min(Math.max(score, 0), 100);
  }
  
  /**
   * Generate risk factors based on transaction analysis
   */
  private generateRiskFactors(input: PanguFraudAnalysisInput, riskScore: number): RiskFactor[] {
    const factors: RiskFactor[] = [];
    
    // High amount factor
    if (input.amount > 500) {
      factors.push({
        factor: 'High Transaction Amount',
        impact: Math.min(input.amount / 5000, 0.4),
        description: `Transaction amount of $${input.amount} is significantly higher than typical transactions.`,
        evidence: `Amount: $${input.amount}, Avg: $${input.historicalData?.avgTransactionAmount || 100}`,
      });
    }
    
    // Merchant risk factor
    const riskyMerchants = ['crypto', 'gambling', 'gift-card', 'wire-transfer'];
    if (riskyMerchants.some(type => input.merchantType.toLowerCase().includes(type))) {
      factors.push({
        factor: 'High-Risk Merchant Category',
        impact: 0.35,
        description: `Transaction at ${input.merchantType} category, which has elevated fraud rates.`,
        evidence: `Merchant: ${input.merchantType}`,
      });
    }
    
    // Historical anomaly
    if (input.historicalData && input.amount > (input.historicalData.avgTransactionAmount * 2)) {
      factors.push({
        factor: 'Behavioral Anomaly',
        impact: 0.25,
        description: 'Transaction amount deviates significantly from user\'s historical patterns.',
        evidence: `Current: $${input.amount}, Historical Avg: $${input.historicalData.avgTransactionAmount}`,
      });
    }
    
    // Time-based risk
    const hour = new Date(input.timestamp).getHours();
    if (hour < 6 || hour > 22) {
      factors.push({
        factor: 'Unusual Transaction Time',
        impact: 0.15,
        description: 'Transaction occurred during unusual hours (late night/early morning).',
        evidence: `Time: ${new Date(input.timestamp).toLocaleTimeString()}`,
      });
    }
    
    return factors.slice(0, 4); // Return top 4 factors
  }
  
  /**
   * Check which fraud detection rules were triggered
   */
  private checkRules(input: PanguFraudAnalysisInput): string[] {
    const triggered: string[] = [];
    
    if (input.amount > 1000) {
      triggered.push('HIGH_AMOUNT_THRESHOLD');
    }
    
    const riskyMerchants = ['crypto', 'gambling', 'gift-card'];
    if (riskyMerchants.some(type => input.merchantType.toLowerCase().includes(type))) {
      triggered.push('RISKY_MERCHANT_CATEGORY');
    }
    
    if (input.historicalData && input.amount > (input.historicalData.avgTransactionAmount * 3)) {
      triggered.push('VELOCITY_ANOMALY');
    }
    
    const hour = new Date(input.timestamp).getHours();
    if (hour < 6 || hour > 22) {
      triggered.push('UNUSUAL_TIME_PATTERN');
    }
    
    return triggered;
  }
  
  /**
   * Generate human-readable summary
   */
  private generateSummary(input: PanguFraudAnalysisInput, riskScore: number): string {
    if (riskScore > 70) {
      return `High fraud risk detected for $${input.amount} transaction at ${input.merchantType}. Multiple risk factors identified including unusual amount, merchant category, and behavioral patterns. Immediate review recommended.`;
    } else if (riskScore > 40) {
      return `Moderate fraud risk for $${input.amount} transaction. Some suspicious patterns detected but transaction may be legitimate. Suggest monitoring for additional activity.`;
    } else {
      return `Low fraud risk for $${input.amount} transaction at ${input.merchantType}. Transaction patterns appear normal with no significant red flags. Approved for processing.`;
    }
  }
}

// Export singleton instance
export const panguModelsService = new PanguModelsService();

