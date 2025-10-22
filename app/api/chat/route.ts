import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

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

    const { messages } = await request.json()

    // Get user's profile and tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, full_name')
      .eq('id', user.id)
      .single()

    // Fetch some sample campaign data for context
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .eq('tenant_id', profile?.tenant_id)
      .limit(10)

    // Build context for Claude
    const systemPrompt = `You are an AI marketing analytics assistant helping analyze advertising campaign performance across Google Ads, Meta Ads, and LinkedIn Ads.

Current user: ${profile?.full_name || user.email}

Available campaign data: ${
      campaigns && campaigns.length > 0
        ? JSON.stringify(campaigns, null, 2)
        : 'No campaigns connected yet. This is a demo account.'
    }

You should:
- Provide actionable insights about campaign performance
- Suggest optimization strategies
- Explain metrics like ROAS, CTR, CPA, and conversions
- Compare platforms when asked
- Identify trends and anomalies
- Be concise but thorough
- Use specific numbers when available

When the user asks about their campaigns and no real data is available, provide helpful examples using realistic demo data and explain how to connect their actual ad accounts.`

    // Convert messages to Claude format
    const claudeMessages = messages
      .filter((m: any) => m.role !== 'system')
      .map((m: any) => ({
        role: m.role,
        content: m.content,
      }))

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: claudeMessages,
    })

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : ''

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

    return NextResponse.json({ message: assistantMessage })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error.message },
      { status: 500 }
    )
  }
}

