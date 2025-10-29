/**
 * Multi-Platform Rate Limiting using Bottleneck
 * Implements platform-specific rate limits and retry strategies
 */

import Bottleneck from 'bottleneck'
import logger, { logRateLimit } from '../logging/logger'

/**
 * Rate limit configurations for each platform
 * Based on official API documentation
 */
const RATE_LIMIT_CONFIG = {
  google_ads: {
    maxConcurrent: 5,
    minTime: 200, // 5 QPS (queries per second)
    reservoir: 15000, // 15,000 operations per day
    reservoirRefreshAmount: 15000,
    reservoirRefreshInterval: 24 * 60 * 60 * 1000, // 24 hours
  },
  meta_ads: {
    maxConcurrent: 10,
    minTime: 100, // 10 QPS
    // Meta uses dynamic throttling, so we set generous limits
  },
  linkedin_ads: {
    maxConcurrent: 5,
    minTime: 360, // ~3 QPS
    // LinkedIn has application-level daily limits
  },
} as const

type Platform = 'google_ads' | 'meta_ads' | 'linkedin_ads'

class MultiPlatformRateLimiter {
  private limiters: Record<Platform, Bottleneck>
  private retryStrategies: Record<Platform, (retryCount: number, error: any) => number | null>

  constructor() {
    this.limiters = {
      google_ads: new Bottleneck(RATE_LIMIT_CONFIG.google_ads),
      meta_ads: new Bottleneck(RATE_LIMIT_CONFIG.meta_ads),
      linkedin_ads: new Bottleneck(RATE_LIMIT_CONFIG.linkedin_ads),
    }

    this.retryStrategies = {
      google_ads: this.googleAdsRetryStrategy.bind(this),
      meta_ads: this.metaAdsRetryStrategy.bind(this),
      linkedin_ads: this.linkedinAdsRetryStrategy.bind(this),
    }

    this.setupEventListeners()
  }

  /**
   * Setup event listeners for all limiters
   */
  private setupEventListeners() {
    Object.entries(this.limiters).forEach(([platform, limiter]) => {
      limiter.on('failed', async (error, jobInfo) => {
        logger.warn(`Rate limiter job failed for ${platform}`, {
          error: error.message,
          jobId: jobInfo.options.id,
          retryCount: jobInfo.retryCount,
        })

        // Return retry delay based on platform-specific strategy
        const retryDelay = this.retryStrategies[platform as Platform](
          jobInfo.retryCount,
          error
        )

        if (retryDelay !== null) {
          logger.info(`Retrying ${platform} request in ${retryDelay}ms`)
          return retryDelay
        }

        // Don't retry
        return null
      })

      limiter.on('retry', (error, jobInfo) => {
        logger.info(`Retrying ${platform} request`, {
          retryCount: jobInfo.retryCount,
          jobId: jobInfo.options.id,
        })
      })

      limiter.on('depleted', () => {
        logRateLimit(platform, {
          throttled: true,
          remaining: 0,
        })
        logger.warn(`${platform} rate limiter reservoir depleted`)
      })
    })
  }

  /**
   * Google Ads retry strategy
   * Handles RESOURCE_EXHAUSTED and authentication errors
   */
  private googleAdsRetryStrategy(retryCount: number, error: any): number | null {
    // Max 3 retries
    if (retryCount >= 3) {
      return null
    }

    // Check if it's a rate limit error
    if (error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('RATE_LIMIT_EXCEEDED')) {
      // Exponential backoff: 5s, 10s, 20s
      return Math.pow(2, retryCount) * 5000
    }

    // Check if it's an authentication error (don't retry)
    if (error?.message?.includes('AUTHENTICATION_ERROR') || error?.message?.includes('PERMISSION_DENIED')) {
      return null
    }

    // For other errors, short delay
    return 1000
  }

  /**
   * Meta Ads retry strategy
   * Handles dynamic throttling and token errors
   */
  private metaAdsRetryStrategy(retryCount: number, error: any): number | null {
    // Max 5 retries for Meta (they have more dynamic throttling)
    if (retryCount >= 5) {
      return null
    }

    const errorCode = error?.response?.data?.error?.code

    // Rate limit errors (4, 17, 32, 613)
    if ([4, 17, 32, 613].includes(errorCode)) {
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      return Math.pow(2, retryCount) * 1000
    }

    // Token errors (190) - don't retry
    if (errorCode === 190) {
      return null
    }

    // Other errors - short delay
    return 1000
  }

  /**
   * LinkedIn Ads retry strategy
   * Handles 429 errors with Retry-After header
   */
  private linkedinAdsRetryStrategy(retryCount: number, error: any): number | null {
    // Max 3 retries
    if (retryCount >= 3) {
      return null
    }

    const status = error?.response?.status

    // Rate limit error (429)
    if (status === 429) {
      // Check for Retry-After header
      const retryAfter = error?.response?.headers?.['retry-after']
      if (retryAfter) {
        return parseInt(retryAfter) * 1000
      }
      // Default to 60 seconds if no Retry-After header
      return 60000
    }

    // Other errors - short delay
    return 1000
  }

  /**
   * Execute a function with rate limiting
   */
  async executeWithRateLimit<T>(
    platform: Platform,
    fn: () => Promise<T>,
    options?: {
      id?: string
      priority?: number
      weight?: number
    }
  ): Promise<T> {
    const limiter = this.limiters[platform]

    try {
      const result = await limiter.schedule(
        {
          id: options?.id,
          priority: options?.priority || 5,
          weight: options?.weight || 1,
        },
        fn
      )

      return result
    } catch (error) {
      logger.error(`Rate limited execution failed for ${platform}`, {
        error,
        options,
      })
      throw error
    }
  }

  /**
   * Get current rate limiter status
   */
  getStatus(platform: Platform) {
    const limiter = this.limiters[platform]

    return {
      running: limiter.running(),
      queued: limiter.queued(),
      done: limiter.done(),
    }
  }

  /**
   * Get all platforms status
   */
  getAllStatus() {
    return {
      google_ads: this.getStatus('google_ads'),
      meta_ads: this.getStatus('meta_ads'),
      linkedin_ads: this.getStatus('linkedin_ads'),
    }
  }

  /**
   * Update rate limit configuration dynamically
   */
  updateConfig(platform: Platform, config: Partial<Bottleneck.ConstructorOptions>) {
    const limiter = this.limiters[platform]
    limiter.updateSettings(config)
    logger.info(`Updated rate limit config for ${platform}`, { config })
  }

  /**
   * Clear queued jobs for a platform
   */
  async clearQueue(platform: Platform) {
    const limiter = this.limiters[platform]
    const cleared = await limiter.stop({ dropWaitingJobs: true })
    logger.info(`Cleared ${platform} rate limiter queue`, { cleared })
    return cleared
  }

  /**
   * Pause rate limiter for a platform
   */
  async pause(platform: Platform, duration?: number) {
    const limiter = this.limiters[platform]
    await limiter.stop()

    if (duration) {
      setTimeout(() => {
        logger.info(`Resuming ${platform} rate limiter after ${duration}ms`)
      }, duration)
    }

    logger.info(`Paused ${platform} rate limiter`, { duration })
  }

  /**
   * Check Meta API rate limit headers
   */
  checkMetaRateLimit(headers: Record<string, string>) {
    try {
      const appUsage = JSON.parse(headers['x-app-usage'] || '{}')
      const accountUsage = JSON.parse(headers['x-ad-account-usage'] || '{}')

      const callCount = appUsage.call_count || 0
      const totalTime = appUsage.total_time || 0

      if (callCount > 80 || totalTime > 80) {
        logRateLimit('meta_ads', {
          remaining: 100 - callCount,
          limit: 100,
          throttled: true,
        })

        // Auto-throttle if we're getting close to limits
        this.pause('meta_ads', 60000) // Pause for 1 minute
      }

      return {
        callCount,
        totalTime,
        accountUsage,
      }
    } catch (error) {
      logger.error('Error parsing Meta rate limit headers', { error })
      return null
    }
  }
}

// Singleton instance
let rateLimiterInstance: MultiPlatformRateLimiter | null = null

/**
 * Get rate limiter singleton instance
 */
export function getRateLimiter(): MultiPlatformRateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new MultiPlatformRateLimiter()
  }
  return rateLimiterInstance
}

/**
 * Convenience function to execute with rate limiting
 */
export async function withRateLimit<T>(
  platform: Platform,
  fn: () => Promise<T>,
  options?: {
    id?: string
    priority?: number
    weight?: number
  }
): Promise<T> {
  const limiter = getRateLimiter()
  return limiter.executeWithRateLimit(platform, fn, options)
}

export default getRateLimiter

