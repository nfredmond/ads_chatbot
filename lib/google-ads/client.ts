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

/**
 * List accessible customer accounts (for manager accounts)
 */
async function listAccessibleCustomers(
  accessToken: string,
  developerToken: string
): Promise<string[]> {
  const endpoint = 'https://googleads.googleapis.com/v21/customers:listAccessibleCustomers'
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'developer-token': developerToken,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Failed to list accessible customers:', JSON.stringify(data, null, 2))
    return []
  }

  // Extract customer IDs from resource names like "customers/1234567890"
  const customerIds = (data.resourceNames || []).map((name: string) => 
    name.replace('customers/', '')
  )
  
  logger.info('Found accessible customer accounts', { count: customerIds.length, customerIds })
  return customerIds
}

export interface ClientAccount {
  id: string
  name: string
}

/**
 * List client accounts under a manager account using CustomerClient resource
 */
async function listClientAccounts(
  managerCustomerId: string,
  accessToken: string,
  developerToken: string
): Promise<ClientAccount[]> {
  const query = `
    SELECT 
      customer_client.client_customer,
      customer_client.level,
      customer_client.manager,
      customer_client.status,
      customer_client.descriptive_name
    FROM customer_client
    WHERE customer_client.level = 1
      AND customer_client.status = 'ENABLED'
  `
  
  const endpoint = `https://googleads.googleapis.com/v21/customers/${managerCustomerId}/googleAds:search`
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'login-customer-id': managerCustomerId,
    },
    body: JSON.stringify({ query }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Failed to list client accounts:', JSON.stringify(data, null, 2))
    return []
  }

  const clients: ClientAccount[] = []
  const rows = data.results || []
  
  for (const row of rows) {
    const clientCustomer = row?.customerClient?.clientCustomer
    const isManager = row?.customerClient?.manager === true
    const name = row?.customerClient?.descriptiveName || 'Unknown'
    
    if (clientCustomer && !isManager) {
      // Extract customer ID from resource name like "customers/1234567890"
      const clientId = clientCustomer.replace('customers/', '')
      clients.push({ id: clientId, name })
      logger.info(`Found client account: ${name} (${clientId})`)
    }
  }
  
  logger.info('Found client accounts under manager', { count: clients.length })
  return clients
}

/**
 * Check if a customer ID is a manager account
 */
async function isManagerAccount(
  customerId: string,
  accessToken: string,
  developerToken: string,
  loginCustomerId?: string
): Promise<boolean> {
  const query = `SELECT customer.manager FROM customer WHERE customer.id = ${customerId}`
  const endpoint = `https://googleads.googleapis.com/v21/customers/${customerId}/googleAds:search`
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
        ...(loginCustomerId ? { 'login-customer-id': loginCustomerId } : {}),
      },
      body: JSON.stringify({ query }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return false
    }

    const isManager = data.results?.[0]?.customer?.manager === true
    return isManager
  } catch {
    return false
  }
}

/**
 * Fetch campaigns from a single customer account
 */
async function fetchCampaignsFromCustomer(
  customerId: string,
  accessToken: string,
  developerToken: string,
  loginCustomerId?: string
): Promise<any> {
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

  const endpoint = `https://googleads.googleapis.com/v21/customers/${customerId}/googleAds:search`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'developer-token': developerToken,
      ...(loginCustomerId ? { 'login-customer-id': loginCustomerId } : {}),
    },
    body: JSON.stringify({ query }),
  })

  const responseData = await response.json()

  if (!response.ok) {
    const errorDetails = responseData.error?.details?.[0]?.errors?.[0] || responseData.error
    const errorMessage = errorDetails?.message || responseData.error?.message || 'Unknown error'
    const errorCode = errorDetails?.errorCode
    
    // If this is a manager account error, return empty results (we'll handle it in the parent)
    if (errorCode?.queryError === 'REQUESTED_METRICS_FOR_MANAGER') {
      logger.info(`Skipping manager account ${customerId}`)
      return { results: [], isManager: true }
    }
    
    console.error(`Error fetching from customer ${customerId}:`, errorMessage)
    return { results: [], error: errorMessage }
  }

  return responseData
}

export async function fetchGoogleAdsCampaigns(config: GoogleAdsConfig) {
  if (!config.refreshToken) {
    throw new Error('Missing refresh token for Google Ads OAuth flow')
  }

  // Google Ads API requires customer ID without dashes
  const customerId = config.customerId.replace(/-/g, '')
  const loginCustomerId = config.loginCustomerId?.replace(/-/g, '') || customerId
  
  logger.info('Fetching Google Ads campaigns', { customerId, loginCustomerId })

  const accessToken = await getGoogleAdsAccessToken(
    config.clientId,
    config.clientSecret,
    config.refreshToken
  )

  // First, try to fetch directly from the provided customer ID
  const directResult = await withRateLimit('google_ads', async () => {
    return fetchCampaignsFromCustomer(customerId, accessToken, config.developerToken, loginCustomerId)
  })

  // If it's not a manager account and we got results, return them
  if (!directResult.isManager && directResult.results?.length > 0) {
    const resultCount = directResult.results.length
    logAPISuccess('google_ads', 'fetchCampaigns', { resultCount, customerId })
    return directResult
  }

  // If it's a manager account, we need to list client accounts and fetch from each
  if (directResult.isManager) {
    logger.info('Detected manager account, listing client accounts...')
    
    // Use the CustomerClient resource to get linked accounts (more reliable than listAccessibleCustomers)
    let clientAccounts = await listClientAccounts(customerId, accessToken, config.developerToken)
    
    // Fallback to listAccessibleCustomers if no clients found
    if (clientAccounts.length === 0) {
      logger.info('No clients from CustomerClient, trying listAccessibleCustomers...')
      const accessibleCustomers = await listAccessibleCustomers(accessToken, config.developerToken)
      clientAccounts = accessibleCustomers
        .filter(id => id !== customerId)
        .map(id => ({ id, name: `Account ${id}` }))
    }
    
    if (clientAccounts.length === 0) {
      logger.warn('No client accounts found under manager account')
      return { results: [], clientAccounts: [] }
    }

    logger.info(`Found ${clientAccounts.length} client accounts, fetching campaigns...`)

    // Fetch campaigns from each client account
    const allResults: any[] = []
    
    for (const client of clientAccounts) {
      try {
        const clientResult = await fetchCampaignsFromCustomer(
          client.id, 
          accessToken, 
          config.developerToken,
          loginCustomerId
        )
        
        if (clientResult.results && !clientResult.isManager) {
          // Add client ID and name to each result for tracking
          const resultsWithClient = clientResult.results.map((r: any) => ({
            ...r,
            _clientCustomerId: client.id,
            _clientCustomerName: client.name
          }))
          allResults.push(...resultsWithClient)
          logger.info(`Fetched ${clientResult.results.length} campaign records from client ${client.id}`)
        }
      } catch (err: any) {
        logger.warn(`Failed to fetch from client ${client.id}: ${err.message}`)
      }
    }

    const resultCount = allResults.length
    logAPISuccess('google_ads', 'fetchCampaigns', { resultCount, clientAccounts: clientAccounts.length })
    
    return { results: allResults, clientAccounts }
  }

  // No results found
  logger.info('No Google Ads campaigns found')
  return { results: [] }
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
    const customerId = row?._clientCustomerId || null
    const customerName = row?._clientCustomerName || null

    if (!campaignMap.has(campaignId)) {
      const budgetMicros = row?.campaignBudget?.amountMicros

      campaignMap.set(campaignId, {
        campaign_id: campaignId,
        campaign_name: campaign.name,
        platform: 'google_ads',
        status: normalizeGoogleStatus(campaign.status),
        budget_amount: budgetMicros ? Number(budgetMicros) / 1_000_000 : null,
        customer_id: customerId,
        customer_name: customerName,
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

  // Extract unique customers from the client accounts
  const customers = apiData?.clientAccounts || []

  return { campaigns, metrics, customers }
}

function normalizeGoogleStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'ENABLED': 'active',
    'PAUSED': 'paused',
    'REMOVED': 'archived',
  }
  return statusMap[status] || status.toLowerCase()
}
