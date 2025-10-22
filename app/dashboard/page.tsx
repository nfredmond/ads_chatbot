import { createClient } from '@/lib/supabase/server'
import { MetricsOverview } from '@/components/dashboard/metrics-overview'
import { CampaignPerformance } from '@/components/dashboard/campaign-performance'
import { PlatformComparison } from '@/components/dashboard/platform-comparison'
import { RecentInsights } from '@/components/dashboard/recent-insights'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user's profile to fetch tenant_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user?.id)
    .single()

  // Fetch sample data (in production, this would be real data)
  const metrics = {
    totalSpend: 12450.0,
    totalConversions: 324,
    averageROAS: 3.8,
    totalImpressions: 1245000,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <MetricsOverview metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CampaignPerformance />
        <PlatformComparison />
      </div>

      <RecentInsights />
    </div>
  )
}

