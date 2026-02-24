import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import logger, { logOAuthEvent } from '@/lib/logging/logger'
import { buildEncryptedTokenUpdate } from '@/lib/security/ad-account-tokens'

const LINKEDIN_OAUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const LINKEDIN_ACCOUNTS_URL = 'https://api.linkedin.com/rest/adAccounts'

export async function GET(request: NextRequest) {
  let user: any = null
  
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  // Initiating OAuth flow
  if (!code) {
    const authResponse = await supabase.auth.getUser()
    user = authResponse.data.user
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    logOAuthEvent('linkedin_ads', 'initiated', user.id)

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=No tenant found', request.url)
      )
    }

    // Get LinkedIn credentials
    const { data: adAccount } = await supabase
      .from('ad_accounts')
      .select('id, metadata')
      .eq('tenant_id', profile.tenant_id)
      .eq('platform', 'linkedin_ads')
      .maybeSingle()

    if (!adAccount?.metadata?.client_id || !adAccount?.metadata?.client_secret) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=LinkedIn Ads credentials not configured. Please add your Client ID and Secret in Settings first.', request.url)
      )
    }

    // Generate state for CSRF protection
    const stateToken = crypto.randomBytes(32).toString('hex')

    const response = NextResponse.redirect(
      new URL(
        `${LINKEDIN_OAUTH_URL}?` +
          new URLSearchParams({
            response_type: 'code',
            client_id: adAccount.metadata.client_id,
            redirect_uri: `${request.nextUrl.origin}/auth/linkedin`,
            state: stateToken,
            // Keep LinkedIn OAuth scopes limited to core Ads scopes to reduce invalid_scope failures
            // when optional organization/social products are not approved.
            scope: 'r_ads r_ads_reporting rw_ads',
          }).toString(),
        request.url
      )
    )

    response.cookies.set('linkedin_oauth_state', stateToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
    })

    return response
  }

  // Handle OAuth callback
  try {
    const storedState = request.cookies.get('linkedin_oauth_state')?.value

    if (!state || state !== storedState) {
      throw new Error('Invalid state parameter - possible CSRF attack')
    }

    const authResponse = await supabase.auth.getUser()
    user = authResponse.data.user
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      throw new Error('No tenant found')
    }

    // Get LinkedIn account - query by (tenant_id, platform) to find the account
    // This ensures we update the same account even if credentials were changed
    const { data: adAccount } = await supabase
      .from('ad_accounts')
      .select('id, metadata')
      .eq('tenant_id', profile.tenant_id)
      .eq('platform', 'linkedin_ads')
      .maybeSingle()

    if (!adAccount) {
      throw new Error('LinkedIn Ads account not configured. Please add your Client ID and Secret in Settings first.')
    }

    // Exchange code for access token
    const tokenResponse = await fetch(LINKEDIN_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: adAccount.metadata.client_id,
        client_secret: adAccount.metadata.client_secret,
        redirect_uri: `${request.nextUrl.origin}/auth/linkedin`,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      throw new Error(error.error_description || 'Failed to exchange code for token')
    }

    const tokens = await tokenResponse.json()

    // Fetch ad accounts to get actual account ID
    const accountsResponse = await fetch(
      `${LINKEDIN_ACCOUNTS_URL}?q=search&search=(status:(values:List(ACTIVE,DRAFT)))`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'LinkedIn-Version': '202505',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    )

    if (!accountsResponse.ok) {
      const errorData = await accountsResponse.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error_description || 'Failed to fetch LinkedIn ad accounts'
      
      logger.error('LinkedIn OAuth: Failed to fetch ad accounts', {
        status: accountsResponse.status,
        error: errorMessage,
      })
      
      // Provide helpful error messages
      if (accountsResponse.status === 401 || accountsResponse.status === 403) {
        throw new Error('LinkedIn access token expired or invalid. Please try connecting again.')
      }
      
      throw new Error(`Failed to fetch LinkedIn ad accounts: ${errorMessage}`)
    }

    const accountsData = await accountsResponse.json()

    if (!accountsData.elements || accountsData.elements.length === 0) {
      throw new Error('No LinkedIn ad accounts found for this user')
    }

    // Use the first account
    const firstAccount = accountsData.elements[0]
    const accountId = firstAccount.id.toString()

    const tokenUpdate = buildEncryptedTokenUpdate({
      accessToken: tokens.access_token,
    })

    const metadata = {
      ...(adAccount.metadata || {}),
      client_id: adAccount.metadata.client_id,
      client_secret: adAccount.metadata.client_secret,
      account_urn: firstAccount.reference,
    }

    // Update existing ad_account row that stored the credentials during onboarding/settings
    // Note: We update by (tenant_id, platform) to ensure we always update the correct record
    const { error: updateError } = await supabase
      .from('ad_accounts')
      .update({
        account_id: accountId,
        account_name: firstAccount.name || 'LinkedIn Ads Account',
        ...tokenUpdate,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        status: 'active',
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('tenant_id', profile.tenant_id)
      .eq('platform', 'linkedin_ads')

    if (updateError) throw updateError

    logOAuthEvent('linkedin_ads', 'success', user.id)

    // Trigger automatic sync after successful connection
    try {
      // Don't wait for sync to complete - trigger async
      fetch(`${request.nextUrl.origin}/api/sync-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((err) => {
        logger.warn('Failed to trigger automatic sync after LinkedIn OAuth', { error: err })
      })
    } catch (syncError) {
      logger.warn('Error triggering sync after LinkedIn OAuth', { error: syncError })
    }

    const response = NextResponse.redirect(
      new URL('/dashboard/settings?success=LinkedIn Ads connected successfully. Syncing campaign data...', request.url)
    )
    response.cookies.delete('linkedin_oauth_state')

    return response
  } catch (error: any) {
    logger.error('LinkedIn OAuth error:', error)
    logOAuthEvent('linkedin_ads', 'failure', user?.id, error)
    
    const response = NextResponse.redirect(
      new URL(`/dashboard/settings?error=${encodeURIComponent(error.message)}`, request.url)
    )
    response.cookies.delete('linkedin_oauth_state')
    return response
  }
}

