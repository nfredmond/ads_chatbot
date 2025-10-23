import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, MousePointerClick, TrendingUp, Eye } from 'lucide-react'

interface MetricsOverviewProps {
  metrics: {
    totalSpend: number
    totalConversions: number
    averageROAS: number
    totalImpressions: number
  }
  hasData: boolean
}

export function MetricsOverview({ metrics, hasData }: MetricsOverviewProps) {
  const formatNumber = (num: number) => {
    if (!hasData) return '–'
    return num.toLocaleString()
  }

  const formatCurrency = (num: number) => {
    if (!hasData) return '$–'
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatROAS = (num: number) => {
    if (!hasData) return '–'
    return `${num.toFixed(1)}x`
  }

  const formatImpressions = (num: number) => {
    if (!hasData) return '–'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const cards = [
    {
      title: 'Total Ad Spend',
      value: formatCurrency(metrics.totalSpend),
      icon: DollarSign,
    },
    {
      title: 'Total Conversions',
      value: formatNumber(metrics.totalConversions),
      icon: MousePointerClick,
    },
    {
      title: 'Average ROAS',
      value: formatROAS(metrics.averageROAS),
      icon: TrendingUp,
    },
    {
      title: 'Total Impressions',
      value: formatImpressions(metrics.totalImpressions),
      icon: Eye,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{card.value}</div>
            {!hasData && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No data available yet
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

