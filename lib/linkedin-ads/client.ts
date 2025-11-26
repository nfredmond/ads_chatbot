/**
 * LinkedIn Ads API Client
 * Documentation:
 * - Authentication: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication
 * - Getting Access: https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access
 * - Marketing API: https://learn.microsoft.com/en-us/linkedin/marketing/
 * - Best Practices: https://learn.microsoft.com/en-us/linkedin/shared/api-guide/best-practices/overview
 * 
 * Note: Marketing API requires approval as an Advertising API partner.
 * Uses Rest.li Protocol 2.0.0 with LinkedIn-specific headers.
 */

import logger, { PlatformAPIError, logAPISuccess } from '../logging/logger'
import { withRateLimit } from '../rate-limiting/limiter'

const DEFAULT_API_VERSION = '202505'
const LINKEDIN_API_BASE = 'https://api.linkedin.com'

export interface LinkedInAdsConfig {
  accessToken: string
  apiVersion?: string
}

/**
 * Helper to create standard LinkedIn API headers following Rest.li protocol
 */
function getLinkedInHeaders(accessToken: string, apiVersion: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'LinkedIn-Version': apiVersion,
    'X-Restli-Protocol-Version': '2.0.0',
    'Connection': 'Keep-Alive',
  }
}

/**
 * Calculate date range for last 30 days in LinkedIn format
 */
function getDateRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)

  return {
    start: {
      year: start.getFullYear(),
      month: start.getMonth() + 1,
      day: start.getDate(),
    },
    end: {
      year: end.getFullYear(),
      month: end.getMonth() + 1,
      day: end.getDate(),
    },
  }
}

export async function fetchLinkedInAdsCampaigns(config: LinkedInAdsConfig) {
  const apiVersion = config.apiVersion ?? DEFAULT_API_VERSION
  const headers = getLinkedInHeaders(config.accessToken, apiVersion)

  logger.info('Fetching LinkedIn Ads campaigns')

  // Validate required configuration
  if (!config.accessToken) {
    throw new Error('LinkedIn Ads access token is required')
  }

  // Step 1: Fetch ad accounts using Rest.li finder method
  const accountsUrl = `${LINKEDIN_API_BASE}/rest/adAccounts?q=search&search=(status:(values:List(ACTIVE,DRAFT)))`
  
  const accountsData = await withRateLimit('linkedin_ads', async () => {
    try {
      const accountsResponse = await fetch(accountsUrl, {
        method: 'GET',
        headers: {
          ...headers,
          'X-RestLi-Method': 'finder',
        },
      })

      if (!accountsResponse.ok) {
        const errorText = await accountsResponse.text()
        let error: any = {}
        try {
          error = JSON.parse(errorText)
        } catch {
          error = { message: errorText || accountsResponse.statusText }
        }

        // Handle specific LinkedIn API errors
        const errorMessage = error.message || error.error_description || accountsResponse.statusText

        // Token expiration or invalid token
        if (accountsResponse.status === 401 || accountsResponse.status === 403) {
          throw new PlatformAPIError(
            'linkedin_ads',
            'fetchAdAccounts',
            new Error('Access token expired or invalid. Please reconnect your LinkedIn Ads account.'),
            accountsResponse.status,
            error.code?.toString()
          )
        }

        // Rate limit errors
        if (accountsResponse.status === 429) {
          const retryAfter = accountsResponse.headers.get('Retry-After')
          throw new PlatformAPIError(
            'linkedin_ads',
            'fetchAdAccounts',
            new Error(`Rate limit exceeded. Retry after ${retryAfter || 'some time'}`),
            accountsResponse.status,
            error.code?.toString()
          )
        }

        throw new PlatformAPIError(
          'linkedin_ads',
          'fetchAdAccounts',
          new Error(errorMessage),
          accountsResponse.status,
          error.code?.toString()
        )
      }

      return await accountsResponse.json()
    } catch (error: any) {
      // Re-throw PlatformAPIError as-is
      if (error instanceof PlatformAPIError) {
        throw error
      }
      // Wrap other errors
      throw new PlatformAPIError(
        'linkedin_ads',
        'fetchAdAccounts',
        error,
        undefined,
        undefined
      )
    }
  })
  
  if (!accountsData.elements || accountsData.elements.length === 0) {
    throw new Error('No LinkedIn ad accounts found. Ensure the access token has the required Marketing API permissions.')
  }

  const adAccountId = accountsData.elements[0]?.id
  if (!adAccountId) {
    throw new Error('Invalid LinkedIn ad account ID in response')
  }

  // Step 2: Fetch campaigns for the ad account
  // Build URN properly - account ID should be numeric
  const accountUrn = adAccountId.toString().startsWith('urn:li:sponsoredAccount:') 
    ? adAccountId.toString() 
    : `urn:li:sponsoredAccount:${adAccountId}`
  
  const campaignsUrl = `${LINKEDIN_API_BASE}/rest/adCampaigns?q=search&search=(account:(values:List(${accountUrn})))&count=100`
  
  const campaignsData = await withRateLimit('linkedin_ads', async () => {
    try {
      const campaignsResponse = await fetch(campaignsUrl, {
        method: 'GET',
        headers: {
          ...headers,
          'X-RestLi-Method': 'finder',
        },
      })

      if (!campaignsResponse.ok) {
        const errorText = await campaignsResponse.text()
        let error: any = {}
        try {
          error = JSON.parse(errorText)
        } catch {
          error = { message: errorText || campaignsResponse.statusText }
        }

        const errorMessage = error.message || error.error_description || campaignsResponse.statusText

        // Token expiration or invalid token
        if (campaignsResponse.status === 401 || campaignsResponse.status === 403) {
          throw new PlatformAPIError(
            'linkedin_ads',
            'fetchCampaigns',
            new Error('Access token expired or invalid. Please reconnect your LinkedIn Ads account.'),
            campaignsResponse.status,
            error.code?.toString()
          )
        }

        // Rate limit errors
        if (campaignsResponse.status === 429) {
          const retryAfter = campaignsResponse.headers.get('Retry-After')
          throw new PlatformAPIError(
            'linkedin_ads',
            'fetchCampaigns',
            new Error(`Rate limit exceeded. Retry after ${retryAfter || 'some time'}`),
            campaignsResponse.status,
            error.code?.toString()
          )
        }

        throw new PlatformAPIError(
          'linkedin_ads',
          'fetchCampaigns',
          new Error(errorMessage),
          campaignsResponse.status,
          error.code?.toString()
        )
      }

      return await campaignsResponse.json()
    } catch (error: any) {
      // Re-throw PlatformAPIError as-is
      if (error instanceof PlatformAPIError) {
        throw error
      }
      // Wrap other errors
      throw new PlatformAPIError(
        'linkedin_ads',
        'fetchCampaigns',
        error,
        undefined,
        undefined
      )
    }
  })

  if (!campaignsData.elements || campaignsData.elements.length === 0) {
    logger.info('No LinkedIn campaigns found')
    return []
  }

  // Step 3: Fetch analytics for campaigns (batch request for efficiency)
  const dateRange = getDateRange()
  const campaignIds = campaignsData.elements.map((c: any) => c.id)

  const analyticsParams = new URLSearchParams({
    q: 'analytics',
    pivot: 'CAMPAIGN',
    dateRange: JSON.stringify(dateRange),
    campaigns: `List(${campaignIds.join(',')})`,
    fields: 'impressions,clicks,costInLocalCurrency,externalWebsiteConversions,conversionValueInLocalCurrency',
  })

  const analyticsUrl = `${LINKEDIN_API_BASE}/rest/adAnalytics?${analyticsParams.toString()}`
  
  const analyticsData = await withRateLimit('linkedin_ads', async () => {
    try {
      const analyticsResponse = await fetch(analyticsUrl, {
        method: 'GET',
        headers: {
          ...headers,
          'X-RestLi-Method': 'finder',
        },
      })

      if (analyticsResponse.ok) {
        return await analyticsResponse.json()
      }
      
      // Log warning but don't fail the entire request if analytics fails
      const errorText = await analyticsResponse.text()
      logger.warn('LinkedIn analytics fetch failed, continuing without analytics', {
        status: analyticsResponse.status,
        error: errorText,
      })
      return { elements: [] }
    } catch (error: any) {
      // Don't fail the entire request if analytics fails
      logger.warn('LinkedIn analytics fetch error, continuing without analytics', { error })
      return { elements: [] }
    }
  })

  // Map analytics to campaigns
  const analyticsMap = new Map(
    analyticsData.elements?.map((a: any) => [a.pivotValues?.[0], a]) || []
  )

  const campaignsWithMetrics = campaignsData.elements.map((campaign: any) => ({
    ...campaign,
    analytics: analyticsMap.get(campaign.id) || null,
  }))

  logAPISuccess('linkedin_ads', 'fetchCampaigns', {
    campaignCount: campaignsWithMetrics.length,
    withAnalytics: campaignsWithMetrics.filter((c: any) => c.analytics).length,
  })

  return campaignsWithMetrics
}

export function transformLinkedInAdsData(apiData: any[]) {
  const campaigns: any[] = []
  const metrics: any[] = []

  apiData.forEach((campaign: any) => {
    campaigns.push({
      campaign_id: campaign.id.toString(),
      campaign_name: campaign.name,
      platform: 'linkedin_ads',
      status: normalizeLinkedInStatus(campaign.status),
      budget_amount: campaign.dailyBudget?.amount
        ? parseFloat(campaign.dailyBudget.amount)
        : null,
    })

    if (campaign.analytics) {
      metrics.push({
        campaign_api_id: campaign.id.toString(),
        date: new Date().toISOString().split('T')[0],
        impressions: parseInt(campaign.analytics.impressions) || 0,
        clicks: parseInt(campaign.analytics.clicks) || 0,
        conversions: parseFloat(campaign.analytics.externalWebsiteConversions) || 0,
        spend: parseFloat(campaign.analytics.costInLocalCurrency) || 0,
        revenue: parseFloat(campaign.analytics.conversionValueInLocalCurrency) || 0,
      })
    }
  })

  return { campaigns, metrics }
}

function normalizeLinkedInStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'active',
    'PAUSED': 'paused',
    'ARCHIVED': 'archived',
    'DRAFT': 'paused',
  }
  return statusMap[status] || status.toLowerCase()
}

