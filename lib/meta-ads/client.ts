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
    try {
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
        const errorText = await response.text()
        let error: any = {}
        try {
          error = JSON.parse(errorText)
        } catch {
          error = { error: { message: errorText || response.statusText } }
        }

        // Handle specific Meta API errors
        const errorCode = error.error?.code
        const errorMessage = error.error?.message || response.statusText

        // Token expiration or invalid token
        if (errorCode === 190 || response.status === 401) {
          throw new PlatformAPIError(
            'meta_ads',
            'fetchAllPages',
            new Error('Access token expired or invalid. Please reconnect your Meta Ads account.'),
            response.status,
            errorCode?.toString()
          )
        }

        // Rate limit errors
        if ([4, 17, 32, 613].includes(errorCode)) {
          throw new PlatformAPIError(
            'meta_ads',
            'fetchAllPages',
            new Error(`Rate limit exceeded: ${errorMessage}`),
            response.status,
            errorCode?.toString()
          )
        }

        throw new PlatformAPIError(
          'meta_ads',
          'fetchAllPages',
          new Error(errorMessage),
          response.status,
          errorCode?.toString()
        )
      }

      const body = (await response.json()) as MetaPagingResponse<T>
      if (Array.isArray(body.data)) {
        results.push(...body.data)
      }

      nextUrl = body.paging?.next
    } catch (error: any) {
      // Re-throw PlatformAPIError as-is
      if (error instanceof PlatformAPIError) {
        throw error
      }
      // Wrap other errors
      throw new PlatformAPIError(
        'meta_ads',
        'fetchAllPages',
        error,
        undefined,
        undefined
      )
    }
  }

  return results
}

export async function fetchMetaAdsCampaigns(config: MetaAdsConfig) {
  const apiVersion = config.apiVersion ?? DEFAULT_GRAPH_VERSION
  
  // Ensure account ID has act_ prefix
  let accountId = config.accountId
  if (!accountId.startsWith('act_')) {
    // Remove any existing act_ prefix and add it
    accountId = accountId.replace(/^act_/, '')
    accountId = `act_${accountId}`
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const until = new Date().toISOString().split('T')[0]

  logger.info('Fetching Meta Ads campaigns', { accountId, dateRange: { since, until } })

  // Validate required configuration
  if (!config.accessToken) {
    throw new Error('Meta Ads access token is required')
  }
  if (!accountId) {
    throw new Error('Meta Ads account ID is required')
  }

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

// ============================================
// AD SETS (Meta's equivalent of Ad Groups)
// ============================================

export async function fetchMetaAdsAdSets(config: MetaAdsConfig) {
  const apiVersion = config.apiVersion ?? DEFAULT_GRAPH_VERSION
  
  let accountId = config.accountId
  if (!accountId.startsWith('act_')) {
    accountId = accountId.replace(/^act_/, '')
    accountId = `act_${accountId}`
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const until = new Date().toISOString().split('T')[0]

  logger.info('Fetching Meta Ads ad sets', { accountId })

  // Fetch ad set metadata
  const adSetsParams = new URLSearchParams({
    fields: 'id,name,status,daily_budget,campaign_id,targeting,optimization_goal,bid_strategy',
    access_token: config.accessToken,
    limit: '500',
  })

  if (config.appSecret) {
    const appsecretProof = generateAppsecretProof(config.accessToken, config.appSecret)
    adSetsParams.set('appsecret_proof', appsecretProof)
  }

  const adSetsUrl = `https://graph.facebook.com/${apiVersion}/${accountId}/adsets?${adSetsParams.toString()}`
  
  const adSetMetadata = await withRateLimit('meta_ads', async () => {
    return await fetchAllPages<{
      id: string
      name: string
      status: string
      daily_budget?: string
      campaign_id: string
      targeting?: any
      optimization_goal?: string
      bid_strategy?: string
    }>(adSetsUrl)
  })

  // Fetch ad set level insights
  const insightsParams = new URLSearchParams({
    fields: 'adset_id,adset_name,impressions,clicks,spend,actions,action_values,date_start,date_stop',
    level: 'adset',
    time_range: JSON.stringify({ since, until }),
    access_token: config.accessToken,
    limit: '500',
  })

  if (config.appSecret) {
    const appsecretProof = generateAppsecretProof(config.accessToken, config.appSecret)
    insightsParams.set('appsecret_proof', appsecretProof)
  }

  const insightsUrl = `https://graph.facebook.com/${apiVersion}/${accountId}/insights?${insightsParams.toString()}`
  
  const insightsData = await withRateLimit('meta_ads', async () => {
    return await fetchAllPages<{
      adset_id: string
      adset_name: string
      impressions?: string
      clicks?: string
      spend?: string
      actions?: Array<{ action_type: string; value: string }>
      action_values?: Array<{ action_type: string; value: string }>
      date_start?: string
      date_stop?: string
    }>(insightsUrl)
  })

  logAPISuccess('meta_ads', 'fetchAdSets', {
    adSetCount: adSetMetadata.length,
    insightsCount: insightsData.length,
  })

  return { adSetMetadata, insightsData, dateRange: { since, until } }
}

export function transformMetaAdsAdSetData(apiData: {
  adSetMetadata: Array<{
    id: string
    name: string
    status: string
    daily_budget?: string
    campaign_id: string
    targeting?: any
    optimization_goal?: string
    bid_strategy?: string
  }>
  insightsData: Array<{
    adset_id: string
    adset_name: string
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
  const adSets: any[] = []
  const metrics: any[] = []

  const seenAdSets = new Set<string>()

  // Create ad sets from metadata
  for (const adSet of apiData.adSetMetadata) {
    if (!seenAdSets.has(adSet.id)) {
      adSets.push({
        ad_group_id: adSet.id,
        ad_group_name: adSet.name,
        campaign_api_id: adSet.campaign_id,
        platform: 'meta_ads',
        status: normalizeMetaStatus(adSet.status),
        ad_group_type: adSet.optimization_goal || null,
        cpc_bid_micros: null,
        target_cpa_micros: null,
        metadata: {
          targeting: adSet.targeting,
          bid_strategy: adSet.bid_strategy,
          daily_budget: adSet.daily_budget,
        },
      })
      seenAdSets.add(adSet.id)
    }
  }

  // Create metrics from insights
  for (const insight of apiData.insightsData) {
    const purchaseAction = insight.actions?.find(
      (action) => action.action_type === 'offsite_conversion.fb_pixel_purchase' || 
                 action.action_type === 'purchase'
    )
    const revenueAction = insight.action_values?.find(
      (action) => action.action_type === 'offsite_conversion.fb_pixel_purchase' ||
                 action.action_type === 'purchase'
    )

    metrics.push({
      ad_group_api_id: insight.adset_id,
      date: insight.date_stop || apiData.dateRange.until,
      impressions: insight.impressions ? parseInt(insight.impressions, 10) : 0,
      clicks: insight.clicks ? parseInt(insight.clicks, 10) : 0,
      conversions: purchaseAction ? parseFloat(purchaseAction.value) : 0,
      spend: insight.spend ? parseFloat(insight.spend) : 0,
      revenue: revenueAction ? parseFloat(revenueAction.value) : 0,
    })
  }

  return { adSets, metrics }
}

// ============================================
// INDIVIDUAL ADS
// ============================================

export async function fetchMetaAdsAds(config: MetaAdsConfig) {
  const apiVersion = config.apiVersion ?? DEFAULT_GRAPH_VERSION
  
  let accountId = config.accountId
  if (!accountId.startsWith('act_')) {
    accountId = accountId.replace(/^act_/, '')
    accountId = `act_${accountId}`
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const until = new Date().toISOString().split('T')[0]

  logger.info('Fetching Meta Ads individual ads', { accountId })

  // Fetch ad metadata with creative details
  const adsParams = new URLSearchParams({
    fields: 'id,name,status,adset_id,creative{id,title,body,object_story_spec,effective_object_story_id,thumbnail_url,image_url}',
    access_token: config.accessToken,
    limit: '500',
  })

  if (config.appSecret) {
    const appsecretProof = generateAppsecretProof(config.accessToken, config.appSecret)
    adsParams.set('appsecret_proof', appsecretProof)
  }

  const adsUrl = `https://graph.facebook.com/${apiVersion}/${accountId}/ads?${adsParams.toString()}`
  
  const adMetadata = await withRateLimit('meta_ads', async () => {
    return await fetchAllPages<{
      id: string
      name: string
      status: string
      adset_id: string
      creative?: {
        id: string
        title?: string
        body?: string
        object_story_spec?: any
        thumbnail_url?: string
        image_url?: string
      }
    }>(adsUrl)
  })

  // Fetch ad level insights
  const insightsParams = new URLSearchParams({
    fields: 'ad_id,ad_name,impressions,clicks,spend,actions,action_values,date_start,date_stop',
    level: 'ad',
    time_range: JSON.stringify({ since, until }),
    access_token: config.accessToken,
    limit: '500',
  })

  if (config.appSecret) {
    const appsecretProof = generateAppsecretProof(config.accessToken, config.appSecret)
    insightsParams.set('appsecret_proof', appsecretProof)
  }

  const insightsUrl = `https://graph.facebook.com/${apiVersion}/${accountId}/insights?${insightsParams.toString()}`
  
  const insightsData = await withRateLimit('meta_ads', async () => {
    return await fetchAllPages<{
      ad_id: string
      ad_name: string
      impressions?: string
      clicks?: string
      spend?: string
      actions?: Array<{ action_type: string; value: string }>
      action_values?: Array<{ action_type: string; value: string }>
      date_start?: string
      date_stop?: string
    }>(insightsUrl)
  })

  logAPISuccess('meta_ads', 'fetchAds', {
    adCount: adMetadata.length,
    insightsCount: insightsData.length,
  })

  return { adMetadata, insightsData, dateRange: { since, until } }
}

export function transformMetaAdsAdData(apiData: {
  adMetadata: Array<{
    id: string
    name: string
    status: string
    adset_id: string
    creative?: {
      id: string
      title?: string
      body?: string
      object_story_spec?: any
      thumbnail_url?: string
      image_url?: string
    }
  }>
  insightsData: Array<{
    ad_id: string
    ad_name: string
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
  const ads: any[] = []
  const metrics: any[] = []

  const seenAds = new Set<string>()

  // Create ads from metadata
  for (const ad of apiData.adMetadata) {
    if (!seenAds.has(ad.id)) {
      // Extract headline and description from creative
      const creative = ad.creative
      let headlines: string[] = []
      let descriptions: string[] = []
      
      if (creative?.title) {
        headlines.push(creative.title)
      }
      if (creative?.body) {
        descriptions.push(creative.body)
      }
      
      // Try to extract from object_story_spec if available
      const storySpec = creative?.object_story_spec
      if (storySpec?.link_data) {
        if (storySpec.link_data.message) descriptions.push(storySpec.link_data.message)
        if (storySpec.link_data.name) headlines.push(storySpec.link_data.name)
        if (storySpec.link_data.description) descriptions.push(storySpec.link_data.description)
      }

      ads.push({
        ad_id: ad.id,
        ad_name: ad.name,
        ad_group_api_id: ad.adset_id,
        platform: 'meta_ads',
        ad_type: 'FACEBOOK_AD',
        status: normalizeMetaStatus(ad.status),
        approval_status: 'APPROVED', // Meta doesn't have separate approval status like Google
        headlines: headlines.length > 0 ? headlines : null,
        descriptions: descriptions.length > 0 ? descriptions : null,
        final_urls: storySpec?.link_data?.link ? [storySpec.link_data.link] : null,
        display_url: null,
        metadata: {
          creative_id: creative?.id,
          thumbnail_url: creative?.thumbnail_url,
          image_url: creative?.image_url,
        },
      })
      seenAds.add(ad.id)
    }
  }

  // Create metrics from insights
  for (const insight of apiData.insightsData) {
    const purchaseAction = insight.actions?.find(
      (action) => action.action_type === 'offsite_conversion.fb_pixel_purchase' || 
                 action.action_type === 'purchase'
    )
    const revenueAction = insight.action_values?.find(
      (action) => action.action_type === 'offsite_conversion.fb_pixel_purchase' ||
                 action.action_type === 'purchase'
    )

    metrics.push({
      ad_api_id: insight.ad_id,
      date: insight.date_stop || apiData.dateRange.until,
      impressions: insight.impressions ? parseInt(insight.impressions, 10) : 0,
      clicks: insight.clicks ? parseInt(insight.clicks, 10) : 0,
      conversions: purchaseAction ? parseFloat(purchaseAction.value) : 0,
      spend: insight.spend ? parseFloat(insight.spend) : 0,
      revenue: revenueAction ? parseFloat(revenueAction.value) : 0,
    })
  }

  return { ads, metrics }
}

