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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
;
;
// Initialize Vercel AI Gateway
const gateway = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$gateway$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createGateway"])({
    apiKey: process.env.AI_GATEWAY_API_KEY
});
// Initialize database client
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://pfatayebacwjehlfxipx.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmYXRheWViYWN3amVobGZ4aXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjMyOTMsImV4cCI6MjA3NjczOTI5M30.Q-MfA4eqteLtKAqEtZadEBNw3ak8OESTDFnBv0RXwzI"));
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
        // Fetch connected ad accounts
        const { data: adAccounts } = await supabase.from('ad_accounts').select('platform, account_name, status').eq('status', 'active');
        // Fetch campaign data
        const { data: campaigns } = await supabase.from('campaigns').select('id, campaign_id, campaign_name, platform, status, budget_amount').limit(50);
        // Fetch recent metrics
        const { data: recentMetrics } = await supabase.from('campaign_metrics').select('date, impressions, clicks, conversions, spend, revenue, campaign_id').order('date', {
            ascending: false
        }).limit(100);
        // Build campaign platform map
        const campaignPlatformMap = new Map();
        if (campaigns) {
            for (const campaign of campaigns){
                campaignPlatformMap.set(campaign.id, campaign.platform);
            }
        }
        // Calculate summary stats
        const totalSpend = recentMetrics?.reduce((sum, m)=>sum + (Number(m.spend) || 0), 0) || 0;
        const totalRevenue = recentMetrics?.reduce((sum, m)=>sum + (Number(m.revenue) || 0), 0) || 0;
        const totalConversions = recentMetrics?.reduce((sum, m)=>sum + (m.conversions || 0), 0) || 0;
        const totalImpressions = recentMetrics?.reduce((sum, m)=>sum + (m.impressions || 0), 0) || 0;
        const totalClicks = recentMetrics?.reduce((sum, m)=>sum + (m.clicks || 0), 0) || 0;
        const avgROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;
        // Calculate platform-specific stats
        const platformStats = {};
        if (recentMetrics) {
            for (const metric of recentMetrics){
                const platform = campaignPlatformMap.get(metric.campaign_id) || 'unknown';
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
                platformStats[platform].conversions += metric.conversions || 0;
                platformStats[platform].impressions += metric.impressions || 0;
                platformStats[platform].clicks += metric.clicks || 0;
            }
        }
        const platformBreakdown = Object.entries(platformStats).map(([platform, stats])=>({
                platform: platform.replace('_ads', '').toUpperCase(),
                spend: stats.spend,
                revenue: stats.revenue,
                conversions: stats.conversions,
                impressions: stats.impressions,
                clicks: stats.clicks,
                roas: stats.spend > 0 ? stats.revenue / stats.spend : 0,
                ctr: stats.impressions > 0 ? stats.clicks / stats.impressions * 100 : 0
            }));
        const hasData = campaigns && campaigns.length > 0;
        // Build system prompt
        const systemPrompt = `You are an AI marketing analytics assistant helping analyze advertising campaign performance across Google Ads, Meta Ads, and LinkedIn Ads.

Connected Ad Platforms: ${adAccounts?.map((a)=>a.platform.replace('_ads', '').toUpperCase()).join(', ') || 'None'}

${hasData ? `
OVERALL CAMPAIGN SUMMARY:
- Total Active Campaigns: ${campaigns.length}
- Total Ad Spend (last 30 days): $${totalSpend.toFixed(2)}
- Total Revenue: $${totalRevenue.toFixed(2)}
- Total Conversions: ${totalConversions}
- Total Impressions: ${totalImpressions.toLocaleString()}
- Total Clicks: ${totalClicks}
- Average ROAS: ${avgROAS.toFixed(2)}x
- Overall CTR: ${totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0}%

PLATFORM-SPECIFIC BREAKDOWN:
${platformBreakdown.length > 0 ? JSON.stringify(platformBreakdown, null, 2) : 'No platform-specific data available'}

TOP CAMPAIGNS (by spend):
${JSON.stringify(campaigns.sort((a, b)=>(b.budget_amount || 0) - (a.budget_amount || 0)).slice(0, 10).map((c)=>({
                name: c.campaign_name,
                platform: c.platform.replace('_ads', '').toUpperCase(),
                status: c.status,
                budget: c.budget_amount
            })), null, 2)}
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
- Explain metrics like ROAS, CTR, CPA, and conversions
- Compare platforms when asked
- Be concise but thorough
- Use specific numbers from their actual data`;
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

//# sourceMappingURL=%5Broot-of-the-server%5D__680175ef._.js.map