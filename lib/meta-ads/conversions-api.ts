/**
 * Meta Conversions API
 * Server-side tracking for better attribution and iOS 14+ compatibility
 */

import crypto from 'crypto'
import logger, { PlatformAPIError } from '../logging/logger'
import { generateAppsecretProof } from './app-secret-proof'

interface UserData {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  clientIpAddress?: string
  clientUserAgent?: string
  fbc?: string // Facebook click ID
  fbp?: string // Facebook browser ID
  externalId?: string // Your customer ID
}

interface CustomData {
  currency?: string
  value?: number
  contentName?: string
  contentCategory?: string
  contentIds?: string[]
  contents?: Array<{
    id: string
    quantity: number
    itemPrice?: number
  }>
  contentType?: string
  orderId?: string
  predictedLtv?: number
  numItems?: number
  searchString?: string
  status?: string
}

interface ConversionEvent {
  eventName: string
  eventTime: number // Unix timestamp
  eventSourceUrl?: string
  actionSource: 'website' | 'app' | 'email' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other'
  userData: UserData
  customData?: CustomData
  eventId?: string // Deduplication ID
  optOut?: boolean
}

/**
 * Hash user data for privacy (SHA-256)
 */
function hashUserData(value: string | undefined): string | undefined {
  if (!value) return undefined
  
  // Normalize the value (lowercase, trim whitespace)
  const normalized = value.toLowerCase().trim()
  
  return crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex')
}

/**
 * Prepare user data for Conversions API (hash PII)
 */
function prepareUserData(userData: UserData): Record<string, any> {
  return {
    em: hashUserData(userData.email), // email
    ph: hashUserData(userData.phone), // phone
    fn: hashUserData(userData.firstName), // first name
    ln: hashUserData(userData.lastName), // last name
    ct: hashUserData(userData.city), // city
    st: hashUserData(userData.state), // state
    zp: hashUserData(userData.zip), // zip code
    country: hashUserData(userData.country), // country
    client_ip_address: userData.clientIpAddress,
    client_user_agent: userData.clientUserAgent,
    fbc: userData.fbc,
    fbp: userData.fbp,
    external_id: userData.externalId,
  }
}

/**
 * Send conversion event to Meta Conversions API
 */
export async function sendConversionEvent(
  pixelId: string,
  accessToken: string,
  appSecret: string,
  event: ConversionEvent
): Promise<boolean> {
  try {
    const url = `https://graph.facebook.com/v21.0/${pixelId}/events`

    // Prepare the payload
    const payload = {
      data: [
        {
          event_name: event.eventName,
          event_time: event.eventTime,
          event_source_url: event.eventSourceUrl,
          action_source: event.actionSource,
          user_data: prepareUserData(event.userData),
          custom_data: event.customData,
          event_id: event.eventId || crypto.randomUUID(),
          opt_out: event.optOut || false,
        },
      ],
      access_token: accessToken,
    }

    // Add app secret proof for additional security
    const appsecretProof = generateAppsecretProof(accessToken, appSecret)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        appsecret_proof: appsecretProof,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new PlatformAPIError(
        'meta_ads',
        'sendConversionEvent',
        data.error || data,
        response.status,
        data.error?.code
      )
    }

    logger.info('Conversion event sent successfully', {
      pixelId,
      eventName: event.eventName,
      eventId: event.eventId,
      eventsReceived: data.events_received,
    })

    return true
  } catch (error) {
    logger.error('Failed to send conversion event', {
      pixelId,
      eventName: event.eventName,
      error,
    })
    return false
  }
}

/**
 * Send test conversion event (for testing setup)
 */
export async function sendTestEvent(
  pixelId: string,
  accessToken: string,
  appSecret: string,
  testEventCode?: string
): Promise<boolean> {
  const testEvent: ConversionEvent = {
    eventName: 'Purchase',
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: 'https://example.com/test',
    actionSource: 'website',
    userData: {
      email: 'test@example.com',
      phone: '1234567890',
      clientIpAddress: '127.0.0.1',
      clientUserAgent: 'Mozilla/5.0',
    },
    customData: {
      currency: 'USD',
      value: 100.00,
      contentName: 'Test Product',
    },
    eventId: `test_${Date.now()}`,
  }

  let url = `https://graph.facebook.com/v21.0/${pixelId}/events`
  if (testEventCode) {
    url += `?test_event_code=${testEventCode}`
  }

  return await sendConversionEvent(pixelId, accessToken, appSecret, testEvent)
}

/**
 * Batch send multiple conversion events
 */
export async function sendConversionEvents(
  pixelId: string,
  accessToken: string,
  appSecret: string,
  events: ConversionEvent[]
): Promise<{ success: number; failed: number }> {
  const results = { success: 0, failed: 0 }

  // Meta allows up to 1000 events per batch, but we'll use smaller batches
  const batchSize = 100
  
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize)

    try {
      const payload = {
        data: batch.map(event => ({
          event_name: event.eventName,
          event_time: event.eventTime,
          event_source_url: event.eventSourceUrl,
          action_source: event.actionSource,
          user_data: prepareUserData(event.userData),
          custom_data: event.customData,
          event_id: event.eventId || crypto.randomUUID(),
          opt_out: event.optOut || false,
        })),
        access_token: accessToken,
        appsecret_proof: generateAppsecretProof(accessToken, appSecret),
      }

      const response = await fetch(
        `https://graph.facebook.com/v21.0/${pixelId}/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (response.ok) {
        results.success += batch.length
        logger.info('Batch conversion events sent successfully', {
          batchSize: batch.length,
          eventsReceived: data.events_received,
        })
      } else {
        results.failed += batch.length
        logger.error('Batch conversion events failed', {
          batchSize: batch.length,
          error: data.error,
        })
      }
    } catch (error) {
      results.failed += batch.length
      logger.error('Batch conversion events error', {
        batchSize: batch.length,
        error,
      })
    }
  }

  return results
}

/**
 * Common conversion event builders
 */

export function createPurchaseEvent(
  userData: UserData,
  orderValue: number,
  currency: string = 'USD',
  orderId?: string
): ConversionEvent {
  return {
    eventName: 'Purchase',
    eventTime: Math.floor(Date.now() / 1000),
    actionSource: 'website',
    userData,
    customData: {
      currency,
      value: orderValue,
      orderId,
    },
    eventId: orderId || crypto.randomUUID(),
  }
}

export function createLeadEvent(
  userData: UserData,
  leadValue?: number
): ConversionEvent {
  return {
    eventName: 'Lead',
    eventTime: Math.floor(Date.now() / 1000),
    actionSource: 'website',
    userData,
    customData: {
      currency: 'USD',
      value: leadValue,
    },
    eventId: crypto.randomUUID(),
  }
}

export function createAddToCartEvent(
  userData: UserData,
  productId: string,
  productName: string,
  value: number,
  currency: string = 'USD'
): ConversionEvent {
  return {
    eventName: 'AddToCart',
    eventTime: Math.floor(Date.now() / 1000),
    actionSource: 'website',
    userData,
    customData: {
      currency,
      value,
      contentName: productName,
      contentIds: [productId],
      contentType: 'product',
    },
    eventId: crypto.randomUUID(),
  }
}

export function createViewContentEvent(
  userData: UserData,
  productId: string,
  productName: string,
  value?: number
): ConversionEvent {
  return {
    eventName: 'ViewContent',
    eventTime: Math.floor(Date.now() / 1000),
    actionSource: 'website',
    userData,
    customData: {
      contentName: productName,
      contentIds: [productId],
      contentType: 'product',
      value,
    },
    eventId: crypto.randomUUID(),
  }
}

