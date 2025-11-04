import logger from '../logging/logger'
import { encryptToken, decryptToken } from './encryption'
import { createServiceRoleClient } from '../supabase/service-role'

interface TokenUpdateInput {
  accessToken?: string | null
  refreshToken?: string | null
}

interface DecryptedTokens {
  accessToken: string | null
  refreshToken: string | null
}

function buildEncryptedFields(token?: string | null) {
  if (!token) {
    return null
  }

  const encrypted = encryptToken(token)

  return {
    encrypted: encrypted.encrypted,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
  }
}

export function buildEncryptedTokenUpdate(tokens: TokenUpdateInput) {
  const update: Record<string, any> = {}

  const access = buildEncryptedFields(tokens.accessToken)
  if (access) {
    update.access_token_encrypted = access.encrypted
    update.access_token_iv = access.iv
    update.access_token_auth_tag = access.authTag
    update.access_token = null
  }

  const refresh = buildEncryptedFields(tokens.refreshToken)
  if (refresh) {
    update.refresh_token_encrypted = refresh.encrypted
    update.refresh_token_iv = refresh.iv
    update.refresh_token_auth_tag = refresh.authTag
    update.refresh_token = null
  }

  return update
}

export function decryptAccountTokens(account: any): DecryptedTokens {
  let accessToken: string | null = null
  let refreshToken: string | null = null

  if (
    account?.access_token_encrypted &&
    account?.access_token_iv &&
    account?.access_token_auth_tag
  ) {
    try {
      accessToken = decryptToken({
        encrypted: account.access_token_encrypted,
        iv: account.access_token_iv,
        authTag: account.access_token_auth_tag,
      })
    } catch (error) {
      logger.error('Failed to decrypt access token', {
        accountId: account?.id,
        platform: account?.platform,
        error,
      })
    }
  } else if (account?.access_token) {
    accessToken = account.access_token
  }

  if (
    account?.refresh_token_encrypted &&
    account?.refresh_token_iv &&
    account?.refresh_token_auth_tag
  ) {
    try {
      refreshToken = decryptToken({
        encrypted: account.refresh_token_encrypted,
        iv: account.refresh_token_iv,
        authTag: account.refresh_token_auth_tag,
      })
    } catch (error) {
      logger.error('Failed to decrypt refresh token', {
        accountId: account?.id,
        platform: account?.platform,
        error,
      })
    }
  } else if (account?.refresh_token) {
    refreshToken = account.refresh_token
  }

  return { accessToken, refreshToken }
}

export async function migratePlaintextTokens() {
  try {
    const supabase = createServiceRoleClient()

    const { data: accounts, error } = await supabase
      .from('ad_accounts')
      .select(
        'id, platform, access_token, refresh_token, access_token_encrypted, refresh_token_encrypted'
      )
      .or('access_token.not.is.null,refresh_token.not.is.null')

    if (error) {
      logger.error('Failed to query ad accounts for token migration', { error })
      return
    }

    if (!accounts || accounts.length === 0) {
      logger.info('No plaintext tokens found to migrate')
      return
    }

    logger.info('Migrating plaintext ad account tokens', {
      accounts: accounts.length,
    })

    for (const account of accounts) {
      const update = buildEncryptedTokenUpdate({
        accessToken: account.access_token,
        refreshToken: account.refresh_token,
      })

      if (Object.keys(update).length === 0) {
        continue
      }

      update.updated_at = new Date().toISOString()

      const { error: updateError } = await supabase
        .from('ad_accounts')
        .update(update)
        .eq('id', account.id)

      if (updateError) {
        logger.error('Failed to migrate tokens for ad account', {
          accountId: account.id,
          platform: account.platform,
          error: updateError,
        })
      }
    }

    logger.info('Plaintext token migration completed')
  } catch (error) {
    logger.error('Token migration failed', { error })
  }
}
