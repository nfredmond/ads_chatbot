'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const sampleData = [
  { date: '10/15', spend: 420, conversions: 12, revenue: 1680 },
  { date: '10/16', spend: 380, conversions: 15, revenue: 2100 },
  { date: '10/17', spend: 450, conversions: 18, revenue: 2520 },
  { date: '10/18', spend: 390, conversions: 14, revenue: 1960 },
  { date: '10/19', spend: 480, conversions: 20, revenue: 2800 },
  { date: '10/20', spend: 510, conversions: 22, revenue: 3080 },
  { date: '10/21', spend: 440, conversions: 16, revenue: 2240 },
]

export function CampaignPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
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
      </CardContent>
    </Card>
  )
}

