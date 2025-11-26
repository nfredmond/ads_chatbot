module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://pfatayebacwjehlfxipx.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmYXRheWViYWN3amVobGZ4aXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjMyOTMsImV4cCI6MjA3NjczOTI5M30.Q-MfA4eqteLtKAqEtZadEBNw3ak8OESTDFnBv0RXwzI"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
                }
            }
        }
    });
}
}),
"[project]/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "maxDuration",
    ()=>maxDuration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ai/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$gateway$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ai-sdk/gateway/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
;
;
// Initialize Vercel AI Gateway
const gateway = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$gateway$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createGateway"])({
    apiKey: process.env.AI_GATEWAY_API_KEY
});
// Model ID mapping - convert UI display IDs to actual Vercel AI Gateway model IDs
// See: https://vercel.com/docs/ai-gateway/models-and-providers
const MODEL_MAP = {
    // Anthropic models - use actual Claude 4 models
    'anthropic/claude-sonnet-4-5': 'anthropic/claude-sonnet-4',
    'anthropic/claude-opus-4-5': 'anthropic/claude-opus-4',
    'anthropic/claude-haiku-4-5': 'anthropic/claude-haiku-4',
    // OpenAI models - map fictional GPT-5 to available GPT-4o models
    'openai/gpt-5': 'openai/gpt-4o',
    'openai/gpt-5-mini': 'openai/gpt-4o-mini',
    'openai/gpt-5-nano': 'openai/gpt-4o-mini',
    'openai/gpt-5-pro': 'openai/o1',
    'openai/gpt-5-codex': 'openai/gpt-4o',
    'openai/gpt-5.1': 'openai/gpt-4.1',
    'openai/gpt-5.1-chat-latest': 'openai/gpt-4.1',
    'openai/gpt-5.1-codex': 'openai/gpt-4.1',
    'openai/gpt-5.1-codex-mini': 'openai/gpt-4.1-mini',
    'openai/gpt-5.1-codex-max': 'openai/gpt-4.1',
    // Google models - use Gemini 2.0 models
    'google/gemini-3': 'google/gemini-2.0-flash',
    'google/gemini-3-pro': 'google/gemini-2.0-flash',
    'google/gemini-3-flash': 'google/gemini-2.0-flash'
};
const maxDuration = 60;
async function POST(request) {
    try {
        const { messages, model = 'anthropic/claude-sonnet-4-5' } = await request.json();
        // Check for API key
        if (!process.env.AI_GATEWAY_API_KEY) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'AI Gateway API key not configured. Please add AI_GATEWAY_API_KEY to environment variables.'
            }, {
                status: 500
            });
        }
        // Map UI model ID to gateway model ID
        const gatewayModelId = MODEL_MAP[model] || 'anthropic/claude-sonnet-4';
        // Create authenticated Supabase client
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        let tenantId = null;
        let customInstructions = null;
        if (user) {
            // Get user's tenant and custom instructions
            const { data: profile } = await supabase.from('profiles').select('tenant_id, custom_ai_instructions').eq('id', user.id).single();
            tenantId = profile?.tenant_id || null;
            customInstructions = profile?.custom_ai_instructions || null;
        }
        // Fetch connected ad accounts for this tenant
        let adAccounts = [];
        let campaigns = [];
        let recentMetrics = [];
        let customerMetrics = [];
        if (tenantId) {
            const { data: accounts } = await supabase.from('ad_accounts').select('platform, account_name, status').eq('tenant_id', tenantId).eq('status', 'active');
            adAccounts = accounts || [];
            // Fetch campaign data for this tenant including customer info
            const { data: campaignData } = await supabase.from('campaigns').select('id, campaign_id, campaign_name, platform, status, budget_amount, customer_id, customer_name').eq('tenant_id', tenantId).limit(200);
            campaigns = campaignData || [];
            // Fetch recent metrics for this tenant (last 30 days to match dashboard)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const startDate = thirtyDaysAgo.toISOString().split('T')[0];
            const { data: metricsData } = await supabase.from('campaign_metrics').select('date, impressions, clicks, conversions, spend, revenue, campaign_id').eq('tenant_id', tenantId).gte('date', startDate).order('date', {
                ascending: false
            });
            recentMetrics = metricsData || [];
            // Calculate customer-level metrics
            const campaignToCustomer = new Map();
            for (const campaign of campaigns){
                if (campaign.customer_id) {
                    campaignToCustomer.set(campaign.id, {
                        id: campaign.customer_id,
                        name: campaign.customer_name || campaign.customer_id
                    });
                }
            }
            const customerAggregates = new Map();
            for (const metric of recentMetrics){
                const customer = campaignToCustomer.get(metric.campaign_id);
                if (customer) {
                    const existing = customerAggregates.get(customer.id) || {
                        name: customer.name,
                        spend: 0,
                        revenue: 0,
                        conversions: 0,
                        clicks: 0,
                        impressions: 0
                    };
                    existing.spend += Number(metric.spend) || 0;
                    existing.revenue += Number(metric.revenue) || 0;
                    existing.conversions += Number(metric.conversions) || 0;
                    existing.clicks += metric.clicks || 0;
                    existing.impressions += metric.impressions || 0;
                    customerAggregates.set(customer.id, existing);
                }
            }
            customerMetrics = Array.from(customerAggregates.entries()).map(([id, data])=>({
                    id,
                    name: data.name,
                    spend: data.spend,
                    revenue: data.revenue,
                    conversions: data.conversions,
                    clicks: data.clicks,
                    impressions: data.impressions,
                    roas: data.spend > 0 ? data.revenue / data.spend : 0,
                    ctr: data.impressions > 0 ? data.clicks / data.impressions * 100 : 0,
                    cpc: data.clicks > 0 ? data.spend / data.clicks : 0,
                    convRate: data.clicks > 0 ? data.conversions / data.clicks * 100 : 0
                })).sort((a, b)=>b.spend - a.spend);
        }
        // Calculate campaign-level performance metrics
        const campaignMetricsMap = new Map();
        for (const metric of recentMetrics){
            const existing = campaignMetricsMap.get(metric.campaign_id) || {
                spend: 0,
                revenue: 0,
                conversions: 0,
                clicks: 0,
                impressions: 0
            };
            existing.spend += Number(metric.spend) || 0;
            existing.revenue += Number(metric.revenue) || 0;
            existing.conversions += Number(metric.conversions) || 0;
            existing.clicks += metric.clicks || 0;
            existing.impressions += metric.impressions || 0;
            campaignMetricsMap.set(metric.campaign_id, existing);
        }
        const campaignPerformance = campaigns.map((c)=>{
            const metrics = campaignMetricsMap.get(c.id) || {
                spend: 0,
                revenue: 0,
                conversions: 0,
                clicks: 0,
                impressions: 0
            };
            return {
                name: c.campaign_name,
                customer: c.customer_name || 'Unknown',
                platform: c.platform,
                status: c.status,
                spend: metrics.spend,
                revenue: metrics.revenue,
                roas: metrics.spend > 0 ? metrics.revenue / metrics.spend : 0,
                conversions: metrics.conversions,
                clicks: metrics.clicks,
                impressions: metrics.impressions,
                ctr: metrics.impressions > 0 ? metrics.clicks / metrics.impressions * 100 : 0,
                cpc: metrics.clicks > 0 ? metrics.spend / metrics.clicks : 0
            };
        }).sort((a, b)=>b.spend - a.spend);
        console.log(`Chat API: User ${user?.id}, Tenant ${tenantId}, Accounts: ${adAccounts.length}, Campaigns: ${campaigns.length}, Metrics: ${recentMetrics.length}, Customers: ${customerMetrics.length}`);
        // Build campaign platform map
        const campaignPlatformMap = new Map();
        for (const campaign of campaigns){
            campaignPlatformMap.set(campaign.id, campaign.platform);
        }
        // Calculate summary stats
        const totalSpend = recentMetrics.reduce((sum, m)=>sum + (Number(m.spend) || 0), 0);
        const totalRevenue = recentMetrics.reduce((sum, m)=>sum + (Number(m.revenue) || 0), 0);
        const totalConversions = recentMetrics.reduce((sum, m)=>sum + (Number(m.conversions) || 0), 0);
        const totalImpressions = recentMetrics.reduce((sum, m)=>sum + (m.impressions || 0), 0);
        const totalClicks = recentMetrics.reduce((sum, m)=>sum + (m.clicks || 0), 0);
        const avgROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;
        // Calculate insights (after summary stats are calculated)
        const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
        const conversionRate = totalClicks > 0 ? totalConversions / totalClicks * 100 : 0;
        const costPerConversion = totalConversions > 0 ? totalSpend / totalConversions : 0;
        // Calculate platform-specific stats
        const platformStats = {};
        for (const metric of recentMetrics){
            const platform = campaignPlatformMap.get(metric.campaign_id) || 'google_ads';
            if (!platformStats[platform]) {
                platformStats[platform] = {
                    spend: 0,
                    revenue: 0,
                    conversions: 0,
                    impressions: 0,
                    clicks: 0
                };
            }
            platformStats[platform].spend += Number(metric.spend) || 0;
            platformStats[platform].revenue += Number(metric.revenue) || 0;
            platformStats[platform].conversions += Number(metric.conversions) || 0;
            platformStats[platform].impressions += metric.impressions || 0;
            platformStats[platform].clicks += metric.clicks || 0;
        }
        const platformBreakdown = Object.entries(platformStats).map(([platform, stats])=>({
                platform: platform.replace('_ads', '').toUpperCase(),
                spend: stats.spend.toFixed(2),
                revenue: stats.revenue.toFixed(2),
                conversions: stats.conversions.toFixed(1),
                impressions: stats.impressions,
                clicks: stats.clicks,
                roas: stats.spend > 0 ? (stats.revenue / stats.spend).toFixed(2) : '0',
                ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions * 100).toFixed(2) : '0'
            }));
        const hasData = campaigns.length > 0 || recentMetrics.length > 0;
        const hasConnectedAccounts = adAccounts.length > 0;
        // Build system prompt
        const systemPrompt = `You are an AI marketing analytics assistant helping analyze advertising campaign performance across Google Ads, Meta Ads, and LinkedIn Ads.

Connected Ad Platforms: ${adAccounts.map((a)=>a.platform.replace('_ads', '').toUpperCase()).join(', ') || 'None'}

${hasData ? `
OVERALL CAMPAIGN SUMMARY:
- Total Active Campaigns: ${campaigns.length}
- Total Ad Spend (last 30 days): $${totalSpend.toFixed(2)}
- Total Revenue: $${totalRevenue.toFixed(2)}
- Total Conversions: ${totalConversions.toFixed(1)}
- Total Impressions: ${totalImpressions.toLocaleString()}
- Total Clicks: ${totalClicks.toLocaleString()}
- Average ROAS: ${avgROAS.toFixed(2)}x
- Overall CTR: ${totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0}%

PLATFORM-SPECIFIC BREAKDOWN:
${platformBreakdown.length > 0 ? JSON.stringify(platformBreakdown, null, 2) : 'No platform-specific data available'}

TOP CAMPAIGNS (by budget):
${JSON.stringify(campaigns.sort((a, b)=>(b.budget_amount || 0) - (a.budget_amount || 0)).slice(0, 10).map((c)=>({
                name: c.campaign_name,
                platform: c.platform.replace('_ads', '').toUpperCase(),
                status: c.status,
                budget: c.budget_amount
            })), null, 2)}

DETAILED CAMPAIGN PERFORMANCE (top 20 by spend):
${campaignPerformance.slice(0, 20).map((c, i)=>`${i + 1}. ${c.name} (${c.customer}): $${c.spend.toFixed(2)} spend, $${c.revenue.toFixed(2)} revenue, ${c.roas.toFixed(2)}x ROAS, ${c.conversions.toFixed(0)} conversions, ${c.ctr.toFixed(2)}% CTR`).join('\n')}

BEST PERFORMING CAMPAIGNS (ROAS > 4x with spend > $50):
${campaignPerformance.filter((c)=>c.roas >= 4 && c.spend > 50).slice(0, 8).map((c)=>`- ${c.name} (${c.customer}): ${c.roas.toFixed(2)}x ROAS on $${c.spend.toFixed(2)} spend, ${c.conversions.toFixed(0)} conversions`).join('\n') || 'None identified with ROAS > 4x'}

UNDERPERFORMING CAMPAIGNS (ROAS < 1x with spend > $100):
${campaignPerformance.filter((c)=>c.roas < 1 && c.spend > 100).slice(0, 8).map((c)=>`- ${c.name} (${c.customer}): ${c.roas.toFixed(2)}x ROAS on $${c.spend.toFixed(2)} spend - consider pausing or restructuring`).join('\n') || 'No significantly underperforming campaigns identified'}

KEY EFFICIENCY METRICS:
- Average CPC: $${avgCPC.toFixed(2)}
- Conversion Rate: ${conversionRate.toFixed(2)}%
- Cost Per Conversion: $${costPerConversion.toFixed(2)}

CLIENT/CUSTOMER PERFORMANCE (sorted by spend):
${customerMetrics.length > 0 ? customerMetrics.slice(0, 15).map((c, i)=>`${i + 1}. ${c.name}: Spend $${c.spend.toFixed(2)}, Revenue $${c.revenue.toFixed(2)}, ROAS ${c.roas.toFixed(2)}x, Conversions ${c.conversions.toFixed(0)}, CTR ${c.ctr.toFixed(2)}%`).join('\n') : 'No customer-level data available'}

TOP PERFORMERS (ROAS > 3x):
${customerMetrics.filter((c)=>c.roas >= 3).length > 0 ? customerMetrics.filter((c)=>c.roas >= 3).slice(0, 5).map((c)=>`- ${c.name}: ${c.roas.toFixed(2)}x ROAS, $${c.spend.toFixed(2)} spend`).join('\n') : 'No top performers identified'}

CLIENTS NEEDING ATTENTION (ROAS < 1.5x with significant spend):
${customerMetrics.filter((c)=>c.roas < 1.5 && c.spend > 100).length > 0 ? customerMetrics.filter((c)=>c.roas < 1.5 && c.spend > 100).slice(0, 5).map((c)=>`- ${c.name}: ${c.roas.toFixed(2)}x ROAS, $${c.spend.toFixed(2)} spend - needs optimization`).join('\n') : 'All clients performing adequately'}
` : hasConnectedAccounts ? `
The user has connected their ad accounts but data is still syncing. Ask them to click "Sync Data" in Settings if they haven't already.
` : `
⚠️ NO CAMPAIGN DATA CONNECTED YET

The user needs to:
1. Connect their ad platform accounts in Settings (Google Ads, Meta Ads, LinkedIn Ads)
2. Click "Sync Data" button after connecting accounts
3. Wait for data to populate

Guide them to connect their accounts first.`}

You should:
- Provide actionable insights about campaign performance
- Suggest optimization strategies based on actual data
- Explain metrics like ROAS, CTR, CPA, CPC, and conversions in plain language
- Compare platforms when asked
- Be concise but thorough
- Use specific numbers from their actual data - always cite real figures
- If they have data, proactively highlight interesting patterns or concerns
- Recommend specific actions: which campaigns to scale, pause, or optimize
- When discussing a specific client, reference their full performance data
- For campaign questions, provide detailed analysis including spend, revenue, ROAS, and CTR
- Identify patterns across clients and campaigns
- Suggest budget reallocation based on performance data
- Alert about any campaigns that need immediate attention (high spend, low ROAS)

${customInstructions ? `
USER'S CUSTOM INSTRUCTIONS (follow these preferences):
${customInstructions}
` : ''}`;
        console.log(`Chat request: UI model="${model}" -> Gateway model="${gatewayModelId}"`);
        // Use AI SDK with Vercel AI Gateway
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateText"])({
            model: gateway(gatewayModelId),
            system: systemPrompt,
            messages: messages.map((m)=>({
                    role: m.role,
                    content: m.content
                }))
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: result.text
        });
    } catch (error) {
        console.error('Chat API Error:', error);
        console.error('Error details:', JSON.stringify({
            name: error.name,
            message: error.message,
            cause: error.cause,
            stack: error.stack?.split('\n').slice(0, 5)
        }, null, 2));
        // Provide more helpful error message
        let errorMessage = 'Failed to process chat message';
        if (error.message?.includes('model')) {
            errorMessage = `Model error: The selected model may not be available. Try a different model.`;
        } else if (error.message?.includes('API key') || error.message?.includes('authentication')) {
            errorMessage = 'API key error: Please check your AI_GATEWAY_API_KEY configuration.';
        } else if (error.message?.includes('rate limit')) {
            errorMessage = 'Rate limit exceeded. Please try again later.';
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: errorMessage,
            details: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3d8899c1._.js.map