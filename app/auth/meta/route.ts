import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import logger, { logOAuthEvent } from '@/lib/logging/logger'

const META_OAUTH_URL = 'https://www.facebook.com/v21.0/dialog/oauth'
const META_TOKEN_URL = 'https://graph.facebook.com/v21.0/oauth/access_token'
const META_LONG_LIVED_URL = 'https://graph.facebook.com/oauth/access_token'
const META_ACCOUNTS_URL = 'https://graph.facebook.com/v21.0/me/adaccounts'

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

    logOAuthEvent('meta_ads', 'initiated', user.id)

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

    // Get Meta credentials
    const { data: adAccount } = await supabase
      .from('ad_accounts')
      .select('metadata')
      .eq('tenant_id', profile.tenant_id)
      .eq('platform', 'meta_ads')
      .maybeSingle()

    if (!adAccount?.metadata?.app_id || !adAccount?.metadata?.app_secret) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=Meta Ads credentials not configured', request.url)
      )
    }

    // Generate state for CSRF protection
    const stateToken = crypto.randomBytes(32).toString('hex')

    const response = NextResponse.redirect(
      new URL(
        `${META_OAUTH_URL}?` +
          new URLSearchParams({
            client_id: adAccount.metadata.app_id,
            redirect_uri: `${request.nextUrl.origin}/auth/meta`,
            response_type: 'code',
            scope: 'ads_management,ads_read,business_management',
            state: stateToken,
          }).toString(),
        request.url
      )
    )

    response.cookies.set('meta_oauth_state', stateToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
    })

    return response
  }

  // Handle OAuth callback
  try {
    const storedState = request.cookies.get('meta_oauth_state')?.value

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

    // Get Meta account
    const { data: adAccount } = await supabase
      .from('ad_accounts')
      .select('id, metadata')
      .eq('tenant_id', profile.tenant_id)
      .eq('platform', 'meta_ads')
      .maybeSingle()

    if (!adAccount) {
      throw new Error('Meta Ads account not configured')
    }

    // Step 1: Exchange code for short-lived token
    const tokenResponse = await fetch(
      `${META_TOKEN_URL}?` +
        new URLSearchParams({
          client_id: adAccount.metadata.app_id,
          client_secret: adAccount.metadata.app_secret,
          code: code,
          redirect_uri: `${request.nextUrl.origin}/auth/meta`,
        })
    )

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      throw new Error(error.error?.message || 'Failed to exchange code for token')
    }

    const shortToken = await tokenResponse.json()

    // Step 2: Convert to long-lived token (60 days)
    const longTokenResponse = await fetch(
      `${META_LONG_LIVED_URL}?` +
        new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: adAccount.metadata.app_id,
          client_secret: adAccount.metadata.app_secret,
          fb_exchange_token: shortToken.access_token,
        })
    )

    if (!longTokenResponse.ok) {
      const error = await longTokenResponse.json()
      throw new Error(error.error?.message || 'Failed to get long-lived token')
    }

    const longToken = await longTokenResponse.json()

    // Step 3: Fetch ad accounts to get the actual account ID
    const accountsResponse = await fetch(
      `${META_ACCOUNTS_URL}?` +
        new URLSearchParams({
          access_token: longToken.access_token,
          fields: 'id,name,account_status',
        })
    )

    if (!accountsResponse.ok) {
      throw new Error('Failed to fetch ad accounts')
    }

    const accountsData = await accountsResponse.json()

    if (!accountsData.data || accountsData.data.length === 0) {
      throw new Error('No Meta ad accounts found for this user')
    }

    // Use the first active account
    const firstAccount = accountsData.data[0]

    // Update or insert ad_accounts
    const { error: upsertError } = await supabase.from('ad_accounts').upsert(
      {
        tenant_id: profile.tenant_id,
        platform: 'meta_ads',
        account_id: firstAccount.id,
        account_name: firstAccount.name || 'Meta Ads Account',
        access_token: longToken.access_token,
        token_expires_at: new Date(Date.now() + (longToken.expires_in || 5184000) * 1000).toISOString(),
        status: 'active',
        metadata: {
          app_id: adAccount.metadata.app_id,
          app_secret: adAccount.metadata.app_secret,
          account_status: firstAccount.account_status,
        },
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'tenant_id,platform,account_id',
      }
    )

    if (upsertError) throw upsertError

    logOAuthEvent('meta_ads', 'success', user.id)

    const response = NextResponse.redirect(
      new URL('/dashboard/settings?success=Meta Ads connected successfully', request.url)
    )
    response.cookies.delete('meta_oauth_state')

    return response
  } catch (error: any) {
    logger.error('Meta OAuth error:', error)
    logOAuthEvent('meta_ads', 'failure', user?.id, error)
    
    const response = NextResponse.redirect(
      new URL(`/dashboard/settings?error=${encodeURIComponent(error.message)}`, request.url)
    )
    response.cookies.delete('meta_oauth_state')
    return response
  }
}

