/**
 * Huawei GaussDB Service Client
 * PostgreSQL-compatible relational database for all application data
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { gaussDBConfig, isHuaweiServicesEnabled } from '../config';

export interface Transaction {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  timestamp: string;
  location: string;
  country: string;
  merchant_type: string;
  merchant_name: string;
  payment_method: string;
  card_last4: string;
  ip_address: string;
  device_id: string;
  risk_score: number;
  fraud_probability: number;
  confidence: number;
  ai_explanation: any; // JSONB
  processing_time: number;
  model_version: string;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'analyst' | 'viewer';
  created_at: string;
  last_login?: string;
}

export interface Alert {
  id: string;
  transaction_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  status: 'new' | 'investigating' | 'resolved' | 'false-positive';
  risk_score: number;
  created_at: string;
  resolved_at?: string;
  assigned_to?: string;
}

export interface MLModel {
  id: string;
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  last_trained: string;
  huawei_model_id?: string;
  is_active: boolean;
  training_data_size: number;
}

class GaussDBService {
  private pool: Pool | null = null;
  private isConnected = false;
  private initAttempted = false;

  constructor() {
    // Don't initialize in constructor - let it be lazy
  }
  
  /**
   * Ensure the pool is initialized (lazy initialization)
   */
  private ensureInitialized() {
    if (!this.initAttempted) {
      this.initAttempted = true;
      if (isHuaweiServicesEnabled() && gaussDBConfig.endpoint) {
        this.initializePool();
      }
    }
  }

  /**
   * Initialize connection pool
   */
  private initializePool() {
    try {
      this.pool = new Pool({
        host: this.extractHost(gaussDBConfig.endpoint),
        port: this.extractPort(gaussDBConfig.endpoint),
        database: gaussDBConfig.database,
        user: gaussDBConfig.username,
        password: gaussDBConfig.password,
        ssl: {
          rejectUnauthorized: false, // For Huawei Cloud SSL
        },
        max: 20, // Maximum pool size
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.pool.on('error', (err) => {
        console.error('Unexpected error on idle GaussDB client', err);
      });

      this.isConnected = true;
      console.log('✅ GaussDB connection pool initialized');
    } catch (error) {
      console.error('❌ Failed to initialize GaussDB pool:', error);
      this.isConnected = false;
    }
  }

  /**
   * Extract host from endpoint URL
   */
  private extractHost(endpoint: string): string {
    try {
      const url = new URL(endpoint);
      return url.hostname;
    } catch {
      // If not a URL, assume it's already a hostname
      return endpoint.split(':')[0];
    }
  }

  /**
   * Extract port from endpoint URL
   */
  private extractPort(endpoint: string): number {
    try {
      const url = new URL(endpoint);
      return parseInt(url.port) || 5432;
    } catch {
      const parts = endpoint.split(':');
      return parts.length > 1 ? parseInt(parts[1]) : 5432;
    }
  }

  /**
   * Get a client from the pool
   */
  private async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('GaussDB pool not initialized');
    }
    return await this.pool.connect();
  }

  /**
   * Check if GaussDB is available
   */
  isAvailable(): boolean {
    this.ensureInitialized();
    return this.isConnected && this.pool !== null;
  }

  /**
   * Initialize database schema
   */
  async initializeSchema(): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('GaussDB not available, skipping schema initialization');
      return;
    }

    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          display_name VARCHAR(255),
          role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'analyst', 'viewer')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP
        )
      `);

      // Transactions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          user_name VARCHAR(255),
          amount DECIMAL(15,2) NOT NULL,
          timestamp TIMESTAMP NOT NULL,
          location VARCHAR(255),
          country VARCHAR(100),
          merchant_type VARCHAR(100),
          merchant_name VARCHAR(255),
          payment_method VARCHAR(50),
          card_last4 VARCHAR(4),
          ip_address VARCHAR(45),
          device_id VARCHAR(255),
          risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
          fraud_probability DECIMAL(5,4),
          confidence DECIMAL(5,4),
          ai_explanation JSONB,
          processing_time INTEGER,
          model_version VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create index on timestamp for performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_transactions_timestamp 
        ON transactions(timestamp DESC)
      `);

      // Create index on risk_score for alert queries
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_transactions_risk_score 
        ON transactions(risk_score DESC)
      `);

      // Alerts table
      await client.query(`
        CREATE TABLE IF NOT EXISTS alerts (
          id VARCHAR(255) PRIMARY KEY,
          transaction_id VARCHAR(255) REFERENCES transactions(id),
          severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
          title TEXT NOT NULL,
          message TEXT,
          status VARCHAR(30) DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'false-positive')),
          risk_score INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          resolved_at TIMESTAMP,
          assigned_to VARCHAR(255)
        )
      `);

      // ML Models table
      await client.query(`
        CREATE TABLE IF NOT EXISTS ml_models (
          id VARCHAR(100) PRIMARY KEY,
          version VARCHAR(50) NOT NULL,
          accuracy DECIMAL(5,4),
          precision DECIMAL(5,4),
          recall DECIMAL(5,4),
          f1_score DECIMAL(5,4),
          last_trained TIMESTAMP,
          huawei_model_id VARCHAR(255),
          is_active BOOLEAN DEFAULT FALSE,
          training_data_size INTEGER
        )
      `);

      await client.query('COMMIT');
      console.log('✅ GaussDB schema initialized successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Failed to initialize schema:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // TRANSACTION OPERATIONS
  // ============================================================

  /**
   * Create a new transaction
   */
  async createTransaction(transaction: Transaction): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('GaussDB not available');
    }

    const client = await this.getClient();
    try {
      const result = await client.query(
        `INSERT INTO transactions (
          id, user_id, user_name, amount, timestamp, location, country,
          merchant_type, merchant_name, payment_method, card_last4,
          ip_address, device_id, risk_score, fraud_probability, confidence,
          ai_explanation, processing_time, model_version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING id`,
        [
          transaction.id,
          transaction.user_id,
          transaction.user_name,
          transaction.amount,
          transaction.timestamp,
          transaction.location,
          transaction.country,
          transaction.merchant_type,
          transaction.merchant_name,
          transaction.payment_method,
          transaction.card_last4,
          transaction.ip_address,
          transaction.device_id,
          transaction.risk_score,
          transaction.fraud_probability,
          transaction.confidence,
          JSON.stringify(transaction.ai_explanation),
          transaction.processing_time,
          transaction.model_version,
        ]
      );

      return result.rows[0].id;
    } finally {
      client.release();
    }
  }

  /**
   * Get transactions with pagination
   */
  async getTransactions(limit = 100, offset = 0): Promise<Transaction[]> {
    if (!this.isAvailable()) {
      return [];
    }

    const client = await this.getClient();
    try {
      const result = await client.query(
        `SELECT * FROM transactions 
         ORDER BY timestamp DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    if (!this.isAvailable()) {
      return null;
    }

    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM transactions WHERE id = $1',
        [id]
      );

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  /**
   * Get high-risk transactions
   */
  async getHighRiskTransactions(minRiskScore = 70, limit = 50): Promise<Transaction[]> {
    if (!this.isAvailable()) {
      return [];
    }

    const client = await this.getClient();
    try {
      const result = await client.query(
        `SELECT * FROM transactions 
         WHERE risk_score >= $1 
         ORDER BY risk_score DESC, timestamp DESC 
         LIMIT $2`,
        [minRiskScore, limit]
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(): Promise<{
    total: number;
    highRisk: number;
    avgRiskScore: number;
    totalAmount: number;
  }> {
    if (!this.isAvailable()) {
      return { total: 0, highRisk: 0, avgRiskScore: 0, totalAmount: 0 };
    }

    const client = await this.getClient();
    try {
      const result = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN risk_score >= 70 THEN 1 END) as high_risk,
          AVG(risk_score)::DECIMAL(5,2) as avg_risk_score,
          SUM(amount)::DECIMAL(15,2) as total_amount
        FROM transactions
      `);

      return {
        total: parseInt(result.rows[0].total),
        highRisk: parseInt(result.rows[0].high_risk),
        avgRiskScore: parseFloat(result.rows[0].avg_risk_score || 0),
        totalAmount: parseFloat(result.rows[0].total_amount || 0),
      };
    } finally {
      client.release();
    }
  }

  // ============================================================
  // ALERT OPERATIONS
  // ============================================================

  /**
   * Create a new alert
   */
  async createAlert(alert: Omit<Alert, 'created_at'>): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('GaussDB not available');
    }

    const client = await this.getClient();
    try {
      const result = await client.query(
        `INSERT INTO alerts (
          id, transaction_id, severity, title, message, status, risk_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
        [
          alert.id,
          alert.transaction_id,
          alert.severity,
          alert.title,
          alert.message,
          alert.status,
          alert.risk_score,
        ]
      );

      return result.rows[0].id;
    } finally {
      client.release();
    }
  }

  /**
   * Get alerts with filters
   */
  async getAlerts(
    status?: Alert['status'],
    severity?: Alert['severity'],
    limit = 100
  ): Promise<Alert[]> {
    if (!this.isAvailable()) {
      return [];
    }

    const client = await this.getClient();
    try {
      let query = 'SELECT * FROM alerts WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;

      if (status) {
        query += ` AND status = $${paramCount++}`;
        params.push(status);
      }

      if (severity) {
        query += ` AND severity = $${paramCount++}`;
        params.push(severity);
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
      params.push(limit);

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // USER OPERATIONS
  // ============================================================

  /**
   * Create or update user
   */
  async upsertUser(user: User): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('GaussDB not available');
    }

    const client = await this.getClient();
    try {
      await client.query(
        `INSERT INTO users (id, email, display_name, role, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           display_name = EXCLUDED.display_name,
           role = EXCLUDED.role`,
        [user.id, user.email, user.display_name, user.role, user.created_at]
      );
    } finally {
      client.release();
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    if (!this.isAvailable()) {
      return null;
    }

    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('GaussDB connection pool closed');
    }
  }
}

// Export singleton instance
export const gaussDBService = new GaussDBService();

// Export helper to check if GaussDB should be used
export function shouldUseGaussDB(): boolean {
  return gaussDBService.isAvailable();
}

