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
"[project]/app/api/data/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        // Parse filter parameters
        const searchParams = request.nextUrl.searchParams;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const accountsParam = searchParams.get('accounts');
        const selectedAccountIds = accountsParam ? accountsParam.split(',').filter(Boolean) : [];
        const customersParam = searchParams.get('customers');
        const selectedCustomerIds = customersParam ? customersParam.split(',').filter(Boolean) : [];
        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                adAccounts: [],
                campaigns: [],
                metrics: {
                    totalSpend: 0,
                    totalRevenue: 0,
                    totalImpressions: 0,
                    totalClicks: 0,
                    totalConversions: 0,
                    roas: 0,
                    ctr: 0
                },
                hasData: false
            });
        }
        // Get user's tenant
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile?.tenant_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                adAccounts: [],
                campaigns: [],
                metrics: {
                    totalSpend: 0,
                    totalRevenue: 0,
                    totalImpressions: 0,
                    totalClicks: 0,
                    totalConversions: 0,
                    roas: 0,
                    ctr: 0
                },
                hasData: false
            });
        }
        const tenantId = profile.tenant_id;
        // Fetch ad accounts for this tenant
        const { data: adAccounts, error: accountsError } = await supabase.from('ad_accounts').select('id, account_id, platform, account_name, status, last_synced_at').eq('tenant_id', tenantId).order('platform');
        if (accountsError) {
            console.error('Error fetching ad accounts:', accountsError);
        }
        // Fetch campaigns for this tenant (include customer info)
        const { data: campaigns, error: campaignsError } = await supabase.from('campaigns').select('id, platform, campaign_name, status, budget_amount, ad_account_id, customer_id, customer_name').eq('tenant_id', tenantId);
        if (campaignsError) {
            console.error('Error fetching campaigns:', campaignsError);
        }
        // Build metrics query with optional date range filtering
        let metricsQuery = supabase.from('campaign_metrics').select('impressions, clicks, conversions, spend, revenue, date, campaign_id').eq('tenant_id', tenantId);
        // Apply date range filter if provided
        if (startDate) {
            metricsQuery = metricsQuery.gte('date', startDate);
        }
        if (endDate) {
            metricsQuery = metricsQuery.lte('date', endDate);
        }
        // Apply account filter if provided (filter by campaign_id which relates to accounts)
        if (selectedAccountIds.length > 0 || selectedCustomerIds.length > 0) {
            // Build query to get matching campaign IDs
            let campaignQuery = supabase.from('campaigns').select('id').eq('tenant_id', tenantId);
            if (selectedAccountIds.length > 0) {
                campaignQuery = campaignQuery.in('ad_account_id', selectedAccountIds);
            }
            if (selectedCustomerIds.length > 0) {
                campaignQuery = campaignQuery.in('customer_id', selectedCustomerIds);
            }
            const { data: filteredCampaigns } = await campaignQuery;
            if (filteredCampaigns && filteredCampaigns.length > 0) {
                const campaignIds = filteredCampaigns.map((c)=>c.id);
                metricsQuery = metricsQuery.in('campaign_id', campaignIds);
            } else {
                // No matching campaigns, return empty metrics
                metricsQuery = metricsQuery.eq('campaign_id', 'no-match');
            }
        }
        const { data: metrics, error: metricsError } = await metricsQuery;
        if (metricsError) {
            console.error('Error fetching metrics:', metricsError);
        }
        // Build available accounts list for the filter dropdown
        const availableAccounts = (adAccounts || []).map((acc)=>({
                id: acc.id || acc.account_id || `${acc.platform}-${acc.account_name}`,
                name: acc.account_name || 'Unnamed Account',
                platform: acc.platform === 'google_ads' ? 'Google Ads' : acc.platform === 'meta_ads' ? 'Meta Ads' : acc.platform === 'linkedin_ads' ? 'LinkedIn Ads' : acc.platform
            }));
        // Build available customers list grouped by platform
        const customerMap = new Map();
        (campaigns || []).forEach((campaign)=>{
            if (campaign.customer_id && campaign.customer_name) {
                const key = `${campaign.platform}-${campaign.customer_id}`;
                if (!customerMap.has(key)) {
                    customerMap.set(key, {
                        id: campaign.customer_id,
                        name: campaign.customer_name,
                        platform: campaign.platform === 'google_ads' ? 'Google Ads' : campaign.platform === 'meta_ads' ? 'Meta Ads' : campaign.platform === 'linkedin_ads' ? 'LinkedIn Ads' : campaign.platform
                    });
                }
            }
        });
        const availableCustomers = Array.from(customerMap.values()).sort((a, b)=>a.platform.localeCompare(b.platform) || a.name.localeCompare(b.name));
        console.log(`Data API: Found ${adAccounts?.length || 0} ad accounts, ${campaigns?.length || 0} campaigns, ${metrics?.length || 0} metrics for tenant ${tenantId}`);
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
        // Build performance data for charts (last 30 days)
        const performanceData = buildPerformanceData(metrics || []);
        // Build customer metrics for the client performance table
        const customerMetrics = buildCustomerMetrics(campaigns || [], metrics || []);
        // Check connected platforms
        const connectedPlatforms = {
            google: adAccounts?.some((a)=>a.platform === 'google_ads' && a.status === 'active') || false,
            meta: adAccounts?.some((a)=>a.platform === 'meta_ads' && a.status === 'active') || false,
            linkedin: adAccounts?.some((a)=>a.platform === 'linkedin_ads' && a.status === 'active') || false
        };
        // Build platform comparison data (only for connected platforms with data)
        const platformData = buildPlatformData(campaigns || [], metrics || [], connectedPlatforms);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            adAccounts: adAccounts || [],
            campaigns: campaigns || [],
            metrics: {
                totalSpend: aggregatedMetrics.totalSpend,
                totalConversions: aggregatedMetrics.totalConversions,
                averageROAS: roas,
                totalImpressions: aggregatedMetrics.totalImpressions,
                totalClicks: aggregatedMetrics.totalClicks,
                totalRevenue: aggregatedMetrics.totalRevenue,
                spendChange: 0,
                conversionsChange: 0,
                roasChange: 0,
                impressionsChange: 0
            },
            performanceData,
            platformData,
            customerMetrics,
            connectedPlatforms,
            availableAccounts,
            availableCustomers,
            insights: generateInsights(aggregatedMetrics, campaigns || [], customerMetrics),
            hasData: (metrics?.length || 0) > 0,
            dateRange: {
                startDate,
                endDate
            }
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
function buildPerformanceData(metrics) {
    // Group metrics by date
    const byDate = new Map();
    for (const m of metrics){
        const date = m.date || new Date().toISOString().split('T')[0];
        const existing = byDate.get(date) || {
            spend: 0,
            revenue: 0,
            clicks: 0,
            conversions: 0
        };
        byDate.set(date, {
            spend: existing.spend + (Number(m.spend) || 0),
            revenue: existing.revenue + (Number(m.revenue) || 0),
            clicks: existing.clicks + (Number(m.clicks) || 0),
            conversions: existing.conversions + (Number(m.conversions) || 0)
        });
    }
    // Sort by date and format
    return Array.from(byDate.entries()).sort((a, b)=>a[0].localeCompare(b[0])).slice(-14) // Last 14 days
    .map(([date, data])=>({
            date: new Date(date).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric'
            }),
            spend: Math.round(data.spend * 100) / 100,
            revenue: Math.round(data.revenue * 100) / 100,
            clicks: data.clicks,
            conversions: Math.round(data.conversions * 100) / 100
        }));
}
function buildCustomerMetrics(campaigns, metrics) {
    // Build a map of campaign_id to customer info
    const campaignCustomerMap = new Map();
    for (const campaign of campaigns){
        if (campaign.customer_id && campaign.customer_name) {
            campaignCustomerMap.set(campaign.id, {
                customer_id: campaign.customer_id,
                customer_name: campaign.customer_name
            });
        }
    }
    // Aggregate metrics by customer
    const customerStats = new Map();
    for (const metric of metrics){
        const customerInfo = campaignCustomerMap.get(metric.campaign_id);
        if (!customerInfo) continue;
        const existing = customerStats.get(customerInfo.customer_id) || {
            customer_name: customerInfo.customer_name,
            spend: 0,
            revenue: 0,
            conversions: 0,
            clicks: 0,
            impressions: 0
        };
        customerStats.set(customerInfo.customer_id, {
            customer_name: customerInfo.customer_name,
            spend: existing.spend + (Number(metric.spend) || 0),
            revenue: existing.revenue + (Number(metric.revenue) || 0),
            conversions: existing.conversions + (Number(metric.conversions) || 0),
            clicks: existing.clicks + (Number(metric.clicks) || 0),
            impressions: existing.impressions + (Number(metric.impressions) || 0)
        });
    }
    // Convert to array with calculated metrics
    return Array.from(customerStats.entries()).map(([customer_id, stats])=>({
            customer_id,
            customer_name: stats.customer_name,
            spend: Math.round(stats.spend * 100) / 100,
            revenue: Math.round(stats.revenue * 100) / 100,
            conversions: Math.round(stats.conversions * 100) / 100,
            clicks: stats.clicks,
            impressions: stats.impressions,
            ctr: stats.impressions > 0 ? stats.clicks / stats.impressions * 100 : 0,
            cpc: stats.clicks > 0 ? stats.spend / stats.clicks : 0,
            convRate: stats.clicks > 0 ? stats.conversions / stats.clicks * 100 : 0,
            roas: stats.spend > 0 ? stats.revenue / stats.spend : 0
        })).sort((a, b)=>b.spend - a.spend);
}
function buildPlatformData(campaigns, metrics, connectedPlatforms) {
    const platformNames = {
        'google_ads': 'Google Ads',
        'meta_ads': 'Meta Ads',
        'linkedin_ads': 'LinkedIn Ads'
    };
    // Build a map of campaign_id to platform
    const campaignPlatformMap = new Map();
    for (const campaign of campaigns){
        campaignPlatformMap.set(campaign.id, campaign.platform);
    }
    // Aggregate metrics by platform
    const platformStats = {};
    for (const metric of metrics){
        const platform = campaignPlatformMap.get(metric.campaign_id) || 'google_ads';
        if (!platformStats[platform]) {
            platformStats[platform] = {
                spend: 0,
                conversions: 0
            };
        }
        platformStats[platform].spend += Number(metric.spend) || 0;
        platformStats[platform].conversions += Number(metric.conversions) || 0;
    }
    // Only return platforms that have data or are connected
    const result = [];
    for (const [platform, stats] of Object.entries(platformStats)){
        result.push({
            platform: platformNames[platform] || platform,
            spend: Math.round(stats.spend),
            conversions: Math.round(stats.conversions)
        });
    }
    // Add connected platforms with zero data if they're not in the results
    if (connectedPlatforms.meta && !platformStats['meta_ads']) {
        result.push({
            platform: 'Meta Ads',
            spend: 0,
            conversions: 0
        });
    }
    if (connectedPlatforms.linkedin && !platformStats['linkedin_ads']) {
        result.push({
            platform: 'LinkedIn Ads',
            spend: 0,
            conversions: 0
        });
    }
    return result;
}
function generateInsights(metrics, campaigns, customerMetrics) {
    const insights = [];
    // Calculate average ROAS
    const avgRoas = metrics.totalSpend > 0 ? metrics.totalRevenue / metrics.totalSpend : 0;
    // Find top and bottom performers
    const sortedByRoas = [
        ...customerMetrics
    ].filter((c)=>c.spend > 100).sort((a, b)=>b.roas - a.roas);
    const topPerformer = sortedByRoas[0];
    const bottomPerformer = sortedByRoas[sortedByRoas.length - 1];
    // ROAS insight
    if (avgRoas >= 3) {
        insights.push({
            id: '1',
            title: 'Excellent ROAS Performance',
            description: `Your average ROAS of ${avgRoas.toFixed(1)}x is well above industry benchmarks (typically 2-4x). Consider scaling budgets on top performers.`,
            type: 'success',
            platform: 'All Platforms'
        });
    } else if (avgRoas < 2 && metrics.totalSpend > 1000) {
        insights.push({
            id: '1',
            title: 'ROAS Below Target',
            description: `Your average ROAS of ${avgRoas.toFixed(1)}x is below the typical 2-4x target. Review underperforming campaigns for optimization opportunities.`,
            type: 'warning',
            platform: 'All Platforms'
        });
    }
    // Top performer insight
    if (topPerformer && topPerformer.roas > avgRoas * 1.5) {
        insights.push({
            id: '2',
            title: `${topPerformer.customer_name} Outperforming`,
            description: `This client is achieving ${topPerformer.roas.toFixed(1)}x ROAS, significantly above your average. Consider increasing their budget allocation.`,
            type: 'opportunity',
            platform: 'Google Ads'
        });
    }
    // Bottom performer insight
    if (bottomPerformer && bottomPerformer.roas < avgRoas * 0.5 && bottomPerformer.spend > 500) {
        insights.push({
            id: '3',
            title: `${bottomPerformer.customer_name} Needs Attention`,
            description: `This client has ${bottomPerformer.roas.toFixed(1)}x ROAS with $${bottomPerformer.spend.toLocaleString()} spend. Review targeting and creative strategy.`,
            type: 'warning',
            platform: 'Google Ads'
        });
    }
    // CTR insight
    const avgCtr = metrics.totalImpressions > 0 ? metrics.totalClicks / metrics.totalImpressions * 100 : 0;
    if (avgCtr > 3) {
        insights.push({
            id: '4',
            title: 'Strong Click-Through Rate',
            description: `Your ${avgCtr.toFixed(2)}% CTR exceeds the Google Ads average of 2-3%. Your ad copy and targeting are resonating well.`,
            type: 'success',
            platform: 'All Platforms'
        });
    }
    // Conversion rate insight
    const convRate = metrics.totalClicks > 0 ? metrics.totalConversions / metrics.totalClicks * 100 : 0;
    if (convRate > 5) {
        insights.push({
            id: '5',
            title: 'High Conversion Rate',
            description: `${convRate.toFixed(1)}% of clicks are converting - well above the 2-5% industry average. Your landing pages are performing effectively.`,
            type: 'success',
            platform: 'All Platforms'
        });
    }
    // Default insight if none generated
    if (insights.length === 0) {
        insights.push({
            id: '0',
            title: 'Data Synced Successfully',
            description: 'Your advertising data has been synced. More insights will appear as you accumulate more data.',
            type: 'trend',
            platform: 'All Platforms'
        });
    }
    return insights.slice(0, 4); // Return top 4 insights
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fd750ef9._.js.map