/**
 * Google Ads API Client
 * Documentation:
 * - Getting started: https://developers.google.com/google-ads/api/docs/get-started/make-first-call
 * - OAuth: https://developers.google.com/google-ads/api/docs/oauth/overview
 * - Common errors: https://developers.google.com/google-ads/api/docs/get-started/common-errors
 */

import logger, { PlatformAPIError, logAPISuccess, logTokenRefresh } from '../logging/logger'
import { withRateLimit } from '../rate-limiting/limiter'

export interface GoogleAdsConfig {
  clientId: string
  clientSecret: string
  developerToken: string
  customerId: string
  refreshToken?: string
  loginCustomerId?: string
}

function normalizeCustomerId(rawId?: string): string {
  return String(rawId || '').replace(/\D/g, '')
}

function withGoogleAuthHeaders(config: GoogleAdsConfig, accessToken: string) {
  const normalizedLoginId = normalizeCustomerId(config.loginCustomerId)

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    'developer-token': config.developerToken,
    ...(normalizedLoginId ? { 'login-customer-id': normalizedLoginId } : {}),
  }
}

export async function getGoogleAdsAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.error_description || data.error || 'Failed to refresh access token'
      logTokenRefresh('google_ads', false, undefined, new Error(errorMessage))
      throw new PlatformAPIError('google_ads', 'refreshToken', new Error(errorMessage), response.status, data.error)
    }

    if (!data.access_token) {
      const error = new Error('No access token returned from Google OAuth refresh flow')
      logTokenRefresh('google_ads', false, undefined, error)
      throw error
    }

    logTokenRefresh('google_ads', true)
    return data.access_token
  } catch (error) {
    throw error
  }
}

export async function fetchGoogleAdsCampaigns(config: GoogleAdsConfig) {
  if (!config.refreshToken) {
    throw new Error('Missing refresh token for Google Ads OAuth flow')
  }

  const normalizedCustomerId = normalizeCustomerId(config.customerId)
  if (!normalizedCustomerId) {
    throw new Error(`Invalid Google Ads customer ID: ${config.customerId}`)
  }

  logger.info('Fetching Google Ads campaigns', {
    customerId: normalizedCustomerId,
    inputCustomerId: config.customerId,
  })

  // Google Ads API uses GAQL (Google Ads Query Language)
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign_budget.amount_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.conversions_value,
      metrics.cost_micros,
      metrics.ctr,
      metrics.average_cpc,
      segments.date
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
    ORDER BY metrics.clicks DESC
  `

  const accessToken = await getGoogleAdsAccessToken(
    config.clientId,
    config.clientSecret,
    config.refreshToken
  )

  const endpoint = `https://googleads.googleapis.com/v21/customers/${normalizedCustomerId}/googleAds:search`

  const data = await withRateLimit('google_ads', async () => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: withGoogleAuthHeaders(config, accessToken),
      // NOTE: Google Ads Search endpoint no longer supports custom pageSize.
      body: JSON.stringify({ query }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      const error = responseData.error?.message || 'Unknown Google Ads API error'
      throw new PlatformAPIError(
        'google_ads',
        'fetchCampaigns',
        new Error(error),
        response.status,
        responseData.error?.code?.toString()
      )
    }

    return responseData
  })

  const resultCount = Array.isArray(data?.results) ? data.results.length : 0
  logAPISuccess('google_ads', 'fetchCampaigns', { resultCount })

  return data
}

export function transformGoogleAdsData(apiData: any) {
  const campaigns: any[] = []
  const metrics: any[] = []

  const campaignMap = new Map<string, any>()

  const rows = Array.isArray(apiData?.results) ? apiData.results : []

  rows.forEach((row: any) => {
    const campaign = row?.campaign
    if (!campaign?.id) {
      return
    }

    const campaignId = campaign.id.toString()

    if (!campaignMap.has(campaignId)) {
      const budgetMicros = row?.campaignBudget?.amountMicros

      campaignMap.set(campaignId, {
        campaign_id: campaignId,
        campaign_name: campaign.name,
        platform: 'google_ads',
        status: normalizeGoogleStatus(campaign.status),
        budget_amount: budgetMicros ? Number(budgetMicros) / 1_000_000 : null,
      })
    }

    const campaignMetrics = row?.metrics ?? {}
    const segments = row?.segments ?? {}

    metrics.push({
      campaign_api_id: campaignId,
      date: segments.date || new Date().toISOString().split('T')[0],
      impressions: campaignMetrics.impressions ? Number(campaignMetrics.impressions) : 0,
      clicks: campaignMetrics.clicks ? Number(campaignMetrics.clicks) : 0,
      conversions: campaignMetrics.conversions ? Number(campaignMetrics.conversions) : 0,
      spend: campaignMetrics.costMicros ? Number(campaignMetrics.costMicros) / 1_000_000 : 0,
      revenue: campaignMetrics.conversionsValue
        ? Number(campaignMetrics.conversionsValue)
        : 0,
    })
  })

  campaigns.push(...campaignMap.values())

  return { campaigns, metrics }
}

function normalizeGoogleStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'ENABLED': 'active',
    'PAUSED': 'paused',
    'REMOVED': 'archived',
  }
  return statusMap[status] || status.toLowerCase()
}

// ============================================
// AD GROUPS FETCHING
// ============================================

export async function fetchGoogleAdsAdGroups(config: GoogleAdsConfig) {
  if (!config.refreshToken) {
    throw new Error('Missing refresh token for Google Ads OAuth flow')
  }

  const normalizedCustomerId = normalizeCustomerId(config.customerId)
  if (!normalizedCustomerId) {
    throw new Error(`Invalid Google Ads customer ID: ${config.customerId}`)
  }

  logger.info('Fetching Google Ads ad groups', {
    customerId: normalizedCustomerId,
    inputCustomerId: config.customerId,
  })

  const query = `
    SELECT
      ad_group.id,
      ad_group.name,
      ad_group.status,
      ad_group.type,
      ad_group.cpc_bid_micros,
      ad_group.target_cpa_micros,
      campaign.id,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.conversions_value,
      metrics.cost_micros,
      segments.date
    FROM ad_group
    WHERE segments.date DURING LAST_30_DAYS
    ORDER BY metrics.impressions DESC
  `

  const accessToken = await getGoogleAdsAccessToken(
    config.clientId,
    config.clientSecret,
    config.refreshToken
  )

  const endpoint = `https://googleads.googleapis.com/v21/customers/${normalizedCustomerId}/googleAds:search`

  const data = await withRateLimit('google_ads', async () => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: withGoogleAuthHeaders(config, accessToken),
      // NOTE: Google Ads Search endpoint no longer supports custom pageSize.
      body: JSON.stringify({ query }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      const error = responseData.error?.message || 'Unknown Google Ads API error'
      throw new PlatformAPIError(
        'google_ads',
        'fetchAdGroups',
        new Error(error),
        response.status,
        responseData.error?.code?.toString()
      )
    }

    return responseData
  })

  const resultCount = Array.isArray(data?.results) ? data.results.length : 0
  logAPISuccess('google_ads', 'fetchAdGroups', { resultCount })

  return data
}

export function transformGoogleAdsAdGroupData(apiData: any) {
  const adGroups: any[] = []
  const metrics: any[] = []

  const adGroupMap = new Map<string, any>()
  const rows = Array.isArray(apiData?.results) ? apiData.results : []

  rows.forEach((row: any) => {
    const adGroup = row?.adGroup
    if (!adGroup?.id) return

    const adGroupId = adGroup.id.toString()
    const campaignId = row?.campaign?.id?.toString()

    if (!adGroupMap.has(adGroupId)) {
      adGroupMap.set(adGroupId, {
        ad_group_id: adGroupId,
        ad_group_name: adGroup.name,
        campaign_api_id: campaignId,
        platform: 'google_ads',
        status: normalizeGoogleStatus(adGroup.status || 'UNKNOWN'),
        ad_group_type: adGroup.type,
        cpc_bid_micros: adGroup.cpcBidMicros ? Number(adGroup.cpcBidMicros) : null,
        target_cpa_micros: adGroup.targetCpaMicros ? Number(adGroup.targetCpaMicros) : null,
      })
    }

    const adGroupMetrics = row?.metrics ?? {}
    const segments = row?.segments ?? {}

    metrics.push({
      ad_group_api_id: adGroupId,
      date: segments.date || new Date().toISOString().split('T')[0],
      impressions: adGroupMetrics.impressions ? Number(adGroupMetrics.impressions) : 0,
      clicks: adGroupMetrics.clicks ? Number(adGroupMetrics.clicks) : 0,
      conversions: adGroupMetrics.conversions ? Number(adGroupMetrics.conversions) : 0,
      spend: adGroupMetrics.costMicros ? Number(adGroupMetrics.costMicros) / 1_000_000 : 0,
      revenue: adGroupMetrics.conversionsValue ? Number(adGroupMetrics.conversionsValue) : 0,
    })
  })

  adGroups.push(...adGroupMap.values())
  return { adGroups, metrics }
}

// ============================================
// ADS FETCHING
// ============================================

export async function fetchGoogleAdsAds(config: GoogleAdsConfig) {
  if (!config.refreshToken) {
    throw new Error('Missing refresh token for Google Ads OAuth flow')
  }

  const normalizedCustomerId = normalizeCustomerId(config.customerId)
  if (!normalizedCustomerId) {
    throw new Error(`Invalid Google Ads customer ID: ${config.customerId}`)
  }

  logger.info('Fetching Google Ads ads', {
    customerId: normalizedCustomerId,
    inputCustomerId: config.customerId,
  })

  const query = `
    SELECT
      ad_group_ad.ad.id,
      ad_group_ad.ad.name,
      ad_group_ad.ad.type,
      ad_group_ad.status,
      ad_group_ad.policy_summary.approval_status,
      ad_group_ad.ad.responsive_search_ad.headlines,
      ad_group_ad.ad.responsive_search_ad.descriptions,
      ad_group_ad.ad.final_urls,
      ad_group_ad.ad.display_url,
      ad_group.id,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.conversions_value,
      metrics.cost_micros,
      segments.date
    FROM ad_group_ad
    WHERE segments.date DURING LAST_30_DAYS
    ORDER BY metrics.impressions DESC
  `

  const accessToken = await getGoogleAdsAccessToken(
    config.clientId,
    config.clientSecret,
    config.refreshToken
  )

  const endpoint = `https://googleads.googleapis.com/v21/customers/${normalizedCustomerId}/googleAds:search`

  const data = await withRateLimit('google_ads', async () => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: withGoogleAuthHeaders(config, accessToken),
      // NOTE: Google Ads Search endpoint no longer supports custom pageSize.
      body: JSON.stringify({ query }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      const error = responseData.error?.message || 'Unknown Google Ads API error'
      throw new PlatformAPIError(
        'google_ads',
        'fetchAds',
        new Error(error),
        response.status,
        responseData.error?.code?.toString()
      )
    }

    return responseData
  })

  const resultCount = Array.isArray(data?.results) ? data.results.length : 0
  logAPISuccess('google_ads', 'fetchAds', { resultCount })

  return data
}

export function transformGoogleAdsAdData(apiData: any) {
  const ads: any[] = []
  const metrics: any[] = []

  const adMap = new Map<string, any>()
  const rows = Array.isArray(apiData?.results) ? apiData.results : []

  rows.forEach((row: any) => {
    const adGroupAd = row?.adGroupAd
    const ad = adGroupAd?.ad
    if (!ad?.id) return

    const adId = ad.id.toString()
    const adGroupId = row?.adGroup?.id?.toString()

    if (!adMap.has(adId)) {
      // Extract headlines and descriptions from responsive search ad
      const rsa = ad.responsiveSearchAd
      const headlines = rsa?.headlines?.map((h: any) => h.text) || []
      const descriptions = rsa?.descriptions?.map((d: any) => d.text) || []

      adMap.set(adId, {
        ad_id: adId,
        ad_name: ad.name || `Ad ${adId}`,
        ad_group_api_id: adGroupId,
        platform: 'google_ads',
        ad_type: ad.type,
        status: normalizeGoogleStatus(adGroupAd.status || 'UNKNOWN'),
        approval_status: adGroupAd.policySummary?.approvalStatus || 'UNKNOWN',
        headlines: headlines.length > 0 ? headlines : null,
        descriptions: descriptions.length > 0 ? descriptions : null,
        final_urls: ad.finalUrls || null,
        display_url: ad.displayUrl || null,
      })
    }

    const adMetrics = row?.metrics ?? {}
    const segments = row?.segments ?? {}

    metrics.push({
      ad_api_id: adId,
      date: segments.date || new Date().toISOString().split('T')[0],
      impressions: adMetrics.impressions ? Number(adMetrics.impressions) : 0,
      clicks: adMetrics.clicks ? Number(adMetrics.clicks) : 0,
      conversions: adMetrics.conversions ? Number(adMetrics.conversions) : 0,
      spend: adMetrics.costMicros ? Number(adMetrics.costMicros) / 1_000_000 : 0,
      revenue: adMetrics.conversionsValue ? Number(adMetrics.conversionsValue) : 0,
    })
  })

  ads.push(...adMap.values())
  return { ads, metrics }
}

