/**
 * Redis Caching Client
 * Multi-layer caching for API responses
 */

import Redis from 'ioredis'
import logger, { logCacheOperation } from '../logging/logger'

let redisClient: Redis | null = null

/**
 * Initialize Redis client with connection pooling
 */
export function initRedisClient(): Redis {
  if (redisClient) {
    return redisClient
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    reconnectOnError(err) {
      const targetError = 'READONLY'
      if (err.message.includes(targetError)) {
        // Only reconnect when the error contains "READONLY"
        return true
      }
      return false
    },
  })

  redisClient.on('connect', () => {
    logger.info('Redis client connected')
  })

  redisClient.on('error', (err) => {
    logger.error('Redis client error', { error: err.message })
  })

  redisClient.on('close', () => {
    logger.warn('Redis client connection closed')
  })

  return redisClient
}

/**
 * Get Redis client instance
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    return initRedisClient()
  }
  return redisClient
}

/**
 * Close Redis connection
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    logger.info('Redis client disconnected')
  }
}

/**
 * Cache TTL (Time To Live) settings in seconds
 */
export const CACHE_TTL = {
  CAMPAIGNS: 3600, // 1 hour
  ACCOUNTS: 86400, // 24 hours
  METRICS: 300, // 5 minutes
  USER_DATA: 1800, // 30 minutes
  AD_INSIGHTS: 600, // 10 minutes
} as const

/**
 * Get data from cache
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient()
    const data = await client.get(key)
    
    if (data) {
      logCacheOperation('hit', key)
      return JSON.parse(data) as T
    }
    
    logCacheOperation('miss', key)
    return null
  } catch (error) {
    logger.error('Cache get error', { key, error })
    return null
  }
}

/**
 * Set data in cache with TTL
 */
export async function setCached<T>(
  key: string,
  data: T,
  ttl: number = CACHE_TTL.CAMPAIGNS
): Promise<boolean> {
  try {
    const client = getRedisClient()
    const serialized = JSON.stringify(data)
    await client.setex(key, ttl, serialized)
    
    logCacheOperation('set', key, { ttl })
    return true
  } catch (error) {
    logger.error('Cache set error', { key, error })
    return false
  }
}

/**
 * Delete data from cache
 */
export async function deleteCached(key: string): Promise<boolean> {
  try {
    const client = getRedisClient()
    await client.del(key)
    
    logCacheOperation('delete', key)
    return true
  } catch (error) {
    logger.error('Cache delete error', { key, error })
    return false
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function deleteCachedPattern(pattern: string): Promise<number> {
  try {
    const client = getRedisClient()
    const keys = await client.keys(pattern)
    
    if (keys.length > 0) {
      const deleted = await client.del(...keys)
      logCacheOperation('delete', pattern, { count: deleted })
      return deleted
    }
    
    return 0
  } catch (error) {
    logger.error('Cache pattern delete error', { pattern, error })
    return 0
  }
}

/**
 * Check if key exists in cache
 */
export async function existsInCache(key: string): Promise<boolean> {
  try {
    const client = getRedisClient()
    const exists = await client.exists(key)
    return exists === 1
  } catch (error) {
    logger.error('Cache exists check error', { key, error })
    return false
  }
}

/**
 * Get remaining TTL for a key
 */
export async function getTTL(key: string): Promise<number> {
  try {
    const client = getRedisClient()
    const ttl = await client.ttl(key)
    return ttl
  } catch (error) {
    logger.error('Cache TTL check error', { key, error })
    return -1
  }
}

/**
 * Generate cache key for platform-specific data
 */
export function generateCacheKey(
  platform: string,
  dataType: string,
  userId: string,
  ...additionalKeys: string[]
): string {
  const parts = [platform, dataType, userId, ...additionalKeys]
  return parts.filter(Boolean).join(':')
}

/**
 * Invalidate all cache for a user
 */
export async function invalidateUserCache(userId: string): Promise<number> {
  return await deleteCachedPattern(`*:${userId}:*`)
}

/**
 * Invalidate all cache for a platform
 */
export async function invalidatePlatformCache(
  platform: string,
  userId: string
): Promise<number> {
  return await deleteCachedPattern(`${platform}:*:${userId}:*`)
}

/**
 * Warm up cache with initial data
 */
export async function warmupCache<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttl: number = CACHE_TTL.CAMPAIGNS
): Promise<T> {
  // Check if already cached
  const cached = await getCached<T>(key)
  if (cached) {
    return cached
  }
  
  // Fetch and cache
  const data = await fetchFunction()
  await setCached(key, data, ttl)
  
  return data
}

