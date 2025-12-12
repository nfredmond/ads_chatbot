module.exports=[95808,e=>{"use strict";var o=e.i(100),r=e.i(52787);async function s(e,r,s){try{let t=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:e,client_secret:r,refresh_token:s,grant_type:"refresh_token"})}),a=await t.json();if(!t.ok){let e=a.error_description||a.error||"Failed to refresh access token";throw(0,o.logTokenRefresh)("google_ads",!1,void 0,Error(e)),new o.PlatformAPIError("google_ads","refreshToken",Error(e),t.status,a.error)}if(!a.access_token){let e=Error("No access token returned from Google OAuth refresh flow");throw(0,o.logTokenRefresh)("google_ads",!1,void 0,e),e}return(0,o.logTokenRefresh)("google_ads",!0),a.access_token}catch(e){throw e}}async function t(e){if(!e.refreshToken)throw Error("Missing refresh token for Google Ads OAuth flow");o.default.info("Fetching Google Ads campaigns",{customerId:e.customerId});let t=`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign_budget.amount_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.conversions_value,
      metrics.cost_micros,
      metrics.ctr,
      metrics.average_cpc,
      segments.date
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
    ORDER BY metrics.clicks DESC
  `,a=await s(e.clientId,e.clientSecret,e.refreshToken),n=`https://googleads.googleapis.com/v21/customers/${e.customerId}/googleAds:search`,i=await (0,r.withRateLimit)("google_ads",async()=>{let r=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${a}`,"developer-token":e.developerToken,...e.loginCustomerId?{"login-customer-id":e.loginCustomerId}:{}},body:JSON.stringify({query:t,pageSize:1e3})}),s=await r.json();if(!r.ok){let e=s.error?.message||"Unknown Google Ads API error";throw new o.PlatformAPIError("google_ads","fetchCampaigns",Error(e),r.status,s.error?.code?.toString())}return s}),c=Array.isArray(i?.results)?i.results.length:0;return(0,o.logAPISuccess)("google_ads","fetchCampaigns",{resultCount:c}),i}function a(e){let o=[],r=[],s=new Map;return(Array.isArray(e?.results)?e.results:[]).forEach(e=>{let o=e?.campaign;if(!o?.id)return;let t=o.id.toString();if(!s.has(t)){var a;let r=e?.campaignBudget?.amountMicros;s.set(t,{campaign_id:t,campaign_name:o.name,platform:"google_ads",status:{ENABLED:"active",PAUSED:"paused",REMOVED:"archived"}[a=o.status]||a.toLowerCase(),budget_amount:r?Number(r)/1e6:null})}let n=e?.metrics??{},i=e?.segments??{};r.push({campaign_api_id:t,date:i.date||new Date().toISOString().split("T")[0],impressions:n.impressions?Number(n.impressions):0,clicks:n.clicks?Number(n.clicks):0,conversions:n.conversions?Number(n.conversions):0,spend:n.costMicros?Number(n.costMicros)/1e6:0,revenue:n.conversionsValue?Number(n.conversionsValue):0})}),o.push(...s.values()),{campaigns:o,metrics:r}}e.s(["fetchGoogleAdsCampaigns",()=>t,"getGoogleAdsAccessToken",()=>s,"transformGoogleAdsData",()=>a])}];

//# sourceMappingURL=lib_google-ads_client_ts_c4acd3c8._.js.map