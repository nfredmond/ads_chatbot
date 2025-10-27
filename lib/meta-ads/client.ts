/**
 * Meta Ads (Facebook) API Client
 * Documentation: https://developers.facebook.com/docs/marketing-api
 */

export interface MetaAdsConfig {
  appId: string
  appSecret: string
  accessToken: string
}

export async function fetchMetaAdsCampaigns(config: MetaAdsConfig) {
  // First, get ad accounts
  const accountsResponse = await fetch(
    `https://graph.facebook.com/v21.0/me/adaccounts?access_token=${config.accessToken}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  if (!accountsResponse.ok) {
    const error = await accountsResponse.json()
    throw new Error(`Meta Ads API error: ${error.error?.message || 'Unknown error'}`)
  }

  const accountsData = await accountsResponse.json()
  const adAccountId = accountsData.data[0]?.id

  if (!adAccountId) {
    throw new Error('No ad accounts found')
  }

  // Fetch campaigns with insights
  const campaignsResponse = await fetch(
    `https://graph.facebook.com/v21.0/${adAccountId}/campaigns?` +
      new URLSearchParams({
        fields: 'id,name,status,daily_budget,insights{impressions,clicks,spend,actions,action_values}',
        access_token: config.accessToken,
        time_range: JSON.stringify({
          since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          until: new Date().toISOString().split('T')[0],
        }),
      }),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  if (!campaignsResponse.ok) {
    const error = await campaignsResponse.json()
    throw new Error(`Meta Ads campaigns error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await campaignsResponse.json()
  return data
}

export function transformMetaAdsData(apiData: any) {
  const campaigns: any[] = []
  const metrics: any[] = []

  apiData.data?.forEach((campaign: any) => {
    campaigns.push({
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      platform: 'meta_ads',
      status: campaign.status.toLowerCase(),
      budget_amount: campaign.daily_budget ? parseFloat(campaign.daily_budget) / 100 : null,
    })

    const insights = campaign.insights?.data[0]
    if (insights) {
      // Find conversion actions
      const conversions =
        insights.actions?.find((a: any) => a.action_type === 'offsite_conversion.fb_pixel_purchase')
          ?.value || 0
      const revenue =
        insights.action_values?.find((a: any) => a.action_type === 'offsite_conversion.fb_pixel_purchase')
          ?.value || 0

      metrics.push({
        date: new Date().toISOString().split('T')[0],
        impressions: parseInt(insights.impressions) || 0,
        clicks: parseInt(insights.clicks) || 0,
        conversions: parseFloat(conversions),
        spend: parseFloat(insights.spend) || 0,
        revenue: parseFloat(revenue) || 0,
      })
    }
  })

  return { campaigns, metrics }
}

