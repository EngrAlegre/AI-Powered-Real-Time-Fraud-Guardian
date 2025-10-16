# Huawei Cloud Integration Guide

## Overview

This fraud detection platform integrates multiple Huawei Cloud services to provide enterprise-grade AI-powered fraud detection with explainable reasoning.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  - Real-time Dashboard                                       │
│  - Explainable AI Visualization                             │
│  - Model Management Interface                               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├─────────────┐
                   │             │
         ┌─────────▼──────┐  ┌──▼─────────────┐
         │ Firebase Auth  │  │  Next.js API   │
         │  (Minimal)     │  │   Routes       │
         └────────────────┘  └─────┬──────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
          ┌─────────▼────────┐ ┌──▼─────────┐ ┌─▼──────────────┐
          │  Huawei Pangu    │ │  Huawei    │ │   Huawei       │
          │  Models Service  │ │ ModelArts  │ │   GaussDB      │
          │                  │ │            │ │  (Optional)    │
          │ - AI Reasoning   │ │ - Training │ │                │
          │ - Explainability │ │ - Deploy   │ │ - Analytics    │
          │ - Risk Scoring   │ │ - Monitor  │ │ - Storage      │
          └──────────────────┘ └────────────┘ └────────────────┘
```

## Integrated Services

### 1. Huawei Pangu Models

**Purpose**: Advanced AI reasoning for fraud detection with explainability

**Features**:
- Real-time transaction risk scoring
- Explainable AI decision paths
- Risk factor identification with evidence
- Alternative scenario analysis
- Confidence scoring

**Implementation**: `src/lib/huawei/services/pangu-models.ts`

**Usage**:
```typescript
import { panguModelsService } from '@/lib/huawei';

const result = await panguModelsService.analyzeFraudTransaction({
  transactionId: 'txn_123',
  amount: 1500,
  merchantType: 'online-gaming',
  location: 'Singapore',
  timestamp: new Date().toISOString(),
  userId: 'user_456',
  paymentMethod: 'credit-card',
});

// Returns: risk score, fraud probability, explanation, confidence
```

**Fallback Strategy**: If Pangu Models are not configured, the system automatically falls back to:
1. Rule-based risk scoring
2. Genkit AI with Google Gemini
3. Local analysis algorithms

### 2. Huawei ModelArts

**Purpose**: ML model training, deployment, and management

**Features**:
- Automated model training jobs
- Model deployment to inference services
- Training job monitoring and metrics
- Model version management
- Performance tracking (accuracy, precision, recall, F1)

**Implementation**: `src/lib/huawei/services/modelarts.ts`

**Usage**:
```typescript
import { modelArtsService } from '@/lib/huawei';

// Create training job
const job = await modelArtsService.createTrainingJob({
  jobName: 'fraud-model-training',
  modelName: 'fraud-detection-v2',
  trainingDataPath: 'obs://fraud-data/training/',
  outputPath: 'obs://fraud-models/output/',
});

// Deploy model
const deployment = await modelArtsService.deployModel({
  modelId: 'fraud-detection-v2',
  modelVersion: 'v1.0',
  serviceName: 'fraud-detection-service',
});
```

### 3. Huawei GaussDB (Optional)

**Purpose**: High-performance database for transaction storage and analytics

**Status**: Not yet implemented - currently using Firebase Firestore

**Planned Features**:
- Transaction history storage
- Real-time analytics queries
- Fraud alert management
- User behavior tracking
- Performance metrics storage

**Migration Path**: To implement GaussDB:
1. Create GaussDB instance in Huawei Cloud
2. Implement service client in `src/lib/huawei/services/gaussdb.ts`
3. Migrate Firestore data
4. Update collection hooks to use GaussDB

### 4. Huawei FunctionGraph (Optional)

**Purpose**: Serverless functions for transaction processing

**Status**: Not yet implemented - currently using Next.js API routes

**Planned Features**:
- Real-time transaction processing
- Alert triggering
- Background job processing
- Scheduled model retraining

## Configuration

### Step 1: Get Huawei Cloud Credentials

1. Go to [Huawei Cloud Console](https://console.huaweicloud.com)
2. Navigate to **My Credentials** > **Access Keys**
3. Create new access key (download and save securely)
4. Note your Project ID from project settings

### Step 2: Enable Required Services

1. **Pangu Models**:
   - Go to AI Gallery
   - Find "Pangu Fraud Detection" or similar model
   - Subscribe and note the model ID

2. **ModelArts**:
   - Go to ModelArts console
   - Enable the service
   - Create OBS bucket for data storage
   - Note the endpoint

3. **OBS (Object Storage)**:
   - Create bucket for training data
   - Upload sample fraud detection datasets
   - Note bucket name and region

### Step 3: Configure Environment Variables

Copy the template from `HUAWEI_ENV_TEMPLATE.txt` to your `.env.local`:

```bash
# Required - Core Credentials
HUAWEI_CLOUD_REGION=ap-southeast-1
HUAWEI_CLOUD_ACCESS_KEY_ID=your_key
HUAWEI_CLOUD_SECRET_ACCESS_KEY=your_secret
HUAWEI_CLOUD_PROJECT_ID=your_project_id

# Required - Pangu Models
HUAWEI_PANGU_ENDPOINT=https://pangu.ap-southeast-1.myhuaweicloud.com
HUAWEI_PANGU_MODEL_ID=fraud-detection-v1

# Required - ModelArts
HUAWEI_MODELARTS_ENDPOINT=https://modelarts.ap-southeast-1.myhuaweicloud.com
HUAWEI_OBS_ENDPOINT=https://obs.ap-southeast-1.myhuaweicloud.com
```

### Step 4: Verify Integration

Run the application and check the dashboard:

1. **Service Status Card** should show:
   - ✅ Pangu Models: Connected
   - ✅ ModelArts: Connected

2. **Explainable AI Card**:
   - Enter any transaction ID
   - Should return AI analysis from Pangu
   - Check for "Pangu Model Analysis" in results

3. **Model Management Page**:
   - Try creating a training job
   - Should return Huawei ModelArts job ID

## Graceful Degradation

The system is designed to work with or without Huawei services:

| Feature | With Huawei | Without Huawei |
|---------|-------------|----------------|
| Fraud Detection | Pangu AI + Rules | Genkit AI + Rules |
| Explainability | Advanced AI reasoning | Basic rule explanations |
| Model Training | ModelArts on CloudMatrix384 | Mock training IDs |
| Model Deployment | Real inference services | Mock endpoints |
| Performance | Production-grade | Development/demo |

**Checking Service Status**:
```typescript
import { isHuaweiServicesEnabled } from '@/lib/huawei';

if (isHuaweiServicesEnabled()) {
  // Use Huawei services
} else {
  // Use fallback
}
```

## API Reference

### Pangu Models Service

#### `analyzeFraudTransaction(input)`

Analyzes a transaction for fraud using Pangu AI.

**Input**:
```typescript
{
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
```

**Output**:
```typescript
{
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
  processingTime: number;
  modelVersion: string;
}
```

### ModelArts Service

#### `createTrainingJob(config)`

Creates a new model training job on ModelArts.

**Input**:
```typescript
{
  jobName: string;
  modelName: string;
  trainingDataPath: string; // OBS path
  outputPath: string;
  hyperparameters?: Record<string, any>;
  instanceType?: string;
  instanceCount?: number;
}
```

**Returns**: `{ jobId: string; status: string }`

#### `getTrainingJobStatus(jobId)`

Gets the status of a training job.

**Returns**:
```typescript
{
  jobId: string;
  jobName: string;
  status: 'creating' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  startTime: string;
  metrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
}
```

#### `deployModel(config)`

Deploys a trained model as an inference service.

**Input**:
```typescript
{
  modelId: string;
  modelVersion: string;
  serviceName: string;
  instanceType?: string;
  instanceCount?: number;
}
```

**Returns**: `{ serviceId: string; endpoint: string }`

## Competition Highlights

For the Huawei Developer Competition 2025 demo:

1. **Dashboard**: Shows all Huawei service badges prominently
2. **Service Status**: Live status of Pangu Models and ModelArts
3. **Explainable AI**: Demonstrates Pangu's advanced reasoning
4. **Model Management**: Shows ModelArts training and deployment
5. **Branding**: "Powered by Huawei Cloud" throughout UI

## Troubleshooting

### Pangu Models not connecting

1. Verify access keys are correct
2. Check region matches Pangu endpoint
3. Ensure Pangu model ID is valid
4. Check Huawei Cloud console for service status

### ModelArts training fails

1. Verify OBS bucket exists and is accessible
2. Check training data path format
3. Ensure sufficient cloud resources
4. Review ModelArts console logs

### Services showing as disconnected

1. Check environment variables are set
2. Restart Next.js dev server
3. Check network connectivity
4. Verify Huawei Cloud account status

## Performance Optimization

- **Caching**: Implement Redis for API response caching
- **Batch Processing**: Group multiple transactions for analysis
- **Async Processing**: Use FunctionGraph for background jobs
- **CDN**: Use Huawei Cloud CDN for static assets

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use IAM roles** in production environments
3. **Enable API Gateway** for rate limiting
4. **Encrypt sensitive data** using Huawei KMS
5. **Monitor API usage** through Huawei Cloud console

## Next Steps

1. ✅ Pangu Models integration - **DONE**
2. ✅ ModelArts integration - **DONE**
3. ⏳ GaussDB migration - **Planned**
4. ⏳ FunctionGraph implementation - **Planned**
5. ⏳ CloudMatrix384 optimization - **Planned**
6. ⏳ Production deployment - **Pending**

## Support

For Huawei Cloud support:
- Documentation: https://support.huaweicloud.com
- Console: https://console.huaweicloud.com
- Competition: https://competition.intl.huaweicloud.com

For application support:
- See `README.md` for general setup
- See `docs/blueprint.md` for architecture details

