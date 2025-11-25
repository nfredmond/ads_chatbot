'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { Key, Link as LinkIcon, Check, X } from 'lucide-react'

interface AdAccount {
  id: string
  tenant_id: string
  platform: string
  account_id: string
  account_name: string
  status: string
  last_synced_at: string | null
  metadata: Record<string, string>
}

interface SyncResult {
  platform: string
  status: string
  campaigns?: number
  metrics?: number
  message?: string
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([])

  // Profile state
  const [fullName, setFullName] = useState('')
  const [organization, setOrganization] = useState('')
  const [phone, setPhone] = useState('')

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
  // Note: Meta access token is obtained via OAuth flow, not stored directly
  const [_metaAccessToken, _setMetaAccessToken] = useState('')

  // LinkedIn Ads state
  const [linkedinClientId, setLinkedinClientId] = useState('')
  const [linkedinClientSecret, setLinkedinClientSecret] = useState('')
  // Note: LinkedIn access token is obtained via OAuth flow, not stored directly
  const [_linkedinAccessToken, _setLinkedinAccessToken] = useState('')

  const supabase = useMemo(() => createClient(), [])

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, organization, phone')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setFullName(profile.full_name || '')
        setOrganization(profile.organization || '')
        setPhone(profile.phone || '')
      }
    }
  }, [supabase])

  const loadAdAccounts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return

      const { data, error: loadError } = await supabase
        .from('ad_accounts')
        .select('id, tenant_id, platform, account_id, account_name, status, last_synced_at, metadata')
        .eq('tenant_id', profile.tenant_id)
        .order('updated_at', { ascending: false })

      if (loadError) {
        console.error('Error loading ad accounts:', loadError)
        return
      }

      if (data) {
        setAdAccounts(data as AdAccount[])

        const metaAccount = data.find((acc) => acc.platform === 'meta_ads')
        if (metaAccount?.metadata?.app_id) {
          setMetaAppId(metaAccount.metadata.app_id)
        }
        if (metaAccount?.metadata?.app_secret) {
          setMetaAppSecret(metaAccount.metadata.app_secret)
        }

        const linkedinAccount = data.find((acc) => acc.platform === 'linkedin_ads')
        if (linkedinAccount?.metadata?.client_id) {
          setLinkedinClientId(linkedinAccount.metadata.client_id)
        }
        if (linkedinAccount?.metadata?.client_secret) {
          setLinkedinClientSecret(linkedinAccount.metadata.client_secret)
        }

        const googleAccount = data.find((acc) => acc.platform === 'google_ads')
        if (googleAccount?.metadata?.client_id) {
          setGoogleClientId(googleAccount.metadata.client_id)
        }
        if (googleAccount?.metadata?.developer_token) {
          setGoogleDeveloperToken(googleAccount.metadata.developer_token)
        }
        if (googleAccount?.account_id) {
          setGoogleCustomerId(googleAccount.account_id)
        }
      }
    } catch (err) {
      console.error('Error loading ad accounts:', err)
    }
  }, [supabase])

  useEffect(() => {
    loadProfile()
    loadAdAccounts()
    
    // Check for OAuth success/error in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const successMessage = urlParams.get('success')
    const errorMessage = urlParams.get('error')
    
    if (successMessage) {
      setSuccess(successMessage)
      // Reload accounts to show updated status
      loadAdAccounts()
      
      // If sync message in success, trigger sync after a delay
      if (successMessage.includes('Syncing')) {
        setTimeout(async () => {
          setLoading(true)
          try {
            const response = await fetch('/api/sync-data', { method: 'POST' })
            const data = await response.json()
            if (response.ok) {
              const results: SyncResult[] = data.results || []
              const totalCampaigns = results.reduce((sum, r) => sum + (r.campaigns || 0), 0)
              const totalMetrics = results.reduce((sum, r) => sum + (r.metrics || 0), 0)
              setSuccess(`✅ Connection successful! Synced ${totalCampaigns} campaigns and ${totalMetrics} metric records. Check your dashboard!`)
              await loadAdAccounts()
            } else {
              setError(`Sync completed but encountered issues: ${data.error || 'Unknown error'}`)
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(`Auto-sync failed: ${errorMessage}. Please try manual sync.`)
          } finally {
            setLoading(false)
          }
        }, 2000)
      }
      
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
    
    if (errorMessage) {
      setError(errorMessage)
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [loadProfile, loadAdAccounts])

  const handleSaveProfile = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          organization: organization,
          phone: phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id)

      if (updateError) throw updateError
      
      setSuccess('Profile updated successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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

      if (!googleClientId || !googleClientSecret || !googleDeveloperToken || !googleCustomerId) {
        throw new Error('Please fill in all required Google Ads credentials')
      }

      // Save credentials first (without tokens - they'll be added via OAuth)
      // Note: We upsert by (tenant_id, platform) only to prevent duplicates
      // The account_id will be verified/updated during OAuth flow
      const { error: upsertError } = await supabase.from('ad_accounts').upsert({
        tenant_id: profile?.tenant_id,
        platform: 'google_ads',
        account_id: googleCustomerId,
        account_name: 'Google Ads Account',
        status: 'pending',
        metadata: {
          client_id: googleClientId,
          client_secret: googleClientSecret,
          developer_token: googleDeveloperToken,
        },
      }, {
        onConflict: 'tenant_id,platform'
      })

      if (upsertError) throw upsertError

      // Redirect to OAuth flow
      window.location.href = '/auth/google'
    } catch (err: any) {
      setError(err.message)
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

      // Validate inputs
      if (!metaAppId || !metaAppSecret) {
        throw new Error('Please fill in all required Meta Ads credentials (App ID and App Secret)')
      }
      
      if (metaAppId.trim().length === 0 || metaAppSecret.trim().length === 0) {
        throw new Error('App ID and App Secret cannot be empty')
      }

      // Save app credentials first (account_id and tokens will be set via OAuth)
      // Note: We upsert by (tenant_id, platform) only to allow credential updates
      // The actual ad account ID will be fetched during OAuth from Meta's API
      const { error: upsertError } = await supabase.from('ad_accounts').upsert({
        tenant_id: profile?.tenant_id,
        platform: 'meta_ads',
        account_id: 'pending', // Temporary placeholder, will be replaced with actual account ID during OAuth
        account_name: 'Meta Ads Account',
        status: 'pending',
        metadata: {
          app_id: metaAppId,
          app_secret: metaAppSecret,
        },
      }, {
        onConflict: 'tenant_id,platform'
      })

      if (upsertError) throw upsertError

      // Reload accounts to show pending status
      await loadAdAccounts()

      // Redirect to OAuth flow (don't set loading to false - redirect will happen)
      window.location.href = '/auth/meta'
    } catch (err: any) {
      setError(err.message || 'Failed to connect Meta Ads. Please try again.')
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

      // Validate inputs
      if (!linkedinClientId || !linkedinClientSecret) {
        throw new Error('Please fill in all required LinkedIn Ads credentials (Client ID and Client Secret)')
      }
      
      if (linkedinClientId.trim().length === 0 || linkedinClientSecret.trim().length === 0) {
        throw new Error('Client ID and Client Secret cannot be empty')
      }

      // Save app credentials first (account_id and token will be set via OAuth)
      // Note: We upsert by (tenant_id, platform) only to allow credential updates
      // The actual ad account ID will be fetched during OAuth from LinkedIn's API
      const { error: upsertError } = await supabase.from('ad_accounts').upsert({
        tenant_id: profile?.tenant_id,
        platform: 'linkedin_ads',
        account_id: 'pending', // Temporary placeholder, will be replaced with actual account ID during OAuth
        account_name: 'LinkedIn Ads Account',
        status: 'pending',
        metadata: {
          client_id: linkedinClientId,
          client_secret: linkedinClientSecret,
        },
      }, {
        onConflict: 'tenant_id,platform'
      })

      if (upsertError) throw upsertError

      // Reload accounts to show pending status
      await loadAdAccounts()

      // Redirect to OAuth flow (don't set loading to false - redirect will happen)
      window.location.href = '/auth/linkedin'
    } catch (err: any) {
      setError(err.message || 'Failed to connect LinkedIn Ads. Please try again.')
      setLoading(false)
    }
  }

  const handleDisconnectAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account? You will need to reconnect to sync data again.')) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const { error } = await supabase.from('ad_accounts').delete().eq('id', accountId)
      
      if (error) throw error

      setSuccess('Account disconnected successfully!')
      await loadAdAccounts()
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncData = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/sync-data', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || data.details || 'Failed to sync data'
        throw new Error(errorMessage)
      }

      // Parse sync results
      const results = data.results || []
      const successCount = results.filter((r: any) => r.status === 'success').length
      const errorCount = results.filter((r: any) => r.status === 'error').length
      
      if (successCount > 0) {
        const totalCampaigns = results.reduce((sum: number, r: any) => sum + (r.campaigns || 0), 0)
        const totalMetrics = results.reduce((sum: number, r: any) => sum + (r.metrics || 0), 0)
        
        let message = `Data synced successfully! Fetched ${totalCampaigns} campaigns and ${totalMetrics} metric records.`
        
        if (errorCount > 0) {
          message += ` (${errorCount} platform(s) had errors - check details below)`
        }
        
        setSuccess(message)
        
        // Reload accounts to show updated last_synced_at
        await loadAdAccounts()
      } else if (errorCount > 0) {
        const errorMessages = results
          .filter((r: any) => r.status === 'error')
          .map((r: any) => `${r.platform}: ${r.message || 'Unknown error'}`)
          .join('; ')
        
        throw new Error(`Sync failed: ${errorMessages}`)
      } else {
        setSuccess('Sync completed, but no data was found. Make sure you have active campaigns in your ad accounts.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white">Settings</h1>
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

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="ad-platforms">Ad Platforms</TabsTrigger>
          <TabsTrigger value="connected">Connected Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Personal Information</CardTitle>
              <CardDescription>
                Update your profile and organization details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  placeholder="Acme Marketing Agency"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={loading}>
                Save Profile
              </Button>
              <Separator className="my-4" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium dark:text-white">Setup Wizard</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Re-run the onboarding wizard to reconfigure your ad platform connections
                </p>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const { data: { user } } = await supabase.auth.getUser()
                    await supabase
                      .from('profiles')
                      .update({ onboarding_completed: false })
                      .eq('id', user?.id)
                    window.location.href = '/onboarding'
                  }}
                >
                  Re-run Setup Wizard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
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
          {/* Instructions Card */}
          <Card className="dark:bg-gray-800 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center">
                <Key className="w-5 h-5 mr-2 text-blue-600" />
                How to Connect Your Ad Platforms
              </CardTitle>
              <CardDescription>
                Follow these steps carefully for each platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-3 text-sm">
                <li className="font-semibold text-gray-900 dark:text-gray-100">
                  <strong>Enter Credentials</strong>
                  <p className="text-gray-600 dark:text-gray-400 font-normal ml-5 mt-1">
                    For Meta: Enter your App ID and App Secret from the Meta Developer Portal.<br/>
                    For LinkedIn: Enter your Client ID and Client Secret from LinkedIn Developer Portal.
                  </p>
                </li>
                <li className="font-semibold text-gray-900 dark:text-gray-100">
                  <strong>Click Connect Button</strong>
                  <p className="text-gray-600 dark:text-gray-400 font-normal ml-5 mt-1">
                    The Connect button will save your credentials and redirect you to the platform's OAuth login page.
                  </p>
                </li>
                <li className="font-semibold text-gray-900 dark:text-gray-100">
                  <strong>Authorize Access</strong>
                  <p className="text-gray-600 dark:text-gray-400 font-normal ml-5 mt-1">
                    Log in to your ad account and approve the requested permissions.
                  </p>
                </li>
                <li className="font-semibold text-gray-900 dark:text-gray-100">
                  <strong>Wait for Sync</strong>
                  <p className="text-gray-600 dark:text-gray-400 font-normal ml-5 mt-1">
                    You'll be redirected back and the system will automatically sync your campaign data (takes 10-30 seconds).
                  </p>
                </li>
                <li className="font-semibold text-gray-900 dark:text-gray-100">
                  <strong>Check Dashboard</strong>
                  <p className="text-gray-600 dark:text-gray-400 font-normal ml-5 mt-1">
                    Navigate to the Dashboard to see your campaigns, metrics, and AI insights.
                  </p>
                </li>
              </ol>
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ Common Issues:</strong> Make sure you have active ad campaigns in your account. Empty accounts won't have data to sync. Also ensure your app has the correct permissions approved in the platform's developer portal.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Google Ads</CardTitle>
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
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Need help getting credentials?</strong>
                </p>
                <Link href="/setup/google-ads">
                  <Button variant="outline" size="sm" className="text-xs">
                    View Setup Guide
                  </Button>
                </Link>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> After saving credentials, click "Connect Google Ads" to complete OAuth authentication. You'll be redirected to Google to authorize access.
                </p>
              </div>
              <Button onClick={handleConnectGoogleAds} disabled={loading}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Connect Google Ads (OAuth)
              </Button>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Meta Ads (Facebook/Instagram)</CardTitle>
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
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> After saving your App ID and Secret, click "Connect Meta Ads" to complete OAuth authentication. The access token will be obtained automatically.
                </p>
              </div>
              <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Need help getting credentials?</strong>
                </p>
                <Link href="/setup/meta-ads">
                  <Button variant="outline" size="sm" className="text-xs">
                    View Setup Guide
                  </Button>
                </Link>
              </div>
              <Button onClick={handleConnectMetaAds} disabled={loading || !metaAppId || !metaAppSecret}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Connect Meta Ads (OAuth)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">LinkedIn Ads</CardTitle>
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
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> After saving your Client ID and Secret, click "Connect LinkedIn Ads" to complete OAuth authentication. The access token will be obtained automatically.
                </p>
              </div>
              <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Need help getting credentials?</strong>
                </p>
                <Link href="/setup/linkedin-ads">
                  <Button variant="outline" size="sm" className="text-xs">
                    View Setup Guide
                  </Button>
                </Link>
              </div>
              <Button onClick={handleConnectLinkedInAds} disabled={loading || !linkedinClientId || !linkedinClientSecret}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Connect LinkedIn Ads (OAuth)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connected" className="space-y-4">
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="dark:text-white">Connected Ad Accounts</CardTitle>
              <CardDescription>
                Manage your connected advertising platform accounts
              </CardDescription>
                </div>
                {adAccounts.length > 0 && (
                  <Button onClick={handleSyncData} disabled={loading}>
                    {loading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Sync Data
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {adAccounts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No ad accounts connected yet. Connect your accounts in the "Ad Platforms" tab.
                </p>
              ) : (
                <div className="space-y-4">
                  {adAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg dark:bg-gray-700/50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <h4 className="font-semibold dark:text-white">{account.account_name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Platform: {account.platform.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Account ID: {account.account_id}
                          </p>
                          {account.last_synced_at && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Last synced: {new Date(account.last_synced_at).toLocaleString()}
                            </p>
                          )}
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

