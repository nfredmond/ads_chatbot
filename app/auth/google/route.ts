import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import logger, { logOAuthEvent } from '@/lib/logging/logger'

const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

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

    logOAuthEvent('google_ads', 'initiated', user.id)

    // Get profile with tenant_id
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

    // Get Google Ads credentials from ad_accounts
    const { data: adAccount } = await supabase
      .from('ad_accounts')
      .select('metadata')
      .eq('tenant_id', profile.tenant_id)
      .eq('platform', 'google_ads')
      .single()

    if (!adAccount?.metadata?.client_id || !adAccount?.metadata?.client_secret) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=Google Ads credentials not configured', request.url)
      )
    }

    // Generate state for CSRF protection
    const stateToken = crypto.randomBytes(32).toString('hex')

    // Store state in session (using cookies for simplicity)
    const response = NextResponse.redirect(
      new URL(
        `${GOOGLE_OAUTH_URL}?` +
          new URLSearchParams({
            client_id: adAccount.metadata.client_id,
            redirect_uri: `${request.nextUrl.origin}/auth/google`,
            response_type: 'code',
            scope: 'https://www.googleapis.com/auth/adwords',
            access_type: 'offline',
            include_granted_scopes: 'true',
            state: stateToken,
            prompt: 'consent', // Force consent to get refresh token
          }).toString(),
        request.url
      )
    )

    response.cookies.set('google_oauth_state', stateToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    })

    return response
  }

  // Handle OAuth callback
  try {
    const storedState = request.cookies.get('google_oauth_state')?.value

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

    // Get credentials again
    const { data: adAccount } = await supabase
      .from('ad_accounts')
      .select('id, metadata, account_id')
      .eq('tenant_id', profile.tenant_id)
      .eq('platform', 'google_ads')
      .single()

    if (!adAccount) {
      throw new Error('Google Ads account not found')
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: adAccount.metadata.client_id,
        client_secret: adAccount.metadata.client_secret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${request.nextUrl.origin}/auth/google`,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      throw new Error(error.error_description || 'Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()

    if (!tokens.refresh_token) {
      throw new Error('No refresh token received. Please revoke access and try again.')
    }

    // Update ad_accounts with refresh token
    const { error: updateError } = await supabase
      .from('ad_accounts')
      .update({
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        status: 'active',
        last_synced_at: null, // Reset sync time
        updated_at: new Date().toISOString(),
      })
      .eq('id', adAccount.id)

    if (updateError) throw updateError

    logOAuthEvent('google_ads', 'success', user.id)

    // Clear state cookie
    const response = NextResponse.redirect(
      new URL('/dashboard/settings?success=Google Ads connected successfully', request.url)
    )
    response.cookies.delete('google_oauth_state')

    return response
  } catch (error: any) {
    logger.error('Google OAuth error:', error)
    logOAuthEvent('google_ads', 'failure', user?.id, error)
    
    const response = NextResponse.redirect(
      new URL(`/dashboard/settings?error=${encodeURIComponent(error.message)}`, request.url)
    )
    response.cookies.delete('google_oauth_state')
    return response
  }
}

