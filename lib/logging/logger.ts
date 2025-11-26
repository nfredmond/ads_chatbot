/**
 * Winston Structured Logging Configuration
 * Provides comprehensive logging for all API operations
 */

import winston from 'winston'
import path from 'path'

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

// Tell winston about our colors
winston.addColors(colors)

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
)

// Define log format for files (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.json()
)

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: format,
  }),
  // Error log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: fileFormat,
  }),
  // Combined log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: fileFormat,
  }),
  // API-specific log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'api.log'),
    level: 'http',
    format: fileFormat,
  }),
]

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  transports,
})

/**
 * Custom error class for platform API errors
 */
export class PlatformAPIError extends Error {
  platform: string
  operation: string
  originalError: any
  timestamp: string
  statusCode?: number
  errorCode?: string

  constructor(
    platform: string,
    operation: string,
    originalError: any,
    statusCode?: number,
    errorCode?: string
  ) {
    super(`${platform} API error during ${operation}`)
    this.platform = platform
    this.operation = operation
    this.originalError = originalError
    this.timestamp = new Date().toISOString()
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.name = 'PlatformAPIError'

    // Log the error
    logger.error('Platform API Error', {
      platform,
      operation,
      error: originalError.message || originalError,
      stack: originalError.stack,
      statusCode,
      errorCode,
      timestamp: this.timestamp,
    })
  }
}

/**
 * Log successful API call
 */
export function logAPISuccess(
  platform: string,
  operation: string,
  details?: Record<string, any>
) {
  logger.http('API Success', {
    platform,
    operation,
    timestamp: new Date().toISOString(),
    ...details,
  })
}

/**
 * Log OAuth flow events
 */
export function logOAuthEvent(
  platform: string,
  event: 'initiated' | 'callback' | 'success' | 'failure',
  userId?: string,
  error?: any
) {
  const level = event === 'failure' ? 'error' : 'info'
  
  logger.log(level, 'OAuth Event', {
    platform,
    event,
    userId,
    error: error?.message,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Log data sync operations
 */
export function logSyncOperation(
  platform: string,
  status: 'started' | 'completed' | 'failed',
  details: {
    userId?: string
    campaignsCount?: number
    metricsCount?: number
    error?: any
    duration?: number
  }
) {
  const level = status === 'failed' ? 'error' : 'info'
  
  logger.log(level, 'Data Sync', {
    platform,
    status,
    timestamp: new Date().toISOString(),
    ...details,
  })
}

/**
 * Log token refresh operations
 */
export function logTokenRefresh(
  platform: string,
  success: boolean,
  userId?: string,
  error?: any
) {
  const level = success ? 'info' : 'error'
  
  logger.log(level, 'Token Refresh', {
    platform,
    success,
    userId,
    error: error?.message,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Log rate limiting events
 */
export function logRateLimit(
  platform: string,
  rateLimitInfo: {
    remaining?: number
    limit?: number
    resetAt?: string
    throttled: boolean
  }
) {
  logger.warn('Rate Limit Warning', {
    platform,
    ...rateLimitInfo,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Log cache operations
 */
export function logCacheOperation(
  operation: 'hit' | 'miss' | 'set' | 'delete',
  key: string,
  details?: Record<string, any>
) {
  logger.debug('Cache Operation', {
    operation,
    key,
    timestamp: new Date().toISOString(),
    ...details,
  })
}

export default logger

