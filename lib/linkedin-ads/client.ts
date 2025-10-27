/**
 * LinkedIn Ads API Client
 * Documentation: https://learn.microsoft.com/en-us/linkedin/marketing/
 */

export interface LinkedInAdsConfig {
  clientId: string
  clientSecret: string
  accessToken: string
}

export async function fetchLinkedInAdsCampaigns(config: LinkedInAdsConfig) {
  // Fetch ad accounts first
  const accountsResponse = await fetch(
    'https://api.linkedin.com/rest/adAccounts?q=search&search=(status:(values:List(ACTIVE,DRAFT)))',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'LinkedIn-Version': '202410',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    }
  )

  if (!accountsResponse.ok) {
    const error = await accountsResponse.json().catch(() => ({}))
    throw new Error(`LinkedIn Ads API error: ${error.message || 'Unknown error'}`)
  }

  const accountsData = await accountsResponse.json()
  const adAccountId = accountsData.elements[0]?.id

  if (!adAccountId) {
    throw new Error('No LinkedIn ad accounts found')
  }

  // Fetch campaigns
  const campaignsResponse = await fetch(
    `https://api.linkedin.com/rest/adCampaigns?q=search&search=(account:(values:List(urn:li:sponsoredAccount:${adAccountId})))`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'LinkedIn-Version': '202410',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    }
  )

  if (!campaignsResponse.ok) {
    const error = await campaignsResponse.json().catch(() => ({}))
    throw new Error(`LinkedIn campaigns error: ${error.message || 'Unknown error'}`)
  }

  const campaignsData = await campaignsResponse.json()

  // Fetch analytics for each campaign
  const campaignsWithMetrics = await Promise.all(
    campaignsData.elements.map(async (campaign: any) => {
      const analyticsResponse = await fetch(
        `https://api.linkedin.com/rest/adAnalytics?` +
          new URLSearchParams({
            q: 'analytics',
            pivot: 'CAMPAIGN',
            dateRange: JSON.stringify({
              start: { year: 2025, month: 1, day: 1 },
              end: { year: 2025, month: 12, day: 31 },
            }),
            campaigns: `List(${campaign.id})`,
            fields: 'impressions,clicks,costInLocalCurrency,externalWebsiteConversions,conversionValueInLocalCurrency',
          }),
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'LinkedIn-Version': '202410',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      )

      const analytics = analyticsResponse.ok ? await analyticsResponse.json() : null

      return { ...campaign, analytics: analytics?.elements[0] }
    })
  )

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
      status: campaign.status.toLowerCase(),
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

