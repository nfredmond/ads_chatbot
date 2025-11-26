/**
 * Ads Data Integration Layer
 * Fetches real campaign data from Supabase for the AI assistant
 */

import { getSupabaseClient } from './supabase.js';

export interface AdAccount {
  id: string;
  platform: 'google_ads' | 'meta_ads' | 'linkedin_ads';
  account_id: string;
  account_name: string;
  status: string;
  tenant_id: string;
}

export interface Campaign {
  id: string;
  campaign_id: string;
  campaign_name: string;
  platform: string;
  status: string;
  budget_amount: number | null;
  tenant_id: string;
}

export interface CampaignMetric {
  id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}

export interface PlatformSummary {
  platform: string;
  totalSpend: number;
  totalRevenue: number;
  totalConversions: number;
  totalImpressions: number;
  totalClicks: number;
  roas: number;
  ctr: number;
  campaignCount: number;
}

export interface UserDataContext {
  userId: string;
  tenantId: string;
  fullName: string;
  adAccounts: AdAccount[];
  campaigns: Campaign[];
  recentMetrics: CampaignMetric[];
  platformSummaries: PlatformSummary[];
  overallStats: {
    totalSpend: number;
    totalRevenue: number;
    totalConversions: number;
    totalImpressions: number;
    totalClicks: number;
    avgRoas: number;
    avgCtr: number;
    campaignCount: number;
  };
}

/**
 * Fetch all connected ad accounts for a tenant
 */
export async function getConnectedAdAccounts(tenantId: string): Promise<AdAccount[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('ad_accounts')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching ad accounts:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all campaigns for a tenant
 */
export async function getCampaigns(tenantId: string, platform?: string): Promise<Campaign[]> {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('campaigns')
    .select('*')
    .eq('tenant_id', tenantId);

  if (platform) {
    query = query.eq('platform', platform);
  }

  const { data, error } = await query.order('budget_amount', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch campaign metrics for a date range
 */
export async function getCampaignMetrics(
  tenantId: string,
  options: {
    campaignId?: string;
    platform?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}
): Promise<CampaignMetric[]> {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('campaign_metrics')
    .select('*')
    .eq('tenant_id', tenantId);

  if (options.campaignId) {
    query = query.eq('campaign_id', options.campaignId);
  }

  if (options.startDate) {
    query = query.gte('date', options.startDate);
  }

  if (options.endDate) {
    query = query.lte('date', options.endDate);
  }

  query = query
    .order('date', { ascending: false })
    .limit(options.limit || 100);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching metrics:', error);
    return [];
  }

  return data || [];
}

/**
 * Calculate platform-level summaries
 */
export function calculatePlatformSummaries(
  campaigns: Campaign[],
  metrics: CampaignMetric[]
): PlatformSummary[] {
  const campaignPlatformMap = new Map<string, string>();
  campaigns.forEach(c => campaignPlatformMap.set(c.id, c.platform));

  const platformData: Record<string, {
    spend: number;
    revenue: number;
    conversions: number;
    impressions: number;
    clicks: number;
    campaigns: Set<string>;
  }> = {};

  metrics.forEach(metric => {
    const platform = campaignPlatformMap.get(metric.campaign_id) || 'unknown';
    
    if (!platformData[platform]) {
      platformData[platform] = {
        spend: 0,
        revenue: 0,
        conversions: 0,
        impressions: 0,
        clicks: 0,
        campaigns: new Set(),
      };
    }

    platformData[platform].spend += Number(metric.spend) || 0;
    platformData[platform].revenue += Number(metric.revenue) || 0;
    platformData[platform].conversions += metric.conversions || 0;
    platformData[platform].impressions += metric.impressions || 0;
    platformData[platform].clicks += metric.clicks || 0;
    platformData[platform].campaigns.add(metric.campaign_id);
  });

  return Object.entries(platformData).map(([platform, data]) => ({
    platform: platform.replace('_ads', '').toUpperCase(),
    totalSpend: data.spend,
    totalRevenue: data.revenue,
    totalConversions: data.conversions,
    totalImpressions: data.impressions,
    totalClicks: data.clicks,
    roas: data.spend > 0 ? data.revenue / data.spend : 0,
    ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
    campaignCount: data.campaigns.size,
  }));
}

/**
 * Get complete user data context for AI assistant
 */
export async function getUserDataContext(tenantId: string, userId: string): Promise<UserDataContext | null> {
  const supabase = getSupabaseClient();

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single();

  // Fetch all data in parallel
  const [adAccounts, campaigns, recentMetrics] = await Promise.all([
    getConnectedAdAccounts(tenantId),
    getCampaigns(tenantId),
    getCampaignMetrics(tenantId, { limit: 200 }),
  ]);

  const platformSummaries = calculatePlatformSummaries(campaigns, recentMetrics);

  // Calculate overall stats
  const totalSpend = recentMetrics.reduce((sum, m) => sum + (Number(m.spend) || 0), 0);
  const totalRevenue = recentMetrics.reduce((sum, m) => sum + (Number(m.revenue) || 0), 0);
  const totalConversions = recentMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
  const totalImpressions = recentMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
  const totalClicks = recentMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0);

  return {
    userId,
    tenantId,
    fullName: profile?.full_name || 'User',
    adAccounts,
    campaigns,
    recentMetrics,
    platformSummaries,
    overallStats: {
      totalSpend,
      totalRevenue,
      totalConversions,
      totalImpressions,
      totalClicks,
      avgRoas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      campaignCount: campaigns.length,
    },
  };
}

/**
 * Get a specific campaign with its metrics
 */
export async function getCampaignDetails(
  tenantId: string,
  campaignNameOrId: string
): Promise<{ campaign: Campaign | null; metrics: CampaignMetric[] }> {
  const supabase = getSupabaseClient();

  // Try to find by name (partial match) or ID
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('tenant_id', tenantId)
    .or(`campaign_name.ilike.%${campaignNameOrId}%,campaign_id.eq.${campaignNameOrId},id.eq.${campaignNameOrId}`);

  if (!campaigns || campaigns.length === 0) {
    return { campaign: null, metrics: [] };
  }

  const campaign = campaigns[0];
  const metrics = await getCampaignMetrics(tenantId, { campaignId: campaign.id });

  return { campaign, metrics };
}

/**
 * Compare performance across platforms
 */
export async function comparePlatforms(tenantId: string): Promise<{
  comparison: PlatformSummary[];
  insights: string[];
}> {
  const campaigns = await getCampaigns(tenantId);
  const metrics = await getCampaignMetrics(tenantId);
  const platformSummaries = calculatePlatformSummaries(campaigns, metrics);

  const insights: string[] = [];

  // Generate automatic insights
  if (platformSummaries.length > 1) {
    const sorted = [...platformSummaries].sort((a, b) => b.roas - a.roas);
    if (sorted[0].roas > 0) {
      insights.push(`${sorted[0].platform} has the highest ROAS at ${sorted[0].roas.toFixed(2)}x`);
    }

    const highestCtr = [...platformSummaries].sort((a, b) => b.ctr - a.ctr)[0];
    if (highestCtr.ctr > 0) {
      insights.push(`${highestCtr.platform} has the best CTR at ${highestCtr.ctr.toFixed(2)}%`);
    }

    const highestSpend = [...platformSummaries].sort((a, b) => b.totalSpend - a.totalSpend)[0];
    insights.push(`${highestSpend.platform} has the highest spend at $${highestSpend.totalSpend.toFixed(2)}`);
  }

  return { comparison: platformSummaries, insights };
}

