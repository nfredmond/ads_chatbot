import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to find tenant_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.tenant_id) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    // Get client info from campaigns
    const { data: clientCampaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, campaign_name, platform, status, budget_amount, customer_id, customer_name')
      .eq('tenant_id', profile.tenant_id)
      .eq('customer_id', clientId);

    if (campaignsError) {
      console.error('Error fetching client campaigns:', campaignsError);
      return NextResponse.json({ error: 'Failed to fetch client data' }, { status: 500 });
    }

    if (!clientCampaigns || clientCampaigns.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const clientInfo = {
      id: clientId,
      name: clientCampaigns[0].customer_name || 'Unknown Client',
      platform: clientCampaigns[0].platform || 'google_ads',
    };

    // Get campaign IDs for this client
    const campaignIds = clientCampaigns.map(c => c.id);

    // Build metrics query
    let metricsQuery = supabase
      .from('campaign_metrics')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .in('campaign_id', campaignIds);

    if (startDate) {
      metricsQuery = metricsQuery.gte('date', startDate);
    }
    if (endDate) {
      metricsQuery = metricsQuery.lte('date', endDate);
    }

    const { data: metrics, error: metricsError } = await metricsQuery;

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
      return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
    }

    // Calculate aggregated metrics
    const totalSpend = metrics?.reduce((sum, m) => sum + (m.spend || 0), 0) || 0;
    const totalRevenue = metrics?.reduce((sum, m) => sum + (m.revenue || 0), 0) || 0;
    const totalConversions = metrics?.reduce((sum, m) => sum + (m.conversions || 0), 0) || 0;
    const totalClicks = metrics?.reduce((sum, m) => sum + (m.clicks || 0), 0) || 0;
    const totalImpressions = metrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0;

    const aggregatedMetrics = {
      totalSpend,
      totalRevenue,
      totalConversions,
      totalClicks,
      totalImpressions,
      averageROAS: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
      convRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
    };

    // Group metrics by date for performance chart
    const metricsByDate = (metrics || []).reduce((acc, m) => {
      const date = m.date;
      if (!acc[date]) {
        acc[date] = { spend: 0, revenue: 0, clicks: 0, conversions: 0 };
      }
      acc[date].spend += m.spend || 0;
      acc[date].revenue += m.revenue || 0;
      acc[date].clicks += m.clicks || 0;
      acc[date].conversions += m.conversions || 0;
      return acc;
    }, {} as Record<string, { spend: number; revenue: number; clicks: number; conversions: number }>);

    type MetricData = { spend: number; revenue: number; clicks: number; conversions: number };
    const performanceData = (Object.entries(metricsByDate) as [string, MetricData][])
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
        ...data,
      }));

    // Calculate per-campaign metrics
    const campaignMetrics = clientCampaigns.map(campaign => {
      const campaignData = (metrics || []).filter(m => m.campaign_id === campaign.id);
      const spend = campaignData.reduce((sum, m) => sum + (m.spend || 0), 0);
      const revenue = campaignData.reduce((sum, m) => sum + (m.revenue || 0), 0);
      const conversions = campaignData.reduce((sum, m) => sum + (m.conversions || 0), 0);
      const clicks = campaignData.reduce((sum, m) => sum + (m.clicks || 0), 0);
      const impressions = campaignData.reduce((sum, m) => sum + (m.impressions || 0), 0);

      return {
        id: campaign.id,
        name: campaign.campaign_name,
        status: campaign.status || 'unknown',
        spend,
        revenue,
        conversions,
        clicks,
        impressions,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        cpc: clicks > 0 ? spend / clicks : 0,
        convRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
        roas: spend > 0 ? revenue / spend : 0,
      };
    }).sort((a, b) => b.spend - a.spend);

    // Get all clients for switcher
    const { data: allCustomers, error: customersError } = await supabase
      .from('campaigns')
      .select('customer_id, customer_name, platform')
      .eq('tenant_id', profile.tenant_id)
      .not('customer_id', 'is', null);

    // Deduplicate customers
    const uniqueCustomers = Array.from(
      new Map((allCustomers || []).map(c => [c.customer_id, c])).values()
    ).map(c => ({
      id: c.customer_id,
      name: c.customer_name || c.customer_id,
      platform: c.platform,
    }));

    return NextResponse.json({
      client: clientInfo,
      metrics: aggregatedMetrics,
      performanceData,
      campaigns: campaignMetrics,
      allClients: uniqueCustomers,
    });
  } catch (error) {
    console.error('Client API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
