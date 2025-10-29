/**
 * Cross-Platform Metrics Aggregator
 * Normalizes and combines data from all advertising platforms
 */

import logger from '../logging/logger'
import { getCached, setCached, CACHE_TTL, generateCacheKey } from '../cache/redis-client'

interface PlatformMetric {
  id: string
  name: string
  platform: 'google_ads' | 'meta_ads' | 'linkedin_ads'
  status: string
  impressions?: number | string
  clicks?: number | string
  spend?: number | string
  cost_micros?: number | string
  costInLocalCurrency?: number | string
  conversions?: number | string
  actions?: Array<{ action_type: string; value: string }>
  conversions_value?: number | string
  action_values?: Array<{ action_type: string; value: string }>
  conversionValueInLocalCurrency?: number | string
}

interface NormalizedMetric {
  platform: 'google_ads' | 'meta_ads' | 'linkedin_ads'
  campaignId: string
  campaignName: string
  status: 'active' | 'paused' | 'archived' | 'unknown'
  impressions: number
  clicks: number
  spend: number
  conversions: number
  revenue: number
  ctr: number // Click-through rate (%)
  cpc: number // Cost per click ($)
  cpm: number // Cost per mille/thousand impressions ($)
  roas: number // Return on ad spend (ratio)
  conversionRate: number // Conversion rate (%)
  costPerConversion: number // Cost per conversion ($)
}

interface DateRange {
  start: string
  end: string
}

export class CrossPlatformMetricsAggregator {
  /**
   * Fetch and normalize metrics from all platforms
   */
  async fetchAllPlatformMetrics(
    userId: string,
    dateRange: DateRange
  ): Promise<NormalizedMetric[]> {
    logger.info('Fetching cross-platform metrics', { userId, dateRange })

    try {
      // Check cache first
      const cacheKey = generateCacheKey('aggregated', 'metrics', userId, dateRange.start, dateRange.end)
      const cached = await getCached<NormalizedMetric[]>(cacheKey)
      
      if (cached) {
        logger.info('Returning cached cross-platform metrics')
        return cached
      }

      // Fetch from all platforms in parallel
      const [googleMetrics, metaMetrics, linkedinMetrics] = await Promise.allSettled([
        this.fetchGoogleMetrics(userId, dateRange),
        this.fetchMetaMetrics(userId, dateRange),
        this.fetchLinkedInMetrics(userId, dateRange),
      ])

      const allMetrics: PlatformMetric[] = []

      // Collect successful results
      if (googleMetrics.status === 'fulfilled') {
        allMetrics.push(...googleMetrics.value.map(m => ({ ...m, platform: 'google_ads' as const })))
      } else {
        logger.error('Google Ads metrics fetch failed', { error: googleMetrics.reason })
      }

      if (metaMetrics.status === 'fulfilled') {
        allMetrics.push(...metaMetrics.value.map(m => ({ ...m, platform: 'meta_ads' as const })))
      } else {
        logger.error('Meta Ads metrics fetch failed', { error: metaMetrics.reason })
      }

      if (linkedinMetrics.status === 'fulfilled') {
        allMetrics.push(...linkedinMetrics.value.map(m => ({ ...m, platform: 'linkedin_ads' as const })))
      } else {
        logger.error('LinkedIn Ads metrics fetch failed', { error: linkedinMetrics.reason })
      }

      // Normalize and combine
      const normalized = this.normalizeAndCombine(allMetrics)

      // Cache the results
      await setCached(cacheKey, normalized, CACHE_TTL.METRICS)

      logger.info('Cross-platform metrics fetched successfully', {
        totalCampaigns: normalized.length,
      })

      return normalized
    } catch (error) {
      logger.error('Failed to fetch cross-platform metrics', { error })
      throw error
    }
  }

  /**
   * Fetch Google Ads metrics
   */
  private async fetchGoogleMetrics(userId: string, dateRange: DateRange): Promise<PlatformMetric[]> {
    // This would integrate with the actual Google Ads client
    // For now, it's a placeholder that would call the API
    const { fetchGoogleAdsCampaigns } = await import('@/lib/google-ads/client')
    // Implementation would go here
    return []
  }

  /**
   * Fetch Meta Ads metrics
   */
  private async fetchMetaMetrics(userId: string, dateRange: DateRange): Promise<PlatformMetric[]> {
    // This would integrate with the actual Meta Ads client
    const { fetchMetaAdsCampaigns } = await import('@/lib/meta-ads/client')
    // Implementation would go here
    return []
  }

  /**
   * Fetch LinkedIn Ads metrics
   */
  private async fetchLinkedInMetrics(userId: string, dateRange: DateRange): Promise<PlatformMetric[]> {
    // This would integrate with the actual LinkedIn Ads client
    const { fetchLinkedInAdsCampaigns } = await import('@/lib/linkedin-ads/client')
    // Implementation would go here
    return []
  }

  /**
   * Normalize and combine metrics from all platforms
   */
  private normalizeAndCombine(rawMetrics: PlatformMetric[]): NormalizedMetric[] {
    return rawMetrics.map(metric => {
      const normalized: NormalizedMetric = {
        platform: metric.platform,
        campaignId: metric.id,
        campaignName: metric.name,
        status: this.normalizeStatus(metric.platform, metric.status),
        impressions: parseInt(String(metric.impressions || 0)),
        clicks: parseInt(String(metric.clicks || 0)),
        spend: this.normalizeCost(metric.platform, metric),
        conversions: this.normalizeConversions(metric.platform, metric),
        revenue: this.normalizeRevenue(metric.platform, metric),
        ctr: 0,
        cpc: 0,
        cpm: 0,
        roas: 0,
        conversionRate: 0,
        costPerConversion: 0,
      }

      // Calculate derived metrics
      normalized.ctr = this.calculateCTR(normalized)
      normalized.cpc = this.calculateCPC(normalized)
      normalized.cpm = this.calculateCPM(normalized)
      normalized.roas = this.calculateROAS(normalized)
      normalized.conversionRate = this.calculateConversionRate(normalized)
      normalized.costPerConversion = this.calculateCostPerConversion(normalized)

      return normalized
    })
  }

  /**
   * Normalize status across platforms
   */
  private normalizeStatus(
    platform: string,
    status: string
  ): 'active' | 'paused' | 'archived' | 'unknown' {
    const statusMap: Record<string, Record<string, 'active' | 'paused' | 'archived'>> = {
      google_ads: {
        'ENABLED': 'active',
        'enabled': 'active',
        'PAUSED': 'paused',
        'paused': 'paused',
        'REMOVED': 'archived',
        'removed': 'archived',
      },
      meta_ads: {
        'ACTIVE': 'active',
        'active': 'active',
        'PAUSED': 'paused',
        'paused': 'paused',
        'DELETED': 'archived',
        'deleted': 'archived',
        'ARCHIVED': 'archived',
        'archived': 'archived',
      },
      linkedin_ads: {
        'ACTIVE': 'active',
        'active': 'active',
        'PAUSED': 'paused',
        'paused': 'paused',
        'ARCHIVED': 'archived',
        'archived': 'archived',
        'DRAFT': 'paused',
        'draft': 'paused',
      },
    }

    return statusMap[platform]?.[status] || 'unknown'
  }

  /**
   * Normalize cost across platforms
   */
  private normalizeCost(platform: string, metric: PlatformMetric): number {
    switch (platform) {
      case 'google_ads':
        // Google uses micros (divide by 1,000,000)
        return Number(metric.cost_micros || 0) / 1_000_000
      case 'meta_ads':
        // Meta uses dollars
        return parseFloat(String(metric.spend || 0))
      case 'linkedin_ads':
        // LinkedIn uses local currency
        return parseFloat(String(metric.costInLocalCurrency || 0))
      default:
        return 0
    }
  }

  /**
   * Normalize conversions across platforms
   */
  private normalizeConversions(platform: string, metric: PlatformMetric): number {
    switch (platform) {
      case 'google_ads':
        return Number(metric.conversions || 0)
      case 'meta_ads':
        // Meta tracks conversions in actions array
        const purchaseAction = metric.actions?.find(
          a => a.action_type === 'offsite_conversion.fb_pixel_purchase' || a.action_type === 'purchase'
        )
        return parseFloat(purchaseAction?.value || '0')
      case 'linkedin_ads':
        return parseFloat(String(metric.conversions || 0))
      default:
        return 0
    }
  }

  /**
   * Normalize revenue across platforms
   */
  private normalizeRevenue(platform: string, metric: PlatformMetric): number {
    switch (platform) {
      case 'google_ads':
        return Number(metric.conversions_value || 0)
      case 'meta_ads':
        const revenueAction = metric.action_values?.find(
          a => a.action_type === 'offsite_conversion.fb_pixel_purchase' || a.action_type === 'purchase'
        )
        return parseFloat(revenueAction?.value || '0')
      case 'linkedin_ads':
        return parseFloat(String(metric.conversionValueInLocalCurrency || 0))
      default:
        return 0
    }
  }

  /**
   * Calculate Click-Through Rate (CTR)
   */
  private calculateCTR(metric: NormalizedMetric): number {
    if (metric.impressions === 0) return 0
    return (metric.clicks / metric.impressions) * 100
  }

  /**
   * Calculate Cost Per Click (CPC)
   */
  private calculateCPC(metric: NormalizedMetric): number {
    if (metric.clicks === 0) return 0
    return metric.spend / metric.clicks
  }

  /**
   * Calculate Cost Per Mille (CPM)
   */
  private calculateCPM(metric: NormalizedMetric): number {
    if (metric.impressions === 0) return 0
    return (metric.spend / metric.impressions) * 1000
  }

  /**
   * Calculate Return On Ad Spend (ROAS)
   */
  private calculateROAS(metric: NormalizedMetric): number {
    if (metric.spend === 0) return 0
    return metric.revenue / metric.spend
  }

  /**
   * Calculate Conversion Rate
   */
  private calculateConversionRate(metric: NormalizedMetric): number {
    if (metric.clicks === 0) return 0
    return (metric.conversions / metric.clicks) * 100
  }

  /**
   * Calculate Cost Per Conversion
   */
  private calculateCostPerConversion(metric: NormalizedMetric): number {
    if (metric.conversions === 0) return 0
    return metric.spend / metric.conversions
  }

  /**
   * Aggregate metrics by platform
   */
  aggregateByPlatform(metrics: NormalizedMetric[]): Record<string, NormalizedMetric> {
    const aggregated: Record<string, any> = {}

    metrics.forEach(metric => {
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

      aggregated[metric.platform].impressions += metric.impressions
      aggregated[metric.platform].clicks += metric.clicks
      aggregated[metric.platform].spend += metric.spend
      aggregated[metric.platform].conversions += metric.conversions
      aggregated[metric.platform].revenue += metric.revenue
    })

    // Recalculate derived metrics for aggregated data
    Object.keys(aggregated).forEach(platform => {
      const agg = aggregated[platform]
      agg.ctr = this.calculateCTR(agg)
      agg.cpc = this.calculateCPC(agg)
      agg.cpm = this.calculateCPM(agg)
      agg.roas = this.calculateROAS(agg)
      agg.conversionRate = this.calculateConversionRate(agg)
      agg.costPerConversion = this.calculateCostPerConversion(agg)
    })

    return aggregated
  }

  /**
   * Get total aggregated metrics across all platforms
   */
  getTotalMetrics(metrics: NormalizedMetric[]): NormalizedMetric {
    const total: any = {
      platform: 'all',
      campaignId: 'total',
      campaignName: 'Total (All Platforms)',
      status: 'active',
      impressions: 0,
      clicks: 0,
      spend: 0,
      conversions: 0,
      revenue: 0,
    }

    metrics.forEach(metric => {
      total.impressions += metric.impressions
      total.clicks += metric.clicks
      total.spend += metric.spend
      total.conversions += metric.conversions
      total.revenue += metric.revenue
    })

    // Calculate derived metrics
    total.ctr = this.calculateCTR(total)
    total.cpc = this.calculateCPC(total)
    total.cpm = this.calculateCPM(total)
    total.roas = this.calculateROAS(total)
    total.conversionRate = this.calculateConversionRate(total)
    total.costPerConversion = this.calculateCostPerConversion(total)

    return total as NormalizedMetric
  }
}

// Singleton instance
let aggregatorInstance: CrossPlatformMetricsAggregator | null = null

/**
 * Get aggregator singleton
 */
export function getMetricsAggregator(): CrossPlatformMetricsAggregator {
  if (!aggregatorInstance) {
    aggregatorInstance = new CrossPlatformMetricsAggregator()
  }
  return aggregatorInstance
}

export default getMetricsAggregator

