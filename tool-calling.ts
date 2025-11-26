import { generateText, tool } from 'ai';
import { z } from 'zod';
import 'dotenv/config';
import { config } from 'dotenv';

config({ path: '.env.local' });

// Define tools the AI can use
const tools = {
  getCampaignMetrics: tool({
    description: 'Get performance metrics for an advertising campaign',
    parameters: z.object({
      campaignId: z.string().describe('The campaign identifier'),
      dateRange: z.enum(['today', 'week', 'month', 'quarter']).describe('Time period for metrics'),
    }),
    execute: async ({ campaignId, dateRange }) => {
      // Simulated campaign data
      console.log(`\n📊 Fetching metrics for campaign "${campaignId}" (${dateRange})...`);
      return {
        campaignId,
        dateRange,
        impressions: Math.floor(Math.random() * 100000) + 10000,
        clicks: Math.floor(Math.random() * 5000) + 500,
        conversions: Math.floor(Math.random() * 200) + 20,
        spend: (Math.random() * 1000 + 100).toFixed(2),
        ctr: (Math.random() * 5 + 1).toFixed(2) + '%',
        roas: (Math.random() * 4 + 1).toFixed(2) + 'x',
      };
    },
  }),
  
  suggestOptimization: tool({
    description: 'Get AI-powered optimization suggestions for a campaign',
    parameters: z.object({
      campaignType: z.enum(['search', 'display', 'social', 'video']),
      currentCtr: z.number().describe('Current click-through rate percentage'),
      budget: z.number().describe('Current daily budget'),
    }),
    execute: async ({ campaignType, currentCtr, budget }) => {
      console.log(`\n💡 Generating optimizations for ${campaignType} campaign...`);
      return {
        suggestions: [
          `Increase budget by 20% - your ${campaignType} campaign shows strong potential`,
          `Test new ad creatives - CTR of ${currentCtr}% could improve with A/B testing`,
          'Expand audience targeting to similar demographics',
          'Add negative keywords to reduce wasted spend',
        ],
        estimatedImpact: '+15-25% performance improvement',
      };
    },
  }),
};

async function main() {
  console.log('🔧 AI Tool Calling Demo - Ad Campaign Assistant\n');
  console.log('═'.repeat(50));

  const result = await generateText({
    model: 'openai/gpt-4o-mini',
    tools,
    maxSteps: 5, // Allow multiple tool calls
    prompt: `I want to analyze my "Summer Sale 2024" campaign performance for this month 
             and get optimization suggestions. It's a search campaign with a 2.5% CTR 
             and $150 daily budget.`,
  });

  console.log('\n' + '═'.repeat(50));
  console.log('\n🤖 AI Analysis:\n');
  console.log(result.text);
  
  console.log('\n📈 Tool Calls Made:');
  result.toolCalls?.forEach((call, i) => {
    console.log(`  ${i + 1}. ${call.toolName}(${JSON.stringify(call.args)})`);
  });
}

main().catch(console.error);

