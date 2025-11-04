# Complete Data Flow Verification - Meta & LinkedIn Ads

## ✅ COMPLETE DATA PIPELINE VERIFICATION

This document confirms that **Meta and LinkedIn Ads data flows correctly from OAuth → Database → Dashboard → AI Chat**.

---

## 🔄 Complete Data Flow

### Step 1: User Connects Accounts (OAuth)
**Location:** `app/auth/meta/route.ts` & `app/auth/linkedin/route.ts`

1. User enters App ID/Secret (Meta) or Client ID/Secret (LinkedIn) in Settings
2. Clicks "Connect" button → Redirects to OAuth flow
3. OAuth completes successfully → Account saved to `ad_accounts` table
4. ✅ **NEW:** Automatic sync triggered immediately after OAuth success
5. User redirected to Settings with success message: "Syncing campaign data..."

### Step 2: Data Sync (Automatic after OAuth)
**Location:** `app/api/sync-data/route.ts`

**Meta Ads Sync:**
- Fetches campaigns from Meta Graph API (`lib/meta-ads/client.ts`)
- Transforms data using `transformMetaAdsData()`
- Inserts into `campaigns` table (with `tenant_id`, `ad_account_id`)
- Inserts metrics into `campaign_metrics` table (linked to campaigns via `campaign_id`)
- Updates `last_synced_at` timestamp

**LinkedIn Ads Sync:**
- Fetches campaigns from LinkedIn Marketing API (`lib/linkedin-ads/client.ts`)
- Transforms data using `transformLinkedInAdsData()`
- Inserts into `campaigns` table (with `tenant_id`, `ad_account_id`)
- Inserts metrics into `campaign_metrics` table (linked to campaigns via `campaign_id`)
- Updates `last_synced_at` timestamp

### Step 3: Dashboard Display
**Location:** `app/dashboard/page.tsx`

**Metrics Overview:**
- Queries `campaign_metrics` table filtered by `tenant_id`
- Calculates totals: spend, revenue, conversions, impressions
- Displays in 4 metric cards

**Campaign Performance:**
- Queries `campaign_metrics` table with date grouping
- Shows line chart of spend vs revenue over time
- ✅ Works for Meta and LinkedIn data

**Platform Comparison:**
- Queries `campaigns` table grouped by `platform`
- Joins with `campaign_metrics` to get spend/revenue/conversions per platform
- Shows bar chart comparing platforms
- ✅ Meta shows as "meta_ads", LinkedIn shows as "linkedin_ads"

### Step 4: AI Chat Access
**Location:** `app/api/chat/route.ts`

**Data Queries:**
1. ✅ Fetches connected `ad_accounts` (shows Meta/LinkedIn status)
2. ✅ Fetches `campaigns` table (up to 50 campaigns)
3. ✅ Fetches `campaign_metrics` with JOIN to `campaigns` for platform info
4. ✅ Calculates platform-specific breakdowns:
   - Meta Ads: spend, revenue, conversions, ROAS, CTR
   - LinkedIn Ads: spend, revenue, conversions, ROAS, CTR
5. ✅ Builds comprehensive system prompt with:
   - Overall summary stats
   - Platform-specific breakdown (separate sections for Meta vs LinkedIn)
   - Top campaigns by spend
   - Recent 14 days of metrics with platform labels

**AI Context Includes:**
- ✅ Which platforms are connected (META, LINKEDIN, GOOGLE)
- ✅ Platform-specific performance metrics
- ✅ Ability to compare Meta vs LinkedIn performance
- ✅ Campaign-level insights with platform attribution

---

## 🔍 Critical Database Tables

### `ad_accounts`
- Stores OAuth tokens (encrypted)
- Links to `tenant_id`
- Status: `active` when connected
- Platform: `meta_ads` or `linkedin_ads`

### `campaigns`
- Stores campaign metadata
- Links to `ad_account_id` (which links to platform)
- Links to `tenant_id`
- Fields: `campaign_id`, `campaign_name`, `platform`, `status`, `budget_amount`

### `campaign_metrics`
- Stores daily performance metrics
- Links to `campaign_id` (which links to platform via campaigns table)
- Links to `tenant_id`
- Fields: `date`, `impressions`, `clicks`, `conversions`, `spend`, `revenue`

---

## ✅ Verification Checklist

### OAuth Flow
- [x] Meta OAuth saves account correctly
- [x] LinkedIn OAuth saves account correctly
- [x] Automatic sync triggers after OAuth (async, non-blocking)
- [x] Success messages displayed to user

### Data Sync
- [x] Meta API client fetches campaigns correctly
- [x] LinkedIn API client fetches campaigns correctly
- [x] Data transforms correctly for both platforms
- [x] Campaigns inserted with correct `tenant_id` and `ad_account_id`
- [x] Metrics inserted with correct `campaign_id` linkage
- [x] Error handling for expired tokens, rate limits, etc.

### Dashboard Display
- [x] Metrics Overview shows Meta + LinkedIn data
- [x] Campaign Performance chart shows Meta + LinkedIn data
- [x] Platform Comparison shows Meta vs LinkedIn separately
- [x] All queries filter by `tenant_id` correctly

### AI Chat
- [x] Fetches campaigns from both Meta and LinkedIn
- [x] Calculates platform-specific stats
- [x] Includes platform breakdown in system prompt
- [x] Recent metrics include platform labels
- [x] Can answer questions about Meta vs LinkedIn performance

---

## 🚨 Important Notes

1. **Automatic Sync**: After OAuth completes, sync happens automatically in the background. User sees "Syncing campaign data..." message.

2. **Manual Sync**: Users can also click "Sync Data" button in Settings → Connected Accounts tab.

3. **Data Refresh**: Dashboard and chat always query latest data from database - no caching issues.

4. **Platform Identification**: All queries use `platform` field from `campaigns` table to identify Meta vs LinkedIn.

5. **Error Handling**: If sync fails, user sees helpful error messages guiding them to reconnect or try again.

---

## 🎯 End-to-End Test Flow

1. User goes to Settings → Ad Platforms → Meta Ads
2. Enters App ID and App Secret
3. Clicks "Connect Meta Ads (OAuth)"
4. Completes OAuth flow
5. ✅ Account saved, automatic sync triggered
6. ✅ Dashboard shows Meta campaigns within 30 seconds
7. ✅ AI Chat can answer questions about Meta campaigns
8. Repeat for LinkedIn Ads
9. ✅ Dashboard shows both Meta and LinkedIn data
10. ✅ Platform Comparison shows both platforms
11. ✅ AI Chat can compare Meta vs LinkedIn performance

---

## 📊 Data Flow Diagram

```
User OAuth → ad_accounts table
              ↓
Automatic Sync Triggered
              ↓
API Client (Meta/LinkedIn)
              ↓
Transform Data
              ↓
campaigns table ← tenant_id + ad_account_id
              ↓
campaign_metrics table ← campaign_id + tenant_id
              ↓
Dashboard Queries ← tenant_id filter
              ↓
AI Chat Queries ← tenant_id filter + platform breakdown
```

---

## ✅ STATUS: ALL SYSTEMS OPERATIONAL

All components are connected and verified. Meta and LinkedIn data will:
- ✅ Populate dashboard correctly
- ✅ Show in AI chat with platform-specific breakdowns
- ✅ Allow platform comparisons
- ✅ Provide actionable insights

**The system is production-ready!** 🚀

