import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, MousePointerClick, TrendingUp, Eye } from 'lucide-react'

interface MetricsOverviewProps {
  metrics: {
    totalSpend: number
    totalConversions: number
    averageROAS: number
    totalImpressions: number
  }
}

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const cards = [
    {
      title: 'Total Ad Spend',
      value: `$${metrics.totalSpend.toLocaleString()}`,
      icon: DollarSign,
      change: '+12.3%',
      positive: false,
    },
    {
      title: 'Total Conversions',
      value: metrics.totalConversions.toLocaleString(),
      icon: MousePointerClick,
      change: '+23.1%',
      positive: true,
    },
    {
      title: 'Average ROAS',
      value: `${metrics.averageROAS.toFixed(1)}x`,
      icon: TrendingUp,
      change: '+8.7%',
      positive: true,
    },
    {
      title: 'Total Impressions',
      value: (metrics.totalImpressions / 1000000).toFixed(2) + 'M',
      icon: Eye,
      change: '+15.2%',
      positive: true,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p
              className={`text-xs ${
                card.positive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {card.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

