'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, MousePointerClick, TrendingUp, Eye, MessageSquare, Settings, LayoutDashboard, Check, Lightbulb } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts'
import Link from 'next/link'

const performanceData = [
  { date: '10/15', spend: 2450, revenue: 8820, conversions: 42 },
  { date: '10/16', spend: 2680, revenue: 9540, conversions: 48 },
  { date: '10/17', spend: 2320, revenue: 8120, conversions: 38 },
  { date: '10/18', spend: 2890, revenue: 10280, conversions: 52 },
  { date: '10/19', spend: 3120, revenue: 11780, conversions: 58 },
  { date: '10/20', spend: 2780, revenue: 9940, conversions: 46 },
  { date: '10/21', spend: 2540, revenue: 9180, conversions: 44 },
  { date: '10/22', spend: 2960, revenue: 10640, conversions: 54 },
  { date: '10/23', spend: 3240, revenue: 12480, conversions: 62 },
  { date: '10/24', spend: 2880, revenue: 10360, conversions: 50 },
  { date: '10/25', spend: 3080, revenue: 11540, conversions: 56 },
  { date: '10/26', spend: 3420, revenue: 13680, conversions: 68 },
  { date: '10/27', spend: 3180, revenue: 12240, conversions: 60 },
  { date: '10/28', spend: 2940, revenue: 10580, conversions: 52 },
  { date: '10/29', spend: 3360, revenue: 13440, conversions: 66 },
]

const platformData = [
  { platform: 'Google Ads', spend: 18420, conversions: 284, roas: 3.8 },
  { platform: 'Meta Ads', spend: 14680, conversions: 312, roas: 4.2 },
  { platform: 'LinkedIn Ads', spend: 8240, conversions: 98, roas: 2.4 },
]

const insights = [
  { type: 'success', title: 'Strong ROAS Performance', description: 'Meta Ads campaigns are exceeding target ROAS by 23%. Consider increasing budget allocation.', platform: 'Meta Ads' },
  { type: 'warning', title: 'Rising CPC Trend', description: 'Google Ads CPC has increased 12% over the past week. Review keyword bidding strategy.', platform: 'Google Ads' },
  { type: 'info', title: 'New Audience Opportunity', description: 'LinkedIn B2B campaigns show strong engagement from Tech Industry executives.', platform: 'LinkedIn Ads' },
]

export default function DemoPage() {
  const metrics = { totalSpend: 41340, totalConversions: 694, averageROAS: 3.72, totalImpressions: 2847320 }
  const formatCurrency = (num: number) => `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatNumber = (num: number) => num.toLocaleString()
  const formatImpressions = (num: number) => num >= 1000000 ? (num / 1000000).toFixed(2) + 'M' : num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num.toString()
  const metricCards = [
    { title: 'Total Ad Spend', value: formatCurrency(metrics.totalSpend), icon: DollarSign, change: '+8.2%', positive: false },
    { title: 'Total Conversions', value: formatNumber(metrics.totalConversions), icon: MousePointerClick, change: '+15.4%', positive: true },
    { title: 'Average ROAS', value: `${metrics.averageROAS.toFixed(1)}x`, icon: TrendingUp, change: '+0.3x', positive: true },
    { title: 'Total Impressions', value: formatImpressions(metrics.totalImpressions), icon: Eye, change: '+12.1%', positive: true },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Marketing Analytics</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/demo"><Button variant="ghost" size="sm" className="text-blue-600"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</Button></Link>
            <Link href="/demo/chat"><Button variant="ghost" size="sm"><MessageSquare className="w-4 h-4 mr-2" />AI Chat</Button></Link>
            <Link href="/demo/settings"><Button variant="ghost" size="sm"><Settings className="w-4 h-4 mr-2" />Settings</Button></Link>
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">MS</div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Mike Strickler</span>
            </div>
          </div>
        </div>
      </nav>
      <main className="p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, Mike Strickler!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Longitude 122 Marketing</p>
              <p className="text-xs text-gray-400">Last synced: Nov 25, 2025 at 2:30 PM</p>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-800 dark:text-green-200 font-medium">All Ad Platforms Connected</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-white dark:bg-gray-800 border-green-500 text-green-600"><Check className="w-3 h-3 mr-1" /> Google Ads</Badge>
                <Badge variant="outline" className="bg-white dark:bg-gray-800 border-green-500 text-green-600"><Check className="w-3 h-3 mr-1" /> Meta Ads</Badge>
                <Badge variant="outline" className="bg-white dark:bg-gray-800 border-green-500 text-green-600"><Check className="w-3 h-3 mr-1" /> LinkedIn Ads</Badge>
              </div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((card, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</CardTitle>
                  <card.icon className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
                  <p className={`text-xs ${card.positive ? 'text-green-600' : 'text-amber-600'}`}>{card.change} from last month</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader><CardTitle className="text-gray-900 dark:text-white">Campaign Performance</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="spend" stroke="#ef4444" strokeWidth={2} name="Spend ($)" dot={false} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue ($)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader><CardTitle className="text-gray-900 dark:text-white">Platform Comparison</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="platform" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="spend" fill="#3b82f6" name="Spend ($)" />
                    <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <Lightbulb className="w-5 h-5 text-yellow-500" /><span>AI-Generated Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : insight.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
                    <div className="flex items-start justify-between">
                      <div><h4 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h4><p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p></div>
                      <Badge variant="outline">{insight.platform}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

