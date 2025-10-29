'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, ExternalLink, ArrowRight, AlertCircle, TrendingUp, Shield, Clock, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function LinkedInAdsSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-700 rounded-2xl mb-6">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            LinkedIn Ads API Setup Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect LinkedIn Campaign Manager for B2B advertising analytics
          </p>
        </div>

        {/* Critical Notice */}
        <Card className="mb-8 border-red-300 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  ⏳ Longest Approval Process
                </h3>
                <p className="text-red-800 dark:text-red-200 text-sm leading-relaxed">
                  LinkedIn's Marketing Developer Platform approval can take <strong>weeks to months</strong>. 
                  This is the most selective of all three platforms. You must have a legitimate business need - 
                  personal or hobby projects are typically rejected.
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
            <CardDescription>Plan for a longer setup process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Badge className="bg-green-600 flex-shrink-0">Immediate</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Create App</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create LinkedIn app and get Client ID/Secret immediately.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-orange-600 flex-shrink-0">Weeks-Months</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Marketing Developer Platform Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Longest approval of all platforms. High rejection rate. Requires company page verification.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-blue-600 flex-shrink-0">24 Hours</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Analytics Data Delay</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ⚠️ Important: LinkedIn analytics data has a 24-hour delay. Today's data shows yesterday's performance.
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
                <div className="flex items-center justify-center w-10 h-10 bg-blue-700 text-white rounded-full font-bold">
                  1
                </div>
                <div>
                  <CardTitle>Create LinkedIn App</CardTitle>
                  <CardDescription>Register your application with LinkedIn</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li className="pl-2">
                  Go to{' '}
                  <a
                    href="https://www.linkedin.com/developers/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    LinkedIn Developers
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li className="pl-2">Click <strong>"Create app"</strong></li>
                <li className="pl-2">Fill in required information:
                  <ul className="ml-6 mt-2 space-y-1 list-disc text-sm">
                    <li>App name</li>
                    <li><strong>LinkedIn Company Page</strong> (REQUIRED - you must be admin)</li>
                    <li>Privacy policy URL</li>
                    <li>Business email</li>
                    <li>App logo (square, high quality)</li>
                  </ul>
                </li>
                <li className="pl-2">Agree to LinkedIn API Terms of Use</li>
                <li className="pl-2">Click <strong>"Create app"</strong></li>
              </ol>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>🏢 Company Page Required:</strong> You must have a verified LinkedIn Company Page and be an administrator. 
                  Personal profiles alone are not sufficient.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-700 text-white rounded-full font-bold">
                  2
                </div>
                <div>
                  <CardTitle>Request Marketing Developer Platform Access</CardTitle>
                  <CardDescription>This step takes the longest - be patient!</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-sm text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Weeks to Months Timeline
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This is the most thorough approval process of all three platforms. LinkedIn is very selective about who gets Marketing API access.
                </p>
              </div>

              <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li className="pl-2">In your app settings, click <strong>"Products"</strong> tab</li>
                <li className="pl-2">Find <strong>"Marketing Developer Platform"</strong></li>
                <li className="pl-2">Click <strong>"Request access"</strong></li>
                <li className="pl-2">Complete the detailed application:
                  <ul className="ml-6 mt-2 space-y-2 list-disc text-sm">
                    <li><strong>Company information</strong> (detailed business description)</li>
                    <li><strong>Use case</strong> (be VERY specific about how you'll use the API)</li>
                    <li><strong>Expected usage volume</strong></li>
                    <li><strong>How it benefits LinkedIn members</strong></li>
                    <li><strong>Data privacy practices</strong></li>
                    <li><strong>Security measures</strong></li>
                  </ul>
                </li>
                <li className="pl-2">Submit and wait for review</li>
              </ol>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-300">
                  <h5 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-1">✅ Approval Tips</h5>
                  <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                    <li>• Legitimate business only</li>
                    <li>• Detailed use case description</li>
                    <li>• Show how it helps members</li>
                    <li>• Professional company page</li>
                    <li>• Clear privacy practices</li>
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-300">
                  <h5 className="font-semibold text-sm text-red-900 dark:text-red-100 mb-1">❌ Common Rejections</h5>
                  <ul className="text-xs text-red-800 dark:text-red-200 space-y-1">
                    <li>• Personal/hobby projects</li>
                    <li>• Vague use case descriptions</li>
                    <li>• No company page</li>
                    <li>• Unclear business model</li>
                    <li>• Privacy concerns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-700 text-white rounded-full font-bold">
                  3
                </div>
                <div>
                  <CardTitle>Configure OAuth Settings</CardTitle>
                  <CardDescription>Get Client ID and Secret, set redirect URLs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li className="pl-2">Go to <strong>"Auth"</strong> tab in your app settings</li>
                <li className="pl-2">Copy your <strong>Client ID</strong> and <strong>Client Secret</strong></li>
                <li className="pl-2">Under "OAuth 2.0 settings", add redirect URLs:
                  <div className="mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-xs">
                    http://localhost:3000/auth/linkedin<br />
                    https://yourdomain.com/auth/linkedin
                  </div>
                </li>
                <li className="pl-2">Click <strong>"Update"</strong> to save changes</li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-700 text-white rounded-full font-bold">
                  4
                </div>
                <div>
                  <CardTitle>Connect in Application</CardTitle>
                  <CardDescription>Complete OAuth to get 60-day token</CardDescription>
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
                      Client ID
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Client Secret
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Marketing Platform Access (approved)
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Auto Account Discovery
                  </h4>
                  <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                    <li>✅ Fetches ad account ID automatically</li>
                    <li>✅ 60-day access token</li>
                    <li>✅ Rest.li protocol handled</li>
                    <li>✅ URN format conversion</li>
                    <li>⚠️ No auto-refresh (manual reconnect)</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Steps to Connect:</h4>
                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
                  <li className="pl-2">Go to <strong>Settings</strong> → <strong>Ad Platforms</strong> → <strong>LinkedIn Ads</strong></li>
                  <li className="pl-2">Enter Client ID and Client Secret</li>
                  <li className="pl-2">Click <strong>"Connect LinkedIn Ads (OAuth)"</strong></li>
                  <li className="pl-2">Sign in to LinkedIn (you'll be redirected)</li>
                  <li className="pl-2">Review permissions and authorize</li>
                  <li className="pl-2">System automatically fetches your ad account</li>
                  <li className="pl-2">Stores 60-day token with expiration tracking</li>
                </ol>
              </div>

              <div className="flex justify-center pt-4">
                <Link href="/dashboard/settings">
                  <Button size="lg" className="gap-2 bg-blue-700 hover:bg-blue-800">
                    Go to Settings
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LinkedIn Specific Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              LinkedIn-Specific Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Prerequisites</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Verified LinkedIn Company Page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Admin access to company page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Active Campaign Manager account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Legitimate business use case</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Business email (not personal)</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Technical Details</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>URN Format:</strong> Uses urn:li:sponsoredAccount:123456</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>API Version:</strong> 202505 (YYYYMM format)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>Protocol:</strong> Rest.li 2.0.0</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>Token Life:</strong> 60 days (no refresh)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>Data Delay:</strong> 24 hours for analytics</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What You Get */}
        <Card className="mt-8 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border-green-300">
          <CardHeader>
            <CardTitle className="text-green-900 dark:text-green-100">
              ✨ B2B Advertising Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Professional Metrics
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>📊 Campaign performance data</li>
                  <li>🎯 Industry targeting insights</li>
                  <li>👔 Seniority distribution</li>
                  <li>🏢 Company size analytics</li>
                  <li>📈 Lead generation metrics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Enterprise Features
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>🔒 Secure token encryption</li>
                  <li>📧 Expiration notifications</li>
                  <li>⚡ Intelligent rate limiting</li>
                  <li>🤖 AI-powered recommendations</li>
                  <li>📊 Cross-platform comparison</li>
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
                <h4 className="font-semibold text-sm">Application rejected</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>Solution:</strong> Review rejection feedback, improve documentation, and resubmit with more details. 
                  Ensure you have a legitimate business need and professional company page.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-semibold text-sm">No ad accounts found</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>Solution:</strong> Ensure your LinkedIn account has access to Campaign Manager. 
                  Create an ad account if you don't have one yet.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-semibold text-sm">Token expires in 60 days</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>Info:</strong> Unlike Google, LinkedIn tokens cannot be refreshed. Set a calendar reminder to reconnect every 2 months. 
                  You'll receive email warnings 7 days before expiration.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-semibold text-sm">Data is delayed by 24 hours</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>Info:</strong> This is a LinkedIn API limitation. Today's dashboard shows yesterday's performance. 
                  Plan your reporting accordingly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Scopes */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🔑 Required API Scopes</CardTitle>
            <CardDescription>Permissions needed for full functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <code className="text-sm font-mono text-blue-600">r_ads</code>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Read ad account and campaign data</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <code className="text-sm font-mono text-blue-600">r_ads_reporting</code>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Access campaign performance metrics</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <code className="text-sm font-mono text-blue-600">rw_ads</code>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Read and write ad campaigns (future feature)</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <code className="text-sm font-mono text-blue-600">r_organization_social</code>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Access organization data</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">
              All scopes are automatically requested during OAuth. No manual configuration needed.
            </p>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Ready to Connect?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Have Marketing Developer Platform access approved? Let's connect your LinkedIn Ads!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dashboard/settings">
              <Button size="lg" className="gap-2 bg-blue-700 hover:bg-blue-800">
                Connect LinkedIn Ads Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/setup">
              <Button size="lg" variant="outline" className="gap-2">
                View All Setup Guides
              </Button>
            </Link>
            <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2">
                Open LinkedIn Developers
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>

        {/* Pro Tip */}
        <Card className="mt-8 border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Pro Tip: Set Reconnection Reminders
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Since LinkedIn tokens expire every 60 days and cannot be auto-refreshed, add a recurring calendar event for day 55 to reconnect your account. 
                  This prevents any gaps in your data tracking!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

