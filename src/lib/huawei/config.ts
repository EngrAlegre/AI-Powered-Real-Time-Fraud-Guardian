/**
 * Huawei Cloud Configuration
 * Centralized configuration for all Huawei Cloud services
 */

export interface HuaweiCloudConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  projectId?: string;
}

export interface PanguModelsConfig extends HuaweiCloudConfig {
  endpoint: string;
  modelId: string;
}

export interface ModelArtsConfig extends HuaweiCloudConfig {
  endpoint: string;
  obsEndpoint?: string;
}

export interface GaussDBConfig extends HuaweiCloudConfig {
  endpoint: string;
  database: string;
  username: string;
  password: string;
}

export interface FunctionGraphConfig extends HuaweiCloudConfig {
  endpoint: string;
  functionUrn?: string;
}

// Helper function to get base config
function getHuaweiCloudConfig(): HuaweiCloudConfig {
  return {
    region: process.env.HUAWEI_CLOUD_REGION || 'ap-southeast-1',
    accessKeyId: process.env.HUAWEI_CLOUD_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.HUAWEI_CLOUD_SECRET_ACCESS_KEY || '',
    projectId: process.env.HUAWEI_CLOUD_PROJECT_ID || '',
  };
}

// Load configuration from environment variables (lazy-loaded)
export const huaweiCloudConfig = new Proxy({} as HuaweiCloudConfig, {
  get(target, prop) {
    const config = getHuaweiCloudConfig();
    return config[prop as keyof HuaweiCloudConfig];
  }
});

export const panguModelsConfig = new Proxy({} as PanguModelsConfig, {
  get(target, prop) {
    const base = getHuaweiCloudConfig();
    const config = {
      ...base,
      endpoint: process.env.HUAWEI_PANGU_ENDPOINT || 'https://pangu.ap-southeast-1.myhuaweicloud.com',
      modelId: process.env.HUAWEI_PANGU_MODEL_ID || 'fraud-detection-v1',
    };
    return config[prop as keyof PanguModelsConfig];
  }
});

export const modelArtsConfig = new Proxy({} as ModelArtsConfig, {
  get(target, prop) {
    const base = getHuaweiCloudConfig();
    const config = {
      ...base,
      endpoint: process.env.HUAWEI_MODELARTS_ENDPOINT || 'https://modelarts.ap-southeast-1.myhuaweicloud.com',
      obsEndpoint: process.env.HUAWEI_OBS_ENDPOINT || 'https://obs.ap-southeast-1.myhuaweicloud.com',
    };
    return config[prop as keyof ModelArtsConfig];
  }
});

export const gaussDBConfig = new Proxy({} as GaussDBConfig, {
  get(target, prop) {
    const base = getHuaweiCloudConfig();
    const config = {
      ...base,
      endpoint: process.env.HUAWEI_GAUSSDB_ENDPOINT || '',
      database: process.env.HUAWEI_GAUSSDB_DATABASE || 'fraud_guardian',
      username: process.env.HUAWEI_GAUSSDB_USERNAME || '',
      password: process.env.HUAWEI_GAUSSDB_PASSWORD || '',
    };
    return config[prop as keyof GaussDBConfig];
  }
});

export const functionGraphConfig = new Proxy({} as FunctionGraphConfig, {
  get(target, prop) {
    const base = getHuaweiCloudConfig();
    const config = {
      ...base,
      endpoint: process.env.HUAWEI_FUNCTIONGRAPH_ENDPOINT || 'https://functiongraph.ap-southeast-1.myhuaweicloud.com',
      functionUrn: process.env.HUAWEI_FUNCTION_URN || '',
    };
    return config[prop as keyof FunctionGraphConfig];
  }
});

/**
 * Validate that required configuration is present
 */
export function validateHuaweiConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!huaweiCloudConfig.accessKeyId) {
    errors.push('HUAWEI_CLOUD_ACCESS_KEY_ID is not set');
  }
  
  if (!huaweiCloudConfig.secretAccessKey) {
    errors.push('HUAWEI_CLOUD_SECRET_ACCESS_KEY is not set');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if Huawei services are enabled (for graceful degradation)
 */
export function isHuaweiServicesEnabled(): boolean {
  const config = getHuaweiCloudConfig();
  return !!(config.accessKeyId && config.secretAccessKey);
}

