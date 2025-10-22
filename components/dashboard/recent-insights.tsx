import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'

const sampleInsights = [
  {
    type: 'opportunity',
    priority: 'high',
    title: 'Google Ads campaign showing strong performance',
    description: 'Your "Summer Sale" campaign has achieved 4.5x ROAS. Consider increasing budget by 20%.',
    icon: TrendingUp,
  },
  {
    type: 'warning',
    priority: 'medium',
    title: 'Meta Ads CTR declining',
    description: 'Click-through rate dropped 15% this week. Review ad creative and targeting.',
    icon: AlertTriangle,
  },
  {
    type: 'trend',
    priority: 'low',
    title: 'LinkedIn engagement increasing',
    description: 'Professional audience engagement up 32%. B2B campaigns performing well.',
    icon: Lightbulb,
  },
]

export function RecentInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Generated Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sampleInsights.map((insight, index) => {
            const Icon = insight.icon
            const priorityColors = {
              high: 'bg-red-100 text-red-800',
              medium: 'bg-yellow-100 text-yellow-800',
              low: 'bg-blue-100 text-blue-800',
            }

            return (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Icon className="w-5 h-5 text-blue-600 mt-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-semibold">{insight.title}</h4>
                    <Badge
                      variant="secondary"
                      className={priorityColors[insight.priority as keyof typeof priorityColors]}
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

