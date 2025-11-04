/**
 * Cross-Platform Metrics Aggregator
 * Normalizes and combines data from all advertising platforms
 */

import logger from '../logging/logger'
import {
  getCached,
  setCached,
  CACHE_TTL,
  generateCacheKey,
} from '../cache/redis-client'
import { createServiceRoleClient } from '../supabase/service-role'

export interface NormalizedMetric {
  platform: 'google_ads' | 'meta_ads' | 'linkedin_ads' | 'all'
  campaignId: string
  campaignName: string
  status: 'active' | 'paused' | 'archived' | 'unknown'
  impressions: number
  clicks: number
  spend: number
  conversions: number
  revenue: number
  ctr: number
  cpc: number
  cpm: number
  roas: number
  conversionRate: number
  costPerConversion: number
}

interface DateRange {
  start: string
  end: string
}

interface AggregateTotals {
  impressions: number
  clicks: number
  spend: number
  conversions: number
  revenue: number
}

export class CrossPlatformMetricsAggregator {
  async fetchAllPlatformMetrics(
    userId: string,
    dateRange: DateRange
  ): Promise<NormalizedMetric[]> {
    logger.info('Fetching cross-platform metrics', { userId, dateRange })

    try {
      const supabase = createServiceRoleClient()

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', userId)
        .single()

      if (profileError) {
        logger.error('Failed to resolve tenant for user', {
          userId,
          error: profileError,
        })
        return []
      }

      if (!profile?.tenant_id) {
        logger.warn('No tenant associated with user, skipping metrics fetch', {
          userId,
        })
        return []
      }

      const tenantId = profile.tenant_id
      const cacheKey = generateCacheKey(
        'aggregated',
        'metrics',
        tenantId,
        dateRange.start,
        dateRange.end
      )

      const cached = await getCached<NormalizedMetric[]>(cacheKey)
      if (cached) {
        logger.info('Returning cached cross-platform metrics')
        return cached
      }

      const normalizedMetrics = await this.loadTenantMetrics(
        supabase,
        tenantId,
        dateRange
      )

      await setCached(cacheKey, normalizedMetrics, CACHE_TTL.METRICS)

      logger.info('Cross-platform metrics fetched successfully', {
        tenantId,
        campaignCount: normalizedMetrics.length,
      })

      return normalizedMetrics
    } catch (error) {
      logger.error('Failed to fetch cross-platform metrics', { error })
      return []
    }
  }

  private async loadTenantMetrics(
    supabase: ReturnType<typeof createServiceRoleClient>,
    tenantId: string,
    dateRange: DateRange
  ): Promise<NormalizedMetric[]> {
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id,campaign_id,campaign_name,platform,status')
      .eq('tenant_id', tenantId)

    if (campaignsError) {
      logger.error('Failed to fetch campaigns for tenant', {
        tenantId,
        error: campaignsError,
      })
      return []
    }

    const { data: metrics, error: metricsError } = await supabase
      .from('campaign_metrics')
      .select('campaign_id,impressions,clicks,spend,conversions,revenue,date')
      .eq('tenant_id', tenantId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)

    if (metricsError) {
      logger.error('Failed to fetch campaign metrics', {
        tenantId,
        error: metricsError,
      })
      return []
    }

    const totalsByCampaign = new Map<string, AggregateTotals>()

    for (const metric of metrics || []) {
      if (!metric?.campaign_id) continue

      if (!totalsByCampaign.has(metric.campaign_id)) {
        totalsByCampaign.set(metric.campaign_id, {
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0,
          revenue: 0,
        })
      }

      const totals = totalsByCampaign.get(metric.campaign_id)!
      totals.impressions += Number(metric.impressions || 0)
      totals.clicks += Number(metric.clicks || 0)
      totals.spend += Number(metric.spend || 0)
      totals.conversions += Number(metric.conversions || 0)
      totals.revenue += Number(metric.revenue || 0)
    }

    const normalized: NormalizedMetric[] = []

    for (const campaign of campaigns || []) {
      if (!['google_ads', 'meta_ads', 'linkedin_ads'].includes(campaign.platform)) {
        continue
      }

      const totals = totalsByCampaign.get(campaign.id) || {
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        revenue: 0,
      }

      const normalizedMetric: NormalizedMetric = {
        platform: campaign.platform,
        campaignId: campaign.campaign_id,
        campaignName: campaign.campaign_name,
        status: this.normalizeStatus(campaign.platform, campaign.status),
        impressions: totals.impressions,
        clicks: totals.clicks,
        spend: totals.spend,
        conversions: totals.conversions,
        revenue: totals.revenue,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        roas: 0,
        conversionRate: 0,
        costPerConversion: 0,
      }

      this.applyDerivedMetrics(normalizedMetric)
      normalized.push(normalizedMetric)
    }

    return normalized
  }

  private normalizeStatus(
    platform: string,
    status: string
  ): 'active' | 'paused' | 'archived' | 'unknown' {
    const normalized = String(status || '').toUpperCase()

    const statusMap: Record<string, Record<string, 'active' | 'paused' | 'archived'>> = {
      google_ads: {
        ENABLED: 'active',
        PAUSED: 'paused',
        REMOVED: 'archived',
      },
      meta_ads: {
        ACTIVE: 'active',
        PAUSED: 'paused',
        DELETED: 'archived',
        ARCHIVED: 'archived',
      },
      linkedin_ads: {
        ACTIVE: 'active',
        PAUSED: 'paused',
        ARCHIVED: 'archived',
        DRAFT: 'paused',
      },
    }

    return statusMap[platform]?.[normalized] || 'unknown'
  }

  private applyDerivedMetrics(metric: NormalizedMetric) {
    metric.ctr = metric.impressions > 0 ? (metric.clicks / metric.impressions) * 100 : 0
    metric.cpc = metric.clicks > 0 ? metric.spend / metric.clicks : 0
    metric.cpm = metric.impressions > 0 ? (metric.spend / metric.impressions) * 1000 : 0
    metric.roas = metric.spend > 0 ? metric.revenue / metric.spend : 0
    metric.conversionRate = metric.clicks > 0 ? (metric.conversions / metric.clicks) * 100 : 0
    metric.costPerConversion = metric.conversions > 0 ? metric.spend / metric.conversions : 0
  }

  aggregateByPlatform(metrics: NormalizedMetric[]): Record<string, NormalizedMetric> {
    const aggregated: Record<string, NormalizedMetric> = {}

    metrics.forEach((metric) => {
      if (!aggregated[metric.platform]) {
        aggregated[metric.platform] = {
          platform: metric.platform,
          campaignId: 'aggregated',
          campaignName: `${metric.platform} Total`,
          status: 'active',
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0,
          revenue: 0,
          ctr: 0,
          cpc: 0,
          cpm: 0,
          roas: 0,
          conversionRate: 0,
          costPerConversion: 0,
        }
      }

      const totals = aggregated[metric.platform]
      totals.impressions += metric.impressions
      totals.clicks += metric.clicks
      totals.spend += metric.spend
      totals.conversions += metric.conversions
      totals.revenue += metric.revenue
    })

    Object.values(aggregated).forEach((metric) => this.applyDerivedMetrics(metric))

    return aggregated
  }

  getTotalMetrics(metrics: NormalizedMetric[]): NormalizedMetric {
    const total: NormalizedMetric = {
      platform: 'all',
      campaignId: 'total',
      campaignName: 'Total (All Platforms)',
      status: 'active',
      impressions: 0,
      clicks: 0,
      spend: 0,
      conversions: 0,
      revenue: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
      roas: 0,
      conversionRate: 0,
      costPerConversion: 0,
    }

    metrics.forEach((metric) => {
      total.impressions += metric.impressions
      total.clicks += metric.clicks
      total.spend += metric.spend
      total.conversions += metric.conversions
      total.revenue += metric.revenue
    })

    this.applyDerivedMetrics(total)

    return total
  }
}

let aggregatorInstance: CrossPlatformMetricsAggregator | null = null

export function getMetricsAggregator(): CrossPlatformMetricsAggregator {
  if (!aggregatorInstance) {
    aggregatorInstance = new CrossPlatformMetricsAggregator()
  }
  return aggregatorInstance
}

export default getMetricsAggregator

