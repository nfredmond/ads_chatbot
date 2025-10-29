/**
 * Meta Ads App Secret Proof Generator
 * Provides additional security for API calls
 */

import crypto from 'crypto'

/**
 * Generate App Secret Proof for Meta API calls
 * This adds an extra layer of security by proving you have the app secret
 * 
 * @param accessToken - The access token being used
 * @param appSecret - Your app's secret key
 * @returns The app secret proof (HMAC-SHA256 hash)
 */
export function generateAppsecretProof(accessToken: string, appSecret: string): string {
  if (!accessToken || !appSecret) {
    throw new Error('Access token and app secret are required to generate app secret proof')
  }

  return crypto
    .createHmac('sha256', appSecret)
    .update(accessToken)
    .digest('hex')
}

/**
 * Add App Secret Proof to Meta API request headers
 */
export function addAppsecretProofToHeaders(
  headers: Record<string, string>,
  accessToken: string,
  appSecret: string
): Record<string, string> {
  const appsecretProof = generateAppsecretProof(accessToken, appSecret)

  return {
    ...headers,
    'appsecret_proof': appsecretProof,
  }
}

/**
 * Add App Secret Proof to Meta API request URL params
 */
export function addAppsecretProofToParams(
  params: URLSearchParams,
  accessToken: string,
  appSecret: string
): URLSearchParams {
  const appsecretProof = generateAppsecretProof(accessToken, appSecret)
  params.set('appsecret_proof', appsecretProof)
  return params
}

/**
 * Verify App Secret Proof (for webhooks)
 */
export function verifyAppsecretProof(
  accessToken: string,
  appSecret: string,
  providedProof: string
): boolean {
  const expectedProof = generateAppsecretProof(accessToken, appSecret)
  return crypto.timingSafeEqual(
    Buffer.from(expectedProof, 'utf8'),
    Buffer.from(providedProof, 'utf8')
  )
}

