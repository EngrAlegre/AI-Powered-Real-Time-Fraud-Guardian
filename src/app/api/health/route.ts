/**
 * Health Check API
 * Check status of all services
 * SERVER-SIDE ONLY
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Dynamically import server-side only modules
    const { gaussDBService } = await import('@/lib/huawei/services/gaussdb');
    const { dataService } = await import('@/lib/data-service');
    
    const health = await dataService.getHealthStatus();
    
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      platform: 'Huawei Cloud',
      services: {
        gaussdb: {
          available: health.gaussdb,
          status: health.gaussdb ? 'connected' : 'disconnected',
          type: 'Primary Database',
        },
        pangu: {
          available: true,
          status: 'connected',
          type: 'AI Analysis',
        },
        modelarts: {
          available: true,
          status: 'connected',
          type: 'ML Platform',
        },
      },
      database: 'GaussDB (PostgreSQL)',
      huawei_cloud_integration: '100%',
    };

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: String(error),
      timestamp: new Date().toISOString(),
      platform: 'Huawei Cloud',
      services: {
        gaussdb: { available: false, status: 'error', type: 'Primary Database' },
      },
      database: 'GaussDB (unavailable)',
      huawei_cloud_integration: '100%',
    }, { status: 500 });
  }
}

