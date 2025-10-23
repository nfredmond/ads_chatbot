import { createClient } from '@/lib/supabase/server'
import { MetricsOverview } from '@/components/dashboard/metrics-overview'
import { CampaignPerformance } from '@/components/dashboard/campaign-performance'
import { PlatformComparison } from '@/components/dashboard/platform-comparison'
import { RecentInsights } from '@/components/dashboard/recent-insights'
import { ConnectionStatus } from '@/components/dashboard/connection-status'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user's profile to fetch tenant_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, full_name')
    .eq('id', user?.id)
    .single()

  const tenantId = profile?.tenant_id

  // Get connected ad accounts
  const { data: adAccounts } = await supabase
    .from('ad_accounts')
    .select('platform, status')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')

  const connectedPlatforms = {
    google: adAccounts?.some((acc) => acc.platform === 'google_ads') || false,
    meta: adAccounts?.some((acc) => acc.platform === 'meta_ads') || false,
    linkedin: adAccounts?.some((acc) => acc.platform === 'linkedin_ads') || false,
  }

  // Fetch real metrics from campaign_metrics table
  const { data: metricsData } = await supabase
    .from('campaign_metrics')
    .select('impressions, clicks, conversions, spend, revenue')
    .eq('tenant_id', tenantId)

  // Calculate aggregated metrics
  const metrics = metricsData && metricsData.length > 0 ? {
    totalSpend: metricsData.reduce((sum, m) => sum + (Number(m.spend) || 0), 0),
    totalConversions: metricsData.reduce((sum, m) => sum + (m.conversions || 0), 0),
    averageROAS: metricsData.reduce((sum, m) => sum + (Number(m.revenue) || 0), 0) / 
                 Math.max(metricsData.reduce((sum, m) => sum + (Number(m.spend) || 0), 0), 1),
    totalImpressions: metricsData.reduce((sum, m) => sum + (m.impressions || 0), 0),
  } : {
    totalSpend: 0,
    totalConversions: 0,
    averageROAS: 0,
    totalImpressions: 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
          {profile?.full_name && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {profile.full_name}!
            </p>
          )}
        </div>
      </div>

      <ConnectionStatus connectedPlatforms={connectedPlatforms} />

      <MetricsOverview metrics={metrics} hasData={!!(metricsData && metricsData.length > 0)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CampaignPerformance tenantId={tenantId || null} />
        <PlatformComparison tenantId={tenantId || null} connectedPlatforms={connectedPlatforms} />
      </div>

      <RecentInsights tenantId={tenantId || null} />
    </div>
  )
}

