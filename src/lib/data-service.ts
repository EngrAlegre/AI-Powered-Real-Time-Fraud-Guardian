/**
 * Huawei GaussDB Data Service
 * 100% Huawei Cloud - No Firebase
 * 
 * NOTE: This service is SERVER-SIDE ONLY
 * GaussDB operations require Node.js and cannot run in the browser
 */

import type { Transaction, User, Alert } from './huawei/services/gaussdb';

// Lazy load GaussDB service only on server-side
let gaussDBService: any = null;

// Initialize GaussDB only on server-side
if (typeof window === 'undefined') {
  try {
    const gaussDBModule = require('./huawei/services/gaussdb');
    gaussDBService = gaussDBModule.gaussDBService;
  } catch (error) {
    console.error('❌ GaussDB failed to initialize:', error);
    throw new Error('GaussDB is required but not available');
  }
}

export class DataService {
  /**
   * Create a new transaction
   */
  static async createTransaction(transaction: Omit<Transaction, 'created_at'>): Promise<string> {
    if (!gaussDBService || !gaussDBService.isAvailable()) {
      throw new Error('GaussDB is not available');
    }
    
    console.log('💾 Saving to Huawei GaussDB...');
    return await gaussDBService.createTransaction(transaction as Transaction);
  }

  /**
   * Get transactions (with limit)
   */
  static async getTransactions(limit: number = 100): Promise<Transaction[]> {
    if (!gaussDBService || !gaussDBService.isAvailable()) {
      throw new Error('GaussDB is not available');
    }
    
    console.log('📊 Fetching from Huawei GaussDB...');
    return await gaussDBService.getTransactions(limit);
  }

  /**
   * Get transaction by ID
   */
  static async getTransaction(id: string): Promise<Transaction | null> {
    if (!gaussDBService || !gaussDBService.isAvailable()) {
      throw new Error('GaussDB is not available');
    }
    
    return await gaussDBService.getTransaction(id);
  }

  /**
   * Get transaction statistics
   */
  static async getTransactionStats(): Promise<{
    total: number;
    highRisk: number;
    avgRiskScore: number;
    totalAmount: number;
  }> {
    if (!gaussDBService || !gaussDBService.isAvailable()) {
      throw new Error('GaussDB is not available');
    }
    
    return await gaussDBService.getTransactionStats();
  }

  /**
   * Create a new user
   */
  static async createUser(user: Omit<User, 'created_at'>): Promise<string> {
    if (!gaussDBService || !gaussDBService.isAvailable()) {
      throw new Error('GaussDB is not available');
    }
    
    return await gaussDBService.createUser(user as User);
  }

  /**
   * Create a new alert
   */
  static async createAlert(alert: Omit<Alert, 'created_at'>): Promise<string> {
    if (!gaussDBService || !gaussDBService.isAvailable()) {
      throw new Error('GaussDB is not available');
    }
    
    console.log('🚨 Saving alert to Huawei GaussDB...');
    return await gaussDBService.createAlert(alert as Alert);
  }

  /**
   * Get alerts
   */
  static async getAlerts(limit: number = 100): Promise<Alert[]> {
    if (!gaussDBService || !gaussDBService.isAvailable()) {
      throw new Error('GaussDB is not available');
    }
    
    return await gaussDBService.getAlerts({});
  }

  /**
   * Check which database is currently active
   */
  static getActiveDatabase(): 'gaussdb' {
    return 'gaussdb';
  }

  /**
   * Get system health status
   */
  static async getHealthStatus() {
    return {
      gaussdb: gaussDBService ? gaussDBService.isAvailable() : false,
      huaweiCloud: true,
      primary: 'gaussdb' as const,
    };
  }
}

// Export for convenience
export const dataService = DataService;

