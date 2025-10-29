/**
 * Manual Token Monitoring Trigger
 * Allows manual triggering of token expiration checks
 */

import { NextRequest, NextResponse } from 'next/server'
import { runTokenMonitoringNow } from '@/lib/cron/token-monitor'
import logger from '@/lib/logging/logger'

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check here for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info('Manual token monitoring triggered')
    await runTokenMonitoringNow()

    return NextResponse.json({
      success: true,
      message: 'Token monitoring completed successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    logger.error('Manual token monitoring failed', { error })
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

