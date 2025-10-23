'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CampaignPerformanceProps {
  tenantId: string | null
}

export function CampaignPerformance({ tenantId }: CampaignPerformanceProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      const { data: metricsData } = await supabase
        .from('campaign_metrics')
        .select('date, spend, revenue, conversions')
        .eq('tenant_id', tenantId)
        .order('date', { ascending: true })
        .limit(30)

      if (metricsData && metricsData.length > 0) {
        const formattedData = metricsData.map((m) => ({
          date: new Date(m.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
          spend: Number(m.spend) || 0,
          revenue: Number(m.revenue) || 0,
          conversions: m.conversions || 0,
        }))
        setData(formattedData)
      }
      setLoading(false)
    }

    fetchData()
  }, [tenantId])

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white">Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2">No campaign data available yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Connect your ad platforms to start tracking performance
            </p>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
              <XAxis dataKey="date" className="dark:fill-gray-400" />
              <YAxis className="dark:fill-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                }}
              />
            <Legend />
            <Line
              type="monotone"
              dataKey="spend"
              stroke="#ef4444"
              strokeWidth={2}
              name="Spend ($)"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              name="Revenue ($)"
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

