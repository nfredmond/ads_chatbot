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

  logger.info('Fetching Google Ads campaigns', { customerId: config.customerId })

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

  const endpoint = `https://googleads.googleapis.com/v21/customers/${config.customerId}/googleAds:search`

  const data = await withRateLimit('google_ads', async () => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'developer-token': config.developerToken,
        ...(config.loginCustomerId ? { 'login-customer-id': config.loginCustomerId } : {}),
      },
      body: JSON.stringify({ query, pageSize: 1000 }),
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

