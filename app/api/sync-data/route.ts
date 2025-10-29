import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import logger, { logSyncOperation } from '@/lib/logging/logger'

export async function POST(request: NextRequest) {
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

    const syncResults = []

    // Sync data from each platform
    for (const account of adAccounts) {
      const startTime = Date.now()
      
      try {
        logSyncOperation(account.platform, 'started', { userId: user.id })

        if (account.platform === 'google_ads') {
          const result = await syncGoogleAdsData(supabase, account, profile.tenant_id)
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
          const result = await syncMetaAdsData(supabase, account, profile.tenant_id)
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
          const result = await syncLinkedInAdsData(supabase, account, profile.tenant_id)
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

async function syncGoogleAdsData(supabase: any, account: any, tenantId: string) {
  const { fetchGoogleAdsCampaigns, transformGoogleAdsData } = await import('@/lib/google-ads/client')
  
  if (!account.refresh_token) {
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
    refreshToken: account.refresh_token,
    loginCustomerId: account.metadata?.login_customer_id,
  }

  // Fetch real campaign data from Google Ads API
  const apiData = await fetchGoogleAdsCampaigns(config)
  const { campaigns: campaignData, metrics: metricsData } = transformGoogleAdsData(apiData)

  if (campaignData.length === 0) {
    logger.info('No Google Ads campaigns found for this account')
    return { campaignsCount: 0, metricsCount: 0 }
  }

  // Insert campaigns into database
  const campaignsToInsert = campaignData.map((c: any) => ({
    ...c,
    tenant_id: tenantId,
    ad_account_id: account.id,
  }))

  const { data: campaigns } = await supabase
    .from('campaigns')
    .upsert(campaignsToInsert, { onConflict: 'campaign_id,tenant_id' })
    .select()

  // Insert metrics - map API campaign IDs to database IDs
  let metricsInserted = 0
  if (campaigns && campaigns.length > 0 && metricsData.length > 0) {
    const campaignIdMap = new Map(campaigns.map((c: any) => [c.campaign_id, c.id]))
    
    const metricsToInsert = metricsData
      .map((m: any) => {
        const dbCampaignId = campaignIdMap.get(m.campaign_api_id)
        if (!dbCampaignId) return null
        
        // Remove campaign_api_id before inserting
        const { campaign_api_id, ...metricData } = m
        
        return {
          ...metricData,
          tenant_id: tenantId,
          campaign_id: dbCampaignId,
        }
      })
      .filter((m: any) => m !== null)

    if (metricsToInsert.length > 0) {
      await supabase.from('campaign_metrics').upsert(metricsToInsert)
      metricsInserted = metricsToInsert.length
    }
  }

  return { campaignsCount: campaigns?.length || 0, metricsCount: metricsInserted }
}


async function syncMetaAdsData(supabase: any, account: any, tenantId: string) {
  const { fetchMetaAdsCampaigns, transformMetaAdsData } = await import('@/lib/meta-ads/client')

  if (!account.access_token) {
    throw new Error('Meta Ads access token missing. Please reconnect your account.')
  }

  const config = {
    accessToken: account.access_token,
    accountId: account.account_id,
    apiVersion: account.metadata?.api_version,
    appSecret: account.metadata?.app_secret, // Pass app secret for App Secret Proof
  }

  // Fetch real campaign data from Meta Ads API
  const apiData = await fetchMetaAdsCampaigns(config)
  const { campaigns: campaignData, metrics: metricsData } = transformMetaAdsData(apiData)

  if (campaignData.length === 0) {
    logger.info('No Meta Ads campaigns found for this account')
    return { campaignsCount: 0, metricsCount: 0 }
  }

  // Insert campaigns into database
  const campaignsToInsert = campaignData.map((c: any) => ({
    ...c,
    tenant_id: tenantId,
    ad_account_id: account.id,
  }))

  const { data: campaigns } = await supabase
    .from('campaigns')
    .upsert(campaignsToInsert, { onConflict: 'campaign_id,tenant_id' })
    .select()

  // Insert metrics - map API campaign IDs to database IDs
  let metricsInserted = 0
  if (campaigns && campaigns.length > 0 && metricsData.length > 0) {
    const campaignIdMap = new Map(campaigns.map((c: any) => [c.campaign_id, c.id]))
    
    const metricsToInsert = metricsData
      .map((m: any) => {
        const dbCampaignId = campaignIdMap.get(m.campaign_api_id)
        if (!dbCampaignId) return null
        
        // Remove campaign_api_id before inserting
        const { campaign_api_id, ...metricData } = m
        
        return {
          ...metricData,
          tenant_id: tenantId,
          campaign_id: dbCampaignId,
        }
      })
      .filter((m: any) => m !== null)

    if (metricsToInsert.length > 0) {
      await supabase.from('campaign_metrics').upsert(metricsToInsert)
      metricsInserted = metricsToInsert.length
    }
  }

  return { campaignsCount: campaigns?.length || 0, metricsCount: metricsInserted }
}


async function syncLinkedInAdsData(supabase: any, account: any, tenantId: string) {
  const { fetchLinkedInAdsCampaigns, transformLinkedInAdsData } = await import('@/lib/linkedin-ads/client')
  
  if (!account.access_token) {
    throw new Error('LinkedIn Ads access token missing. Please reconnect your account.')
  }

  const config = {
    accessToken: account.access_token,
    apiVersion: account.metadata?.api_version,
  }

  // Fetch real campaign data from LinkedIn Ads API
  const apiData = await fetchLinkedInAdsCampaigns(config)
  
  if (!apiData || apiData.length === 0) {
    logger.info('No LinkedIn campaigns found for this account')
    return { campaignsCount: 0, metricsCount: 0 }
  }
  
  const { campaigns: campaignData, metrics: metricsData } = transformLinkedInAdsData(apiData)

  if (campaignData.length === 0) {
    logger.info('No LinkedIn Ads campaigns found for this account')
    return { campaignsCount: 0, metricsCount: 0 }
  }

  // Insert campaigns into database
  const campaignsToInsert = campaignData.map((c: any) => ({
    ...c,
    tenant_id: tenantId,
    ad_account_id: account.id,
  }))

  const { data: campaigns } = await supabase
    .from('campaigns')
    .upsert(campaignsToInsert, { onConflict: 'campaign_id,tenant_id' })
    .select()

  // Insert metrics - map API campaign IDs to database IDs
  let metricsInserted = 0
  if (campaigns && campaigns.length > 0 && metricsData.length > 0) {
    const campaignIdMap = new Map(campaigns.map((c: any) => [c.campaign_id, c.id]))
    
    const metricsToInsert = metricsData
      .map((m: any) => {
        const dbCampaignId = campaignIdMap.get(m.campaign_api_id)
        if (!dbCampaignId) return null
        
        // Remove campaign_api_id before inserting
        const { campaign_api_id, ...metricData } = m
        
        return {
          ...metricData,
          tenant_id: tenantId,
          campaign_id: dbCampaignId,
        }
      })
      .filter((m: any) => m !== null)

    if (metricsToInsert.length > 0) {
      await supabase.from('campaign_metrics').upsert(metricsToInsert)
      metricsInserted = metricsToInsert.length
    }
  }

  return { campaignsCount: campaigns?.length || 0, metricsCount: metricsInserted }
}


