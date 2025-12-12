import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import logger, { logSyncOperation } from '@/lib/logging/logger'
import { decryptAccountTokens } from '@/lib/security/ad-account-tokens'

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile and tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    // Get connected ad accounts
    const { data: adAccounts } = await supabase
      .from('ad_accounts')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .eq('status', 'active')

    if (!adAccounts || adAccounts.length === 0) {
      return NextResponse.json({ error: 'No ad accounts connected' }, { status: 404 })
    }

    const accountsWithTokens = adAccounts.map((account) => ({
      ...account,
      tokens: decryptAccountTokens(account),
    }))

    const syncResults = []

    // Sync data from each platform
    for (const account of accountsWithTokens) {
      const startTime = Date.now()
      
      try {
        logSyncOperation(account.platform, 'started', { userId: user.id })

        if (account.platform === 'google_ads') {
          const result = await syncGoogleAdsData(
            supabase,
            account,
            profile.tenant_id,
            account.tokens
          )
          logSyncOperation(account.platform, 'completed', {
            userId: user.id,
            campaignsCount: result?.campaignsCount || 0,
            metricsCount: result?.metricsCount || 0,
            duration: Date.now() - startTime,
          })
          syncResults.push({
            platform: 'google_ads',
            status: 'success',
            campaigns: result?.campaignsCount || 0,
            metrics: result?.metricsCount || 0,
          })
        } else if (account.platform === 'meta_ads') {
          const result = await syncMetaAdsData(
            supabase,
            account,
            profile.tenant_id,
            account.tokens
          )
          logSyncOperation(account.platform, 'completed', {
            userId: user.id,
            campaignsCount: result?.campaignsCount || 0,
            metricsCount: result?.metricsCount || 0,
            duration: Date.now() - startTime,
          })
          syncResults.push({
            platform: 'meta_ads',
            status: 'success',
            campaigns: result?.campaignsCount || 0,
            metrics: result?.metricsCount || 0,
          })
        } else if (account.platform === 'linkedin_ads') {
          const result = await syncLinkedInAdsData(
            supabase,
            account,
            profile.tenant_id,
            account.tokens
          )
          logSyncOperation(account.platform, 'completed', {
            userId: user.id,
            campaignsCount: result?.campaignsCount || 0,
            metricsCount: result?.metricsCount || 0,
            duration: Date.now() - startTime,
          })
          syncResults.push({
            platform: 'linkedin_ads',
            status: 'success',
            campaigns: result?.campaignsCount || 0,
            metrics: result?.metricsCount || 0,
          })
        }

        // Update last synced time
        await supabase
          .from('ad_accounts')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', account.id)
      } catch (err: any) {
        logger.error(`Error syncing ${account.platform}:`, { error: err, userId: user.id })
        logSyncOperation(account.platform, 'failed', {
          userId: user.id,
          error: err,
          duration: Date.now() - startTime,
        })
        syncResults.push({ platform: account.platform, status: 'error', message: err.message })
      }
    }

    return NextResponse.json({ 
      message: 'Data sync initiated',
      results: syncResults 
    })
  } catch (error: any) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync data', details: error.message },
      { status: 500 }
    )
  }
}

async function syncGoogleAdsData(supabase: any, account: any, tenantId: string, tokens: any) {
  const { 
    fetchGoogleAdsCampaigns, 
    transformGoogleAdsData,
    fetchGoogleAdsAdGroups,
    transformGoogleAdsAdGroupData,
    fetchGoogleAdsAds,
    transformGoogleAdsAdData
  } = await import('@/lib/google-ads/client')
  
  if (!tokens?.refreshToken) {
    throw new Error('Google Ads refresh token missing. Please reconnect your account.')
  }

  if (!account.metadata?.client_id || !account.metadata?.client_secret || !account.metadata?.developer_token) {
    throw new Error('Google Ads credentials incomplete. Please reconfigure in settings.')
  }

  const config = {
    clientId: account.metadata.client_id,
    clientSecret: account.metadata.client_secret,
    developerToken: account.metadata.developer_token,
    customerId: account.account_id,
    refreshToken: tokens.refreshToken,
    loginCustomerId: account.metadata?.login_customer_id,
  }

  // ============================================
  // 1. FETCH AND STORE CAMPAIGNS
  // ============================================
  const apiData = await fetchGoogleAdsCampaigns(config)
  console.log(`Google Ads API returned ${apiData?.results?.length || 0} result rows`)
  
  const { campaigns: campaignData, metrics: metricsData } = transformGoogleAdsData(apiData)
  console.log(`Transformed: ${campaignData.length} campaigns, ${metricsData.length} metrics`)

  if (campaignData.length === 0) {
    logger.info('No Google Ads campaigns found for this account')
    return { campaignsCount: 0, metricsCount: 0, adGroupsCount: 0, adsCount: 0 }
  }

  // Insert campaigns into database
  const campaignsToInsert = campaignData.map((c: any) => ({
    ...c,
    tenant_id: tenantId,
    ad_account_id: account.id,
  }))

  console.log(`Inserting ${campaignsToInsert.length} campaigns for tenant ${tenantId}`)
  
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .upsert(campaignsToInsert, { onConflict: 'campaign_id,tenant_id' })
    .select()

if (campaignsError) {
    console.error('Error inserting campaigns:', campaignsError)
    throw new Error(`Failed to save campaigns: ${campaignsError.message}`)
  }
  
  console.log(`Successfully inserted/updated ${campaigns?.length || 0} campaigns`)

  // Build campaign ID map for later use
  const campaignIdMap = new Map<string, string>(
    campaigns?.map((c: any): [string, string] => [c.campaign_id, c.id]) || []
  )

  // Insert campaign metrics
  let campaignMetricsInserted = 0
  if (campaigns && campaigns.length > 0 && metricsData.length > 0) {
    const metricsToInsert = metricsData
      .map((m: any) => {
        const dbCampaignId = campaignIdMap.get(m.campaign_api_id)
        if (!dbCampaignId) return null
        const { campaign_api_id, ...metricData } = m
        return { ...metricData, tenant_id: tenantId, campaign_id: dbCampaignId }
      })
      .filter((m: any) => m !== null)

    if (metricsToInsert.length > 0) {
      console.log(`Inserting ${metricsToInsert.length} metrics for tenant ${tenantId}`)
      
      const { error: metricsError } = await supabase
        .from('campaign_metrics')
        .upsert(metricsToInsert, { onConflict: 'campaign_id,date,tenant_id' })
      
      if (metricsError) {
        console.error('Error inserting metrics:', metricsError)
      } else {
        campaignMetricsInserted = metricsToInsert.length
        console.log(`Successfully inserted/updated ${campaignMetricsInserted} metrics`)
      }
    }
  }

  // ============================================
  // 2. FETCH AND STORE AD GROUPS
  // ============================================
  let adGroupsInserted = 0
  let adGroupMetricsInserted = 0
  const adGroupIdMap = new Map<string, string>()

  try {
    const adGroupApiData = await fetchGoogleAdsAdGroups(config)
    const { adGroups: adGroupData, metrics: adGroupMetricsData } = transformGoogleAdsAdGroupData(adGroupApiData)

    if (adGroupData.length > 0) {
      // Map ad groups to their database campaign IDs
      const adGroupsToInsert = adGroupData
        .map((ag: any) => {
          const dbCampaignId = campaignIdMap.get(ag.campaign_api_id)
          if (!dbCampaignId) return null
          const { campaign_api_id, ...adGroupRecord } = ag
          return { ...adGroupRecord, tenant_id: tenantId, campaign_id: dbCampaignId }
        })
        .filter((ag: any) => ag !== null)

      if (adGroupsToInsert.length > 0) {
        const { data: adGroups } = await supabase
          .from('ad_groups')
          .upsert(adGroupsToInsert, { onConflict: 'tenant_id,ad_group_id' })
          .select()

        adGroupsInserted = adGroups?.length || 0

        // Build ad group ID map
        adGroups?.forEach((ag: any) => adGroupIdMap.set(ag.ad_group_id, ag.id))

        // Insert ad group metrics
        if (adGroups && adGroups.length > 0 && adGroupMetricsData.length > 0) {
          const agMetricsToInsert = adGroupMetricsData
            .map((m: any) => {
              const dbAdGroupId = adGroupIdMap.get(m.ad_group_api_id)
              if (!dbAdGroupId) return null
              const { ad_group_api_id, ...metricData } = m
              return { ...metricData, tenant_id: tenantId, ad_group_id: dbAdGroupId }
            })
            .filter((m: any) => m !== null)

          if (agMetricsToInsert.length > 0) {
            await supabase.from('ad_group_metrics').upsert(agMetricsToInsert)
            adGroupMetricsInserted = agMetricsToInsert.length
          }
        }
      }
    }
    logger.info('Google Ads ad groups synced', { count: adGroupsInserted })
  } catch (error: any) {
    logger.error('Failed to sync ad groups (non-fatal)', { error: error.message })
    // Continue - ad groups are optional
  }

  // ============================================
  // 3. FETCH AND STORE ADS
  // ============================================
  let adsInserted = 0
  let adMetricsInserted = 0

  try {
    const adsApiData = await fetchGoogleAdsAds(config)
    const { ads: adsData, metrics: adMetricsData } = transformGoogleAdsAdData(adsApiData)

    if (adsData.length > 0) {
      // Map ads to their database ad group IDs
      const adsToInsert = adsData
        .map((ad: any) => {
          const dbAdGroupId = adGroupIdMap.get(ad.ad_group_api_id)
          if (!dbAdGroupId) return null
          const { ad_group_api_id, ...adRecord } = ad
          return { ...adRecord, tenant_id: tenantId, ad_group_id: dbAdGroupId }
        })
        .filter((ad: any) => ad !== null)

      if (adsToInsert.length > 0) {
        const { data: ads } = await supabase
          .from('ads')
          .upsert(adsToInsert, { onConflict: 'tenant_id,ad_id' })
          .select()

        adsInserted = ads?.length || 0

        // Build ad ID map
        const adIdMap = new Map(ads?.map((a: any) => [a.ad_id, a.id]) || [])

        // Insert ad metrics
        if (ads && ads.length > 0 && adMetricsData.length > 0) {
          const adMetricsToInsert = adMetricsData
            .map((m: any) => {
              const dbAdId = adIdMap.get(m.ad_api_id)
              if (!dbAdId) return null
              const { ad_api_id, ...metricData } = m
              return { ...metricData, tenant_id: tenantId, ad_id: dbAdId }
            })
            .filter((m: any) => m !== null)

          if (adMetricsToInsert.length > 0) {
            await supabase.from('ad_metrics').upsert(adMetricsToInsert)
            adMetricsInserted = adMetricsToInsert.length
          }
        }
      }
    }
    logger.info('Google Ads ads synced', { count: adsInserted })
  } catch (error: any) {
    logger.error('Failed to sync ads (non-fatal)', { error: error.message })
    // Continue - ads are optional
  }

  logger.info('Google Ads sync complete', {
    campaigns: campaigns?.length || 0,
    campaignMetrics: campaignMetricsInserted,
    adGroups: adGroupsInserted,
    adGroupMetrics: adGroupMetricsInserted,
    ads: adsInserted,
    adMetrics: adMetricsInserted,
  })

  return { 
    campaignsCount: campaigns?.length || 0, 
    metricsCount: campaignMetricsInserted,
    adGroupsCount: adGroupsInserted,
    adsCount: adsInserted,
  }
}


async function syncMetaAdsData(supabase: any, account: any, tenantId: string, tokens: any) {
  const { 
    fetchMetaAdsCampaigns, 
    transformMetaAdsData,
    fetchMetaAdsAdSets,
    transformMetaAdsAdSetData,
    fetchMetaAdsAds,
    transformMetaAdsAdData
  } = await import('@/lib/meta-ads/client')

  if (!tokens?.accessToken) {
    throw new Error('Meta Ads access token missing. Please reconnect your account in Settings.')
  }

  const config = {
    accessToken: tokens.accessToken,
    accountId: account.account_id,
    apiVersion: account.metadata?.api_version,
    appSecret: account.metadata?.app_secret,
  }

  try {
    // ============================================
    // 1. FETCH AND STORE CAMPAIGNS
    // ============================================
    const apiData = await fetchMetaAdsCampaigns(config)
    const { campaigns: campaignData, metrics: metricsData } = transformMetaAdsData(apiData)

    if (campaignData.length === 0) {
      logger.info('No Meta Ads campaigns found for this account')
      return { campaignsCount: 0, metricsCount: 0, adSetsCount: 0, adsCount: 0 }
    }

    const campaignsToInsert = campaignData.map((c: any) => ({
      ...c,
      tenant_id: tenantId,
      ad_account_id: account.id,
    }))

    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .upsert(campaignsToInsert, { onConflict: 'campaign_id,tenant_id' })
      .select()

    if (campaignsError) {
      logger.error('Failed to insert Meta Ads campaigns', { error: campaignsError })
      throw new Error(`Failed to save campaigns: ${campaignsError.message}`)
    }

    const campaignIdMap = new Map<string, string>(
      campaigns?.map((c: any): [string, string] => [c.campaign_id, c.id]) || []
    )

    // Insert campaign metrics
    let campaignMetricsInserted = 0
    if (campaigns && campaigns.length > 0 && metricsData.length > 0) {
      const metricsToInsert = metricsData
        .map((m: any) => {
          const dbCampaignId = campaignIdMap.get(m.campaign_api_id)
          if (!dbCampaignId) return null
          const { campaign_api_id, ...metricData } = m
          return { ...metricData, tenant_id: tenantId, campaign_id: dbCampaignId }
        })
        .filter((m: any) => m !== null)

      if (metricsToInsert.length > 0) {
        await supabase.from('campaign_metrics').upsert(metricsToInsert)
        campaignMetricsInserted = metricsToInsert.length
      }
    }

    // ============================================
    // 2. FETCH AND STORE AD SETS (Ad Groups)
    // ============================================
    let adSetsInserted = 0
    let adSetMetricsInserted = 0
    const adSetIdMap = new Map<string, string>()

    try {
      const adSetApiData = await fetchMetaAdsAdSets(config)
      const { adSets: adSetData, metrics: adSetMetricsData } = transformMetaAdsAdSetData(adSetApiData)

      if (adSetData.length > 0) {
        const adSetsToInsert = adSetData
          .map((as: any) => {
            const dbCampaignId = campaignIdMap.get(as.campaign_api_id)
            if (!dbCampaignId) return null
            const { campaign_api_id, ...adSetRecord } = as
            return { ...adSetRecord, tenant_id: tenantId, campaign_id: dbCampaignId }
          })
          .filter((as: any) => as !== null)

        if (adSetsToInsert.length > 0) {
          const { data: adSets } = await supabase
            .from('ad_groups')
            .upsert(adSetsToInsert, { onConflict: 'tenant_id,ad_group_id' })
            .select()

          adSetsInserted = adSets?.length || 0
          adSets?.forEach((as: any) => adSetIdMap.set(as.ad_group_id, as.id))

          // Insert ad set metrics
          if (adSets && adSets.length > 0 && adSetMetricsData.length > 0) {
            const asMetricsToInsert = adSetMetricsData
              .map((m: any) => {
                const dbAdSetId = adSetIdMap.get(m.ad_group_api_id)
                if (!dbAdSetId) return null
                const { ad_group_api_id, ...metricData } = m
                return { ...metricData, tenant_id: tenantId, ad_group_id: dbAdSetId }
              })
              .filter((m: any) => m !== null)

            if (asMetricsToInsert.length > 0) {
              await supabase.from('ad_group_metrics').upsert(asMetricsToInsert)
              adSetMetricsInserted = asMetricsToInsert.length
            }
          }
        }
      }
      logger.info('Meta Ads ad sets synced', { count: adSetsInserted })
    } catch (error: any) {
      logger.error('Failed to sync Meta ad sets (non-fatal)', { error: error.message })
    }

    // ============================================
    // 3. FETCH AND STORE ADS
    // ============================================
    let adsInserted = 0
    let adMetricsInserted = 0

    try {
      const adsApiData = await fetchMetaAdsAds(config)
      const { ads: adsData, metrics: adMetricsData } = transformMetaAdsAdData(adsApiData)

      if (adsData.length > 0) {
        const adsToInsert = adsData
          .map((ad: any) => {
            const dbAdSetId = adSetIdMap.get(ad.ad_group_api_id)
            if (!dbAdSetId) return null
            const { ad_group_api_id, ...adRecord } = ad
            return { ...adRecord, tenant_id: tenantId, ad_group_id: dbAdSetId }
          })
          .filter((ad: any) => ad !== null)

        if (adsToInsert.length > 0) {
          const { data: ads } = await supabase
            .from('ads')
            .upsert(adsToInsert, { onConflict: 'tenant_id,ad_id' })
            .select()

          adsInserted = ads?.length || 0
          const adIdMap = new Map(ads?.map((a: any) => [a.ad_id, a.id]) || [])

          // Insert ad metrics
          if (ads && ads.length > 0 && adMetricsData.length > 0) {
            const adMetricsToInsert = adMetricsData
              .map((m: any) => {
                const dbAdId = adIdMap.get(m.ad_api_id)
                if (!dbAdId) return null
                const { ad_api_id, ...metricData } = m
                return { ...metricData, tenant_id: tenantId, ad_id: dbAdId }
              })
              .filter((m: any) => m !== null)

            if (adMetricsToInsert.length > 0) {
              await supabase.from('ad_metrics').upsert(adMetricsToInsert)
              adMetricsInserted = adMetricsToInsert.length
            }
          }
        }
      }
      logger.info('Meta Ads ads synced', { count: adsInserted })
    } catch (error: any) {
      logger.error('Failed to sync Meta ads (non-fatal)', { error: error.message })
    }

    logger.info('Meta Ads sync complete', {
      campaigns: campaigns?.length || 0,
      campaignMetrics: campaignMetricsInserted,
      adSets: adSetsInserted,
      adSetMetrics: adSetMetricsInserted,
      ads: adsInserted,
      adMetrics: adMetricsInserted,
    })

    return { 
      campaignsCount: campaigns?.length || 0, 
      metricsCount: campaignMetricsInserted,
      adSetsCount: adSetsInserted,
      adsCount: adsInserted,
    }
  } catch (error: any) {
    if (error.message?.includes('Access token expired') || error.message?.includes('invalid')) {
      throw new Error('Meta Ads access token expired. Please reconnect your account in Settings.')
    }
    if (error.message?.includes('Rate limit')) {
      throw new Error('Meta Ads rate limit exceeded. Please try again later.')
    }
    throw error
  }
}


async function syncLinkedInAdsData(supabase: any, account: any, tenantId: string, tokens: any) {
  const { 
    fetchLinkedInAdsCampaigns, 
    transformLinkedInAdsData,
    fetchLinkedInCreatives,
    transformLinkedInCreativeData
  } = await import('@/lib/linkedin-ads/client')
  
  if (!tokens?.accessToken) {
    throw new Error('LinkedIn Ads access token missing. Please reconnect your account in Settings.')
  }

  const config = {
    accessToken: tokens.accessToken,
    apiVersion: account.metadata?.api_version || '202505',
  }

  try {
    // ============================================
    // 1. FETCH AND STORE CAMPAIGNS
    // ============================================
    const apiData = await fetchLinkedInAdsCampaigns(config)
    
    if (!apiData || apiData.length === 0) {
      logger.info('No LinkedIn campaigns found for this account')
      return { campaignsCount: 0, metricsCount: 0, adGroupsCount: 0, adsCount: 0 }
    }
    
    const { campaigns: campaignData, metrics: metricsData } = transformLinkedInAdsData(apiData)

    if (campaignData.length === 0) {
      logger.info('No LinkedIn Ads campaigns found for this account')
      return { campaignsCount: 0, metricsCount: 0, adGroupsCount: 0, adsCount: 0 }
    }

    const campaignsToInsert = campaignData.map((c: any) => ({
      ...c,
      tenant_id: tenantId,
      ad_account_id: account.id,
    }))

    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .upsert(campaignsToInsert, { onConflict: 'campaign_id,tenant_id' })
      .select()

    if (campaignsError) {
      logger.error('Failed to insert LinkedIn Ads campaigns', { error: campaignsError })
      throw new Error(`Failed to save campaigns: ${campaignsError.message}`)
    }

    const campaignIdMap = new Map<string, string>(
      campaigns?.map((c: any): [string, string] => [c.campaign_id, c.id]) || []
    )
    const campaignApiIds = campaigns?.map((c: any) => c.campaign_id) || []

    // Insert campaign metrics
    let campaignMetricsInserted = 0
    if (campaigns && campaigns.length > 0 && metricsData.length > 0) {
      const metricsToInsert = metricsData
        .map((m: any) => {
          const dbCampaignId = campaignIdMap.get(m.campaign_api_id)
          if (!dbCampaignId) return null
          const { campaign_api_id, ...metricData } = m
          return { ...metricData, tenant_id: tenantId, campaign_id: dbCampaignId }
        })
        .filter((m: any) => m !== null)

      if (metricsToInsert.length > 0) {
        await supabase.from('campaign_metrics').upsert(metricsToInsert)
        campaignMetricsInserted = metricsToInsert.length
      }
    }

    // ============================================
    // 2. CREATE PSEUDO AD GROUPS (One per campaign)
    // LinkedIn doesn't have a true ad group level, but we create one
    // per campaign to maintain database consistency
    // ============================================
    let adGroupsInserted = 0
    const adGroupIdMap = new Map<string, string>()

    try {
      const pseudoAdGroups = campaigns?.map((c: any) => ({
        tenant_id: tenantId,
        campaign_id: c.id,
        ad_group_id: `li_ag_${c.campaign_id}`,
        ad_group_name: `${c.campaign_name} - Ads`,
        platform: 'linkedin_ads',
        status: c.status,
        ad_group_type: 'LINKEDIN_CAMPAIGN',
      })) || []

      if (pseudoAdGroups.length > 0) {
        const { data: adGroups } = await supabase
          .from('ad_groups')
          .upsert(pseudoAdGroups, { onConflict: 'tenant_id,ad_group_id' })
          .select()

        adGroupsInserted = adGroups?.length || 0
        
        // Map campaign API ID to ad group DB ID
        adGroups?.forEach((ag: any) => {
          const campaignApiId = ag.ad_group_id.replace('li_ag_', '')
          adGroupIdMap.set(campaignApiId, ag.id)
        })
      }
      logger.info('LinkedIn pseudo ad groups created', { count: adGroupsInserted })
    } catch (error: any) {
      logger.error('Failed to create LinkedIn pseudo ad groups (non-fatal)', { error: error.message })
    }

    // ============================================
    // 3. FETCH AND STORE CREATIVES (Ads)
    // ============================================
    let creativesInserted = 0
    let creativeMetricsInserted = 0

    try {
      const creativesApiData = await fetchLinkedInCreatives(config, campaignApiIds)
      
      if (creativesApiData.length > 0) {
        const { creatives: creativesData, metrics: creativeMetricsData } = transformLinkedInCreativeData(
          creativesApiData,
          campaignIdMap
        )

        // Map creatives to their pseudo ad groups
        const creativesToInsert = creativesData
          .map((creative: any) => {
            const adGroupId = adGroupIdMap.get(creative.campaign_api_id)
            if (!adGroupId) return null
            const { campaign_api_id, db_campaign_id, ...creativeRecord } = creative
            return { ...creativeRecord, tenant_id: tenantId, ad_group_id: adGroupId }
          })
          .filter((c: any) => c !== null)

        if (creativesToInsert.length > 0) {
          const { data: creatives } = await supabase
            .from('ads')
            .upsert(creativesToInsert, { onConflict: 'tenant_id,ad_id' })
            .select()

          creativesInserted = creatives?.length || 0
          const creativeIdMap = new Map(creatives?.map((c: any) => [c.ad_id, c.id]) || [])

          // Insert creative metrics
          if (creatives && creatives.length > 0 && creativeMetricsData.length > 0) {
            const creativeMetricsToInsert = creativeMetricsData
              .map((m: any) => {
                const dbCreativeId = creativeIdMap.get(m.ad_api_id)
                if (!dbCreativeId) return null
                const { ad_api_id, ...metricData } = m
                return { ...metricData, tenant_id: tenantId, ad_id: dbCreativeId }
              })
              .filter((m: any) => m !== null)

            if (creativeMetricsToInsert.length > 0) {
              await supabase.from('ad_metrics').upsert(creativeMetricsToInsert)
              creativeMetricsInserted = creativeMetricsToInsert.length
            }
          }
        }
      }
      logger.info('LinkedIn creatives synced', { count: creativesInserted })
    } catch (error: any) {
      logger.error('Failed to sync LinkedIn creatives (non-fatal)', { error: error.message })
    }

    logger.info('LinkedIn Ads sync complete', {
      campaigns: campaigns?.length || 0,
      campaignMetrics: campaignMetricsInserted,
      adGroups: adGroupsInserted,
      creatives: creativesInserted,
      creativeMetrics: creativeMetricsInserted,
    })

    return { 
      campaignsCount: campaigns?.length || 0, 
      metricsCount: campaignMetricsInserted,
      adGroupsCount: adGroupsInserted,
      adsCount: creativesInserted,
    }
  } catch (error: any) {
    if (error.message?.includes('Access token expired') || error.message?.includes('invalid')) {
      throw new Error('LinkedIn Ads access token expired. Please reconnect your account in Settings.')
    }
    if (error.message?.includes('Rate limit')) {
      throw new Error('LinkedIn Ads rate limit exceeded. Please try again later.')
    }
    if (error.message?.includes('No LinkedIn ad accounts found')) {
      throw new Error('No LinkedIn ad accounts found. Ensure your account has Marketing API access approved.')
    }
    throw error
  }
}

