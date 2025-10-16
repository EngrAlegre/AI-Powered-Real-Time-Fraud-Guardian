/**
 * Transaction Generator for Real-Time Fraud Detection Demo
 * Generates realistic transaction data with controllable fraud scenarios
 */

export interface GeneratedTransaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  merchantType: string;
  merchantName: string;
  location: string;
  country: string;
  timestamp: string;
  paymentMethod: string;
  cardLast4: string;
  ipAddress: string;
  deviceId: string;
  // Fraud indicators
  isSimulatedFraud: boolean;
  fraudReason?: string;
}

export interface SimulatorConfig {
  transactionsPerMinute: number;
  fraudRate: number; // 0-1 (percentage of fraudulent transactions)
  enableScenarios: {
    highAmount: boolean;
    riskyMerchant: boolean;
    unusualTime: boolean;
    velocitySpike: boolean;
    locationAnomaly: boolean;
  };
}

const MERCHANT_TYPES = [
  'grocery', 'restaurant', 'gas-station', 'retail', 'pharmacy',
  'online-gaming', 'crypto-exchange', 'gift-card', 'wire-transfer',
  'electronics', 'clothing', 'hotel', 'airline', 'entertainment'
];

const RISKY_MERCHANTS = [
  'online-gaming', 'crypto-exchange', 'gift-card', 'wire-transfer',
  'foreign-atm', 'offshore-casino'
];

const MERCHANT_NAMES: Record<string, string[]> = {
  'grocery': ['Fresh Market', 'Whole Foods', 'Target', 'Walmart'],
  'restaurant': ['Olive Garden', 'Chipotle', 'Starbucks', 'McDonalds'],
  'gas-station': ['Shell', 'Chevron', 'BP', '76'],
  'retail': ['Amazon', 'Best Buy', 'Home Depot', 'IKEA'],
  'online-gaming': ['SteamGames', 'Epic Store', 'Xbox Live', 'PlayStation Store'],
  'crypto-exchange': ['Binance', 'Coinbase', 'Kraken', 'Crypto.com'],
  'gift-card': ['Gift Card Mall', 'CardCash', 'Raise', 'GiftCards.com'],
  'electronics': ['Apple Store', 'Best Buy', 'B&H Photo', 'Newegg'],
};

const LOCATIONS = [
  { city: 'New York', state: 'NY', country: 'USA' },
  { city: 'Los Angeles', state: 'CA', country: 'USA' },
  { city: 'Chicago', state: 'IL', country: 'USA' },
  { city: 'Houston', state: 'TX', country: 'USA' },
  { city: 'Singapore', state: 'Singapore', country: 'Singapore' },
  { city: 'London', state: 'England', country: 'UK' },
  { city: 'Tokyo', state: 'Tokyo', country: 'Japan' },
  { city: 'Sydney', state: 'NSW', country: 'Australia' },
];

const SUSPICIOUS_LOCATIONS = [
  { city: 'Lagos', state: 'Lagos', country: 'Nigeria' },
  { city: 'Moscow', state: 'Moscow', country: 'Russia' },
  { city: 'Unknown', state: 'Unknown', country: 'Tor Network' },
];

const PAYMENT_METHODS = ['credit-card', 'debit-card', 'digital-wallet', 'bank-transfer'];

const FIRST_NAMES = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

export class TransactionGenerator {
  private config: SimulatorConfig;
  private transactionCount = 0;
  private userTransactionHistory: Map<string, number[]> = new Map();
  
  constructor(config: SimulatorConfig) {
    this.config = config;
  }
  
  /**
   * Generate a single transaction
   */
  generateTransaction(): GeneratedTransaction {
    this.transactionCount++;
    
    // Decide if this should be fraudulent
    const shouldBeFraud = Math.random() < this.config.fraudRate;
    
    if (shouldBeFraud) {
      return this.generateFraudulentTransaction();
    } else {
      return this.generateNormalTransaction();
    }
  }
  
  /**
   * Generate a normal, legitimate transaction
   */
  private generateNormalTransaction(): GeneratedTransaction {
    const userId = `user_${Math.floor(Math.random() * 1000)}`;
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    
    // Normal amounts: $5-$500
    const amount = Math.round((Math.random() * 495 + 5) * 100) / 100;
    
    // Normal merchants
    const normalMerchants = MERCHANT_TYPES.filter(m => !RISKY_MERCHANTS.includes(m));
    const merchantType = normalMerchants[Math.floor(Math.random() * normalMerchants.length)];
    const merchantName = this.getMerchantName(merchantType);
    
    // Normal locations
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    
    // Normal business hours (9 AM - 10 PM)
    const timestamp = this.generateTimestamp(false);
    
    const paymentMethod = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
    
    return {
      id: `TXN-${Date.now()}-${this.transactionCount}`,
      userId,
      userName: `${firstName} ${lastName}`,
      amount,
      merchantType,
      merchantName,
      location: `${location.city}, ${location.state}`,
      country: location.country,
      timestamp,
      paymentMethod,
      cardLast4: Math.floor(1000 + Math.random() * 9000).toString(),
      ipAddress: this.generateIP(),
      deviceId: `device_${Math.random().toString(36).substr(2, 9)}`,
      isSimulatedFraud: false,
    };
  }
  
  /**
   * Generate a fraudulent transaction with specific patterns
   */
  private generateFraudulentTransaction(): GeneratedTransaction {
    const userId = `user_${Math.floor(Math.random() * 1000)}`;
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    
    // Pick a fraud scenario
    const scenarios = [];
    if (this.config.enableScenarios.highAmount) scenarios.push('highAmount');
    if (this.config.enableScenarios.riskyMerchant) scenarios.push('riskyMerchant');
    if (this.config.enableScenarios.unusualTime) scenarios.push('unusualTime');
    if (this.config.enableScenarios.locationAnomaly) scenarios.push('locationAnomaly');
    if (this.config.enableScenarios.velocitySpike) scenarios.push('velocitySpike');
    
    const scenario = scenarios.length > 0 
      ? scenarios[Math.floor(Math.random() * scenarios.length)]
      : 'highAmount';
    
    let amount: number;
    let merchantType: string;
    let merchantName: string;
    let location: any;
    let timestamp: string;
    let fraudReason: string;
    
    switch (scenario) {
      case 'highAmount':
        amount = Math.round((Math.random() * 4000 + 1000) * 100) / 100; // $1000-$5000
        merchantType = MERCHANT_TYPES[Math.floor(Math.random() * MERCHANT_TYPES.length)];
        merchantName = this.getMerchantName(merchantType);
        location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        timestamp = this.generateTimestamp(false);
        fraudReason = 'Unusually high transaction amount';
        break;
        
      case 'riskyMerchant':
        amount = Math.round((Math.random() * 1500 + 500) * 100) / 100;
        merchantType = RISKY_MERCHANTS[Math.floor(Math.random() * RISKY_MERCHANTS.length)];
        merchantName = this.getMerchantName(merchantType);
        location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        timestamp = this.generateTimestamp(false);
        fraudReason = 'High-risk merchant category';
        break;
        
      case 'unusualTime':
        amount = Math.round((Math.random() * 800 + 200) * 100) / 100;
        merchantType = MERCHANT_TYPES[Math.floor(Math.random() * MERCHANT_TYPES.length)];
        merchantName = this.getMerchantName(merchantType);
        location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        timestamp = this.generateTimestamp(true); // Late night
        fraudReason = 'Transaction at unusual hours (2-6 AM)';
        break;
        
      case 'locationAnomaly':
        amount = Math.round((Math.random() * 600 + 100) * 100) / 100;
        merchantType = MERCHANT_TYPES[Math.floor(Math.random() * MERCHANT_TYPES.length)];
        merchantName = this.getMerchantName(merchantType);
        location = SUSPICIOUS_LOCATIONS[Math.floor(Math.random() * SUSPICIOUS_LOCATIONS.length)];
        timestamp = this.generateTimestamp(false);
        fraudReason = 'Suspicious geographic location';
        break;
        
      case 'velocitySpike':
        amount = Math.round((Math.random() * 300 + 50) * 100) / 100;
        merchantType = 'gift-card';
        merchantName = this.getMerchantName(merchantType);
        location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        timestamp = this.generateTimestamp(false);
        fraudReason = 'Rapid transaction velocity (card testing)';
        break;
        
      default:
        amount = 2000;
        merchantType = 'crypto-exchange';
        merchantName = 'Suspicious Crypto';
        location = SUSPICIOUS_LOCATIONS[0];
        timestamp = this.generateTimestamp(true);
        fraudReason = 'Multiple fraud indicators';
    }
    
    const paymentMethod = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
    
    return {
      id: `TXN-${Date.now()}-${this.transactionCount}`,
      userId,
      userName: `${firstName} ${lastName}`,
      amount,
      merchantType,
      merchantName,
      location: `${location.city}, ${location.state}`,
      country: location.country,
      timestamp,
      paymentMethod,
      cardLast4: Math.floor(1000 + Math.random() * 9000).toString(),
      ipAddress: this.generateIP(),
      deviceId: `device_${Math.random().toString(36).substr(2, 9)}`,
      isSimulatedFraud: true,
      fraudReason,
    };
  }
  
  /**
   * Get merchant name for a type
   */
  private getMerchantName(type: string): string {
    const names = MERCHANT_NAMES[type] || [`${type} Store`];
    return names[Math.floor(Math.random() * names.length)];
  }
  
  /**
   * Generate timestamp (normal hours or unusual hours)
   */
  private generateTimestamp(unusualHours: boolean): string {
    const now = new Date();
    
    if (unusualHours) {
      // 2 AM - 6 AM
      now.setHours(2 + Math.floor(Math.random() * 4));
    } else {
      // 9 AM - 10 PM
      now.setHours(9 + Math.floor(Math.random() * 13));
    }
    
    now.setMinutes(Math.floor(Math.random() * 60));
    now.setSeconds(Math.floor(Math.random() * 60));
    
    return now.toISOString();
  }
  
  /**
   * Generate random IP address
   */
  private generateIP(): string {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<SimulatorConfig>) {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Default simulator configuration
 */
export const DEFAULT_SIMULATOR_CONFIG: SimulatorConfig = {
  transactionsPerMinute: 30, // 1 transaction every 2 seconds
  fraudRate: 0.08, // 8% fraud rate
  enableScenarios: {
    highAmount: true,
    riskyMerchant: true,
    unusualTime: true,
    velocitySpike: true,
    locationAnomaly: true,
  },
};

