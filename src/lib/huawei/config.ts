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

// Load configuration from environment variables
export const huaweiCloudConfig: HuaweiCloudConfig = {
  region: process.env.HUAWEI_CLOUD_REGION || 'ap-southeast-1',
  accessKeyId: process.env.HUAWEI_CLOUD_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.HUAWEI_CLOUD_SECRET_ACCESS_KEY || '',
  projectId: process.env.HUAWEI_CLOUD_PROJECT_ID || '',
};

export const panguModelsConfig: PanguModelsConfig = {
  ...huaweiCloudConfig,
  endpoint: process.env.HUAWEI_PANGU_ENDPOINT || 'https://pangu.ap-southeast-1.myhuaweicloud.com',
  modelId: process.env.HUAWEI_PANGU_MODEL_ID || 'fraud-detection-v1',
};

export const modelArtsConfig: ModelArtsConfig = {
  ...huaweiCloudConfig,
  endpoint: process.env.HUAWEI_MODELARTS_ENDPOINT || 'https://modelarts.ap-southeast-1.myhuaweicloud.com',
  obsEndpoint: process.env.HUAWEI_OBS_ENDPOINT || 'https://obs.ap-southeast-1.myhuaweicloud.com',
};

export const gaussDBConfig: GaussDBConfig = {
  ...huaweiCloudConfig,
  endpoint: process.env.HUAWEI_GAUSSDB_ENDPOINT || 'https://gaussdb.ap-southeast-1.myhuaweicloud.com',
  database: process.env.HUAWEI_GAUSSDB_DATABASE || 'fraud_guardian',
  username: process.env.HUAWEI_GAUSSDB_USERNAME || '',
  password: process.env.HUAWEI_GAUSSDB_PASSWORD || '',
};

export const functionGraphConfig: FunctionGraphConfig = {
  ...huaweiCloudConfig,
  endpoint: process.env.HUAWEI_FUNCTIONGRAPH_ENDPOINT || 'https://functiongraph.ap-southeast-1.myhuaweicloud.com',
  functionUrn: process.env.HUAWEI_FUNCTION_URN || '',
};

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
  return !!(huaweiCloudConfig.accessKeyId && huaweiCloudConfig.secretAccessKey);
}

