/**
 * Application Initialization Endpoint
 * Can be called to manually initialize or check service status
 */

import { NextResponse } from 'next/server'
import { initializeApplication, getHealthStatus } from '@/lib/init/app-initialization'
import logger from '@/lib/logging/logger'

export async function GET() {
  try {
    logger.info('Application initialization endpoint called')
    
    const health = await getHealthStatus()
    
    return NextResponse.json({
      initialized: true,
      health,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    logger.error('Initialization endpoint error', { error })
    return NextResponse.json(
      {
        initialized: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    logger.info('Manual initialization requested')
    
    const result = await initializeApplication()
    
    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    logger.error('Manual initialization failed', { error })
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

