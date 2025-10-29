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

    // For now, fetch from database (would be replaced with aggregator when fully integrated)
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    // Fetch campaigns and metrics from database
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select(`
        *,
        campaign_metrics(*)
      `)
      .eq('tenant_id', profile.tenant_id)

    if (!campaigns) {
      return NextResponse.json({ campaigns: [], metrics: [] })
    }

    // Transform to aggregated format
    const aggregatedData = campaigns.map((campaign: any) => {
      const metrics = campaign.campaign_metrics || []
      const totalMetrics = metrics.reduce(
        (acc: any, m: any) => ({
          impressions: (acc.impressions || 0) + (m.impressions || 0),
          clicks: (acc.clicks || 0) + (m.clicks || 0),
          spend: (acc.spend || 0) + (m.spend || 0),
          conversions: (acc.conversions || 0) + (m.conversions || 0),
          revenue: (acc.revenue || 0) + (m.revenue || 0),
        }),
        {}
      )

      return {
        platform: campaign.platform,
        campaignId: campaign.campaign_id,
        campaignName: campaign.campaign_name,
        status: campaign.status,
        ...totalMetrics,
        ctr: totalMetrics.impressions > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0,
        cpc: totalMetrics.clicks > 0 ? totalMetrics.spend / totalMetrics.clicks : 0,
        cpm: totalMetrics.impressions > 0 ? (totalMetrics.spend / totalMetrics.impressions) * 1000 : 0,
        roas: totalMetrics.spend > 0 ? totalMetrics.revenue / totalMetrics.spend : 0,
      }
    })

    // Aggregate by platform if requested
    if (aggregateBy === 'platform') {
      const byPlatform = aggregatedData.reduce((acc: any, campaign: any) => {
        if (!acc[campaign.platform]) {
          acc[campaign.platform] = {
            platform: campaign.platform,
            impressions: 0,
            clicks: 0,
            spend: 0,
            conversions: 0,
            revenue: 0,
          }
        }

        acc[campaign.platform].impressions += campaign.impressions || 0
        acc[campaign.platform].clicks += campaign.clicks || 0
        acc[campaign.platform].spend += campaign.spend || 0
        acc[campaign.platform].conversions += campaign.conversions || 0
        acc[campaign.platform].revenue += campaign.revenue || 0

        return acc
      }, {})

      // Calculate derived metrics for each platform
      Object.values(byPlatform).forEach((platform: any) => {
        platform.ctr = platform.impressions > 0 ? (platform.clicks / platform.impressions) * 100 : 0
        platform.cpc = platform.clicks > 0 ? platform.spend / platform.clicks : 0
        platform.cpm = platform.impressions > 0 ? (platform.spend / platform.impressions) * 1000 : 0
        platform.roas = platform.spend > 0 ? platform.revenue / platform.spend : 0
      })

      return NextResponse.json({ aggregated: Object.values(byPlatform) })
    }

    // Return all campaigns
    return NextResponse.json({ campaigns: aggregatedData })
  } catch (error: any) {
    logger.error('Analytics aggregation error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    )
  }
}

