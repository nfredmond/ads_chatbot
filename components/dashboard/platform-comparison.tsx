'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const sampleData = [
  { platform: 'Google Ads', spend: 5200, conversions: 145, roas: 4.2 },
  { platform: 'Meta Ads', spend: 4800, conversions: 112, roas: 3.5 },
  { platform: 'LinkedIn Ads', spend: 2450, conversions: 67, roas: 3.8 },
]

export function PlatformComparison() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="platform" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="spend" fill="#3b82f6" name="Spend ($)" />
            <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

