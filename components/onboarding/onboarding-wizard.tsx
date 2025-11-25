'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronRight, ChevronLeft, Check, ExternalLink } from 'lucide-react'

interface OnboardingWizardProps {
  userId: string
  userEmail: string
}

export function OnboardingWizard({ userId, userEmail }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Step 1: Personal Info
  const [fullName, setFullName] = useState('')
  const [organization, setOrganization] = useState('')
  const [phone, setPhone] = useState('')

  // Step 2: Google Ads
  const [googleClientId, setGoogleClientId] = useState('')
  const [googleClientSecret, setGoogleClientSecret] = useState('')
  const [googleDeveloperToken, setGoogleDeveloperToken] = useState('')
  const [googleCustomerId, setGoogleCustomerId] = useState('')
  const [skipGoogle, setSkipGoogle] = useState(false)

  // Step 3: Meta Ads
  const [metaAppId, setMetaAppId] = useState('')
  const [metaAppSecret, setMetaAppSecret] = useState('')
  const [skipMeta, setSkipMeta] = useState(false)

  // Step 4: LinkedIn Ads
  const [linkedinClientId, setLinkedinClientId] = useState('')
  const [linkedinClientSecret, setLinkedinClientSecret] = useState('')
  const [skipLinkedIn, setSkipLinkedIn] = useState(false)

  const totalSteps = 4

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Get or create tenant
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', userId)
        .single()

      let tenantId = profile?.tenant_id

      if (!tenantId) {
        // Create tenant
        const { data: newTenant, error: tenantError } = await supabase
          .from('tenants')
          .insert({
            name: organization || 'My Organization',
            slug: organization?.toLowerCase().replace(/\s+/g, '-') || 'my-org',
          })
          .select()
          .single()

        if (tenantError) throw tenantError
        tenantId = newTenant.id
      }

      // Update profile with onboarding info
      const { error: profileError, data: updatedProfile } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          organization: organization,
          phone: phone,
          tenant_id: tenantId,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()

      if (profileError) {
        console.error('Profile update error:', profileError)
        throw profileError
      }

      if (!updatedProfile || updatedProfile.length === 0) {
        throw new Error('Failed to update profile')
      }

      // Save Google Ads if not skipped
      if (!skipGoogle && googleCustomerId) {
        await supabase.from('ad_accounts').insert({
          tenant_id: tenantId,
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
      }

      // Save Meta Ads if not skipped
      if (!skipMeta && metaAppId && metaAppSecret) {
        const { error: metaError } = await supabase.from('ad_accounts').upsert(
          {
            tenant_id: tenantId,
            platform: 'meta_ads',
            account_id: metaAppId,
            account_name: 'Meta Ads Account',
            status: 'pending',
            metadata: {
              app_id: metaAppId,
              app_secret: metaAppSecret,
            },
          },
          {
            onConflict: 'tenant_id,platform,account_id',
          }
        )

        if (metaError) {
          console.error('Meta Ads save error:', metaError)
          throw new Error('Failed to save Meta Ads credentials. Please double-check your App ID and Secret.')
        }
      }

      // Save LinkedIn Ads if not skipped
      if (!skipLinkedIn && linkedinClientId && linkedinClientSecret) {
        const { error: linkedinError } = await supabase.from('ad_accounts').upsert(
          {
            tenant_id: tenantId,
            platform: 'linkedin_ads',
            account_id: linkedinClientId,
            account_name: 'LinkedIn Ads Account',
            status: 'pending',
            metadata: {
              client_id: linkedinClientId,
              client_secret: linkedinClientSecret,
            },
          },
          {
            onConflict: 'tenant_id,platform,account_id',
          }
        )

        if (linkedinError) {
          console.error('LinkedIn Ads save error:', linkedinError)
          throw new Error('Failed to save LinkedIn Ads credentials. Please double-check your Client ID and Secret.')
        }
      }

      // Wait a moment for database to fully commit
      await new Promise(resolve => setTimeout(resolve, 500))

      // Force redirect to dashboard
      window.location.href = '/dashboard'
    } catch (err: any) {
      console.error('Onboarding error:', err)
      alert('Error completing onboarding: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome to Marketing Analytics! 🎉</CardTitle>
          <CardDescription>
            Let's get you set up in just a few steps (Step {step} of {totalSteps})
          </CardDescription>
          <div className="flex space-x-2 mt-4">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded ${
                  i + 1 <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tell us about yourself</h3>
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name *</Label>
                <Input
                  id="full-name"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={userEmail} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization Name *</Label>
                <Input
                  id="organization"
                  placeholder="Acme Marketing Agency"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Google Ads */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Google Ads Connection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Connect your Google Ads account to track campaigns and get AI insights
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Need help getting credentials?
                  </h4>
                  <a href="/setup/google-ads" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-xs">
                      View Full Guide
                    </Button>
                  </a>
                </div>
                <ol className="text-xs space-y-1 text-gray-700 dark:text-gray-300 list-decimal list-inside">
                  <li>Create Google Ads Manager Account (MCC) - <strong>required!</strong></li>
                  <li>Enable Google Ads API in Cloud Console</li>
                  <li>Create OAuth 2.0 credentials</li>
                  <li>Request Developer Token from API Center</li>
                  <li>Find Customer ID in your account (top right)</li>
                </ol>
                <p className="text-xs text-gray-500 mt-2 italic">
                  ⚠️ Standard accounts cannot get developer tokens - MCC required
                </p>
              </div>

              <div className="space-y-3">
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
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="skip-google"
                  checked={skipGoogle}
                  onChange={(e) => setSkipGoogle(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="skip-google" className="text-sm text-gray-600 dark:text-gray-400">
                  I'll set this up later
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Meta Ads */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Meta Ads Connection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Connect Facebook & Instagram Ads to your dashboard
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Need help getting credentials?
                  </h4>
                  <a href="/setup/meta-ads" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-xs">
                      View Full Guide
                    </Button>
                  </a>
                </div>
                <ol className="text-xs space-y-1 text-gray-700 dark:text-gray-300 list-decimal list-inside">
                  <li>Create Business-type app at Meta for Developers</li>
                  <li>Add Marketing API product to your app</li>
                  <li>Copy App ID and App Secret from Settings → Basic</li>
                  <li>Request Advanced Access (1-2 weeks approval)</li>
                </ol>
                <p className="text-xs text-gray-500 mt-2 italic">
                  💡 OAuth will auto-fetch your ad account - no manual token needed!
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="meta-app-id">App ID</Label>
                  <Input
                    id="meta-app-id"
                    placeholder="1234567890123456"
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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  After completing onboarding, you'll be redirected to finish the Meta OAuth connection so we can fetch your ad accounts securely.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="skip-meta"
                  checked={skipMeta}
                  onChange={(e) => setSkipMeta(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="skip-meta" className="text-sm text-gray-600 dark:text-gray-400">
                  I'll set this up later
                </label>
              </div>
            </div>
          )}

          {/* Step 4: LinkedIn Ads */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">LinkedIn Ads Connection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Connect your LinkedIn Ads account for B2B campaign tracking
                </p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Need help getting credentials?
                  </h4>
                  <a href="/setup/linkedin-ads" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-xs">
                      View Full Guide
                    </Button>
                  </a>
                </div>
                <ol className="text-xs space-y-1 text-gray-700 dark:text-gray-300 list-decimal list-inside">
                  <li>Create app at LinkedIn Developers</li>
                  <li>Associate with verified Company Page</li>
                  <li>Request Marketing Developer Platform access</li>
                  <li>Wait for approval (weeks to months)</li>
                  <li>Copy Client ID and Secret from Auth tab</li>
                </ol>
                <p className="text-xs text-gray-500 mt-2 italic">
                  ⚠️ Longest approval process - apply early! OAuth auto-fetches account.
                </p>
              </div>

              <div className="space-y-3">
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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Once onboarding is complete we'll walk you through the LinkedIn OAuth flow to securely pull campaigns with live tokens.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="skip-linkedin"
                  checked={skipLinkedIn}
                  onChange={(e) => setSkipLinkedIn(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="skip-linkedin" className="text-sm text-gray-600 dark:text-gray-400">
                  I'll set this up later
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && (!fullName || !organization))
                }
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading}>
                <Check className="w-4 h-4 mr-2" />
                {loading ? 'Completing...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

