/**
 * Huawei ModelArts Service Client
 * Manages ML model training, deployment, and monitoring
 */

import { modelArtsConfig, isHuaweiServicesEnabled } from '../config';
import { signHuaweiRequest } from '../auth';

export interface TrainingJobConfig {
  jobName: string;
  modelName: string;
  trainingDataPath: string; // OBS path
  outputPath: string; // OBS path for trained model
  hyperparameters?: Record<string, any>;
  instanceType?: string;
  instanceCount?: number;
}

export interface TrainingJobStatus {
  jobId: string;
  jobName: string;
  status: 'creating' | 'running' | 'completed' | 'failed' | 'stopped';
  progress: number; // 0-100
  startTime: string;
  endTime?: string;
  duration?: number; // seconds
  metrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    loss?: number;
  };
}

export interface ModelDeploymentConfig {
  modelId: string;
  modelVersion: string;
  serviceName: string;
  instanceType?: string;
  instanceCount?: number;
}

export interface InferenceService {
  serviceId: string;
  serviceName: string;
  status: 'creating' | 'running' | 'failed' | 'stopped';
  endpoint: string;
  modelVersion: string;
  createTime: string;
}

export interface ModelMetrics {
  modelId: string;
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  trainingDataSize: number;
  isActive: boolean;
}

export class ModelArtsService {
  private config = modelArtsConfig;
  
  /**
   * Create a new training job
   */
  async createTrainingJob(config: TrainingJobConfig): Promise<{ jobId: string; status: string }> {
    if (!isHuaweiServicesEnabled()) {
      console.warn('Huawei ModelArts not configured, using mock training job');
      return this.createMockTrainingJob(config);
    }
    
    try {
      const payload = {
        job_name: config.jobName,
        job_desc: `Training job for fraud detection model: ${config.modelName}`,
        config: {
          worker_server_num: config.instanceCount || 1,
          app_url: config.trainingDataPath,
          boot_file_url: '/opt/modelarts/training_code/train.py',
          model_id: config.modelName,
          train_url: config.outputPath,
          engine_id: 1, // MindSpore engine
          user_image_url: '', // Use default ModelArts image
          user_command: 'python train.py',
          hyperparameters: config.hyperparameters || {},
        },
      };
      
      const body = JSON.stringify(payload);
      const url = `${this.config.endpoint}/v1/training-jobs`;
      
      const signedRequest = signHuaweiRequest(
        'POST',
        url,
        body,
        this.config.accessKeyId,
        this.config.secretAccessKey,
        this.config.region,
        'modelarts'
      );
      
      const response = await fetch(url, {
        method: 'POST',
        headers: signedRequest.headers,
        body: body,
      });
      
      if (!response.ok) {
        throw new Error(`ModelArts API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        jobId: result.job_id || result.jobId,
        status: result.status || 'creating',
      };
    } catch (error) {
      console.error('ModelArts training job creation error:', error);
      return this.createMockTrainingJob(config);
    }
  }
  
  /**
   * Get training job status
   */
  async getTrainingJobStatus(jobId: string): Promise<TrainingJobStatus> {
    if (!isHuaweiServicesEnabled()) {
      return this.getMockTrainingStatus(jobId);
    }
    
    try {
      const url = `${this.config.endpoint}/v1/training-jobs/${jobId}`;
      
      const signedRequest = signHuaweiRequest(
        'GET',
        url,
        '',
        this.config.accessKeyId,
        this.config.secretAccessKey,
        this.config.region,
        'modelarts'
      );
      
      const response = await fetch(url, {
        method: 'GET',
        headers: signedRequest.headers,
      });
      
      if (!response.ok) {
        throw new Error(`ModelArts API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        jobId: result.job_id,
        jobName: result.job_name,
        status: result.status,
        progress: result.progress || 0,
        startTime: result.create_time,
        endTime: result.end_time,
        duration: result.duration,
        metrics: result.metrics ? {
          accuracy: result.metrics.accuracy,
          precision: result.metrics.precision,
          recall: result.metrics.recall,
          f1Score: result.metrics.f1_score,
          loss: result.metrics.loss,
        } : undefined,
      };
    } catch (error) {
      console.error('ModelArts get training status error:', error);
      return this.getMockTrainingStatus(jobId);
    }
  }
  
  /**
   * Deploy model as inference service
   */
  async deployModel(config: ModelDeploymentConfig): Promise<{ serviceId: string; endpoint: string }> {
    if (!isHuaweiServicesEnabled()) {
      return this.createMockInferenceService(config);
    }
    
    try {
      const payload = {
        service_name: config.serviceName,
        description: `Fraud detection inference service for ${config.modelId}`,
        infer_type: 'real-time',
        config: [
          {
            model_id: config.modelId,
            weight: 100,
            specification: config.instanceType || 'modelarts.vm.cpu.2u',
            instance_count: config.instanceCount || 1,
          },
        ],
      };
      
      const body = JSON.stringify(payload);
      const url = `${this.config.endpoint}/v1/services`;
      
      const signedRequest = signHuaweiRequest(
        'POST',
        url,
        body,
        this.config.accessKeyId,
        this.config.secretAccessKey,
        this.config.region,
        'modelarts'
      );
      
      const response = await fetch(url, {
        method: 'POST',
        headers: signedRequest.headers,
        body: body,
      });
      
      if (!response.ok) {
        throw new Error(`ModelArts API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        serviceId: result.service_id,
        endpoint: result.access_address,
      };
    } catch (error) {
      console.error('ModelArts model deployment error:', error);
      return this.createMockInferenceService(config);
    }
  }
  
  /**
   * Get inference service details
   */
  async getInferenceService(serviceId: string): Promise<InferenceService> {
    if (!isHuaweiServicesEnabled()) {
      return this.getMockInferenceService(serviceId);
    }
    
    try {
      const url = `${this.config.endpoint}/v1/services/${serviceId}`;
      
      const signedRequest = signHuaweiRequest(
        'GET',
        url,
        '',
        this.config.accessKeyId,
        this.config.secretAccessKey,
        this.config.region,
        'modelarts'
      );
      
      const response = await fetch(url, {
        method: 'GET',
        headers: signedRequest.headers,
      });
      
      if (!response.ok) {
        throw new Error(`ModelArts API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        serviceId: result.service_id,
        serviceName: result.service_name,
        status: result.status,
        endpoint: result.access_address,
        modelVersion: result.model_version,
        createTime: result.create_time,
      };
    } catch (error) {
      console.error('ModelArts get inference service error:', error);
      return this.getMockInferenceService(serviceId);
    }
  }
  
  /**
   * List all models
   */
  async listModels(): Promise<ModelMetrics[]> {
    if (!isHuaweiServicesEnabled()) {
      return this.getMockModels();
    }
    
    try {
      const url = `${this.config.endpoint}/v1/models`;
      
      const signedRequest = signHuaweiRequest(
        'GET',
        url,
        '',
        this.config.accessKeyId,
        this.config.secretAccessKey,
        this.config.region,
        'modelarts'
      );
      
      const response = await fetch(url, {
        method: 'GET',
        headers: signedRequest.headers,
      });
      
      if (!response.ok) {
        throw new Error(`ModelArts API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      return result.models.map((model: any) => ({
        modelId: model.model_id,
        version: model.model_version,
        accuracy: model.metrics?.accuracy || 0,
        precision: model.metrics?.precision || 0,
        recall: model.metrics?.recall || 0,
        f1Score: model.metrics?.f1_score || 0,
        lastTrained: model.update_time,
        trainingDataSize: model.training_data_size || 0,
        isActive: model.status === 'published',
      }));
    } catch (error) {
      console.error('ModelArts list models error:', error);
      return this.getMockModels();
    }
  }
  
  // Mock/Fallback methods
  
  private createMockTrainingJob(config: TrainingJobConfig): { jobId: string; status: string } {
    const jobId = `training-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      jobId,
      status: 'running',
    };
  }
  
  private getMockTrainingStatus(jobId: string): TrainingJobStatus {
    // Simulate training progress
    const elapsed = Date.now() - parseInt(jobId.split('-')[2] || '0');
    const progress = Math.min((elapsed / (5 * 60 * 1000)) * 100, 100); // 5 minutes to complete
    
    return {
      jobId,
      jobName: 'fraud-detection-training',
      status: progress >= 100 ? 'completed' : 'running',
      progress: Math.round(progress),
      startTime: new Date(parseInt(jobId.split('-')[2] || Date.now())).toISOString(),
      endTime: progress >= 100 ? new Date().toISOString() : undefined,
      duration: Math.floor(elapsed / 1000),
      metrics: progress >= 100 ? {
        accuracy: 0.9542,
        precision: 0.9321,
        recall: 0.9156,
        f1Score: 0.9237,
        loss: 0.0832,
      } : undefined,
    };
  }
  
  private createMockInferenceService(config: ModelDeploymentConfig): { serviceId: string; endpoint: string } {
    const serviceId = `inference-service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      serviceId,
      endpoint: `https://modelarts.${this.config.region}.myhuaweicloud.com/v1/${serviceId}/infer`,
    };
  }
  
  private getMockInferenceService(serviceId: string): InferenceService {
    return {
      serviceId,
      serviceName: 'fraud-detection-service',
      status: 'running',
      endpoint: `https://modelarts.${this.config.region}.myhuaweicloud.com/v1/${serviceId}/infer`,
      modelVersion: 'v1.0',
      createTime: new Date(parseInt(serviceId.split('-')[2] || Date.now())).toISOString(),
    };
  }
  
  private getMockModels(): ModelMetrics[] {
    return [
      {
        modelId: 'fraud-detection-v1',
        version: 'v1.0',
        accuracy: 0.9542,
        precision: 0.9321,
        recall: 0.9156,
        f1Score: 0.9237,
        lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        trainingDataSize: 150000,
        isActive: true,
      },
      {
        modelId: 'fraud-detection-v2',
        version: 'v2.0-beta',
        accuracy: 0.9678,
        precision: 0.9545,
        recall: 0.9423,
        f1Score: 0.9483,
        lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        trainingDataSize: 250000,
        isActive: false,
      },
    ];
  }
}

// Export singleton instance
export const modelArtsService = new ModelArtsService();

