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
  accountId?: string
}

interface LinkedInAdAccountSummary {
  id: string
  name?: string
}

interface LinkedInPartialFailure {
  accountId: string
  error: string
}

function normalizeLinkedInId(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  const urnParts = str.split(':')
  return urnParts[urnParts.length - 1] || str
}

function toLinkedInUrn(entity: 'sponsoredAccount' | 'sponsoredCampaign' | 'sponsoredCreative', id: unknown): string {
  const str = String(id || '')
  if (str.startsWith('urn:li:')) return str
  return `urn:li:${entity}:${normalizeLinkedInId(str)}`
}

function extractLinkedInCampaignIdParts(campaignId: unknown): { accountId: string; campaignId: string } | null {
  const value = String(campaignId || '')
  const match = value.match(/^linkedin:([^:]+):([^:]+)$/)
  if (!match) return null
  return {
    accountId: normalizeLinkedInId(match[1]),
    campaignId: normalizeLinkedInId(match[2]),
  }
}

export function buildLinkedInCampaignId(rawAccountId: unknown, rawCampaignId: unknown): string {
  const accountId = normalizeLinkedInId(rawAccountId)
  const campaignId = normalizeLinkedInId(rawCampaignId)
  if (!accountId || !campaignId) return normalizeLinkedInId(rawCampaignId)
  return `linkedin:${accountId}:${campaignId}`
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
  const accessibleAccounts = await listAccessibleLinkedInAdAccounts(config)
  if (accessibleAccounts.length === 0) {
    throw new Error('No LinkedIn ad accounts found. Ensure the access token has the required Marketing API permissions.')
  }

  const requestedAccountId = normalizeLinkedInId(config.accountId)
  const selectedAccount = requestedAccountId
    ? accessibleAccounts.find((account) => normalizeLinkedInId(account.id) === requestedAccountId)
    : accessibleAccounts[0]

  if (!selectedAccount?.id) {
    if (requestedAccountId) {
      throw new Error(`LinkedIn ad account ${requestedAccountId} was not found for this token. Reconnect LinkedIn or select the correct account.`)
    }
    throw new Error('Invalid LinkedIn ad account ID in response')
  }

  const accountData = await fetchLinkedInCampaignDataForAccount(config, {
    accountId: selectedAccount.id,
    accountName: selectedAccount.name || null,
  })

  logAPISuccess('linkedin_ads', 'fetchCampaigns', {
    campaignCount: accountData.length,
    withAnalytics: accountData.filter((c: any) => c.analytics).length,
    accountCount: 1,
  })

  return accountData
}

export async function listAccessibleLinkedInAdAccounts(config: LinkedInAdsConfig): Promise<LinkedInAdAccountSummary[]> {
  const apiVersion = config.apiVersion ?? DEFAULT_API_VERSION
  const headers = getLinkedInHeaders(config.accessToken, apiVersion)

  if (!config.accessToken) {
    throw new Error('LinkedIn Ads access token is required')
  }

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

  if (!Array.isArray(accountsData.elements)) return []
  return accountsData.elements
    .filter((account: any) => !!account?.id)
    .map((account: any) => ({
      id: normalizeLinkedInId(account.id),
      name: account.name || account.reference || null,
    }))
}

async function fetchLinkedInCampaignDataForAccount(
  config: LinkedInAdsConfig,
  sourceAccount: { accountId: string; accountName?: string | null }
) {
  const apiVersion = config.apiVersion ?? DEFAULT_API_VERSION
  const headers = getLinkedInHeaders(config.accessToken, apiVersion)
  const accountId = normalizeLinkedInId(sourceAccount.accountId)
  const accountUrn = toLinkedInUrn('sponsoredAccount', accountId)

  if (!accountId) {
    throw new Error('Invalid LinkedIn ad account ID in response')
  }

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
    return []
  }

  const dateRange = getDateRange()
  const campaignIds = campaignsData.elements.map((c: any) => normalizeLinkedInId(c.id))
  const campaignUrns = campaignIds.map((id: string) => toLinkedInUrn('sponsoredCampaign', id))

  const analyticsParams = new URLSearchParams({
    q: 'analytics',
    pivot: 'CAMPAIGN',
    dateRange: JSON.stringify(dateRange),
    campaigns: `List(${campaignUrns.join(',')})`,
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
  const analyticsMap = new Map<string, any>(
    analyticsData.elements?.map((a: any) => [normalizeLinkedInId(a.pivotValues?.[0]), a]) || []
  )

  const campaignsWithMetrics = campaignsData.elements.map((campaign: any) => ({
    ...campaign,
    analytics: analyticsMap.get(normalizeLinkedInId(campaign.id)) || null,
    source_account_id: accountId,
    source_account_name: sourceAccount.accountName || null,
  }))

  return campaignsWithMetrics
}

export async function fetchLinkedInAdsCampaignsAggregated(config: LinkedInAdsConfig) {
  logger.info('Fetching LinkedIn Ads campaigns (aggregated)')

  const configuredAccountId = normalizeLinkedInId(config.accountId)
  let sourceAccounts: Array<{ accountId: string; accountName?: string | null }> = []
  try {
    const accessibleAccounts = await listAccessibleLinkedInAdAccounts(config)
    sourceAccounts = accessibleAccounts.map((account) => ({
      accountId: account.id,
      accountName: account.name || null,
    }))

    if (configuredAccountId) {
      const matched = sourceAccounts.find((account) => normalizeLinkedInId(account.accountId) === configuredAccountId)
      if (matched) {
        sourceAccounts = [matched, ...sourceAccounts.filter((account) => account !== matched)]
      } else {
        sourceAccounts.unshift({ accountId: configuredAccountId, accountName: null })
      }
    }
  } catch (error: any) {
    logger.warn('Failed to list accessible LinkedIn ad accounts, falling back to configured account', {
      error: error?.message || String(error),
    })

    if (!configuredAccountId) {
      throw error
    }

    sourceAccounts = [{ accountId: configuredAccountId, accountName: null }]
  }

  const uniqueAccountIds = new Set<string>()
  sourceAccounts = sourceAccounts.filter((account) => {
    const normalizedId = normalizeLinkedInId(account.accountId)
    if (!normalizedId || uniqueAccountIds.has(normalizedId)) return false
    uniqueAccountIds.add(normalizedId)
    return true
  })

  if (sourceAccounts.length === 0) {
    throw new Error('No LinkedIn ad accounts found. Ensure the access token has the required Marketing API permissions.')
  }

  const campaigns: any[] = []
  const partialFailures: LinkedInPartialFailure[] = []

  for (const sourceAccount of sourceAccounts) {
    try {
      const accountCampaigns = await fetchLinkedInCampaignDataForAccount(config, sourceAccount)
      campaigns.push(...accountCampaigns)
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown LinkedIn account sync error'
      partialFailures.push({ accountId: sourceAccount.accountId, error: errorMessage })
      logger.error('Failed LinkedIn campaign fetch for ad account; continuing', {
        accountId: sourceAccount.accountId,
        error: errorMessage,
      })
    }
  }

  if (campaigns.length === 0 && partialFailures.length > 0) {
    throw new Error(`LinkedIn campaign sync failed for all accounts: ${partialFailures[0].error}`)
  }

  logAPISuccess('linkedin_ads', 'fetchCampaignsAggregated', {
    accountCount: sourceAccounts.length,
    campaignCount: campaigns.length,
    withAnalytics: campaigns.filter((c: any) => c.analytics).length,
    partialFailures: partialFailures.length,
  })

  return { campaigns, partialFailures }
}

export function transformLinkedInAdsData(apiData: any[]) {
  const campaigns: any[] = []
  const metrics: any[] = []

  apiData.forEach((campaign: any) => {
    const sourceAccountId = normalizeLinkedInId(campaign.source_account_id || campaign.account)
    const campaignId = normalizeLinkedInId(campaign.id)
    const namespacedCampaignId = buildLinkedInCampaignId(sourceAccountId, campaignId)

    campaigns.push({
      campaign_id: namespacedCampaignId,
      campaign_name: campaign.name,
      platform: 'linkedin_ads',
      status: normalizeLinkedInStatus(campaign.status || 'DRAFT'),
      budget_amount: campaign.dailyBudget?.amount
        ? parseFloat(campaign.dailyBudget.amount)
        : null,
      customer_id: sourceAccountId || null,
      customer_name: campaign.source_account_name || null,
    })

    if (campaign.analytics) {
      metrics.push({
        campaign_api_id: namespacedCampaignId,
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
  const campaignUrns = campaignIds.map((id) => toLinkedInUrn('sponsoredCampaign', id))

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
  const creativeIds = creativesData.elements.map((c: any) => normalizeLinkedInId(c.id))
  const creativeUrns = creativeIds.map((id: string) => toLinkedInUrn('sponsoredCreative', id))

  let analyticsData = { elements: [] }
  try {
    const analyticsParams = new URLSearchParams({
      q: 'analytics',
      pivot: 'CREATIVE',
      dateRange: JSON.stringify(dateRange),
      creatives: `List(${creativeUrns.join(',')})`,
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
  const analyticsMap = new Map<string, any>(
    analyticsData.elements?.map((a: any) => [normalizeLinkedInId(a.pivotValues?.[0]), a]) || []
  )

  const creativesWithMetrics = creativesData.elements.map((creative: any) => ({
    ...creative,
    analytics: analyticsMap.get(normalizeLinkedInId(creative.id)) || null,
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
    const campaignUrn = creative.campaign
    const rawCampaignId = campaignUrn ? normalizeLinkedInId(campaignUrn) : null
    const rawAccountId = creative.account ? normalizeLinkedInId(creative.account) : null
    const fallbackParts = extractLinkedInCampaignIdParts(rawCampaignId)
    const campaignApiId = rawCampaignId
      ? buildLinkedInCampaignId(rawAccountId || fallbackParts?.accountId, fallbackParts?.campaignId || rawCampaignId)
      : null

    // Get the database campaign ID
    const dbCampaignId = campaignApiId
      ? campaignIdMap.get(campaignApiId) || campaignIdMap.get(rawCampaignId || '')
      : null

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
      ad_id: normalizeLinkedInId(creative.id),
      ad_name: headlines[0] || `Creative ${normalizeLinkedInId(creative.id)}`,
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
        ad_api_id: normalizeLinkedInId(creative.id),
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
