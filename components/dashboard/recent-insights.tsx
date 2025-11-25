'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Insight {
  id: string
  title: string
  description: string
  insight_type: string
  priority: 'high' | 'medium' | 'low'
  status: string
  created_at: string
}

interface RecentInsightsProps {
  tenantId: string | null
}

export function RecentInsights({ tenantId }: RecentInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(!!tenantId)
  const supabase = useMemo(() => createClient(), [])

  const fetchInsights = useCallback(async () => {
    if (!tenantId) return
    
    setLoading(true)
    const { data } = await supabase
      .from('insights')
      .select('*')
      .eq('tenant_id', tenantId)
      .in('status', ['new', 'viewed'])
      .order('created_at', { ascending: false })
      .limit(5)

    if (data) setInsights(data as Insight[])
    setLoading(false)
  }, [tenantId, supabase])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  const getIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return TrendingUp
      case 'warning':
        return AlertTriangle
      case 'trend':
        return Lightbulb
      default:
        return AlertCircle
    }
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  }

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white">AI-Generated Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading insights...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="py-8 text-center">
            <Lightbulb className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No insights available yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Start syncing campaign data to receive AI-powered recommendations
            </p>
          </div>
        ) : (
        <div className="space-y-4">
            {insights.map((insight) => {
              const Icon = getIcon(insight.insight_type)
            return (
                <div
                  key={insight.id}
                  className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                <div className="flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-semibold dark:text-white">{insight.title}</h4>
                    <Badge
                      variant="secondary"
                      className={priorityColors[insight.priority as keyof typeof priorityColors]}
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{insight.description}</p>
                </div>
              </div>
            )
          })}
        </div>
        )}
      </CardContent>
    </Card>
  )
}

