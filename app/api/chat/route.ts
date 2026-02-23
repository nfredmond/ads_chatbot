import { generateText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Vercel AI Gateway
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

// Model ID mapping - convert UI display IDs to actual Vercel AI Gateway model IDs
// See: https://vercel.com/docs/ai-gateway/models-and-providers
const MODEL_MAP: Record<string, string> = {
  // Anthropic models - use actual Claude 4 models
  'anthropic/claude-sonnet-4-5': 'anthropic/claude-sonnet-4',
  'anthropic/claude-opus-4-5': 'anthropic/claude-opus-4',
  'anthropic/claude-haiku-4-5': 'anthropic/claude-haiku-4',
  // OpenAI models - map fictional GPT-5 to available GPT-4o models
  'openai/gpt-5': 'openai/gpt-4o',
  'openai/gpt-5-mini': 'openai/gpt-4o-mini',
  'openai/gpt-5-nano': 'openai/gpt-4o-mini',
  'openai/gpt-5-pro': 'openai/o1',
  'openai/gpt-5-codex': 'openai/gpt-4o',
  'openai/gpt-5.1': 'openai/gpt-4.1',
  'openai/gpt-5.1-chat-latest': 'openai/gpt-4.1',
  'openai/gpt-5.1-codex': 'openai/gpt-4.1',
  'openai/gpt-5.1-codex-mini': 'openai/gpt-4.1-mini',
  'openai/gpt-5.1-codex-max': 'openai/gpt-4.1',
  // Google models - use Gemini 2.0 models
  'google/gemini-3': 'google/gemini-2.0-flash',
  'google/gemini-3-pro': 'google/gemini-2.0-flash',
  'google/gemini-3-flash': 'google/gemini-2.0-flash',
};

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'anthropic/claude-sonnet-4-5', startDate, endDate, customers } = await request.json();

    // Check for API key
    if (!process.env.AI_GATEWAY_API_KEY) {
      return NextResponse.json(
        { error: 'AI Gateway API key not configured. Please add AI_GATEWAY_API_KEY to environment variables.' },
        { status: 500 }
      );
    }

    // Map UI model ID to gateway model ID
    const gatewayModelId = MODEL_MAP[model] || 'anthropic/claude-sonnet-4';

    // Create authenticated Supabase client
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    let tenantId: string | null = null;
    let customInstructions: string | null = null;
    
    if (user) {
      // Get user's tenant and custom instructions
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, custom_ai_instructions')
        .eq('id', user.id)
        .single();
      
      tenantId = profile?.tenant_id || null;
      customInstructions = profile?.custom_ai_instructions || null;
    }

    // Fetch connected ad accounts for this tenant
    let adAccounts: any[] = [];
    let campaigns: any[] = [];
    let recentMetrics: any[] = [];
    let customerMetrics: any[] = [];
    let adGroups: any[] = [];
    let adGroupMetrics: any[] = [];
    let ads: any[] = [];
    let adMetrics: any[] = [];
    
    // Parse customer filter - declare outside block so it's available for system prompt
    const selectedCustomerIds = customers && Array.isArray(customers) && customers.length > 0 ? customers : null;

    if (tenantId) {
      const { data: accounts } = await supabase
        .from('ad_accounts')
        .select('platform, account_name, status')
        .eq('tenant_id', tenantId)
        .eq('status', 'active');
      adAccounts = accounts || [];

      // Fetch campaign data for this tenant including customer info
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('id, campaign_id, campaign_name, platform, status, budget_amount, customer_id, customer_name')
        .eq('tenant_id', tenantId)
        .limit(200);
      campaigns = campaignData || [];

      // Calculate date range - use provided dates or default to last 30 days
      let effectiveStartDate: string;
      let effectiveEndDate: string;
      
      if (startDate && endDate) {
        effectiveStartDate = startDate;
        effectiveEndDate = endDate;
      } else {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        effectiveStartDate = thirtyDaysAgo.toISOString().split('T')[0];
        effectiveEndDate = new Date().toISOString().split('T')[0];
      }
      
      // Fetch metrics for this tenant within the date range
      let metricsQuery = supabase
        .from('campaign_metrics')
        .select('date, impressions, clicks, conversions, spend, revenue, campaign_id')
        .eq('tenant_id', tenantId)
        .gte('date', effectiveStartDate)
        .lte('date', effectiveEndDate)
        .order('date', { ascending: false });
      
      const { data: metricsData } = await metricsQuery;
      recentMetrics = metricsData || [];

      // Calculate customer-level metrics
      const campaignToCustomer = new Map<string, { id: string; name: string }>();
      for (const campaign of campaigns) {
        if (campaign.customer_id) {
          campaignToCustomer.set(campaign.id, { 
            id: campaign.customer_id, 
            name: campaign.customer_name || campaign.customer_id 
          });
        }
      }
      
      // Filter metrics by selected customers if provided
      if (selectedCustomerIds) {
        // Get campaign IDs for selected customers
        const selectedCampaignIds = new Set<string>();
        for (const campaign of campaigns) {
          if (selectedCustomerIds.includes(campaign.customer_id)) {
            selectedCampaignIds.add(campaign.id);
          }
        }
        // Filter metrics to only include selected campaigns
        recentMetrics = recentMetrics.filter(m => selectedCampaignIds.has(m.campaign_id));
      }

      const customerAggregates = new Map<string, {
        name: string;
        spend: number;
        revenue: number;
        conversions: number;
        clicks: number;
        impressions: number;
      }>();

      for (const metric of recentMetrics) {
        const customer = campaignToCustomer.get(metric.campaign_id);
        if (customer) {
          const existing = customerAggregates.get(customer.id) || {
            name: customer.name,
            spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0
          };
          existing.spend += Number(metric.spend) || 0;
          existing.revenue += Number(metric.revenue) || 0;
          existing.conversions += Number(metric.conversions) || 0;
          existing.clicks += metric.clicks || 0;
          existing.impressions += metric.impressions || 0;
          customerAggregates.set(customer.id, existing);
        }
      }

      customerMetrics = Array.from(customerAggregates.entries()).map(([id, data]) => ({
        id,
        name: data.name,
        spend: data.spend,
        revenue: data.revenue,
        conversions: data.conversions,
        clicks: data.clicks,
        impressions: data.impressions,
        roas: data.spend > 0 ? data.revenue / data.spend : 0,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        cpc: data.clicks > 0 ? data.spend / data.clicks : 0,
        convRate: data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0,
      })).sort((a, b) => b.spend - a.spend);

      // ============================================
      // FETCH AD GROUPS DATA
      // ============================================
      // Build set of campaign IDs to filter by (for customer filtering)
      const selectedCampaignDbIds = new Set<string>();
      if (selectedCustomerIds) {
        for (const campaign of campaigns) {
          if (selectedCustomerIds.includes(campaign.customer_id)) {
            selectedCampaignDbIds.add(campaign.id);
          }
        }
      }

      const { data: adGroupsData } = await supabase
        .from('ad_groups')
        .select(`
          id, ad_group_id, ad_group_name, platform, status, ad_group_type,
          cpc_bid_micros, target_cpa_micros,
          campaign_id,
          campaigns!inner(campaign_name, customer_id)
        `)
        .eq('tenant_id', tenantId)
        .limit(500);
      
      // Filter ad groups by selected customers if applicable
      if (selectedCustomerIds && selectedCampaignDbIds.size > 0) {
        adGroups = (adGroupsData || []).filter((ag: any) => selectedCampaignDbIds.has(ag.campaign_id));
      } else {
        adGroups = adGroupsData || [];
      }

      // Fetch ad group metrics
      if (adGroups.length > 0) {
        const adGroupIds = adGroups.map((ag: any) => ag.id);
        const { data: agMetricsData } = await supabase
          .from('ad_group_metrics')
          .select('ad_group_id, date, impressions, clicks, conversions, spend, revenue')
          .eq('tenant_id', tenantId)
          .in('ad_group_id', adGroupIds)
          .gte('date', effectiveStartDate)
          .lte('date', effectiveEndDate);
        adGroupMetrics = agMetricsData || [];
      }

      // ============================================
      // FETCH ADS DATA
      // ============================================
      // Build set of ad group IDs for filtering ads by customer
      const filteredAdGroupIds = new Set(adGroups.map((ag: any) => ag.id));

      const { data: adsData } = await supabase
        .from('ads')
        .select(`
          id, ad_id, ad_name, platform, ad_type, status, approval_status,
          headlines, descriptions, final_urls, display_url,
          ad_group_id,
          ad_groups!inner(ad_group_name, campaign_id)
        `)
        .eq('tenant_id', tenantId)
        .limit(1000);
      
      // Filter ads by selected customers (through ad groups) if applicable
      if (selectedCustomerIds && filteredAdGroupIds.size > 0) {
        ads = (adsData || []).filter((ad: any) => filteredAdGroupIds.has(ad.ad_group_id));
      } else {
        ads = adsData || [];
      }

      // Fetch ad metrics
      if (ads.length > 0) {
        const adIds = ads.map((a: any) => a.id);
        const { data: adMetricsData } = await supabase
          .from('ad_metrics')
          .select('ad_id, date, impressions, clicks, conversions, spend, revenue')
          .eq('tenant_id', tenantId)
          .in('ad_id', adIds)
          .gte('date', effectiveStartDate)
          .lte('date', effectiveEndDate);
        adMetrics = adMetricsData || [];
      }
    }

// Calculate campaign-level performance metrics
    const campaignMetricsMap = new Map<string, {
      spend: number; revenue: number; conversions: number; clicks: number; impressions: number;
    }>();
    for (const metric of recentMetrics) {
      const existing = campaignMetricsMap.get(metric.campaign_id) || {
        spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0
      };
      existing.spend += Number(metric.spend) || 0;
      existing.revenue += Number(metric.revenue) || 0;
      existing.conversions += Number(metric.conversions) || 0;
      existing.clicks += metric.clicks || 0;
      existing.impressions += metric.impressions || 0;
      campaignMetricsMap.set(metric.campaign_id, existing);
    }

    const campaignPerformance = campaigns.map(c => {
      const metrics = campaignMetricsMap.get(c.id) || { spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0 };
      return {
        name: c.campaign_name,
        customer: c.customer_name || 'Unknown',
        platform: c.platform,
        status: c.status,
        spend: metrics.spend,
        revenue: metrics.revenue,
        roas: metrics.spend > 0 ? metrics.revenue / metrics.spend : 0,
        conversions: metrics.conversions,
        clicks: metrics.clicks,
        impressions: metrics.impressions,
        ctr: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0,
        cpc: metrics.clicks > 0 ? metrics.spend / metrics.clicks : 0,
      };
    }).sort((a, b) => b.spend - a.spend);

    // Platform campaign inventory (includes zero-spend campaigns)
    const campaignsByPlatform = campaigns.reduce((acc: Record<string, number>, c: any) => {
      acc[c.platform] = (acc[c.platform] || 0) + 1;
      return acc;
    }, {});

    const metaCampaignInventory = campaigns
      .filter((c: any) => c.platform === 'meta_ads')
      .map((c: any) => ({
        name: c.campaign_name,
        customer: c.customer_name || 'Unknown',
        status: c.status,
      }));

    console.log(`Chat API: User ${user?.id}, Tenant ${tenantId}, Accounts: ${adAccounts.length}, Campaigns: ${campaigns.length}, Metrics: ${recentMetrics.length}, Customers: ${customerMetrics.length}, AdGroups: ${adGroups.length}, Ads: ${ads.length}, DateRange: ${startDate || 'default'} to ${endDate || 'default'}, CustomerFilter: ${customers?.length || 'all'}`)

    // Build campaign platform map
    const campaignPlatformMap = new Map<string, string>();
    for (const campaign of campaigns) {
      campaignPlatformMap.set(campaign.id, campaign.platform);
    }

    // Calculate summary stats
    const totalSpend = recentMetrics.reduce((sum, m) => sum + (Number(m.spend) || 0), 0);
    const totalRevenue = recentMetrics.reduce((sum, m) => sum + (Number(m.revenue) || 0), 0);
    const totalConversions = recentMetrics.reduce((sum, m) => sum + (Number(m.conversions) || 0), 0);
    const totalImpressions = recentMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
    const totalClicks = recentMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
    const avgROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    // Calculate insights (after summary stats are calculated)
    const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const costPerConversion = totalConversions > 0 ? totalSpend / totalConversions : 0;

    // Calculate platform-specific stats
    const platformStats: Record<string, any> = {};
    for (const metric of recentMetrics) {
      const platform = campaignPlatformMap.get(metric.campaign_id) || 'google_ads';
      if (!platformStats[platform]) {
        platformStats[platform] = {
          spend: 0, revenue: 0, conversions: 0, impressions: 0, clicks: 0,
        };
      }
      platformStats[platform].spend += Number(metric.spend) || 0;
      platformStats[platform].revenue += Number(metric.revenue) || 0;
      platformStats[platform].conversions += Number(metric.conversions) || 0;
      platformStats[platform].impressions += metric.impressions || 0;
      platformStats[platform].clicks += metric.clicks || 0;
    }

    const platformBreakdown = Object.entries(platformStats).map(([platform, stats]: [string, any]) => ({
      platform: platform.replace('_ads', '').toUpperCase(),
      spend: stats.spend.toFixed(2),
      revenue: stats.revenue.toFixed(2),
      conversions: stats.conversions.toFixed(1),
      impressions: stats.impressions,
      clicks: stats.clicks,
      roas: stats.spend > 0 ? (stats.revenue / stats.spend).toFixed(2) : '0',
      ctr: stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(2) : '0',
    }));

    const hasData = campaigns.length > 0 || recentMetrics.length > 0;
    const hasConnectedAccounts = adAccounts.length > 0;

    // ============================================
    // AGGREGATE AD GROUP METRICS
    // ============================================
    const adGroupAggregates = new Map<string, any>();
    for (const metric of adGroupMetrics) {
      const existing = adGroupAggregates.get(metric.ad_group_id) || {
        spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0
      };
      existing.spend += Number(metric.spend) || 0;
      existing.revenue += Number(metric.revenue) || 0;
      existing.conversions += Number(metric.conversions) || 0;
      existing.clicks += metric.clicks || 0;
      existing.impressions += metric.impressions || 0;
      adGroupAggregates.set(metric.ad_group_id, existing);
    }

    const adGroupPerformance = adGroups.map((ag: any) => {
      const metrics = adGroupAggregates.get(ag.id) || { spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0 };
      return {
        name: ag.ad_group_name,
        campaign: ag.campaigns?.campaign_name || 'Unknown',
        status: ag.status,
        type: ag.ad_group_type,
        spend: metrics.spend,
        revenue: metrics.revenue,
        conversions: metrics.conversions,
        clicks: metrics.clicks,
        impressions: metrics.impressions,
        roas: metrics.spend > 0 ? metrics.revenue / metrics.spend : 0,
        ctr: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0,
        cpc: metrics.clicks > 0 ? metrics.spend / metrics.clicks : 0,
      };
    }).sort((a: any, b: any) => b.spend - a.spend);

    // ============================================
    // AGGREGATE AD METRICS
    // ============================================
    const adAggregates = new Map<string, any>();
    for (const metric of adMetrics) {
      const existing = adAggregates.get(metric.ad_id) || {
        spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0
      };
      existing.spend += Number(metric.spend) || 0;
      existing.revenue += Number(metric.revenue) || 0;
      existing.conversions += Number(metric.conversions) || 0;
      existing.clicks += metric.clicks || 0;
      existing.impressions += metric.impressions || 0;
      adAggregates.set(metric.ad_id, existing);
    }

    const adPerformance = ads.map((ad: any) => {
      const metrics = adAggregates.get(ad.id) || { spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0 };
      return {
        name: ad.ad_name || `Ad ${ad.ad_id}`,
        adGroup: ad.ad_groups?.ad_group_name || 'Unknown',
        type: ad.ad_type,
        status: ad.status,
        approvalStatus: ad.approval_status,
        headlines: ad.headlines,
        descriptions: ad.descriptions,
        finalUrls: ad.final_urls,
        spend: metrics.spend,
        revenue: metrics.revenue,
        conversions: metrics.conversions,
        clicks: metrics.clicks,
        impressions: metrics.impressions,
        roas: metrics.spend > 0 ? metrics.revenue / metrics.spend : 0,
        ctr: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0,
        cpc: metrics.clicks > 0 ? metrics.spend / metrics.clicks : 0,
      };
    }).sort((a: any, b: any) => b.spend - a.spend);

    // Find ads with issues
    const disapprovedAds = adPerformance.filter((a: any) => 
      a.approvalStatus && !['APPROVED', 'APPROVED_LIMITED'].includes(a.approvalStatus)
    );
    const topPerformingAds = adPerformance.filter((a: any) => a.roas >= 3 && a.spend > 10).slice(0, 10);
    const underperformingAds = adPerformance.filter((a: any) => a.roas < 1 && a.spend > 50).slice(0, 10);

    // Build date range description for system prompt
    const dateRangeDesc = startDate && endDate 
      ? `${startDate} to ${endDate}` 
      : 'last 30 days';
    
    const customerFilterDesc = selectedCustomerIds 
      ? `Filtered to ${selectedCustomerIds.length} selected customer(s)` 
      : 'All customers';

    // Build system prompt
    const systemPrompt = `You are an AI marketing analytics assistant helping analyze advertising campaign performance across Google Ads, Meta Ads, and LinkedIn Ads.

Connected Ad Platforms: ${adAccounts.map((a) => a.platform.replace('_ads', '').toUpperCase()).join(', ') || 'None'}
Data Period: ${dateRangeDesc}
Customer Filter: ${customerFilterDesc}

${hasData ? `
OVERALL CAMPAIGN SUMMARY:
- Total Active Campaigns: ${campaigns.length}
- Total Ad Spend (${dateRangeDesc}): $${totalSpend.toFixed(2)}
- Total Revenue: $${totalRevenue.toFixed(2)}
- Total Conversions: ${totalConversions.toFixed(1)}
- Total Impressions: ${totalImpressions.toLocaleString()}
- Total Clicks: ${totalClicks.toLocaleString()}
- Average ROAS: ${avgROAS.toFixed(2)}x
- Overall CTR: ${totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0}%

PLATFORM-SPECIFIC BREAKDOWN:
${platformBreakdown.length > 0 ? JSON.stringify(platformBreakdown, null, 2) : 'No platform-specific data available'}

CAMPAIGN INVENTORY COUNTS (all campaigns, including zero-spend):
${JSON.stringify(campaignsByPlatform, null, 2)}

META CAMPAIGN INVENTORY (all Meta campaigns, not spend-limited):
${metaCampaignInventory.length > 0
  ? metaCampaignInventory.slice(0, 100).map((c: any, i: number) => `${i + 1}. ${c.name} (${c.customer}) [${c.status}]`).join('\n')
  : 'No Meta campaigns found in campaigns table'}

TOP CAMPAIGNS (by budget):
${JSON.stringify(
  campaigns
    .sort((a, b) => (b.budget_amount || 0) - (a.budget_amount || 0))
    .slice(0, 10)
    .map((c: any) => ({
      name: c.campaign_name,
      platform: c.platform.replace('_ads', '').toUpperCase(),
      status: c.status,
      budget: c.budget_amount,
    })),
  null,
  2
)}

DETAILED CAMPAIGN PERFORMANCE (top 20 by spend):
${campaignPerformance.slice(0, 20).map((c, i) => 
  `${i + 1}. ${c.name} (${c.customer}): $${c.spend.toFixed(2)} spend, $${c.revenue.toFixed(2)} revenue, ${c.roas.toFixed(2)}x ROAS, ${c.conversions.toFixed(0)} conversions, ${c.ctr.toFixed(2)}% CTR`
).join('\n')}

BEST PERFORMING CAMPAIGNS (ROAS > 4x with spend > $50):
${campaignPerformance.filter(c => c.roas >= 4 && c.spend > 50).slice(0, 8).map(c => 
  `- ${c.name} (${c.customer}): ${c.roas.toFixed(2)}x ROAS on $${c.spend.toFixed(2)} spend, ${c.conversions.toFixed(0)} conversions`
).join('\n') || 'None identified with ROAS > 4x'}

UNDERPERFORMING CAMPAIGNS (ROAS < 1x with spend > $100):
${campaignPerformance.filter(c => c.roas < 1 && c.spend > 100).slice(0, 8).map(c => 
  `- ${c.name} (${c.customer}): ${c.roas.toFixed(2)}x ROAS on $${c.spend.toFixed(2)} spend - consider pausing or restructuring`
).join('\n') || 'No significantly underperforming campaigns identified'}

KEY EFFICIENCY METRICS:
- Average CPC: $${avgCPC.toFixed(2)}
- Conversion Rate: ${conversionRate.toFixed(2)}%
- Cost Per Conversion: $${costPerConversion.toFixed(2)}

CLIENT/CUSTOMER PERFORMANCE (sorted by spend):
${customerMetrics.length > 0 ? customerMetrics.slice(0, 15).map((c, i) => 
  `${i + 1}. ${c.name}: Spend $${c.spend.toFixed(2)}, Revenue $${c.revenue.toFixed(2)}, ROAS ${c.roas.toFixed(2)}x, Conversions ${c.conversions.toFixed(0)}, CTR ${c.ctr.toFixed(2)}%`
).join('\n') : 'No customer-level data available'}

TOP PERFORMERS (ROAS > 3x):
${customerMetrics.filter(c => c.roas >= 3).length > 0 
  ? customerMetrics.filter(c => c.roas >= 3).slice(0, 5).map(c => 
    `- ${c.name}: ${c.roas.toFixed(2)}x ROAS, $${c.spend.toFixed(2)} spend`
  ).join('\n')
  : 'No top performers identified'}

CLIENTS NEEDING ATTENTION (ROAS < 1.5x with significant spend):
${customerMetrics.filter(c => c.roas < 1.5 && c.spend > 100).length > 0 
  ? customerMetrics.filter(c => c.roas < 1.5 && c.spend > 100).slice(0, 5).map(c => 
    `- ${c.name}: ${c.roas.toFixed(2)}x ROAS, $${c.spend.toFixed(2)} spend - needs optimization`
  ).join('\n')
  : 'All clients performing adequately'}

============================================
AD GROUP LEVEL DATA (${adGroupPerformance.length} ad groups)
============================================
${adGroupPerformance.length > 0 ? `
TOP AD GROUPS BY SPEND:
${adGroupPerformance.slice(0, 15).map((ag: any, i: number) => 
  `${i + 1}. "${ag.name}" (Campaign: ${ag.campaign})
     Status: ${ag.status} | Type: ${ag.type || 'N/A'}
     Spend: $${ag.spend.toFixed(2)} | Revenue: $${ag.revenue.toFixed(2)} | ROAS: ${ag.roas.toFixed(2)}x
     Clicks: ${ag.clicks} | Impressions: ${ag.impressions.toLocaleString()} | CTR: ${ag.ctr.toFixed(2)}%`
).join('\n\n')}

TOP PERFORMING AD GROUPS (ROAS > 3x):
${adGroupPerformance.filter((ag: any) => ag.roas >= 3 && ag.spend > 10).slice(0, 5).map((ag: any) => 
  `- "${ag.name}": ${ag.roas.toFixed(2)}x ROAS, $${ag.spend.toFixed(2)} spend, ${ag.clicks} clicks`
).join('\n') || 'No high-performing ad groups identified'}

UNDERPERFORMING AD GROUPS (ROAS < 1x with $50+ spend):
${adGroupPerformance.filter((ag: any) => ag.roas < 1 && ag.spend > 50).slice(0, 5).map((ag: any) => 
  `- "${ag.name}": ${ag.roas.toFixed(2)}x ROAS, $${ag.spend.toFixed(2)} spend - needs optimization`
).join('\n') || 'No significantly underperforming ad groups'}
` : 'No ad group data available yet. Click "Sync Data" to fetch ad group details.'}

============================================
INDIVIDUAL AD LEVEL DATA (${adPerformance.length} ads)
============================================
${adPerformance.length > 0 ? `
TOP ADS BY SPEND:
${adPerformance.slice(0, 20).map((ad: any, i: number) => 
  `${i + 1}. "${ad.name}" (Ad Group: ${ad.adGroup})
     Type: ${ad.type || 'N/A'} | Status: ${ad.status} | Approval: ${ad.approvalStatus || 'N/A'}
     Spend: $${ad.spend.toFixed(2)} | Revenue: $${ad.revenue.toFixed(2)} | ROAS: ${ad.roas.toFixed(2)}x
     Clicks: ${ad.clicks} | Impressions: ${ad.impressions.toLocaleString()} | CTR: ${ad.ctr.toFixed(2)}%
     ${ad.headlines ? `Headlines: ${JSON.stringify(ad.headlines.slice(0, 3))}` : ''}
     ${ad.descriptions ? `Descriptions: ${JSON.stringify(ad.descriptions.slice(0, 2))}` : ''}
     ${ad.finalUrls ? `URLs: ${JSON.stringify(ad.finalUrls.slice(0, 1))}` : ''}`
).join('\n\n')}

TOP PERFORMING ADS (ROAS > 3x):
${topPerformingAds.length > 0 ? topPerformingAds.map((ad: any) => 
  `- "${ad.name}": ${ad.roas.toFixed(2)}x ROAS, $${ad.spend.toFixed(2)} spend, ${ad.clicks} clicks, CTR ${ad.ctr.toFixed(2)}%`
).join('\n') : 'No high-performing ads identified'}

UNDERPERFORMING ADS (ROAS < 1x with $50+ spend):
${underperformingAds.length > 0 ? underperformingAds.map((ad: any) => 
  `- "${ad.name}": ${ad.roas.toFixed(2)}x ROAS, $${ad.spend.toFixed(2)} spend - consider pausing or optimizing`
).join('\n') : 'No significantly underperforming ads'}

ADS WITH APPROVAL ISSUES:
${disapprovedAds.length > 0 ? disapprovedAds.slice(0, 10).map((ad: any) => 
  `- "${ad.name}": Status ${ad.approvalStatus} - needs attention`
).join('\n') : 'No ads with approval issues'}

BEST PERFORMING HEADLINES (from top ads):
${topPerformingAds.filter((ad: any) => ad.headlines).slice(0, 5).flatMap((ad: any) => 
  ad.headlines?.slice(0, 2).map((h: string) => `- "${h}" (from ${ad.name}, ROAS: ${ad.roas.toFixed(2)}x)`) || []
).join('\n') || 'No headline data available'}
` : 'No individual ad data available yet. Click "Sync Data" to fetch ad details.'}
` : hasConnectedAccounts ? `
The user has connected their ad accounts but data is still syncing. Ask them to click "Sync Data" in Settings if they haven't already.
` : `
⚠️ NO CAMPAIGN DATA CONNECTED YET

The user needs to:
1. Connect their ad platform accounts in Settings (Google Ads, Meta Ads, LinkedIn Ads)
2. Click "Sync Data" button after connecting accounts
3. Wait for data to populate

Guide them to connect their accounts first.`}

You have access to DETAILED DATA at multiple levels:
- CAMPAIGN level: budgets, status, overall performance
- AD GROUP level: targeting groups, bidding strategies, ad group performance
- INDIVIDUAL AD level: headlines, descriptions, URLs, approval status, ad-specific metrics

You should:
- Provide actionable insights about campaign, ad group, AND ad performance
- Identify specific ads or ad groups that are performing well or poorly
- Suggest specific optimizations (pause this ad, increase bid on this ad group, etc.)
- Analyze ad copy effectiveness - which headlines/descriptions are working
- Flag any ads with approval issues
- Explain metrics like ROAS, CTR, CPA, CPC, and conversions at each level
- Compare platforms when asked
- When asked "how many campaigns" for a platform, use CAMPAIGN INVENTORY COUNTS / platform inventory lists (not spend-ranked subsets)
- Be concise but thorough
- Use specific numbers from their actual data - always cite real figures
- If they have data, proactively highlight interesting patterns or concerns
- Recommend specific actions: which campaigns to scale, pause, or optimize
- When discussing a specific client, reference their full performance data
- Compare performance across ad groups within campaigns
- Be specific - reference actual ad names, headlines, and metrics
- Suggest budget reallocation based on performance data
- Alert about any campaigns that need immediate attention (high spend, low ROAS)

${customInstructions ? `
USER'S CUSTOM INSTRUCTIONS (follow these preferences):
${customInstructions}
` : ''}`;

    console.log(`Chat request: UI model="${model}" -> Gateway model="${gatewayModelId}"`);

    // Use AI SDK with Vercel AI Gateway
    const result = await generateText({
      model: gateway(gatewayModelId),
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    return NextResponse.json({ message: result.text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    console.error('Error details:', JSON.stringify({
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack?.split('\n').slice(0, 5),
    }, null, 2));
    
    // Provide more helpful error message
    let errorMessage = 'Failed to process chat message';
    if (error.message?.includes('model')) {
      errorMessage = `Model error: The selected model may not be available. Try a different model.`;
    } else if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      errorMessage = 'API key error: Please check your AI_GATEWAY_API_KEY configuration.';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    );
  }
}
