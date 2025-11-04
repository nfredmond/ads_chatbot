import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import logger, { logOAuthEvent } from '@/lib/logging/logger'
import { buildEncryptedTokenUpdate } from '@/lib/security/ad-account-tokens'

const META_OAUTH_URL = 'https://www.facebook.com/v21.0/dialog/oauth'
const META_TOKEN_URL = 'https://graph.facebook.com/v21.0/oauth/access_token'
const META_LONG_LIVED_URL = 'https://graph.facebook.com/oauth/access_token'
const META_ACCOUNTS_URL = 'https://graph.facebook.com/v21.0/me/adaccounts'

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
            scope: 'ads_management,ads_read,business_management,pages_read_engagement,pages_show_list',
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

    // Fetch pages associated with the authenticated user to map webhook events
    let pages: Array<{ id: string; name?: string }> = []
    try {
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?` +
          new URLSearchParams({
            access_token: longToken.access_token,
            fields: 'id,name',
          })
      )

      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json()
        if (Array.isArray(pagesData?.data)) {
          pages = pagesData.data
        }
      } else {
        logger.warn('Meta OAuth: failed to fetch connected pages', {
          status: pagesResponse.status,
        })
      }
    } catch (error) {
      logger.warn('Meta OAuth: error fetching connected pages', { error })
    }

    // Step 3: Fetch ad accounts to get the actual account ID
    const accountsResponse = await fetch(
      `${META_ACCOUNTS_URL}?` +
        new URLSearchParams({
          access_token: longToken.access_token,
          fields: 'id,name,account_status',
        })
    )

    if (!accountsResponse.ok) {
      const errorData = await accountsResponse.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || 'Failed to fetch ad accounts'
      
      logger.error('Meta OAuth: Failed to fetch ad accounts', {
        status: accountsResponse.status,
        error: errorMessage,
      })
      
      throw new Error(`Failed to fetch Meta ad accounts: ${errorMessage}`)
    }

    const accountsData = await accountsResponse.json()

    if (!accountsData.data || accountsData.data.length === 0) {
      throw new Error('No Meta ad accounts found for this user')
    }

    // Use the first active account
    const firstAccount = accountsData.data[0]

    const tokenUpdate = buildEncryptedTokenUpdate({
      accessToken: longToken.access_token,
    })

    const metadata = {
      ...(adAccount.metadata || {}),
      app_id: adAccount.metadata.app_id,
      app_secret: adAccount.metadata.app_secret,
      account_status: firstAccount.account_status,
      pages,
      page_ids: pages.map((page) => page.id),
    }

    // Update existing ad_account row that stored the credentials during onboarding/settings
    const { error: updateError } = await supabase
      .from('ad_accounts')
      .update({
        account_id: firstAccount.id,
        account_name: firstAccount.name || 'Meta Ads Account',
        ...tokenUpdate,
        token_expires_at: new Date(
          Date.now() + (longToken.expires_in || 5184000) * 1000
        ).toISOString(),
        status: 'active',
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', adAccount.id)

    if (updateError) throw updateError

    logOAuthEvent('meta_ads', 'success', user.id)

    // Trigger automatic sync after successful connection
    try {
      // Don't wait for sync to complete - trigger async
      fetch(`${request.nextUrl.origin}/api/sync-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((err) => {
        logger.warn('Failed to trigger automatic sync after Meta OAuth', { error: err })
      })
    } catch (syncError) {
      logger.warn('Error triggering sync after Meta OAuth', { error: syncError })
    }

    const response = NextResponse.redirect(
      new URL('/dashboard/settings?success=Meta Ads connected successfully. Syncing campaign data...', request.url)
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

