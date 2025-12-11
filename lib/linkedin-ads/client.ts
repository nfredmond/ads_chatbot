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

// ============================================
// CREATIVES (Individual Ads)
// ============================================

export async function fetchLinkedInCreatives(config: LinkedInAdsConfig, campaignIds: string[]) {
  const apiVersion = config.apiVersion ?? DEFAULT_API_VERSION
  const headers = getLinkedInHeaders(config.accessToken, apiVersion)

  logger.info('Fetching LinkedIn Ads creatives', { campaignCount: campaignIds.length })

  if (!config.accessToken) {
    throw new Error('LinkedIn Ads access token is required')
  }

  if (campaignIds.length === 0) {
    return []
  }

  // Fetch creatives for campaigns
  // LinkedIn creatives are linked to campaigns, not ad groups
  const campaignUrns = campaignIds.map(id => 
    id.startsWith('urn:li:sponsoredCampaign:') ? id : `urn:li:sponsoredCampaign:${id}`
  )

  const creativesUrl = `${LINKEDIN_API_BASE}/rest/creatives?q=search&search=(campaigns:List(${campaignUrns.join(',')}))&count=500`
  
  const creativesData = await withRateLimit('linkedin_ads', async () => {
    try {
      const creativesResponse = await fetch(creativesUrl, {
        method: 'GET',
        headers: {
          ...headers,
          'X-RestLi-Method': 'finder',
        },
      })

      if (!creativesResponse.ok) {
        const errorText = await creativesResponse.text()
        let error: any = {}
        try {
          error = JSON.parse(errorText)
        } catch {
          error = { message: errorText || creativesResponse.statusText }
        }

        const errorMessage = error.message || error.error_description || creativesResponse.statusText

        if (creativesResponse.status === 401 || creativesResponse.status === 403) {
          throw new PlatformAPIError(
            'linkedin_ads',
            'fetchCreatives',
            new Error('Access token expired or invalid. Please reconnect your LinkedIn Ads account.'),
            creativesResponse.status,
            error.code?.toString()
          )
        }

        if (creativesResponse.status === 429) {
          throw new PlatformAPIError(
            'linkedin_ads',
            'fetchCreatives',
            new Error('Rate limit exceeded.'),
            creativesResponse.status,
            error.code?.toString()
          )
        }

        throw new PlatformAPIError(
          'linkedin_ads',
          'fetchCreatives',
          new Error(errorMessage),
          creativesResponse.status,
          error.code?.toString()
        )
      }

      return await creativesResponse.json()
    } catch (error: any) {
      if (error instanceof PlatformAPIError) {
        throw error
      }
      throw new PlatformAPIError(
        'linkedin_ads',
        'fetchCreatives',
        error,
        undefined,
        undefined
      )
    }
  })

  if (!creativesData.elements || creativesData.elements.length === 0) {
    logger.info('No LinkedIn creatives found')
    return []
  }

  // Fetch analytics for creatives
  const dateRange = getDateRange()
  const creativeIds = creativesData.elements.map((c: any) => c.id)

  let analyticsData = { elements: [] }
  try {
    const analyticsParams = new URLSearchParams({
      q: 'analytics',
      pivot: 'CREATIVE',
      dateRange: JSON.stringify(dateRange),
      creatives: `List(${creativeIds.join(',')})`,
      fields: 'impressions,clicks,costInLocalCurrency,externalWebsiteConversions,conversionValueInLocalCurrency',
    })

    const analyticsUrl = `${LINKEDIN_API_BASE}/rest/adAnalytics?${analyticsParams.toString()}`
    
    const analyticsResponse = await withRateLimit('linkedin_ads', async () => {
      const response = await fetch(analyticsUrl, {
        method: 'GET',
        headers: {
          ...headers,
          'X-RestLi-Method': 'finder',
        },
      })

      if (response.ok) {
        return await response.json()
      }
      
      logger.warn('LinkedIn creative analytics fetch failed', { status: response.status })
      return { elements: [] }
    })

    analyticsData = analyticsResponse
  } catch (error: any) {
    logger.warn('LinkedIn creative analytics error', { error: error.message })
  }

  // Map analytics to creatives
  const analyticsMap = new Map(
    analyticsData.elements?.map((a: any) => [a.pivotValues?.[0], a]) || []
  )

  const creativesWithMetrics = creativesData.elements.map((creative: any) => ({
    ...creative,
    analytics: analyticsMap.get(creative.id) || null,
  }))

  logAPISuccess('linkedin_ads', 'fetchCreatives', {
    creativeCount: creativesWithMetrics.length,
    withAnalytics: creativesWithMetrics.filter((c: any) => c.analytics).length,
  })

  return creativesWithMetrics
}

export function transformLinkedInCreativeData(apiData: any[], campaignIdMap: Map<string, string>) {
  const creatives: any[] = []
  const metrics: any[] = []

  apiData.forEach((creative: any) => {
    // Extract campaign ID from the creative's campaign URN
    const campaignUrn = creative.campaign
    const campaignApiId = campaignUrn?.replace('urn:li:sponsoredCampaign:', '') || null
    
    // Get the database campaign ID
    const dbCampaignId = campaignApiId ? campaignIdMap.get(campaignApiId) : null

    // Extract content from creative
    let headlines: string[] = []
    let descriptions: string[] = []
    let finalUrls: string[] = []

    // LinkedIn creative content structure varies by type
    const content = creative.content
    if (content) {
      // Text ads
      if (content.textAd) {
        if (content.textAd.headline) headlines.push(content.textAd.headline)
        if (content.textAd.text) descriptions.push(content.textAd.text)
      }
      // Sponsored content
      if (content.sponsored) {
        if (content.sponsored.title) headlines.push(content.sponsored.title)
        if (content.sponsored.description) descriptions.push(content.sponsored.description)
        if (content.sponsored.landingPage) finalUrls.push(content.sponsored.landingPage)
      }
      // Direct sponsored content
      if (content.reference) {
        // This is a reference to an existing post
        descriptions.push('Sponsored Post')
      }
    }

    // For LinkedIn, we create a pseudo "ad group" per campaign since LinkedIn
    // doesn't have a true ad group level - creatives link directly to campaigns
    creatives.push({
      ad_id: creative.id.toString(),
      ad_name: headlines[0] || `Creative ${creative.id}`,
      campaign_api_id: campaignApiId,
      db_campaign_id: dbCampaignId,
      platform: 'linkedin_ads',
      ad_type: creative.type || 'SPONSORED_CONTENT',
      status: normalizeLinkedInStatus(creative.status || 'ACTIVE'),
      approval_status: creative.review?.status || 'APPROVED',
      headlines: headlines.length > 0 ? headlines : null,
      descriptions: descriptions.length > 0 ? descriptions : null,
      final_urls: finalUrls.length > 0 ? finalUrls : null,
      display_url: null,
      metadata: {
        creative_type: creative.type,
        intendedStatus: creative.intendedStatus,
      },
    })

    if (creative.analytics) {
      metrics.push({
        ad_api_id: creative.id.toString(),
        date: new Date().toISOString().split('T')[0],
        impressions: parseInt(creative.analytics.impressions) || 0,
        clicks: parseInt(creative.analytics.clicks) || 0,
        conversions: parseFloat(creative.analytics.externalWebsiteConversions) || 0,
        spend: parseFloat(creative.analytics.costInLocalCurrency) || 0,
        revenue: parseFloat(creative.analytics.conversionValueInLocalCurrency) || 0,
      })
    }
  })

  return { creatives, metrics }
}

