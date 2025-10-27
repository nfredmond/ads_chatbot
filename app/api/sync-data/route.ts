import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      try {
        if (account.platform === 'google_ads') {
          await syncGoogleAdsData(supabase, account, profile.tenant_id)
          syncResults.push({ platform: 'google_ads', status: 'success' })
        } else if (account.platform === 'meta_ads') {
          await syncMetaAdsData(supabase, account, profile.tenant_id)
          syncResults.push({ platform: 'meta_ads', status: 'success' })
        } else if (account.platform === 'linkedin_ads') {
          await syncLinkedInAdsData(supabase, account, profile.tenant_id)
          syncResults.push({ platform: 'linkedin_ads', status: 'success' })
        }

        // Update last synced time
        await supabase
          .from('ad_accounts')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', account.id)
      } catch (err: any) {
        console.error(`Error syncing ${account.platform}:`, err)
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
  // TODO: Implement Google Ads API integration
  // For now, create sample data
  const sampleCampaigns = [
    {
      tenant_id: tenantId,
      ad_account_id: account.id,
      campaign_id: 'google-campaign-1',
      campaign_name: 'Summer Sale 2025',
      platform: 'google_ads',
      status: 'active',
      budget_amount: 5000,
    },
  ]

  const { data: campaigns } = await supabase
    .from('campaigns')
    .insert(sampleCampaigns)
    .select()

  if (campaigns) {
    // Create sample metrics
    const sampleMetrics = campaigns.map((campaign: any) => ({
      tenant_id: tenantId,
      campaign_id: campaign.id,
      date: new Date().toISOString().split('T')[0],
      impressions: Math.floor(Math.random() * 50000) + 10000,
      clicks: Math.floor(Math.random() * 1000) + 100,
      conversions: Math.floor(Math.random() * 50) + 10,
      spend: Math.floor(Math.random() * 2000) + 500,
      revenue: Math.floor(Math.random() * 10000) + 2000,
    }))

    await supabase.from('campaign_metrics').insert(sampleMetrics)
  }
}

async function syncMetaAdsData(supabase: any, account: any, tenantId: string) {
  // TODO: Implement Meta Ads API integration
  const sampleCampaigns = [
    {
      tenant_id: tenantId,
      ad_account_id: account.id,
      campaign_id: 'meta-campaign-1',
      campaign_name: 'Facebook Brand Awareness',
      platform: 'meta_ads',
      status: 'active',
      budget_amount: 3000,
    },
  ]

  const { data: campaigns } = await supabase
    .from('campaigns')
    .insert(sampleCampaigns)
    .select()

  if (campaigns) {
    const sampleMetrics = campaigns.map((campaign: any) => ({
      tenant_id: tenantId,
      campaign_id: campaign.id,
      date: new Date().toISOString().split('T')[0],
      impressions: Math.floor(Math.random() * 40000) + 8000,
      clicks: Math.floor(Math.random() * 800) + 80,
      conversions: Math.floor(Math.random() * 40) + 8,
      spend: Math.floor(Math.random() * 1500) + 400,
      revenue: Math.floor(Math.random() * 8000) + 1500,
    }))

    await supabase.from('campaign_metrics').insert(sampleMetrics)
  }
}

async function syncLinkedInAdsData(supabase: any, account: any, tenantId: string) {
  // TODO: Implement LinkedIn Ads API integration  
  const sampleCampaigns = [
    {
      tenant_id: tenantId,
      ad_account_id: account.id,
      campaign_id: 'linkedin-campaign-1',
      campaign_name: 'B2B Lead Generation',
      platform: 'linkedin_ads',
      status: 'active',
      budget_amount: 2500,
    },
  ]

  const { data: campaigns } = await supabase
    .from('campaigns')
    .insert(sampleCampaigns)
    .select()

  if (campaigns) {
    const sampleMetrics = campaigns.map((campaign: any) => ({
      tenant_id: tenantId,
      campaign_id: campaign.id,
      date: new Date().toISOString().split('T')[0],
      impressions: Math.floor(Math.random() * 20000) + 5000,
      clicks: Math.floor(Math.random() * 400) + 50,
      conversions: Math.floor(Math.random() * 30) + 5,
      spend: Math.floor(Math.random() * 1000) + 300,
      revenue: Math.floor(Math.random() * 5000) + 1000,
    }))

    await supabase.from('campaign_metrics').insert(sampleMetrics)
  }
}

