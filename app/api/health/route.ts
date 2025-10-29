/**
 * Health Check Endpoint
 * Returns system status and service health
 */

import { NextResponse } from 'next/server'
import { getHealthStatus } from '@/lib/init/app-initialization'

export async function GET() {
  try {
    const health = await getHealthStatus()
    
    const statusCode = health.status === 'healthy' ? 200 : 503
    
    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}

