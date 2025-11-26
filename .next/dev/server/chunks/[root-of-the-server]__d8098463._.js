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
"[project]/app/api/data/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
// Initialize Supabase client
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
async function GET() {
    try {
        // Fetch ad accounts
        const { data: adAccounts, error: accountsError } = await supabase.from('ad_accounts').select('platform, account_name, status, last_synced_at').order('platform');
        if (accountsError) {
            console.error('Error fetching ad accounts:', accountsError);
        }
        // Fetch campaigns
        const { data: campaigns, error: campaignsError } = await supabase.from('campaigns').select('id, platform, campaign_name, status, budget_amount');
        if (campaignsError) {
            console.error('Error fetching campaigns:', campaignsError);
        }
        // Fetch metrics
        const { data: metrics, error: metricsError } = await supabase.from('campaign_metrics').select('impressions, clicks, conversions, spend, revenue');
        if (metricsError) {
            console.error('Error fetching metrics:', metricsError);
        }
        // Calculate aggregated metrics
        const aggregatedMetrics = (metrics || []).reduce((acc, m)=>({
                totalSpend: acc.totalSpend + (Number(m.spend) || 0),
                totalRevenue: acc.totalRevenue + (Number(m.revenue) || 0),
                totalImpressions: acc.totalImpressions + (m.impressions || 0),
                totalClicks: acc.totalClicks + (m.clicks || 0),
                totalConversions: acc.totalConversions + (m.conversions || 0)
            }), {
            totalSpend: 0,
            totalRevenue: 0,
            totalImpressions: 0,
            totalClicks: 0,
            totalConversions: 0
        });
        const roas = aggregatedMetrics.totalSpend > 0 ? aggregatedMetrics.totalRevenue / aggregatedMetrics.totalSpend : 0;
        const ctr = aggregatedMetrics.totalImpressions > 0 ? aggregatedMetrics.totalClicks / aggregatedMetrics.totalImpressions * 100 : 0;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            adAccounts: adAccounts || [],
            campaigns: campaigns || [],
            metrics: {
                ...aggregatedMetrics,
                roas,
                ctr
            },
            hasData: (metrics?.length || 0) > 0
        });
    } catch (error) {
        console.error('API Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch data'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d8098463._.js.map