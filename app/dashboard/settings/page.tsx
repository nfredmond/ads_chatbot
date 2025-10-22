'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { Key, Link as LinkIcon, Check, X } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [adAccounts, setAdAccounts] = useState<any[]>([])

  // API Keys state
  const [anthropicKey, setAnthropicKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')

  // Google Ads state
  const [googleClientId, setGoogleClientId] = useState('')
  const [googleClientSecret, setGoogleClientSecret] = useState('')
  const [googleDeveloperToken, setGoogleDeveloperToken] = useState('')
  const [googleCustomerId, setGoogleCustomerId] = useState('')

  // Meta Ads state
  const [metaAppId, setMetaAppId] = useState('')
  const [metaAppSecret, setMetaAppSecret] = useState('')
  const [metaAccessToken, setMetaAccessToken] = useState('')

  // LinkedIn Ads state
  const [linkedinClientId, setLinkedinClientId] = useState('')
  const [linkedinClientSecret, setLinkedinClientSecret] = useState('')
  const [linkedinAccessToken, setLinkedinAccessToken] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadAdAccounts()
  }, [])

  const loadAdAccounts = async () => {
    const { data } = await supabase.from('ad_accounts').select('*')
    if (data) setAdAccounts(data)
  }

  const handleSaveAPIKeys = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // In production, these should be saved securely server-side
      localStorage.setItem('anthropic_key', anthropicKey)
      localStorage.setItem('openai_key', openaiKey)
      
      setSuccess('API keys saved successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectGoogleAds = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user?.id)
        .single()

      // Save Google Ads credentials
      const { error: insertError } = await supabase.from('ad_accounts').insert({
        tenant_id: profile?.tenant_id,
        platform: 'google_ads',
        account_id: googleCustomerId,
        account_name: 'Google Ads Account',
        status: 'active',
        metadata: {
          client_id: googleClientId,
          client_secret: googleClientSecret,
          developer_token: googleDeveloperToken,
        },
      })

      if (insertError) throw insertError

      setSuccess('Google Ads connected successfully!')
      loadAdAccounts()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectMetaAds = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user?.id)
        .single()

      // Save Meta Ads credentials
      const { error: insertError } = await supabase.from('ad_accounts').insert({
        tenant_id: profile?.tenant_id,
        platform: 'meta_ads',
        account_id: metaAppId,
        account_name: 'Meta Ads Account',
        access_token: metaAccessToken,
        status: 'active',
        metadata: {
          app_id: metaAppId,
          app_secret: metaAppSecret,
        },
      })

      if (insertError) throw insertError

      setSuccess('Meta Ads connected successfully!')
      loadAdAccounts()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectLinkedInAds = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user?.id)
        .single()

      // Save LinkedIn Ads credentials
      const { error: insertError } = await supabase.from('ad_accounts').insert({
        tenant_id: profile?.tenant_id,
        platform: 'linkedin_ads',
        account_id: linkedinClientId,
        account_name: 'LinkedIn Ads Account',
        access_token: linkedinAccessToken,
        status: 'active',
        metadata: {
          client_id: linkedinClientId,
          client_secret: linkedinClientSecret,
        },
      })

      if (insertError) throw insertError

      setSuccess('LinkedIn Ads connected successfully!')
      loadAdAccounts()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnectAccount = async (accountId: string) => {
    try {
      await supabase.from('ad_accounts').delete().eq('id', accountId)
      setSuccess('Account disconnected successfully!')
      loadAdAccounts()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="ad-platforms">Ad Platforms</TabsTrigger>
          <TabsTrigger value="connected">Connected Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>AI API Keys</span>
              </CardTitle>
              <CardDescription>
                Configure your AI API keys for intelligent insights and chatbot functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="anthropic-key">Anthropic API Key (Claude)</Label>
                <Input
                  id="anthropic-key"
                  type="password"
                  placeholder="sk-ant-api03-..."
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Get your API key from{' '}
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Anthropic Console
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key (Optional)</Label>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-proj-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Get your API key from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>

              <Button onClick={handleSaveAPIKeys} disabled={loading}>
                Save API Keys
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ad-platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Google Ads</CardTitle>
              <CardDescription>
                Connect your Google Ads account to sync campaign data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-client-id">OAuth Client ID</Label>
                <Input
                  id="google-client-id"
                  placeholder="123456789-abc.apps.googleusercontent.com"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google-client-secret">OAuth Client Secret</Label>
                <Input
                  id="google-client-secret"
                  type="password"
                  placeholder="GOCSPX-..."
                  value={googleClientSecret}
                  onChange={(e) => setGoogleClientSecret(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google-developer-token">Developer Token</Label>
                <Input
                  id="google-developer-token"
                  type="password"
                  placeholder="Your Google Ads Developer Token"
                  value={googleDeveloperToken}
                  onChange={(e) => setGoogleDeveloperToken(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google-customer-id">Customer ID</Label>
                <Input
                  id="google-customer-id"
                  placeholder="123-456-7890"
                  value={googleCustomerId}
                  onChange={(e) => setGoogleCustomerId(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">
                Learn how to get credentials:{' '}
                <a
                  href="https://developers.google.com/google-ads/api/docs/first-call/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google Ads API Documentation
                </a>
              </p>
              <Button onClick={handleConnectGoogleAds} disabled={loading}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Connect Google Ads
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meta Ads (Facebook/Instagram)</CardTitle>
              <CardDescription>
                Connect your Meta Ads account to sync campaign data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-app-id">App ID</Label>
                <Input
                  id="meta-app-id"
                  placeholder="Your Meta App ID"
                  value={metaAppId}
                  onChange={(e) => setMetaAppId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-app-secret">App Secret</Label>
                <Input
                  id="meta-app-secret"
                  type="password"
                  placeholder="Your Meta App Secret"
                  value={metaAppSecret}
                  onChange={(e) => setMetaAppSecret(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-access-token">Access Token</Label>
                <Input
                  id="meta-access-token"
                  type="password"
                  placeholder="Long-lived Access Token"
                  value={metaAccessToken}
                  onChange={(e) => setMetaAccessToken(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">
                Learn how to get credentials:{' '}
                <a
                  href="https://developers.facebook.com/docs/marketing-api/get-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Meta Marketing API Documentation
                </a>
              </p>
              <Button onClick={handleConnectMetaAds} disabled={loading}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Connect Meta Ads
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Ads</CardTitle>
              <CardDescription>
                Connect your LinkedIn Ads account to sync campaign data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin-client-id">Client ID</Label>
                <Input
                  id="linkedin-client-id"
                  placeholder="Your LinkedIn App Client ID"
                  value={linkedinClientId}
                  onChange={(e) => setLinkedinClientId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin-client-secret">Client Secret</Label>
                <Input
                  id="linkedin-client-secret"
                  type="password"
                  placeholder="Your LinkedIn App Client Secret"
                  value={linkedinClientSecret}
                  onChange={(e) => setLinkedinClientSecret(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin-access-token">Access Token</Label>
                <Input
                  id="linkedin-access-token"
                  type="password"
                  placeholder="OAuth 2.0 Access Token"
                  value={linkedinAccessToken}
                  onChange={(e) => setLinkedinAccessToken(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">
                Learn how to get credentials:{' '}
                <a
                  href="https://learn.microsoft.com/en-us/linkedin/marketing/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  LinkedIn Marketing API Documentation
                </a>
              </p>
              <Button onClick={handleConnectLinkedInAds} disabled={loading}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Connect LinkedIn Ads
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Ad Accounts</CardTitle>
              <CardDescription>
                Manage your connected advertising platform accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {adAccounts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No ad accounts connected yet. Connect your accounts in the "Ad Platforms" tab.
                </p>
              ) : (
                <div className="space-y-4">
                  {adAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <h4 className="font-semibold">{account.account_name}</h4>
                          <p className="text-sm text-gray-500">
                            Platform: {account.platform.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            Account ID: {account.account_id}
                          </p>
                        </div>
                        <Badge
                          variant={account.status === 'active' ? 'default' : 'secondary'}
                        >
                          {account.status === 'active' ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            <X className="w-3 h-3 mr-1" />
                          )}
                          {account.status}
                        </Badge>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDisconnectAccount(account.id)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

