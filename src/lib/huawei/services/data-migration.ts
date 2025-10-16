/**
 * Data Migration Service
 * Utilities to migrate data from Firebase to GaussDB
 */

import { gaussDBService } from './gaussdb';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, limit as firebaseLimit } from 'firebase/firestore';

export interface MigrationStats {
  total: number;
  migrated: number;
  failed: number;
  errors: string[];
}

class DataMigrationService {
  /**
   * Migrate all transactions from Firebase to GaussDB
   */
  async migrateTransactions(limit?: number): Promise<MigrationStats> {
    console.log('🔄 Starting transaction migration...');
    const stats: MigrationStats = {
      total: 0,
      migrated: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Check if GaussDB is available
      if (!gaussDBService.isAvailable()) {
        throw new Error('GaussDB is not available');
      }

      // Get transactions from Firebase
      const transactionsRef = collection(db, 'transactions');
      const q = limit
        ? query(transactionsRef, orderBy('timestamp', 'desc'), firebaseLimit(limit))
        : query(transactionsRef, orderBy('timestamp', 'desc'));

      const snapshot = await getDocs(q);
      stats.total = snapshot.size;

      console.log(`📊 Found ${stats.total} transactions to migrate`);

      // Migrate each transaction
      for (const doc of snapshot.docs) {
        try {
          const data = doc.data();
          
          // Transform Firebase data to GaussDB format
          const transaction = {
            id: doc.id,
            user_id: data.userId || data.user_id || 'unknown',
            user_name: data.userName || data.user_name || 'Unknown User',
            amount: parseFloat(data.amount) || 0,
            timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
            location: data.location || 'Unknown',
            country: data.country || 'Unknown',
            merchant_type: data.merchantType || data.merchant_type || 'unknown',
            merchant_name: data.merchantName || data.merchant_name || 'Unknown Merchant',
            payment_method: data.paymentMethod || data.payment_method || 'unknown',
            card_last4: data.cardLast4 || data.card_last4 || '0000',
            ip_address: data.ipAddress || data.ip_address || '0.0.0.0',
            device_id: data.deviceId || data.device_id || 'unknown',
            risk_score: data.riskScore || data.risk_score || 0,
            fraud_probability: data.fraudProbability || data.fraud_probability || 0,
            confidence: data.confidence || 0.5,
            ai_explanation: data.aiExplanation || data.ai_explanation || null,
            processing_time: data.processingTime || data.processing_time || 0,
            model_version: data.modelVersion || data.model_version || 'v1.0',
          };

          await gaussDBService.createTransaction(transaction);
          stats.migrated++;
          
          if (stats.migrated % 100 === 0) {
            console.log(`✅ Migrated ${stats.migrated}/${stats.total} transactions`);
          }
        } catch (error) {
          stats.failed++;
          const errorMsg = `Failed to migrate transaction ${doc.id}: ${error}`;
          stats.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      console.log('✅ Transaction migration complete!');
      return stats;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Migrate users from Firebase Auth to GaussDB
   */
  async migrateUsers(): Promise<MigrationStats> {
    console.log('🔄 Starting user migration...');
    const stats: MigrationStats = {
      total: 0,
      migrated: 0,
      failed: 0,
      errors: [],
    };

    try {
      if (!gaussDBService.isAvailable()) {
        throw new Error('GaussDB is not available');
      }

      // Get users from Firebase
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      stats.total = snapshot.size;

      console.log(`📊 Found ${stats.total} users to migrate`);

      for (const doc of snapshot.docs) {
        try {
          const data = doc.data();
          
          const user = {
            id: doc.id,
            email: data.email || '',
            display_name: data.displayName || data.display_name || 'Unknown',
            role: (data.role || 'viewer') as 'admin' | 'analyst' | 'viewer',
            created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            last_login: data.lastLogin?.toDate?.()?.toISOString(),
          };

          await gaussDBService.createUser(user);
          stats.migrated++;
        } catch (error) {
          stats.failed++;
          const errorMsg = `Failed to migrate user ${doc.id}: ${error}`;
          stats.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      console.log('✅ User migration complete!');
      return stats;
    } catch (error) {
      console.error('❌ User migration failed:', error);
      throw error;
    }
  }

  /**
   * Migrate fraud alerts from Firebase to GaussDB
   */
  async migrateAlerts(): Promise<MigrationStats> {
    console.log('🔄 Starting alert migration...');
    const stats: MigrationStats = {
      total: 0,
      migrated: 0,
      failed: 0,
      errors: [],
    };

    try {
      if (!gaussDBService.isAvailable()) {
        throw new Error('GaussDB is not available');
      }

      const alertsRef = collection(db, 'fraudAlerts');
      const snapshot = await getDocs(alertsRef);
      stats.total = snapshot.size;

      console.log(`📊 Found ${stats.total} alerts to migrate`);

      for (const doc of snapshot.docs) {
        try {
          const data = doc.data();
          
          const alert = {
            id: doc.id,
            transaction_id: data.transactionId || data.transaction_id || '',
            severity: (data.severity || data.riskLevel || 'low') as 'low' | 'medium' | 'high' | 'critical',
            title: data.title || data.alertType || 'Fraud Alert',
            message: data.message || data.description || '',
            status: (data.status || 'new') as 'new' | 'investigating' | 'resolved' | 'false-positive',
            risk_score: data.riskScore || data.risk_score || 0,
            created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            resolved_at: data.resolvedAt?.toDate?.()?.toISOString(),
            assigned_to: data.assignedTo || data.assigned_to,
          };

          await gaussDBService.createAlert(alert);
          stats.migrated++;
        } catch (error) {
          stats.failed++;
          const errorMsg = `Failed to migrate alert ${doc.id}: ${error}`;
          stats.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      console.log('✅ Alert migration complete!');
      return stats;
    } catch (error) {
      console.error('❌ Alert migration failed:', error);
      throw error;
    }
  }

  /**
   * Run full migration (all collections)
   */
  async migrateAll(): Promise<{
    transactions: MigrationStats;
    users: MigrationStats;
    alerts: MigrationStats;
  }> {
    console.log('🚀 Starting full data migration...\n');

    const results = {
      transactions: await this.migrateTransactions(),
      users: await this.migrateUsers(),
      alerts: await this.migrateAlerts(),
    };

    console.log('\n📊 Migration Summary:');
    console.log('Transactions:', `${results.transactions.migrated}/${results.transactions.total} migrated`);
    console.log('Users:', `${results.users.migrated}/${results.users.total} migrated`);
    console.log('Alerts:', `${results.alerts.migrated}/${results.alerts.total} migrated`);

    return results;
  }
}

export const dataMigrationService = new DataMigrationService();

