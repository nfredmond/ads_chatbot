'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, CheckCircle, Clock, Zap, Shield, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function SetupHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Platform Setup Guides
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Step-by-step instructions to connect Google Ads, Meta Ads, and LinkedIn Ads to your dashboard
          </p>
        </div>

        {/* Feature Overview */}
        <Card className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="pt-8 pb-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-90" />
                <h3 className="font-bold mb-2">Enterprise Security</h3>
                <p className="text-sm opacity-90">
                  AES-256 encryption, OAuth 2.0, CSRF protection
                </p>
              </div>
              <div>
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-90" />
                <h3 className="font-bold mb-2">Real Data Only</h3>
                <p className="text-sm opacity-90">
                  No dummy data - only your actual campaigns
                </p>
              </div>
              <div>
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-90" />
                <h3 className="font-bold mb-2">Production Ready</h3>
                <p className="text-sm opacity-90">
                  Auto rate limiting, caching, error handling
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Google Ads */}
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-400">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg">Google Ads</CardTitle>
                  <Badge className="bg-green-600 mt-1">Easiest</Badge>
                </div>
              </div>
              <CardDescription>
                Search advertising with automatic token refresh
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Approval: 1-2 weeks</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">Tokens never expire</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="text-gray-600 dark:text-gray-400">15K ops/day (Basic)</span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 mb-4">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>What you need:</strong> OAuth Client ID, Client Secret, Developer Token, Customer ID
                </p>
              </div>

              <Link href="/setup/google-ads">
                <Button className="w-full gap-2" variant="default">
                  View Setup Guide
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Meta Ads */}
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-purple-400">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-800/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg">Meta Ads</CardTitle>
                  <Badge className="bg-purple-600 mt-1">Recommended</Badge>
                </div>
              </div>
              <CardDescription>
                Facebook & Instagram with webhooks
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Approval: 1-2 weeks</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">Real-time webhooks</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="text-gray-600 dark:text-gray-400">60-day tokens</span>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-3 mb-4">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>What you need:</strong> App ID, App Secret (Auto-fetches account ID via OAuth)
                </p>
              </div>

              <Link href="/setup/meta-ads">
                <Button className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  View Setup Guide
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* LinkedIn Ads */}
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-indigo-400">
            <CardHeader className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-800/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg">LinkedIn Ads</CardTitle>
                  <Badge className="bg-orange-600 mt-1">Advanced</Badge>
                </div>
              </div>
              <CardDescription>
                B2B professional targeting
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Approval: Weeks-months</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-600 dark:text-gray-400">24-hour data delay</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="text-gray-600 dark:text-gray-400">60-day tokens</span>
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded p-3 mb-4">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>What you need:</strong> Client ID, Client Secret, Company Page (verified)
                </p>
              </div>

              <Link href="/setup/linkedin-ads">
                <Button className="w-full gap-2 bg-blue-700 hover:bg-blue-800">
                  View Setup Guide
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Platform Comparison</CardTitle>
            <CardDescription>Choose the right platforms for your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Feature</th>
                    <th className="text-left p-3 font-semibold">Google Ads</th>
                    <th className="text-left p-3 font-semibold">Meta Ads</th>
                    <th className="text-left p-3 font-semibold">LinkedIn Ads</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr className="border-b">
                    <td className="p-3 font-medium">Best For</td>
                    <td className="p-3">Search intent</td>
                    <td className="p-3">Social, B2C</td>
                    <td className="p-3">B2B, professionals</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Setup Time</td>
                    <td className="p-3"><Badge variant="outline" className="bg-green-50">1-2 weeks</Badge></td>
                    <td className="p-3"><Badge variant="outline" className="bg-green-50">1-2 weeks</Badge></td>
                    <td className="p-3"><Badge variant="outline" className="bg-orange-50">Weeks-months</Badge></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Token Refresh</td>
                    <td className="p-3"><span className="text-green-600">✅ Automatic</span></td>
                    <td className="p-3"><span className="text-orange-600">⚠️ Manual (60d)</span></td>
                    <td className="p-3"><span className="text-orange-600">⚠️ Manual (60d)</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Data Freshness</td>
                    <td className="p-3">Few hours</td>
                    <td className="p-3">Real-time</td>
                    <td className="p-3">24h delay</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Webhooks</td>
                    <td className="p-3">❌ No</td>
                    <td className="p-3"><span className="text-green-600">✅ Yes</span></td>
                    <td className="p-3">⚠️ Limited</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Credentials Needed</td>
                    <td className="p-3">4 items</td>
                    <td className="p-3">2 items</td>
                    <td className="p-3">2 items</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start Recommendations */}
        <Card className="mb-12 border-2 border-blue-400 dark:border-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Recommended Setup Order
            </CardTitle>
            <CardDescription>Follow this order for smoothest experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Start with Google Ads</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Easiest setup, automatic token refresh, good for testing the system. If you run search ads, start here.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Add Meta Ads</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Similar approval time, only needs 2 credentials, real-time webhooks. Great for B2C and social campaigns.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-700 text-white rounded-full font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Finally, LinkedIn Ads</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Longest approval, 24h data delay, but essential for B2B. Apply early and be patient.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Questions */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>❓ Common Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-1">Do I need all three platforms?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No! Connect only the platforms where you run campaigns. Each platform is independent.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm mb-1">How long does setup take?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Google & Meta: 1-2 weeks for approval + 15 minutes for OAuth setup.
                  LinkedIn: Weeks to months for approval + 15 minutes for OAuth.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm mb-1">Will I see dummy data?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No! This app only shows real data from your campaigns. If APIs aren't connected, you'll see a message to connect them.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm mb-1">What happens when tokens expire?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Google: Auto-refreshes (you do nothing).
                  Meta & LinkedIn: Email reminder 7 days before, then you reconnect via Settings (takes 1 minute).
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm mb-1">Is my data secure?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yes! All tokens are encrypted with AES-256-GCM before storage. OAuth uses CSRF protection. 
                  Industry-standard security practices throughout.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Let's Get Started!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Choose a platform above to view detailed setup instructions, or head to Settings to start connecting your accounts.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard/settings">
              <Button size="lg" className="gap-2">
                <Shield className="w-4 h-4" />
                Go to Settings
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

