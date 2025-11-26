/**
 * AI Gateway Ads Assistant
 * Connects to real user ad platform data via Supabase
 * Uses Vercel AI SDK with tool calling for dynamic data retrieval
 */

import { streamText, tool, generateText } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { config } from 'dotenv';
import * as readline from 'readline';

config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Type definitions matching your database schema
interface AdAccount {
  id: string;
  tenant_id: string;
  platform: 'google_ads' | 'meta_ads' | 'linkedin_ads';
  account_id: string;
  account_name: string;
  status: string;
  last_synced_at: string | null;
}

interface Campaign {
  id: string;
  tenant_id: string;
  campaign_id: string;
  campaign_name: string;
  platform: string;
  status: string;
  budget_amount: number | null;
  objective: string | null;
}

interface CampaignMetric {
  id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}

// Define tools the AI can use to query REAL user data
const adsTools = {
  getConnectedPlatforms: tool({
    description: 'Get all connected ad platforms for a user/tenant. Returns which platforms (Google Ads, Meta Ads, LinkedIn Ads) are connected and their status.',
    parameters: z.object({
      tenantId: z.string().describe('The tenant UUID to query'),
    }),
    execute: async ({ tenantId }: { tenantId: string }) => {
      console.log(`\n📡 Fetching connected platforms for tenant ${tenantId}...`);
      
      const { data, error } = await supabase
        .from('ad_accounts')
        .select('platform, account_name, status, last_synced_at')
        .eq('tenant_id', tenantId);

      if (error) {
        return { error: error.message, platforms: [] };
      }

      return {
        connectedPlatforms: data?.map(a => ({
          platform: a.platform.replace('_ads', '').toUpperCase(),
          accountName: a.account_name,
          status: a.status,
          lastSynced: a.last_synced_at,
        })) || [],
        totalConnected: data?.length || 0,
      };
    },
  }),

  getCampaignOverview: tool({
    description: 'Get an overview of all campaigns for a tenant, optionally filtered by platform. Returns campaign names, status, budgets, and platforms.',
    parameters: z.object({
      tenantId: z.string().describe('The tenant UUID to query'),
      platform: z.enum(['google_ads', 'meta_ads', 'linkedin_ads']).optional().describe('Optional: filter by specific platform'),
    }),
    execute: async ({ tenantId, platform }: { tenantId: string; platform?: 'google_ads' | 'meta_ads' | 'linkedin_ads' }) => {
      console.log(`\n📊 Fetching campaigns for tenant ${tenantId}${platform ? ` (${platform})` : ''}...`);
      
      let query = supabase
        .from('campaigns')
        .select('campaign_name, platform, status, budget_amount, objective')
        .eq('tenant_id', tenantId);

      if (platform) {
        query = query.eq('platform', platform);
      }

      const { data, error } = await query.order('budget_amount', { ascending: false });

      if (error) {
        return { error: error.message, campaigns: [] };
      }

      if (!data || data.length === 0) {
        return {
          message: 'No campaigns found. The user may need to sync their ad platform data.',
          campaigns: [],
          totalCampaigns: 0,
        };
      }

      return {
        campaigns: data.map(c => ({
          name: c.campaign_name,
          platform: c.platform.replace('_ads', '').toUpperCase(),
          status: c.status,
          budget: c.budget_amount ? `$${c.budget_amount}` : 'Not set',
          objective: c.objective || 'Not specified',
        })),
        totalCampaigns: data.length,
        byPlatform: {
          google: data.filter(c => c.platform === 'google_ads').length,
          meta: data.filter(c => c.platform === 'meta_ads').length,
          linkedin: data.filter(c => c.platform === 'linkedin_ads').length,
        },
      };
    },
  }),

  getPerformanceMetrics: tool({
    description: 'Get performance metrics (impressions, clicks, conversions, spend, revenue, ROAS, CTR) for campaigns. Can filter by date range.',
    parameters: z.object({
      tenantId: z.string().describe('The tenant UUID to query'),
      dateRange: z.enum(['7days', '14days', '30days', '90days']).default('30days').describe('Time period for metrics'),
    }),
    execute: async ({ tenantId, dateRange }: { tenantId: string; dateRange: '7days' | '14days' | '30days' | '90days' }) => {
      console.log(`\n📈 Fetching performance metrics for ${dateRange}...`);
      
      const daysMap = { '7days': 7, '14days': 14, '30days': 30, '90days': 90 };
      const days = daysMap[dateRange];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data: metrics, error } = await supabase
        .from('campaign_metrics')
        .select('impressions, clicks, conversions, spend, revenue, date')
        .eq('tenant_id', tenantId)
        .gte('date', startDate.toISOString().split('T')[0]);

      if (error) {
        return { error: error.message };
      }

      if (!metrics || metrics.length === 0) {
        return {
          message: 'No metrics data available. The user needs to sync their ad platform data to see performance metrics.',
          hasData: false,
        };
      }

      // Aggregate metrics
      const totals = metrics.reduce((acc, m) => ({
        impressions: acc.impressions + (m.impressions || 0),
        clicks: acc.clicks + (m.clicks || 0),
        conversions: acc.conversions + (m.conversions || 0),
        spend: acc.spend + (Number(m.spend) || 0),
        revenue: acc.revenue + (Number(m.revenue) || 0),
      }), { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 });

      return {
        period: dateRange,
        totalImpressions: totals.impressions.toLocaleString(),
        totalClicks: totals.clicks.toLocaleString(),
        totalConversions: totals.conversions,
        totalSpend: `$${totals.spend.toFixed(2)}`,
        totalRevenue: `$${totals.revenue.toFixed(2)}`,
        roas: totals.spend > 0 ? `${(totals.revenue / totals.spend).toFixed(2)}x` : 'N/A',
        ctr: totals.impressions > 0 ? `${((totals.clicks / totals.impressions) * 100).toFixed(2)}%` : 'N/A',
        cpc: totals.clicks > 0 ? `$${(totals.spend / totals.clicks).toFixed(2)}` : 'N/A',
        cpa: totals.conversions > 0 ? `$${(totals.spend / totals.conversions).toFixed(2)}` : 'N/A',
        hasData: true,
      };
    },
  }),

  comparePlatforms: tool({
    description: 'Compare performance across different ad platforms (Google, Meta, LinkedIn). Shows which platform performs best for different metrics.',
    parameters: z.object({
      tenantId: z.string().describe('The tenant UUID to query'),
    }),
    execute: async ({ tenantId }: { tenantId: string }) => {
      console.log(`\n🔄 Comparing platform performance...`);
      
      // Get campaigns with their platforms
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, platform')
        .eq('tenant_id', tenantId);

      if (!campaigns || campaigns.length === 0) {
        return {
          message: 'No campaigns to compare. Connect and sync ad platforms first.',
          comparison: [],
        };
      }

      const campaignPlatformMap = new Map(campaigns.map(c => [c.id, c.platform]));

      // Get metrics
      const { data: metrics } = await supabase
        .from('campaign_metrics')
        .select('campaign_id, impressions, clicks, conversions, spend, revenue')
        .eq('tenant_id', tenantId);

      if (!metrics || metrics.length === 0) {
        return {
          message: 'No metrics data to compare. Sync your ad platforms to see comparison.',
          comparison: [],
        };
      }

      // Aggregate by platform
      const platformStats: Record<string, any> = {};
      metrics.forEach(m => {
        const platform = campaignPlatformMap.get(m.campaign_id) || 'unknown';
        if (!platformStats[platform]) {
          platformStats[platform] = { spend: 0, revenue: 0, clicks: 0, impressions: 0, conversions: 0 };
        }
        platformStats[platform].spend += Number(m.spend) || 0;
        platformStats[platform].revenue += Number(m.revenue) || 0;
        platformStats[platform].clicks += m.clicks || 0;
        platformStats[platform].impressions += m.impressions || 0;
        platformStats[platform].conversions += m.conversions || 0;
      });

      const comparison = Object.entries(platformStats).map(([platform, stats]: [string, any]) => ({
        platform: platform.replace('_ads', '').toUpperCase(),
        spend: `$${stats.spend.toFixed(2)}`,
        revenue: `$${stats.revenue.toFixed(2)}`,
        roas: stats.spend > 0 ? `${(stats.revenue / stats.spend).toFixed(2)}x` : 'N/A',
        ctr: stats.impressions > 0 ? `${((stats.clicks / stats.impressions) * 100).toFixed(2)}%` : 'N/A',
        conversions: stats.conversions,
      }));

      // Determine best performers
      const bestRoas = comparison.reduce((best, p) => {
        const roasNum = parseFloat(p.roas) || 0;
        return roasNum > (parseFloat(best?.roas) || 0) ? p : best;
      }, comparison[0]);

      return {
        comparison,
        insights: {
          bestRoas: bestRoas?.platform,
          recommendation: comparison.length > 1 
            ? `Consider allocating more budget to ${bestRoas?.platform} which has the highest ROAS.`
            : 'Connect more platforms to enable comparison.',
        },
      };
    },
  }),

  getUserContext: tool({
    description: 'Get the current user context including their tenant ID, name, and connected accounts. Use this first to identify the user before querying their data.',
    parameters: z.object({
      email: z.string().email().describe('The user email address'),
    }),
    execute: async ({ email }: { email: string }) => {
      console.log(`\n👤 Looking up user: ${email}...`);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, tenant_id, email')
        .eq('email', email)
        .single();

      if (error || !profile) {
        return { 
          error: 'User not found. They may need to sign up first.',
          found: false,
        };
      }

      // Get their connected accounts count
      const { data: accounts } = await supabase
        .from('ad_accounts')
        .select('platform, status')
        .eq('tenant_id', profile.tenant_id);

      return {
        found: true,
        userId: profile.id,
        tenantId: profile.tenant_id,
        fullName: profile.full_name,
        email: profile.email,
        connectedAccounts: {
          total: accounts?.filter(a => a.status === 'active').length || 0,
          platforms: accounts?.map(a => a.platform.replace('_ads', '').toUpperCase()) || [],
        },
      };
    },
  }),
};

// Conversation history for multi-turn chat
const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

// Current user context (set after first identification)
let currentUserContext: { tenantId: string; fullName: string; email: string } | null = null;

async function chat(userMessage: string): Promise<string> {
  conversationHistory.push({ role: 'user', content: userMessage });

  const systemPrompt = `You are an AI marketing analytics assistant helping users understand their advertising campaign performance across Google Ads, Meta Ads, and LinkedIn Ads.

${currentUserContext ? `
CURRENT USER CONTEXT:
- Name: ${currentUserContext.fullName}
- Email: ${currentUserContext.email}
- Tenant ID: ${currentUserContext.tenantId}

When querying data, use the tenant ID: ${currentUserContext.tenantId}
` : `
No user identified yet. Ask for their email to look them up, or they can identify themselves.
`}

CAPABILITIES:
- View connected ad platforms and their sync status
- Analyze campaign performance metrics (impressions, clicks, conversions, spend, revenue)
- Calculate ROAS, CTR, CPC, CPA
- Compare performance across platforms
- Provide optimization recommendations

GUIDELINES:
1. Always use the tools to fetch REAL data - never make up numbers
2. If no data exists, explain the user needs to connect and sync their ad platforms
3. Provide actionable insights based on actual performance
4. Be concise but thorough
5. Format numbers clearly (with $ for currency, % for rates)

Available ad platforms: Google Ads, Meta Ads (Facebook/Instagram), LinkedIn Ads`;

  const result = await generateText({
    model: 'openai/gpt-4o-mini',
    tools: adsTools,
    maxSteps: 5,
    system: systemPrompt,
    messages: conversationHistory,
  });

  // Check if user context was retrieved
  for (const step of result.steps || []) {
    for (const toolResult of step.toolResults || []) {
      if (toolResult.toolName === 'getUserContext' && (toolResult.result as any)?.found) {
        const ctx = toolResult.result as any;
        currentUserContext = {
          tenantId: ctx.tenantId,
          fullName: ctx.fullName,
          email: ctx.email,
        };
      }
    }
  }

  const assistantMessage = result.text;
  conversationHistory.push({ role: 'assistant', content: assistantMessage });

  return assistantMessage;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║     🚀 AI Gateway Ads Assistant - Connected to Real Data 🚀      ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log('║  This assistant connects to your Supabase database and can       ║');
  console.log('║  query real campaign data from Google, Meta, and LinkedIn Ads.   ║');
  console.log('║                                                                  ║');
  console.log('║  Try: "Look up user strickermike3@gmail.com"                     ║');
  console.log('║       "Show me connected platforms"                              ║');
  console.log('║       "What\'s my campaign performance?"                          ║');
  console.log('║                                                                  ║');
  console.log('║  Type "exit" to quit.                                            ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = (): void => {
    rl.question('👤 You: ', async (input) => {
      const userInput = input.trim();

      if (userInput.toLowerCase() === 'exit') {
        console.log('\n👋 Goodbye!\n');
        rl.close();
        return;
      }

      if (!userInput) {
        prompt();
        return;
      }

      try {
        console.log('\n🤖 Assistant: ');
        const response = await chat(userInput);
        console.log(response);
        console.log('');
      } catch (error) {
        console.error('Error:', error);
      }

      prompt();
    });
  };

  prompt();
}

main().catch(console.error);

