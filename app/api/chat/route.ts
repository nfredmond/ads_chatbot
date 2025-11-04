import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import logger from '@/lib/logging/logger'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  let user: any = null
  
  try {
    const supabase = await createClient()

    // Check authentication
    const authResponse = await supabase.auth.getUser()
    user = authResponse.data.user

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

    // Fetch campaign data with metrics - JOIN with campaigns to get platform info
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, campaign_id, campaign_name, platform, status, budget_amount')
      .eq('tenant_id', profile?.tenant_id)
      .limit(50)

    // Fetch recent metrics - separate query to avoid JOIN type issues
    const { data: recentMetrics } = await supabase
      .from('campaign_metrics')
      .select('date, impressions, clicks, conversions, spend, revenue, campaign_id')
      .eq('tenant_id', profile?.tenant_id)
      .order('date', { ascending: false })
      .limit(100)

    // Build campaign platform map for metrics lookup
    // campaign_metrics.campaign_id is the database UUID (campaigns.id), not the API campaign_id
    const campaignPlatformMap = new Map<string, string>()
    if (campaigns) {
      for (const campaign of campaigns) {
        // Map by campaign.id (database UUID) - this is what campaign_metrics.campaign_id references
        campaignPlatformMap.set(campaign.id, campaign.platform)
      }
    }

    // Also fetch any campaigns that might be missing from the initial query
    if (recentMetrics && recentMetrics.length > 0) {
      const campaignIds = [...new Set(recentMetrics.map((m: any) => m.campaign_id).filter(Boolean))]
      const existingIds = new Set(campaigns?.map((c: any) => c.id) || [])
      const missingIds = campaignIds.filter((id) => !existingIds.has(id))
      
      if (missingIds.length > 0) {
        const { data: campaignPlatforms } = await supabase
          .from('campaigns')
          .select('id, platform')
          .eq('tenant_id', profile?.tenant_id)
          .in('id', missingIds)

        if (campaignPlatforms) {
          for (const campaign of campaignPlatforms) {
            campaignPlatformMap.set(campaign.id, campaign.platform)
          }
        }
      }
    }

    // Also fetch campaign IDs to platform mapping
    if (recentMetrics && recentMetrics.length > 0) {
      const campaignIds = [...new Set(recentMetrics.map((m: any) => m.campaign_id).filter(Boolean))]
      if (campaignIds.length > 0) {
        const { data: campaignPlatforms } = await supabase
          .from('campaigns')
          .select('id, campaign_id, platform')
          .eq('tenant_id', profile?.tenant_id)
          .in('id', campaignIds)

        if (campaignPlatforms) {
          for (const campaign of campaignPlatforms) {
            campaignPlatformMap.set(campaign.id, campaign.platform)
          }
        }
      }
    }

    // Calculate summary stats
    const totalSpend = recentMetrics?.reduce((sum, m) => sum + (Number(m.spend) || 0), 0) || 0
    const totalRevenue = recentMetrics?.reduce((sum, m) => sum + (Number(m.revenue) || 0), 0) || 0
    const totalConversions = recentMetrics?.reduce((sum, m) => sum + (m.conversions || 0), 0) || 0
    const totalImpressions = recentMetrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0
    const totalClicks = recentMetrics?.reduce((sum, m) => sum + (m.clicks || 0), 0) || 0
    const avgROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0

    // Calculate platform-specific stats
    const platformStats: Record<string, any> = {}
    if (recentMetrics) {
      for (const metric of recentMetrics) {
        // Get platform from campaign map using campaign_id
        const platform = campaignPlatformMap.get(metric.campaign_id) || 'unknown'
        if (!platformStats[platform]) {
          platformStats[platform] = {
            spend: 0,
            revenue: 0,
            conversions: 0,
            impressions: 0,
            clicks: 0,
            campaigns: new Set(),
          }
        }
        platformStats[platform].spend += Number(metric.spend) || 0
        platformStats[platform].revenue += Number(metric.revenue) || 0
        platformStats[platform].conversions += metric.conversions || 0
        platformStats[platform].impressions += metric.impressions || 0
        platformStats[platform].clicks += metric.clicks || 0
      }
    }

    // Convert platform stats to readable format
    const platformBreakdown = Object.entries(platformStats).map(([platform, stats]: [string, any]) => ({
      platform: platform.replace('_ads', '').toUpperCase(),
      spend: stats.spend,
      revenue: stats.revenue,
      conversions: stats.conversions,
      impressions: stats.impressions,
      clicks: stats.clicks,
      roas: stats.spend > 0 ? stats.revenue / stats.spend : 0,
      ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
    }))

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
OVERALL CAMPAIGN SUMMARY:
- Total Active Campaigns: ${campaigns.length}
- Total Ad Spend (last 30 days): $${totalSpend.toFixed(2)}
- Total Revenue: $${totalRevenue.toFixed(2)}
- Total Conversions: ${totalConversions}
- Total Impressions: ${totalImpressions.toLocaleString()}
- Total Clicks: ${totalClicks}
- Average ROAS: ${avgROAS.toFixed(2)}x
- Overall CTR: ${totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0}%

PLATFORM-SPECIFIC BREAKDOWN:
${platformBreakdown.length > 0 ? JSON.stringify(platformBreakdown, null, 2) : 'No platform-specific data available'}

TOP CAMPAIGNS (by spend):
${JSON.stringify(
  campaigns
    .sort((a, b) => (b.budget_amount || 0) - (a.budget_amount || 0))
    .slice(0, 10)
    .map((c: any) => ({
      name: c.campaign_name,
      platform: c.platform.replace('_ads', '').toUpperCase(),
      status: c.status,
      budget: c.budget_amount,
    })),
  null,
  2
)}

RECENT METRICS (last 14 days):
${JSON.stringify(
  recentMetrics
    ?.slice(0, 14)
    .map((m: any) => {
      const platform = campaignPlatformMap.get(m.campaign_id) || 'unknown'
      return {
        date: m.date,
        platform: platform.replace('_ads', '').toUpperCase(),
        spend: Number(m.spend) || 0,
        revenue: Number(m.revenue) || 0,
        conversions: m.conversions || 0,
        impressions: m.impressions || 0,
        clicks: m.clicks || 0,
      }
    }),
  null,
  2
)}
` : `
⚠️ NO CAMPAIGN DATA CONNECTED YET

The user needs to:
1. Connect their ad platform accounts in Settings (Google Ads, Meta Ads, LinkedIn Ads)
2. Click "Sync Data" button after connecting accounts
3. Wait for data to populate (usually takes 10-30 seconds)

When the user asks about campaigns, politely inform them they need to:
- Connect their ad accounts in Settings → Ad Platforms
- Click "Sync Data" to fetch campaign information
- Wait a moment for data to load

Once connected, you'll be able to provide insights on:
- Campaign performance across platforms
- ROAS, CTR, and conversion metrics
- Platform comparisons
- Optimization recommendations
- Budget allocation insights`}

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

