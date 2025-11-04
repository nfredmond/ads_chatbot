/**
 * Token Expiration Monitoring Cron Job
 * Checks for expiring tokens and sends notifications
 */

import cron from 'node-cron'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { getEmailService } from '../email/email-service'
import logger from '../logging/logger'

/**
 * Check for expiring tokens and notify users
 */
async function checkExpiringTokens() {
  logger.info('Starting token expiration check')

  try {
    const supabase = createServiceRoleClient()
    const emailService = getEmailService()

    // Find tokens expiring in the next 7 days
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { data: expiringTokens, error } = await supabase
      .from('ad_accounts')
      .select(`
        tenant_id,
        platform,
        token_expires_at,
        profiles!inner(
          id,
          email,
          full_name
        )
      `)
      .lt('token_expires_at', sevenDaysFromNow.toISOString())
      .gt('token_expires_at', new Date().toISOString())
      .eq('status', 'active')

    if (error) {
      logger.error('Failed to fetch expiring tokens', { error })
      return
    }

    if (!expiringTokens || expiringTokens.length === 0) {
      logger.info('No expiring tokens found')
      return
    }

    logger.info(`Found ${expiringTokens.length} expiring tokens`)

    // Send notifications
    for (const token of expiringTokens) {
      try {
        const profile = Array.isArray(token.profiles) ? token.profiles[0] : token.profiles
        
        if (!profile?.email) {
          logger.warn('No email found for user', { tenant_id: token.tenant_id })
          continue
        }

        const expiresAt = new Date(token.token_expires_at)
        const now = new Date()
        const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Send email notification
        const sent = await emailService.sendTokenExpirationWarning(profile.email, {
          platform: token.platform,
          expiresAt: expiresAt,
          daysRemaining: daysRemaining,
        })

        if (sent) {
          logger.info('Sent expiration warning', {
            email: profile.email,
            platform: token.platform,
            daysRemaining,
          })
        }
      } catch (error) {
        logger.error('Failed to send expiration warning', {
          platform: token.platform,
          error,
        })
      }
    }

    logger.info('Token expiration check completed')
  } catch (error) {
    logger.error('Token expiration check failed', { error })
  }
}

/**
 * Check for already expired tokens and mark them as inactive
 */
async function deactivateExpiredTokens() {
  logger.info('Starting expired token deactivation')

  try {
    const supabase = createServiceRoleClient()

    const { data: expiredTokens, error: fetchError } = await supabase
      .from('ad_accounts')
      .select('id, platform, tenant_id, profiles!inner(email)')
      .lt('token_expires_at', new Date().toISOString())
      .eq('status', 'active')

    if (fetchError) {
      logger.error('Failed to fetch expired tokens', { error: fetchError })
      return
    }

    if (!expiredTokens || expiredTokens.length === 0) {
      logger.info('No expired tokens to deactivate')
      return
    }

    logger.info(`Found ${expiredTokens.length} expired tokens`)

    // Update status to 'expired'
    const { error: updateError } = await supabase
      .from('ad_accounts')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .in('id', expiredTokens.map(t => t.id))

    if (updateError) {
      logger.error('Failed to update expired tokens', { error: updateError })
      return
    }

    // Send notifications
    const emailService = getEmailService()
    for (const token of expiredTokens) {
      try {
        const profile = Array.isArray(token.profiles) ? token.profiles[0] : token.profiles
        
        if (profile?.email) {
          await emailService.sendSyncErrorNotification(
            profile.email,
            token.platform,
            'Your account connection has expired. Please reconnect to continue syncing data.'
          )
        }
      } catch (error) {
        logger.error('Failed to send expiration notification', { error })
      }
    }

    logger.info(`Deactivated ${expiredTokens.length} expired tokens`)
  } catch (error) {
    logger.error('Expired token deactivation failed', { error })
  }
}

/**
 * Initialize token monitoring cron jobs
 */
export function initializeTokenMonitoring() {
  // Check for expiring tokens daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running scheduled token expiration check')
    await checkExpiringTokens()
  })

  // Deactivate expired tokens every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running scheduled expired token deactivation')
    await deactivateExpiredTokens()
  })

  logger.info('Token monitoring cron jobs initialized')
  logger.info('- Expiration check: Daily at 9 AM')
  logger.info('- Expired token deactivation: Every hour')
}

/**
 * Run token monitoring checks immediately (for testing)
 */
export async function runTokenMonitoringNow() {
  logger.info('Running token monitoring checks manually')
  await checkExpiringTokens()
  await deactivateExpiredTokens()
}

export { checkExpiringTokens, deactivateExpiredTokens }

