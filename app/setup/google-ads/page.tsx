'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, ExternalLink, ArrowRight, AlertCircle, Key, Shield, Clock } from 'lucide-react'
import Link from 'next/link'

export default function GoogleAdsSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Google Ads API Setup Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Complete step-by-step guide to connect your Google Ads account and start tracking campaigns
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  ⚠️ Manager Account Required
                </h3>
                <p className="text-yellow-800 dark:text-yellow-200 text-sm leading-relaxed">
                  You <strong>MUST</strong> have a Google Ads Manager Account (MCC) to obtain a developer token. 
                  Standard Google Ads accounts cannot get developer tokens. This is a hard requirement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timeline & Approval Process
            </CardTitle>
            <CardDescription>What to expect during setup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Badge className="bg-green-600 flex-shrink-0">Immediate</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Test Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create OAuth credentials and request developer token. Works with test accounts only.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-blue-600 flex-shrink-0">1-2 Weeks</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Basic Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    15,000 operations/day. Works with production accounts. Apply after testing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-purple-600 flex-shrink-0">2-4 Weeks</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Standard Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Unlimited operations. For larger-scale applications. Requires detailed review.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <div className="space-y-6">
          {/* Step 1 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold">
                  1
                </div>
                <div>
                  <CardTitle>Create Google Cloud Project</CardTitle>
                  <CardDescription>Set up your project in Google Cloud Console</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li className="pl-2">
                  Go to{' '}
                  <a
                    href="https://console.cloud.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Google Cloud Console
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li className="pl-2">Click <strong>"Select a Project"</strong> → <strong>"New Project"</strong></li>
                <li className="pl-2">Enter project name (e.g., "Marketing Analytics")</li>
                <li className="pl-2">Click <strong>"Create"</strong></li>
              </ol>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Enable the Google Ads API
                </h4>
                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
                  <li>In your project, go to <strong>"APIs & Services"</strong> → <strong>"Library"</strong></li>
                  <li>Search for <strong>"Google Ads API"</strong></li>
                  <li>Click on it and click <strong>"Enable"</strong></li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold">
                  2
                </div>
                <div>
                  <CardTitle>Create OAuth 2.0 Credentials</CardTitle>
                  <CardDescription>Get your Client ID and Client Secret</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li className="pl-2">Navigate to <strong>"APIs & Services"</strong> → <strong>"Credentials"</strong></li>
                <li className="pl-2">Click <strong>"Create Credentials"</strong> → <strong>"OAuth 2.0 Client ID"</strong></li>
                <li className="pl-2">
                  If prompted, configure the OAuth consent screen:
                  <ul className="ml-6 mt-2 space-y-1 list-disc">
                    <li>User Type: External</li>
                    <li>App name: Your app name</li>
                    <li>Support email: Your email</li>
                  </ul>
                </li>
                <li className="pl-2">Select <strong>"Web application"</strong> as application type</li>
                <li className="pl-2">
                  Add authorized redirect URIs:
                  <div className="mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-xs">
                    http://localhost:3000/auth/google<br />
                    https://yourdomain.com/auth/google
                  </div>
                </li>
                <li className="pl-2">Click <strong>"Create"</strong></li>
                <li className="pl-2">
                  Copy your credentials:
                  <ul className="ml-6 mt-2 space-y-1 list-disc">
                    <li><strong>Client ID</strong>: Ends with .apps.googleusercontent.com</li>
                    <li><strong>Client Secret</strong>: Starts with GOCSPX-</li>
                  </ul>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold">
                  3
                </div>
                <div>
                  <CardTitle>Get Developer Token</CardTitle>
                  <CardDescription>Requires Google Ads Manager Account (MCC)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="text-red-800 dark:text-red-200 text-sm font-semibold">
                  ⛔ You MUST have a Manager Account (MCC) - Standard accounts don't work!
                </p>
              </div>

              <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li className="pl-2">
                  Create a Manager Account at{' '}
                  <a
                    href="https://ads.google.com/home/tools/manager-accounts/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Google Ads Manager Accounts
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li className="pl-2">Sign in to your Manager Account</li>
                <li className="pl-2">Go to <strong>"Tools"</strong> → <strong>"Setup"</strong> → <strong>"API Center"</strong></li>
                <li className="pl-2">Click <strong>"Request a developer token"</strong></li>
                <li className="pl-2">
                  Fill in the application form:
                  <ul className="ml-6 mt-2 space-y-1 list-disc text-sm">
                    <li>Will you manage campaigns? (Yes/No)</li>
                    <li>Will you retrieve reporting data? (Yes/No)</li>
                    <li>Describe your use case in detail</li>
                    <li>Agree to Terms of Service</li>
                  </ul>
                </li>
                <li className="pl-2">
                  Initial status: <Badge variant="outline">Test Access</Badge>
                  <ul className="ml-6 mt-2 space-y-1 list-disc text-sm">
                    <li>15,000 operations per day</li>
                    <li>Works with test accounts only</li>
                    <li>Good for development</li>
                  </ul>
                </li>
                <li className="pl-2">Copy your developer token (22 characters)</li>
              </ol>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-sm mb-2">📈 Apply for Production Access</h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p>After testing with Test Access, apply for higher tiers:</p>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <h5 className="font-semibold mb-1">Basic Access</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">15K ops/day</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Production accounts</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">1-2 weeks approval</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <h5 className="font-semibold mb-1">Standard Access</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Unlimited ops</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Production accounts</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">2-4 weeks approval</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold">
                  4
                </div>
                <div>
                  <CardTitle>Find Your Customer ID</CardTitle>
                  <CardDescription>Located in your Google Ads account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li className="pl-2">Log into your Google Ads account</li>
                <li className="pl-2">Look at the <strong>top-right corner</strong> of the page</li>
                <li className="pl-2">
                  Find the Customer ID (format: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">123-456-7890</code>)
                </li>
                <li className="pl-2">Copy the number (digits only, hyphens optional)</li>
              </ol>

              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>💡 Tip:</strong> If managing multiple accounts, this is the specific account you want to connect. 
                  For Manager Accounts, use the MCC ID.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 5 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold">
                  5
                </div>
                <div>
                  <CardTitle>Connect in Application</CardTitle>
                  <CardDescription>Enter credentials and authorize</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">You'll need:</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      OAuth Client ID
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      OAuth Client Secret
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Developer Token
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Customer ID
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security Features
                  </h4>
                  <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                    <li>✅ Tokens encrypted with AES-256</li>
                    <li>✅ Refresh tokens never expire</li>
                    <li>✅ Auto-refresh every hour</li>
                    <li>✅ CSRF protection enabled</li>
                    <li>✅ Secure cookie handling</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Steps to Connect:</h4>
                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
                  <li className="pl-2">Go to <strong>Settings</strong> → <strong>Ad Platforms</strong> → <strong>Google Ads</strong></li>
                  <li className="pl-2">Enter all four credentials above</li>
                  <li className="pl-2">Click <strong>"Connect Google Ads (OAuth)"</strong></li>
                  <li className="pl-2">Authorize at Google (you'll be redirected)</li>
                  <li className="pl-2">Grant permissions when prompted</li>
                  <li className="pl-2">You'll be redirected back with success message</li>
                </ol>
              </div>

              <div className="flex justify-center pt-4">
                <Link href="/dashboard/settings">
                  <Button size="lg" className="gap-2">
                    Go to Settings
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <Card className="mt-8 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border-green-300">
          <CardHeader>
            <CardTitle className="text-green-900 dark:text-green-100">
              ✨ What You Get with Google Ads Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-sm">Campaign Metrics</h4>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Impressions & Clicks</li>
                  <li>• Cost & Conversions</li>
                  <li>• CTR & Average CPC</li>
                  <li>• Campaign performance trends</li>
                  <li>• Last 30 days of data</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-sm">Automation Features</h4>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Automatic token refresh</li>
                  <li>• Rate limiting protection</li>
                  <li>• Error handling & retries</li>
                  <li>• Performance caching</li>
                  <li>• AI-powered insights</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🐛 Common Issues & Solutions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-semibold text-sm">No refresh token received</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>Solution:</strong> Revoke access at{' '}
                  <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    myaccount.google.com/permissions
                  </a>
                  {' '}and try connecting again.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-semibold text-sm">Can't get developer token</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>Solution:</strong> You must create a Manager Account (MCC). Standard accounts cannot obtain developer tokens.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-semibold text-sm">Test Access only works with test accounts</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>Solution:</strong> Apply for Basic Access or Standard Access to work with production ad accounts.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-semibold text-sm">Rate limit exceeded</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>Solution:</strong> System auto-retries. Wait a few minutes. Basic Access has 15K ops/day limit.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Ready to Connect?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Once you have all four credentials, head to Settings to complete the OAuth connection
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard/settings">
              <Button size="lg" className="gap-2">
                <Key className="w-4 h-4" />
                Go to Settings
              </Button>
            </Link>
            <Link href="/setup">
              <Button size="lg" variant="outline" className="gap-2">
                View All Setup Guides
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

