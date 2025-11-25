import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptAccountTokens } from '@/lib/security/ad-account-tokens'
import logger from '@/lib/logging/logger'

/**
 * GET /api/connection-status
 * Verifies the connection status of Meta and LinkedIn ad accounts
 * Returns connection health and token expiration info
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile and tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    // Get Meta and LinkedIn ad accounts
    const { data: adAccounts } = await supabase
      .from('ad_accounts')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .in('platform', ['meta_ads', 'linkedin_ads'])
      .eq('status', 'active')

    if (!adAccounts || adAccounts.length === 0) {
      return NextResponse.json({
        meta: { connected: false, status: 'not_connected' },
        linkedin: { connected: false, status: 'not_connected' },
      })
    }

    const results: Record<string, any> = {
      meta: { connected: false, status: 'not_connected' },
      linkedin: { connected: false, status: 'not_connected' },
    }

    // Check each account
    for (const account of adAccounts) {
      const tokens = decryptAccountTokens(account)
      const isConnected = !!tokens.accessToken
      
      let status = 'not_connected'
      let expiresAt: string | null = null
      let expiresInDays: number | null = null

      if (isConnected && account.token_expires_at) {
        const expiresDate = new Date(account.token_expires_at)
        const now = new Date()
        const diffMs = expiresDate.getTime() - now.getTime()
        expiresInDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

        if (diffMs < 0) {
          status = 'expired'
        } else if (expiresInDays <= 7) {
          status = 'expiring_soon'
        } else {
          status = 'active'
        }

        expiresAt = account.token_expires_at
      } else if (isConnected) {
        status = 'active'
      }

      const accountData = {
        connected: isConnected,
        status,
        accountId: account.account_id,
        accountName: account.account_name,
        expiresAt,
        expiresInDays,
        lastSyncedAt: account.last_synced_at,
      }

      if (account.platform === 'meta_ads') {
        results.meta = accountData
      } else if (account.platform === 'linkedin_ads') {
        results.linkedin = accountData
      }
    }

    return NextResponse.json(results)
  } catch (error: any) {
    logger.error('Connection status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check connection status', details: error.message },
      { status: 500 }
    )
  }
}

