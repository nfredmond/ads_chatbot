/**
 * Meta Ads (Facebook) API Client
 * Documentation: https://developers.facebook.com/docs/marketing-api/insights
 */

import { generateAppsecretProof } from './app-secret-proof'
import logger, { PlatformAPIError, logAPISuccess } from '../logging/logger'
import { withRateLimit } from '../rate-limiting/limiter'

const DEFAULT_GRAPH_VERSION = 'v21.0'

export interface MetaAdsConfig {
  accessToken: string
  accountId: string
  apiVersion?: string
  appSecret?: string // For App Secret Proof
}

interface MetaPagingResponse<T> {
  data: T[]
  paging?: {
    next?: string
  }
}

async function fetchAllPages<T>(initialUrl: string): Promise<T[]> {
  const results: T[] = []
  let nextUrl: string | undefined = initialUrl

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Check rate limit headers
    const rateLimiter = (await import('../rate-limiting/limiter')).default()
    rateLimiter.checkMetaRateLimit(Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new PlatformAPIError(
        'meta_ads',
        'fetchAllPages',
        new Error(error.error?.message || response.statusText),
        response.status,
        error.error?.code?.toString()
      )
    }

    const body = (await response.json()) as MetaPagingResponse<T>
    if (Array.isArray(body.data)) {
      results.push(...body.data)
    }

    nextUrl = body.paging?.next
  }

  return results
}

export async function fetchMetaAdsCampaigns(config: MetaAdsConfig) {
  const apiVersion = config.apiVersion ?? DEFAULT_GRAPH_VERSION
  const accountId = config.accountId.startsWith('act_') ? config.accountId : `act_${config.accountId}`

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const until = new Date().toISOString().split('T')[0]

  logger.info('Fetching Meta Ads campaigns', { accountId, dateRange: { since, until } })

  // Fetch campaign metadata (name, status, budget)
  const campaignsParams = new URLSearchParams({
    fields: 'id,name,status,daily_budget,objective',
    access_token: config.accessToken,
    limit: '100',
  })

  // Add App Secret Proof if available for enhanced security
  if (config.appSecret) {
    const appsecretProof = generateAppsecretProof(config.accessToken, config.appSecret)
    campaignsParams.set('appsecret_proof', appsecretProof)
  }

  const campaignsUrl = `https://graph.facebook.com/${apiVersion}/${accountId}/campaigns?${campaignsParams.toString()}`
  
  const campaignMetadata = await withRateLimit('meta_ads', async () => {
    return await fetchAllPages<{
      id: string
      name: string
      status: string
      daily_budget?: string
      objective?: string
    }>(campaignsUrl)
  })

  // Fetch insights at campaign level as recommended by Meta
  const insightsParams = new URLSearchParams({
    fields:
      'campaign_id,campaign_name,campaign_status,objective,impressions,clicks,spend,actions,action_values,date_start,date_stop',
    level: 'campaign',
    time_range: JSON.stringify({ since, until }),
    action_attribution_windows: JSON.stringify(['1d_click', '7d_click']),
    use_unified_attribution_setting: 'true',
    access_token: config.accessToken,
    limit: '100',
  })

  // Add App Secret Proof for enhanced security
  if (config.appSecret) {
    const appsecretProof = generateAppsecretProof(config.accessToken, config.appSecret)
    insightsParams.set('appsecret_proof', appsecretProof)
  }

  const insightsUrl = `https://graph.facebook.com/${apiVersion}/${accountId}/insights?${insightsParams.toString()}`
  
  const insightsData = await withRateLimit('meta_ads', async () => {
    return await fetchAllPages<{
      campaign_id: string
      campaign_name: string
      campaign_status: string
      objective?: string
      impressions?: string
      clicks?: string
      spend?: string
      actions?: Array<{ action_type: string; value: string }>
      action_values?: Array<{ action_type: string; value: string }>
      date_start?: string
      date_stop?: string
    }>(insightsUrl)
  })

  logAPISuccess('meta_ads', 'fetchCampaigns', {
    campaignCount: campaignMetadata.length,
    insightsCount: insightsData.length,
  })

  return { campaignMetadata, insightsData, dateRange: { since, until } }
}

export function transformMetaAdsData(apiData: {
  campaignMetadata: Array<{
    id: string
    name: string
    status: string
    daily_budget?: string
    objective?: string
  }>
  insightsData: Array<{
    campaign_id: string
    campaign_name: string
    campaign_status: string
    objective?: string
    impressions?: string
    clicks?: string
    spend?: string
    actions?: Array<{ action_type: string; value: string }>
    action_values?: Array<{ action_type: string; value: string }>
    date_start?: string
    date_stop?: string
  }>
  dateRange: { since: string; until: string }
}) {
  const campaigns: any[] = []
  const metrics: any[] = []

  const metadataById = new Map(
    apiData.campaignMetadata.map((campaign) => [campaign.id, campaign])
  )

  const seenCampaigns = new Set<string>()

  apiData.insightsData.forEach((insight) => {
    if (!seenCampaigns.has(insight.campaign_id)) {
      const meta = metadataById.get(insight.campaign_id)

      campaigns.push({
        campaign_id: insight.campaign_id,
        campaign_name: insight.campaign_name,
        platform: 'meta_ads',
        status: normalizeMetaStatus(insight.campaign_status || meta?.status || 'UNKNOWN'),
        budget_amount: meta?.daily_budget ? parseFloat(meta.daily_budget) / 100 : null,
        objective: insight.objective || meta?.objective || null,
      })

      seenCampaigns.add(insight.campaign_id)
    }

    const purchaseAction = insight.actions?.find(
      (action) => action.action_type === 'offsite_conversion.fb_pixel_purchase' || 
                 action.action_type === 'purchase'
    )
    const revenueAction = insight.action_values?.find(
      (action) => action.action_type === 'offsite_conversion.fb_pixel_purchase' ||
                 action.action_type === 'purchase'
    )

    metrics.push({
      campaign_api_id: insight.campaign_id,
      date: insight.date_stop || apiData.dateRange.until,
      impressions: insight.impressions ? parseInt(insight.impressions, 10) : 0,
      clicks: insight.clicks ? parseInt(insight.clicks, 10) : 0,
      conversions: purchaseAction ? parseFloat(purchaseAction.value) : 0,
      spend: insight.spend ? parseFloat(insight.spend) : 0,
      revenue: revenueAction ? parseFloat(revenueAction.value) : 0,
    })
  })

  return { campaigns, metrics }
}

function normalizeMetaStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'active',
    'PAUSED': 'paused',
    'DELETED': 'archived',
    'ARCHIVED': 'archived',
  }
  return statusMap[status] || status.toLowerCase()
}

