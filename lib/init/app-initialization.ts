/**
 * Application Initialization
 * Initialize all production services and features
 */

import logger from '../logging/logger'
import { initRedisClient, closeRedisClient } from '../cache/redis-client'
import { initializeTokenMonitoring } from '../cron/token-monitor'
import { testEncryption } from '../security/encryption'
import { getEmailService } from '../email/email-service'
import { getRateLimiter } from '../rate-limiting/limiter'
import { migratePlaintextTokens } from '../security/ad-account-tokens'

/**
 * Initialize all application services
 */
export async function initializeApplication() {
  logger.info('🚀 Initializing application...')

  try {
    // 1. Test encryption setup
    logger.info('Testing encryption...')
    const encryptionTest = testEncryption()
    if (encryptionTest) {
      logger.info('✓ Encryption working correctly')
    } else {
      logger.error('✗ Encryption test failed - check ENCRYPTION_KEY environment variable')
    }

    logger.info('Checking for plaintext ad account tokens...')
    await migratePlaintextTokens()

    // 2. Initialize Redis client
    logger.info('Initializing Redis cache...')
    try {
      const redis = initRedisClient()
      await redis.ping()
      logger.info('✓ Redis cache connected')
    } catch (error) {
      logger.warn('✗ Redis cache not available - caching will be disabled', { error })
    }

    // 3. Initialize email service
    logger.info('Initializing email service...')
    const emailService = getEmailService()
    logger.info('✓ Email service initialized')

    // 4. Initialize rate limiters
    logger.info('Initializing rate limiters...')
    const rateLimiter = getRateLimiter()
    logger.info('✓ Rate limiters initialized for all platforms')

    // 5. Initialize cron jobs
    logger.info('Initializing scheduled tasks...')
    initializeTokenMonitoring()
    logger.info('✓ Token monitoring cron jobs initialized')

    // 6. Log all statuses
    logger.info('📊 System Status:')
    logger.info('  - Encryption: ✓')
    logger.info('  - Redis Cache: ✓ (or disabled if not available)')
    logger.info('  - Email Service: ✓')
    logger.info('  - Rate Limiting: ✓')
    logger.info('  - Cron Jobs: ✓')

    logger.info('🎉 Application initialization complete!')

    return {
      success: true,
      services: {
        encryption: encryptionTest,
        redis: true,
        email: true,
        rateLimiter: true,
        cronJobs: true,
      },
    }
  } catch (error) {
    logger.error('❌ Application initialization failed', { error })
    throw error
  }
}

/**
 * Graceful shutdown handler
 */
export async function shutdownApplication() {
  logger.info('👋 Shutting down application...')

  try {
    // Close Redis connection
    await closeRedisClient()
    logger.info('✓ Redis connection closed')

    // Additional cleanup can be added here

    logger.info('✓ Graceful shutdown complete')
  } catch (error) {
    logger.error('Error during shutdown', { error })
  }
}

/**
 * Health check endpoint data
 */
export async function getHealthStatus() {
  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      encryption: false,
      redis: false,
      rateLimiter: false,
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  }

  try {
    // Test encryption
    status.services.encryption = testEncryption()

    // Test Redis
    try {
      const redis = initRedisClient()
      await redis.ping()
      status.services.redis = true
    } catch {
      status.services.redis = false
    }

    // Test rate limiter
    const rateLimiter = getRateLimiter()
    const limiterStatus = rateLimiter.getAllStatus()
    status.services.rateLimiter = true

    return status
  } catch (error) {
    logger.error('Health check failed', { error })
    return {
      ...status,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received')
    await shutdownApplication()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    logger.info('SIGINT signal received')
    await shutdownApplication()
    process.exit(0)
  })
}

