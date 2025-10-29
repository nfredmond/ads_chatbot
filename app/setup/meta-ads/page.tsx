'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, ExternalLink, ArrowRight, AlertCircle, Zap, Shield, Clock, FileText } from 'lucide-react'
import Link from 'next/link'

export default function MetaAdsSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Meta Ads API Setup Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect Facebook & Instagram Ads to track campaigns and capture leads in real-time
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-blue-300 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📱 Facebook & Instagram Together
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                  Meta Ads manages both Facebook and Instagram advertising. One connection gives you access to campaigns on both platforms.
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
            <CardDescription>Advanced Access approval typically takes 1-2 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Badge className="bg-green-600 flex-shrink-0">Immediate</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Development Mode</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create app and test with your own accounts. Limited to admins/developers/testers.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-blue-600 flex-shrink-0">1-2 Weeks</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Advanced Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Full API access after app review. Required for production users. Need privacy policy & terms of service.
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
                  <CardTitle>Create Meta App</CardTitle>
                  <CardDescription>Set up your app in Meta for Developers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li className="pl-2">
                  Go to{' '}
                  <a
                    href="https://developers.facebook.com/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Meta for Developers
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li className="pl-2">Click <strong>"Create App"</strong></li>
                <li className="pl-2">Select app type: <strong>"Business"</strong></li>
                <li className="pl-2">Fill in app details:
                  <ul className="ml-6 mt-2 space-y-1 list-disc text-sm">
                    <li>App name</li>
                    <li>Contact email</li>
                    <li>Business account (optional)</li>
                  </ul>
                </li>
                <li className="pl-2">Click <strong>"Create App"</strong></li>
              </ol>
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
                  <CardTitle>Add Marketing API</CardTitle>
                  <CardDescription>Enable the Marketing API product</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li className="pl-2">In your app dashboard, click <strong>"Add Products"</strong></li>
                <li className="pl-2">Find <strong>"Marketing API"</strong></li>
                <li className="pl-2">Click <strong>"Set Up"</strong></li>
                <li className="pl-2">The Marketing API will be added to your app</li>
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
                  <CardTitle>Configure OAuth & Get Credentials</CardTitle>
                  <CardDescription>Set up Facebook Login and get App ID & Secret</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Get App ID and Secret:</h4>
                <ol className="space-y-2 list-decimal list-inside text-gray-700 dark:text-gray-300 text-sm">
                  <li className="pl-2">Go to <strong>"Settings"</strong> → <strong>"Basic"</strong></li>
                  <li className="pl-2">Copy your <strong>App ID</strong></li>
                  <li className="pl-2">Click <strong>"Show"</strong> next to App Secret</li>
                  <li className="pl-2">Enter your password to reveal</li>
                  <li className="pl-2">Copy your <strong>App Secret</strong></li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Configure OAuth Redirect:</h4>
                <ol className="space-y-2 list-decimal list-inside text-gray-700 dark:text-gray-300 text-sm">
                  <li className="pl-2">In left sidebar, click <strong>"Facebook Login"</strong> → <strong>"Settings"</strong></li>
                  <li className="pl-2">Under "Valid OAuth Redirect URIs", add:
                    <div className="mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-xs">
                      http://localhost:3000/auth/meta<br />
                      https://yourdomain.com/auth/meta
                    </div>
                  </li>
                  <li className="pl-2">Click <strong>"Save Changes"</strong></li>
                </ol>
              </div>

              <Separator />

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Required for App Review
                </h4>
                <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                  Before requesting Advanced Access, you MUST provide:
                </p>
                <ul className="space-y-1 text-sm text-red-800 dark:text-red-200 list-disc list-inside">
                  <li>Privacy Policy URL (publicly accessible)</li>
                  <li>Terms of Service URL (publicly accessible)</li>
                  <li>App icon (1024x1024px minimum)</li>
                  <li>Detailed use case description</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-full font-bold">
                  4
                </div>
                <div>
                  <CardTitle>Request Advanced Access</CardTitle>
                  <CardDescription>Submit your app for review (1-2 weeks)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li className="pl-2">Go to <strong>"App Review"</strong> → <strong>"Permissions and Features"</strong></li>
                <li className="pl-2">
                  Request Advanced Access for these permissions:
                  <ul className="ml-6 mt-2 space-y-1 list-disc text-sm">
                    <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">ads_management</code> - Create and manage ads</li>
                    <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">ads_read</code> - Read ad account data</li>
                    <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">business_management</code> - Access Business Manager</li>
                  </ul>
                </li>
                <li className="pl-2">For each permission, provide:
                  <ul className="ml-6 mt-2 space-y-1 list-disc text-sm">
                    <li>Detailed explanation of how you'll use it</li>
                    <li>Screenshots showing the feature in your app</li>
                    <li>Step-by-step testing instructions</li>
                  </ul>
                </li>
                <li className="pl-2">Click <strong>"Submit for Review"</strong></li>
                <li className="pl-2">Wait 1-2 weeks for Meta to review</li>
                <li className="pl-2">Once approved, switch app to <strong>"Live Mode"</strong></li>
              </ol>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-sm mb-2">💡 Tips for Approval</h4>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                  <li>Be very specific about your use case</li>
                  <li>Provide clear, annotated screenshots</li>
                  <li>Include step-by-step testing instructions</li>
                  <li>Ensure privacy policy is detailed and accessible</li>
                  <li>Respond promptly if Meta requests more info</li>
                </ul>
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
                  <CardDescription>Complete OAuth to get long-lived token</CardDescription>
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
                      App ID
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      App Secret
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 italic mt-3">
                    That's it! Just 2 things needed.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-800/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Auto Token Conversion
                  </h4>
                  <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                    <li>✅ Short → Long token (automatic)</li>
                    <li>✅ Fetches ad account ID</li>
                    <li>✅ 60-day token expiration</li>
                    <li>✅ Email reminder 7 days before</li>
                    <li>✅ App Secret Proof security</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Steps to Connect:</h4>
                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
                  <li className="pl-2">Go to <strong>Settings</strong> → <strong>Ad Platforms</strong> → <strong>Meta Ads</strong></li>
                  <li className="pl-2">Enter App ID and App Secret</li>
                  <li className="pl-2">Click <strong>"Connect Meta Ads (OAuth)"</strong></li>
                  <li className="pl-2">Sign in to Facebook (you'll be redirected)</li>
                  <li className="pl-2">Select your ad account if prompted</li>
                  <li className="pl-2">Click <strong>"Continue"</strong> to authorize</li>
                  <li className="pl-2">System automatically:
                    <ul className="ml-6 mt-1 space-y-1 list-disc text-xs">
                      <li>Converts to long-lived token (60 days)</li>
                      <li>Fetches your ad account ID</li>
                      <li>Saves encrypted credentials</li>
                    </ul>
                  </li>
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

        {/* Advanced Features */}
        <Card className="mt-8 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border-green-300">
          <CardHeader>
            <CardTitle className="text-green-900 dark:text-green-100">
              🚀 Advanced Meta Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-2 text-sm">Real-Time Webhooks</h4>
                <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                  <li>• Lead Ads capture</li>
                  <li>• Comment tracking</li>
                  <li>• Engagement monitoring</li>
                  <li>• Automatic notifications</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-2 text-sm">Conversions API</h4>
                <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                  <li>• Server-side tracking</li>
                  <li>• iOS 14+ compatible</li>
                  <li>• Better attribution</li>
                  <li>• PII auto-hashing</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-2 text-sm">Campaign Insights</h4>
                <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                  <li>• Near real-time data</li>
                  <li>• Detailed demographics</li>
                  <li>• Placement breakdown</li>
                  <li>• ROAS tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Token Management
            </CardTitle>
            <CardDescription>How Meta tokens work</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Two-Stage Process</h4>
                  <ol className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <li>1. OAuth code → Short-lived token (1-2 hours)</li>
                    <li>2. Short-lived → Long-lived token (60 days)</li>
                    <li>3. System handles both automatically</li>
                  </ol>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Expiration Handling</h4>
                  <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <li>⏱️ Tokens last exactly 60 days</li>
                    <li>📧 Email warning 7 days before</li>
                    <li>🔄 Must reconnect manually</li>
                    <li>🔒 Tokens encrypted in database</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ No Automatic Refresh:</strong> Unlike Google Ads, Meta tokens cannot be programmatically refreshed. 
                  Set a calendar reminder to reconnect every 2 months!
                </p>
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
                <h4 className="font-semibold text-sm">No ad accounts found</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>Solution:</strong> Ensure you're signing in with an account that has access to Business Manager and has ad accounts created.
                  Personal Facebook accounts without business access won't work.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-semibold text-sm">App ID vs Account ID confusion</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>Clarification:</strong> App ID identifies your Meta app. Ad Account ID is the specific advertising account (format: act_123456789). 
                  The system automatically fetches and uses the correct account ID.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-semibold text-sm">Permission denied errors</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>Solution:</strong> Check that Advanced Access is approved for required permissions. Development Mode only works for app admins.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-semibold text-sm">Rate limit warnings</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>Info:</strong> Meta uses dynamic throttling. The system monitors headers and automatically pauses at 80% usage to prevent rate limiting.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What You'll Get */}
        <Card className="mt-8 border-2 border-blue-300 dark:border-blue-700">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
            <CardTitle className="text-blue-900 dark:text-blue-100">
              ✨ What You'll Get After Connecting
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Campaign Data
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>📊 All campaign metrics (impressions, clicks, spend)</li>
                  <li>🎯 Facebook & Instagram ads together</li>
                  <li>💰 ROAS and conversion tracking</li>
                  <li>📈 Last 30 days of performance data</li>
                  <li>⚡ Near real-time updates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Advanced Features
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>🔔 Real-time lead notifications</li>
                  <li>💬 Comment & engagement tracking</li>
                  <li>🎯 Server-side conversion tracking</li>
                  <li>🤖 AI-powered insights from chatbot</li>
                  <li>📧 Token expiration reminders</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Ready to Connect?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Have your App ID and App Secret ready? Let's connect your Meta Ads account!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dashboard/settings">
              <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                Connect Meta Ads Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/setup">
              <Button size="lg" variant="outline" className="gap-2">
                View All Setup Guides
              </Button>
            </Link>
            <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2">
                Open Meta Developer Console
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

