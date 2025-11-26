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
"[project]/app/api/data/client/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        // Get user's profile to find tenant_id
        const { data: profile, error: profileError } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (profileError || !profile?.tenant_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Profile not found'
            }, {
                status: 404
            });
        }
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        if (!clientId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Client ID required'
            }, {
                status: 400
            });
        }
        // Get client info from campaigns
        const { data: clientCampaigns, error: campaignsError } = await supabase.from('campaigns').select('id, campaign_name, platform, status, budget_amount, customer_id, customer_name').eq('tenant_id', profile.tenant_id).eq('customer_id', clientId);
        if (campaignsError) {
            console.error('Error fetching client campaigns:', campaignsError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to fetch client data'
            }, {
                status: 500
            });
        }
        if (!clientCampaigns || clientCampaigns.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Client not found'
            }, {
                status: 404
            });
        }
        const clientInfo = {
            id: clientId,
            name: clientCampaigns[0].customer_name || 'Unknown Client',
            platform: clientCampaigns[0].platform || 'google_ads'
        };
        // Get campaign IDs for this client
        const campaignIds = clientCampaigns.map((c)=>c.id);
        // Build metrics query
        let metricsQuery = supabase.from('campaign_metrics').select('*').eq('tenant_id', profile.tenant_id).in('campaign_id', campaignIds);
        if (startDate) {
            metricsQuery = metricsQuery.gte('date', startDate);
        }
        if (endDate) {
            metricsQuery = metricsQuery.lte('date', endDate);
        }
        const { data: metrics, error: metricsError } = await metricsQuery;
        if (metricsError) {
            console.error('Error fetching metrics:', metricsError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to fetch metrics'
            }, {
                status: 500
            });
        }
        // Calculate aggregated metrics
        const totalSpend = metrics?.reduce((sum, m)=>sum + (m.spend || 0), 0) || 0;
        const totalRevenue = metrics?.reduce((sum, m)=>sum + (m.revenue || 0), 0) || 0;
        const totalConversions = metrics?.reduce((sum, m)=>sum + (m.conversions || 0), 0) || 0;
        const totalClicks = metrics?.reduce((sum, m)=>sum + (m.clicks || 0), 0) || 0;
        const totalImpressions = metrics?.reduce((sum, m)=>sum + (m.impressions || 0), 0) || 0;
        const aggregatedMetrics = {
            totalSpend,
            totalRevenue,
            totalConversions,
            totalClicks,
            totalImpressions,
            averageROAS: totalSpend > 0 ? totalRevenue / totalSpend : 0,
            ctr: totalImpressions > 0 ? totalClicks / totalImpressions * 100 : 0,
            cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
            convRate: totalClicks > 0 ? totalConversions / totalClicks * 100 : 0
        };
        // Group metrics by date for performance chart
        const metricsByDate = (metrics || []).reduce((acc, m)=>{
            const date = m.date;
            if (!acc[date]) {
                acc[date] = {
                    spend: 0,
                    revenue: 0,
                    clicks: 0,
                    conversions: 0
                };
            }
            acc[date].spend += m.spend || 0;
            acc[date].revenue += m.revenue || 0;
            acc[date].clicks += m.clicks || 0;
            acc[date].conversions += m.conversions || 0;
            return acc;
        }, {});
        const performanceData = Object.entries(metricsByDate).sort(([a], [b])=>a.localeCompare(b)).map(([date, data])=>({
                date: new Date(date).toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric'
                }),
                ...data
            }));
        // Calculate per-campaign metrics
        const campaignMetrics = clientCampaigns.map((campaign)=>{
            const campaignData = (metrics || []).filter((m)=>m.campaign_id === campaign.id);
            const spend = campaignData.reduce((sum, m)=>sum + (m.spend || 0), 0);
            const revenue = campaignData.reduce((sum, m)=>sum + (m.revenue || 0), 0);
            const conversions = campaignData.reduce((sum, m)=>sum + (m.conversions || 0), 0);
            const clicks = campaignData.reduce((sum, m)=>sum + (m.clicks || 0), 0);
            const impressions = campaignData.reduce((sum, m)=>sum + (m.impressions || 0), 0);
            return {
                id: campaign.id,
                name: campaign.campaign_name,
                status: campaign.status || 'unknown',
                spend,
                revenue,
                conversions,
                clicks,
                impressions,
                ctr: impressions > 0 ? clicks / impressions * 100 : 0,
                cpc: clicks > 0 ? spend / clicks : 0,
                convRate: clicks > 0 ? conversions / clicks * 100 : 0,
                roas: spend > 0 ? revenue / spend : 0
            };
        }).sort((a, b)=>b.spend - a.spend);
        // Get all clients for switcher
        const { data: allCustomers, error: customersError } = await supabase.from('campaigns').select('customer_id, customer_name, platform').eq('tenant_id', profile.tenant_id).not('customer_id', 'is', null);
        // Deduplicate customers
        const uniqueCustomers = Array.from(new Map((allCustomers || []).map((c)=>[
                c.customer_id,
                c
            ])).values()).map((c)=>({
                id: c.customer_id,
                name: c.customer_name || c.customer_id,
                platform: c.platform
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            client: clientInfo,
            metrics: aggregatedMetrics,
            performanceData,
            campaigns: campaignMetrics,
            allClients: uniqueCustomers
        });
    } catch (error) {
        console.error('Client API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7e5e3a75._.js.map