/**
 * Aggregated Cross-Platform Analytics Endpoint
 * Returns normalized metrics from all advertising platforms
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMetricsAggregator } from '@/lib/analytics/cross-platform-aggregator'
import logger from '@/lib/logging/logger'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date range from query params
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    const aggregateBy = searchParams.get('aggregateBy') // 'platform' or 'total'

    logger.info('Fetching aggregated analytics', {
      userId: user.id,
      startDate,
      endDate,
      aggregateBy,
    })

    const aggregator = getMetricsAggregator()

    const metrics = await aggregator.fetchAllPlatformMetrics(user.id, {
      start: startDate,
      end: endDate,
    })

    if (aggregateBy === 'platform') {
      const byPlatform = aggregator.aggregateByPlatform(metrics)

      return NextResponse.json({
        aggregated: Object.values(byPlatform),
      })
    }

    if (aggregateBy === 'total') {
      const total = aggregator.getTotalMetrics(metrics)
      return NextResponse.json({ total })
    }

    return NextResponse.json({ campaigns: metrics })
  } catch (error: any) {
    logger.error('Analytics aggregation error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    )
  }
}

