/**
 * Meta Ads Webhook Handler
 * Handles real-time notifications from Meta for lead ads and conversions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import logger from '@/lib/logging/logger'
import crypto from 'crypto'

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'your-unique-verify-token'

/**
 * GET - Webhook Verification
 * Meta will call this to verify the webhook endpoint
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  logger.info('Meta webhook verification request received', {
    mode,
    hasToken: !!token,
    hasChallenge: !!challenge,
  })

  // Check if it's a subscription verification
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    logger.info('Meta webhook verified successfully')
    // Respond with the challenge to complete verification
    return new NextResponse(challenge, { status: 200 })
  } else {
    logger.warn('Meta webhook verification failed', {
      mode,
      tokenMatch: token === VERIFY_TOKEN,
    })
    return new NextResponse('Forbidden', { status: 403 })
  }
}

/**
 * POST - Webhook Event Handler
 * Receives real-time notifications from Meta
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the request signature
    const signature = request.headers.get('x-hub-signature-256')
    const body = await request.text()

    if (!verifySignature(body, signature)) {
      logger.error('Invalid Meta webhook signature')
      return new NextResponse('Invalid signature', { status: 401 })
    }

    const data = JSON.parse(body)

    logger.info('Meta webhook event received', {
      object: data.object,
      entryCount: data.entry?.length || 0,
    })

    // Process the webhook data
    if (data.object === 'page') {
      await handlePageWebhook(data)
    } else if (data.object === 'instagram') {
      await handleInstagramWebhook(data)
    } else if (data.object === 'whatsapp_business_account') {
      await handleWhatsAppWebhook(data)
    }

    // Always respond with 200 OK to acknowledge receipt
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    logger.error('Meta webhook processing error', { error })
    // Still return 200 to prevent Meta from retrying
    return NextResponse.json({ success: false }, { status: 200 })
  }
}

/**
 * Verify webhook signature using app secret
 */
function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature) {
    return false
  }

  const appSecret = process.env.META_APP_SECRET
  if (!appSecret) {
    logger.error('META_APP_SECRET not configured')
    return false
  }

  try {
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', appSecret)
      .update(payload, 'utf8')
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    logger.error('Signature verification error', { error })
    return false
  }
}

/**
 * Handle Facebook Page webhooks (Lead Ads, Comments, etc.)
 */
async function handlePageWebhook(data: any) {
  const supabase = await createClient()

  for (const entry of data.entry || []) {
    for (const change of entry.changes || []) {
      logger.info('Processing page webhook change', {
        field: change.field,
        value: change.value,
      })

      // Handle Lead Ads
      if (change.field === 'leadgen') {
        await handleLeadGen(supabase, change.value)
      }

      // Handle Comments
      if (change.field === 'feed' && change.value.item === 'comment') {
        await handleComment(supabase, change.value)
      }

      // Handle Post Engagement
      if (change.field === 'feed' && change.value.item === 'status') {
        await handlePost(supabase, change.value)
      }
    }
  }
}

/**
 * Handle Instagram webhooks
 */
async function handleInstagramWebhook(data: any) {
  logger.info('Instagram webhook received', { data })
  // Implement Instagram-specific logic here
}

/**
 * Handle WhatsApp webhooks
 */
async function handleWhatsAppWebhook(data: any) {
  logger.info('WhatsApp webhook received', { data })
  // Implement WhatsApp-specific logic here
}

/**
 * Handle Lead Gen (Lead Ads) events
 */
async function handleLeadGen(supabase: any, value: any) {
  try {
    const leadgenId = value.leadgen_id
    const pageId = value.page_id
    const formId = value.form_id

    logger.info('New lead received', { leadgenId, pageId, formId })

    // Fetch the lead data from Meta API
    // This would require making an API call to get the full lead details
    // For now, we'll just log it

    // Store lead information
    const { error } = await supabase.from('leads').insert({
      platform: 'meta_ads',
      leadgen_id: leadgenId,
      page_id: pageId,
      form_id: formId,
      created_at: new Date().toISOString(),
      raw_data: value,
    })

    if (error) {
      logger.error('Failed to store lead', { error, leadgenId })
    } else {
      logger.info('Lead stored successfully', { leadgenId })
    }
  } catch (error) {
    logger.error('Lead gen handling error', { error })
  }
}

/**
 * Handle Comment events
 */
async function handleComment(supabase: any, value: any) {
  try {
    logger.info('New comment received', {
      commentId: value.comment_id,
      postId: value.post_id,
    })

    // Store comment for analysis or response
    const { error } = await supabase.from('social_engagements').insert({
      platform: 'meta_ads',
      engagement_type: 'comment',
      post_id: value.post_id,
      comment_id: value.comment_id,
      created_time: value.created_time,
      message: value.message,
      from_user: value.from,
      raw_data: value,
    })

    if (error) {
      logger.error('Failed to store comment', { error })
    }
  } catch (error) {
    logger.error('Comment handling error', { error })
  }
}

/**
 * Handle Post events
 */
async function handlePost(supabase: any, value: any) {
  try {
    logger.info('Post event received', {
      postId: value.post_id,
      verb: value.verb,
    })

    // Update post engagement metrics
    // Implementation here
  } catch (error) {
    logger.error('Post handling error', { error })
  }
}

