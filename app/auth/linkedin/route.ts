import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import logger, { logOAuthEvent } from '@/lib/logging/logger'

const LINKEDIN_OAUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const LINKEDIN_ACCOUNTS_URL = 'https://api.linkedin.com/rest/adAccounts'

export async function GET(request: NextRequest) {
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
    const {
      data: { user },
    } = await supabase.auth.getUser()
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
      .select('metadata')
      .eq('tenant_id', profile.tenant_id)
      .eq('platform', 'linkedin_ads')
      .maybeSingle()

    if (!adAccount?.metadata?.client_id || !adAccount?.metadata?.client_secret) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=LinkedIn Ads credentials not configured', request.url)
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
            scope: 'r_ads r_ads_reporting rw_ads r_organization_social',
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

    const {
      data: { user },
    } = await supabase.auth.getUser()
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

    // Get LinkedIn account
    const { data: adAccount } = await supabase
      .from('ad_accounts')
      .select('id, metadata')
      .eq('tenant_id', profile.tenant_id)
      .eq('platform', 'linkedin_ads')
      .maybeSingle()

    if (!adAccount) {
      throw new Error('LinkedIn Ads account not configured')
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
      throw new Error('Failed to fetch LinkedIn ad accounts')
    }

    const accountsData = await accountsResponse.json()

    if (!accountsData.elements || accountsData.elements.length === 0) {
      throw new Error('No LinkedIn ad accounts found for this user')
    }

    // Use the first account
    const firstAccount = accountsData.elements[0]
    const accountId = firstAccount.id.toString()

    // Update or insert ad_accounts
    const { error: upsertError } = await supabase.from('ad_accounts').upsert(
      {
        tenant_id: profile.tenant_id,
        platform: 'linkedin_ads',
        account_id: accountId,
        account_name: firstAccount.name || 'LinkedIn Ads Account',
        access_token: tokens.access_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        status: 'active',
        metadata: {
          client_id: adAccount.metadata.client_id,
          client_secret: adAccount.metadata.client_secret,
          account_urn: firstAccount.reference,
        },
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'tenant_id,platform,account_id',
      }
    )

    if (upsertError) throw upsertError

    logOAuthEvent('linkedin_ads', 'success', user.id)

    const response = NextResponse.redirect(
      new URL('/dashboard/settings?success=LinkedIn Ads connected successfully', request.url)
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

