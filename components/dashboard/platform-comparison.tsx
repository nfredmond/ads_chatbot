'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PlatformStats {
  spend: number
  conversions: number
  revenue: number
}

interface PlatformData {
  platform: string
  spend: number
  conversions: number
  roas: number
}

interface PlatformComparisonProps {
  tenantId: string | null
  connectedPlatforms: {
    google: boolean
    meta: boolean
    linkedin: boolean
  }
}

export function PlatformComparison({ tenantId }: PlatformComparisonProps) {
  const [data, setData] = useState<PlatformData[]>([])
  const [loading, setLoading] = useState(!!tenantId)
  const supabase = useMemo(() => createClient(), [])

  const fetchData = useCallback(async () => {
    if (!tenantId) return
    
    setLoading(true)
    // Get campaigns grouped by platform
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, platform')
      .eq('tenant_id', tenantId)

    if (campaigns && campaigns.length > 0) {
      const platformStats: Record<string, PlatformStats> = {}

      for (const campaign of campaigns) {
        const { data: metrics } = await supabase
          .from('campaign_metrics')
          .select('spend, conversions, revenue')
          .eq('campaign_id', campaign.id)

        if (metrics) {
          const platformName = campaign.platform.replace('_', ' ')
          if (!platformStats[platformName]) {
            platformStats[platformName] = { spend: 0, conversions: 0, revenue: 0 }
          }
          metrics.forEach((m) => {
            platformStats[platformName].spend += Number(m.spend) || 0
            platformStats[platformName].conversions += Number(m.conversions) || 0
            platformStats[platformName].revenue += Number(m.revenue) || 0
          })
        }
      }

      const formattedData = Object.entries(platformStats).map(([platform, stats]) => ({
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        spend: stats.spend,
        conversions: stats.conversions,
        roas: stats.spend > 0 ? stats.revenue / stats.spend : 0,
      }))

      setData(formattedData)
    }
    setLoading(false)
  }, [tenantId, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white">Platform Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2">No platform data available yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Connect your ad platforms and sync campaign data to see comparisons
            </p>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
              <XAxis dataKey="platform" className="dark:fill-gray-400" />
              <YAxis className="dark:fill-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                }}
              />
            <Legend />
            <Bar dataKey="spend" fill="#3b82f6" name="Spend ($)" />
            <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
          </BarChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

