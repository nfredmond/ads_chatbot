import { generateObject } from 'ai';
import { z } from 'zod';
import 'dotenv/config';
import { config } from 'dotenv';

config({ path: '.env.local' });

// Define a schema for ad campaign analysis
const AdCampaignAnalysis = z.object({
  campaignName: z.string().describe('A creative name for the campaign'),
  targetAudience: z.object({
    ageRange: z.string(),
    interests: z.array(z.string()),
    demographics: z.string(),
  }),
  recommendedPlatforms: z.array(z.enum(['Google Ads', 'Meta Ads', 'LinkedIn Ads', 'TikTok Ads', 'Twitter Ads'])),
  budgetAllocation: z.object({
    daily: z.number(),
    monthly: z.number(),
    breakdown: z.record(z.string(), z.number()),
  }),
  keyMessages: z.array(z.string()),
  expectedMetrics: z.object({
    impressions: z.string(),
    ctr: z.string(),
    conversions: z.string(),
  }),
});

async function main() {
  console.log('🎯 Generating Structured Ad Campaign Analysis...\n');

  const result = await generateObject({
    model: 'openai/gpt-4o-mini',
    schema: AdCampaignAnalysis,
    prompt: 'Create a digital advertising campaign strategy for a new sustainable fashion brand targeting eco-conscious millennials with a $5000 monthly budget.',
  });

  console.log('📊 Campaign Analysis:\n');
  console.log(JSON.stringify(result.object, null, 2));
  
  console.log('\n📈 Token Usage:', result.usage);
}

main().catch(console.error);

