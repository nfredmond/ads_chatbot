/**
 * Google Ads API Client
 * Documentation: https://developers.google.com/google-ads/api/docs/start
 */

export interface GoogleAdsConfig {
  clientId: string
  clientSecret: string
  developerToken: string
  customerId: string
  refreshToken?: string
}

export async function getGoogleAdsAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string> {
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
  return data.access_token
}

export async function fetchGoogleAdsCampaigns(config: GoogleAdsConfig) {
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
      metrics.cost_micros,
      metrics.conversions_value
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
  `

  const accessToken = config.refreshToken
    ? await getGoogleAdsAccessToken(config.clientId, config.clientSecret, config.refreshToken)
    : null

  if (!accessToken) {
    throw new Error('No access token available for Google Ads')
  }

  const response = await fetch(
    `https://googleads.googleapis.com/v17/customers/${config.customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': config.developerToken,
      },
      body: JSON.stringify({ query }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Google Ads API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data
}

export function transformGoogleAdsData(apiData: any) {
  const campaigns: any[] = []
  const metrics: any[] = []

  // Transform Google Ads response to our schema
  apiData.forEach((result: any) => {
    const campaign = result.campaign
    const campaignMetrics = result.metrics

    campaigns.push({
      campaign_id: campaign.id.toString(),
      campaign_name: campaign.name,
      platform: 'google_ads',
      status: campaign.status.toLowerCase(),
      budget_amount: campaign.campaignBudget
        ? parseInt(campaign.campaignBudget.amountMicros) / 1000000
        : null,
    })

    metrics.push({
      date: new Date().toISOString().split('T')[0],
      impressions: parseInt(campaignMetrics.impressions) || 0,
      clicks: parseInt(campaignMetrics.clicks) || 0,
      conversions: parseFloat(campaignMetrics.conversions) || 0,
      spend: parseInt(campaignMetrics.costMicros) / 1000000 || 0,
      revenue: parseFloat(campaignMetrics.conversionsValue) || 0,
    })
  })

  return { campaigns, metrics }
}

