import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import logger from '@/lib/logging/logger'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, model = 'claude-3-5-sonnet-20241022' } = await request.json()

    // Get user's profile and tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, full_name')
      .eq('id', user.id)
      .single()

    // Fetch connected ad accounts
    const { data: adAccounts } = await supabase
      .from('ad_accounts')
      .select('platform, account_name, status')
      .eq('tenant_id', profile?.tenant_id)
      .eq('status', 'active')

    // Fetch campaign data with metrics
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, campaign_name, platform, status, budget_amount')
      .eq('tenant_id', profile?.tenant_id)
      .limit(20)

    // Fetch recent metrics
    const { data: recentMetrics } = await supabase
      .from('campaign_metrics')
      .select('date, impressions, clicks, conversions, spend, revenue')
      .eq('tenant_id', profile?.tenant_id)
      .order('date', { ascending: false })
      .limit(30)

    // Calculate summary stats
    const totalSpend = recentMetrics?.reduce((sum, m) => sum + (Number(m.spend) || 0), 0) || 0
    const totalRevenue = recentMetrics?.reduce((sum, m) => sum + (Number(m.revenue) || 0), 0) || 0
    const totalConversions = recentMetrics?.reduce((sum, m) => sum + (m.conversions || 0), 0) || 0
    const totalImpressions = recentMetrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0
    const totalClicks = recentMetrics?.reduce((sum, m) => sum + (m.clicks || 0), 0) || 0
    const avgROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0

    const hasData = campaigns && campaigns.length > 0

    logger.info('Chat request received', {
      userId: user.id,
      hasData,
      campaignCount: campaigns?.length || 0,
      connectedPlatforms: adAccounts?.length || 0,
    })

    // Build context for Claude
    const systemPrompt = `You are an AI marketing analytics assistant helping ${profile?.full_name || user.email} analyze their advertising campaign performance across Google Ads, Meta Ads, and LinkedIn Ads.

Connected Ad Platforms: ${adAccounts?.map((a) => a.platform.replace('_ads', '').toUpperCase()).join(', ') || 'None'}

${hasData ? `
Campaign Summary:
- Total Active Campaigns: ${campaigns.length}
- Total Ad Spend (last 30 days): $${totalSpend.toFixed(2)}
- Total Revenue: $${totalRevenue.toFixed(2)}
- Total Conversions: ${totalConversions}
- Total Impressions: ${totalImpressions.toLocaleString()}
- Total Clicks: ${totalClicks}
- Average ROAS: ${avgROAS.toFixed(2)}x
- CTR: ${totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0}%

Campaign Details:
${JSON.stringify(campaigns.slice(0, 10), null, 2)}

Recent Metrics (last 7 days):
${JSON.stringify(recentMetrics?.slice(0, 7), null, 2)}
` : `
⚠️ NO CAMPAIGN DATA CONNECTED YET

The user needs to:
1. Connect their ad platform accounts in Settings
2. Sync campaign data from their accounts
3. Wait for data to populate the dashboard

When the user asks about campaigns, politely inform them they need to connect their ad accounts first. Explain what they can do with the platform once connected.`}

You should:
- Provide actionable insights about campaign performance
- Suggest optimization strategies based on actual data
- Explain metrics like ROAS, CTR, CPA, and conversions
- Compare platforms when asked
- Identify trends and anomalies
- Be concise but thorough
- Use specific numbers from their actual data
- If no data is available, guide them to connect their accounts in Settings`

    // Convert messages to Claude format
    const claudeMessages = messages
      .filter((m: any) => m.role !== 'system')
      .map((m: any) => ({
        role: m.role,
        content: m.content,
      }))

    let assistantMessage = ''

    // Check if using OpenAI model
    if (model.startsWith('gpt-') || model.startsWith('o1-')) {
      // Use OpenAI API (if configured)
      const openaiApiKey = process.env.OPENAI_API_KEY
      if (!openaiApiKey) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.' },
          { status: 500 }
        )
      }

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...claudeMessages,
          ],
          max_tokens: 1024,
        }),
      })

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json().catch(() => ({}))
        console.error('OpenAI API error:', errorData)
        throw new Error(`OpenAI API request failed: ${errorData.error?.message || openaiResponse.statusText}`)
      }

      const openaiData = await openaiResponse.json()
      assistantMessage = openaiData.choices[0]?.message?.content || ''
    } else {
      // Use Claude API
    const response = await anthropic.messages.create({
        model: model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: claudeMessages,
    })

      assistantMessage = response.content[0].type === 'text' ? response.content[0].text : ''
    }

    // Save conversation to database
    try {
      // Create or get conversation
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      let conversationId = existingConversation?.id

      if (!conversationId && profile) {
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            tenant_id: profile.tenant_id,
            title: messages[1]?.content?.substring(0, 50) || 'New Conversation',
          })
          .select('id')
          .single()

        conversationId = newConversation?.id
      }

      // Save messages
      if (conversationId) {
        await supabase.from('messages').insert([
          {
            conversation_id: conversationId,
            role: 'user',
            content: messages[messages.length - 1].content,
          },
          {
            conversation_id: conversationId,
            role: 'assistant',
            content: assistantMessage,
          },
        ])
      }
    } catch (error) {
      console.error('Error saving conversation:', error)
      // Continue even if saving fails
    }

    logger.info('Chat response generated successfully', {
      userId: user.id,
      responseLength: assistantMessage.length,
    })

    return NextResponse.json({ message: assistantMessage })
  } catch (error: any) {
    logger.error('Chat API error', { error, userId: user?.id })
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error.message },
      { status: 500 }
    )
  }
}

