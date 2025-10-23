'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Check, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

interface ConnectionStatusProps {
  connectedPlatforms: {
    google: boolean
    meta: boolean
    linkedin: boolean
  }
}

export function ConnectionStatus({ connectedPlatforms }: ConnectionStatusProps) {
  const platforms = [
    { name: 'Google Ads', key: 'google', connected: connectedPlatforms.google },
    { name: 'Meta Ads', key: 'meta', connected: connectedPlatforms.meta },
    { name: 'LinkedIn Ads', key: 'linkedin', connected: connectedPlatforms.linkedin },
  ]

  const allConnected = platforms.every((p) => p.connected)
  const noneConnected = platforms.every((p) => !p.connected)

  if (noneConnected) {
    return (
      <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
        <CardHeader>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div className="flex-1">
              <CardTitle className="text-orange-900 dark:text-orange-100">
                No Ad Platforms Connected
              </CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                Connect at least one advertising platform to start tracking your campaigns and get AI-powered insights
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link href="/dashboard/settings">
                <LinkIcon className="w-4 h-4 mr-2" />
                Connect Ad Platforms
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/onboarding">Set Up Wizard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!allConnected) {
    return (
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Platform Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <Badge
                key={platform.key}
                variant={platform.connected ? 'default' : 'secondary'}
                className="flex items-center space-x-1"
              >
                {platform.connected ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                <span>{platform.name}</span>
              </Badge>
            ))}
            <Button size="sm" variant="ghost" asChild className="ml-auto">
              <Link href="/dashboard/settings">Manage</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null // All connected, no need to show banner
}

