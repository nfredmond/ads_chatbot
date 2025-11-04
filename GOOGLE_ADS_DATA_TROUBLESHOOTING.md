# 🔍 Google Ads Data Not Populating - Troubleshooting Guide

## Overview

You've successfully connected your Google Ads account, but the data isn't appearing in the dashboard or AI chatbot. This guide will help you diagnose and fix the issue.

---

## ✅ Quick Checklist - Try These First

Before diving into detailed troubleshooting, run through these quick checks:

- [ ] **Have you clicked "Sync Data"?** - Data doesn't sync automatically on connection, you must manually trigger it
- [ ] **Does your account have campaigns?** - You need existing campaigns with recent activity
- [ ] **Is your Google Ads account linked to a Manager Account (MCC)?** - Google Ads API requires this
- [ ] **Have you waited long enough?** - Sync takes 15-30 seconds depending on campaign volume
- [ ] **Are you still on the Connected Accounts tab?** - Data syncs in the background; refresh the page

---

## 📋 Step-by-Step Diagnostic

### Step 1: Verify the Account Connection

1. Go to **Settings** → **Connected Accounts** tab
2. Look for your **Google Ads Account** card
3. Check for these indicators:

```
✅ Status Badge showing "active" (green checkmark)
✅ Account ID displayed (format: 123-456-7890)
✅ Last Synced timestamp shown
```

**If any are missing:**
- Your connection may have failed. See "Reconnecting Your Account" section below.

### Step 2: Check If Data Sync Was Triggered

1. In **Connected Accounts**, click the **"Sync Data"** button
2. Wait 15-30 seconds (don't close the page)
3. Look for a green success message at the top of the settings page:
   ```
   ✅ "Data synced successfully! Check your dashboard for updated metrics."
   ```

**If you see an error message instead:**
- Note the exact error text
- Jump to the "Common Error Messages" section below

### Step 3: Verify Data in Database

After clicking "Sync Data", the system should:
1. Fetch your campaigns from Google Ads API
2. Save them to the `campaigns` table
3. Save metrics to the `campaign_metrics` table

To manually check if this worked:

**In your Supabase dashboard:**
1. Go to **SQL Editor**
2. Run this query to check campaigns:
```sql
SELECT COUNT(*), platform 
FROM campaigns 
WHERE tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
GROUP BY platform;
```

3. Run this to check metrics:
```sql
SELECT COUNT(*), DATE(date) as sync_date
FROM campaign_metrics 
WHERE tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
GROUP BY DATE(date)
ORDER BY sync_date DESC
LIMIT 10;
```

**Expected results:**
- Campaigns table should have 1+ rows with platform='google_ads'
- Campaign_metrics table should have multiple rows from recent dates

**If tables are empty:**
- The sync completed but found no data. See "No Data From API" section.

### Step 4: Check Dashboard Rendering

After data sync completes:
1. Click **"Dashboard"** in the top menu
2. Scroll down to **"Campaign Performance"** section
3. Should show a line chart with Spend and Revenue lines

**If chart is still empty:**
- Data was synced but dashboard isn't displaying it
- Try **refreshing your browser** (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for errors (F12 → Console tab)

---

## 🚨 Common Error Messages & Fixes

### Error: "Google Ads refresh token missing. Please reconnect your account."

**What this means:** Your refresh token wasn't properly saved when you first connected.

**How to fix:**
1. Go to **Settings** → **Connected Accounts**
2. Click the **"Disconnect"** button on your Google Ads account
3. In the same settings page, go to **Ad Platforms** tab
4. Click **"Connect Google Ads (OAuth)"** again
5. **IMPORTANT**: Make sure you see the **"Confirm Permissions"** screen (not just a quick redirect)
6. Click "Allow" to grant permissions
7. Return to **Connected Accounts** and click **"Sync Data"**

**Why this happens:** Google only sends refresh tokens on the first authorization. If you were already authorized to the same app, Google skips sending it again.

### Error: "Google Ads credentials incomplete. Please reconfigure in settings."

**What this means:** One of your OAuth credentials is missing or invalid.

**How to fix:**
1. Go to **Settings** → **Ad Platforms** → **Google Ads**
2. Verify you have all **4 fields filled in**:
   - [ ] Client ID (from Google Cloud Console)
   - [ ] Client Secret (from Google Cloud Console)
   - [ ] Developer Token (from Google Ads API Center)
   - [ ] Customer ID (your Google Ads account ID, format: 123-456-7890)

3. Double-check that:
   - **Client ID ends with `.apps.googleusercontent.com`**
   - **Client Secret is at least 20 characters**
   - **Developer Token is 40 characters** and all UPPERCASE
   - **Customer ID has hyphens** (e.g., 1234-567-8901, not 1234567-8901)

4. If you're unsure about any field, re-copy them from:
   - [Google Cloud Console](https://console.cloud.google.com) for Client ID/Secret
   - [Google Ads API Center](https://ads.google.com/aw/apicenter) for Developer Token

5. Click **"Connect Google Ads (OAuth)"** again

### Error: "Failed to refresh access token" or "Invalid refresh token"

**What this means:** Your refresh token is expired or invalid.

**How to fix:**
1. The automatic refresh failed, so you need to reconnect
2. Go to **Settings** → **Connected Accounts**
3. Click **"Disconnect"** on your Google Ads account
4. Remove access from Google:
   - Visit https://myaccount.google.com/permissions
   - Find your app and click "Remove Access"
5. Go back to **Settings** → **Ad Platforms** → **Connect Google Ads (OAuth)** again
6. This time, authorize with `prompt=consent` which will issue a new refresh token

### Error: "No campaigns found for this account" or "Empty API response"

**What this means:** The sync completed but Google's API returned no campaigns.

**Possible causes and fixes:**

| Cause | Fix |
|-------|-----|
| **No campaigns exist** | Create at least one campaign in your Google Ads account |
| **Campaigns have no recent data** | Google Ads API requires campaigns with data in the last 30 days |
| **Account is a sub-account** | Make sure you're using a Manager Account (MCC), not a sub-account |
| **API access not approved** | You may have Test Access only. Upgrade to Basic or Standard Access |
| **Account is paused/inactive** | Reactivate your Google Ads account and create active campaigns |

**To check your access level:**
1. Go to [Google Ads API Center](https://ads.google.com/aw/apicenter)
2. Look for "API access tier" or "Access level"
3. If it says "Test Access", you can only access test accounts

### Error: "Invalid developer token" or "HTTP 401 Unauthorized"

**What this means:** Your Developer Token is invalid or incorrect.

**How to fix:**
1. Visit [Google Ads API Center](https://ads.google.com/aw/apicenter)
2. Under "Developer Token", click the **eye icon** to reveal your token
3. **Copy the entire token** (it's 40 characters, all uppercase)
4. Go back to your app Settings → **Ad Platforms** → **Google Ads**
5. **Paste the full token** (don't type it or copy from elsewhere)
6. **Save** and try syncing again

**Note:** Each Google account has ONE developer token. If you've created multiple Google Cloud projects, make sure you're copying the token from the Google Ads API Center, not a separate API key.

### Error: "Rate limit exceeded" or "HTTP 429"

**What this means:** You've hit Google's API quota limits.

**How long to wait:**
- Test Access: Resets daily at midnight Pacific Time
- Basic Access (15,000 ops/day): Resets daily at midnight Pacific Time
- Standard Access (unlimited): Usually recovers in 1 hour

**How to reduce rate limiting:**
1. Avoid clicking "Sync Data" multiple times in quick succession
2. Upgrade your API access tier to Standard Access (takes 2-4 weeks approval)
3. Contact Google Ads support if you believe the limit is too restrictive

### Error: "Invalid login customer ID" or "HTTP 400"

**What this means:** Your login customer ID is required but missing or wrong.

**How to fix:**
1. Check if you provided a "Login Customer ID" in settings
2. In **Settings** → **Ad Platforms** → **Google Ads**, look for an optional "Login Customer ID" field
3. Leave it **empty** for most accounts
4. **Only fill it if**:
   - You have a Manager Account (MCC)
   - AND you're trying to access a sub-account
   - Then set it to your Manager Account's ID

For simple setup, leave this field empty.

### Error: "Failed to decrypt tokens" or "Invalid encryption"

**What this means:** There's an issue with the token storage/retrieval.

**How to fix:**
1. Your tokens may be corrupted in the database
2. Reconnect your account:
   - Settings → Connected Accounts → Disconnect
   - Settings → Ad Platforms → Connect Google Ads (OAuth) again
3. If error persists, check that `ENCRYPTION_KEY` environment variable is set in production

---

## 📊 No Data From API - Advanced Diagnostics

If the sync completes successfully but no campaigns appear:

### Check #1: Does Account Have Campaigns?

In your Google Ads account:
1. Click the **Campaigns** menu
2. You should see at least one campaign listed
3. The campaign must have **recent activity** (last 30 days minimum)

**If no campaigns:**
- Create a test campaign or promote existing ones
- Campaigns need at least 1 impression or click in the last 30 days

### Check #2: Verify API Query Format

The system queries campaigns from the last 30 days. Verify your campaigns have data:

**In Google Ads:**
1. Go to **Campaigns**
2. Click any campaign
3. Check the date range selector at the top (change to "Last 30 days")
4. Should show metrics: Impressions, Clicks, Conversions, Cost

**If metrics are 0:**
- This is normal, but the campaign must exist
- Even campaigns with no activity will appear in API results

### Check #3: Check API Status

Google's APIs occasionally have incidents:
1. Visit [Google Cloud Status Dashboard](https://status.cloud.google.com)
2. Look for "Google Ads API" section
3. Should show "Operational" (green)
4. If it shows any issues, wait for resolution

### Check #4: Review Browser Console Logs

The dashboard component may have errors when loading:
1. Open your browser **Developer Tools** (F12)
2. Go to **Console** tab
3. Look for red error messages
4. Common issues:
   - `tenant_id is null` - Not logged in properly
   - `supabase is not defined` - Connection issue
   - Network errors - API server down

**For tenant_id is null:**
1. Make sure you're logged in
2. Refresh the page (Ctrl+F5)
3. Try logging out and back in

---

## 🔧 Advanced Troubleshooting

### Enable Debug Logging

To get more detailed logs of what's happening during sync:

1. **In development (localhost):**
   - Check the browser Console (F12) for sync status
   - Check terminal where `npm run dev` is running

2. **In production:**
   - Go to Settings → Connected Accounts
   - Click "Sync Data"
   - Check Supabase Logs (if you have access):
     - Supabase Dashboard → Logs
     - Filter by "api" function
     - Look for your recent sync requests

### Check Network Requests

To see exactly what API calls are being made:

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Click "Sync Data"
4. Look for requests to:
   - `/api/sync-data` (your backend)
   - `googleads.googleapis.com` (Google's API)

5. Click each request to see:
   - **Status**: Should be `200` for success
   - **Response**: Check the returned data

### Verify Database Permissions

Your Supabase user must have permission to insert data:

1. Go to Supabase Dashboard
2. **SQL Editor** tab
3. Run:
```sql
-- Check your user's role
SELECT auth.uid();

-- Check campaigns table permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='campaigns';
```

If you see permission errors, contact your Supabase project admin.

---

## 🔄 When to Reconnect Your Account

If data still won't sync after trying the above steps, try a full reconnection:

1. Go to **Settings** → **Connected Accounts**
2. Click **"Disconnect"** button on Google Ads account
3. Confirm when prompted
4. Wait 5 seconds
5. Go to **Settings** → **Ad Platforms** → **Google Ads**
6. Enter all credentials again (all 4 fields)
7. Click **"Connect Google Ads (OAuth)"**
8. Complete the OAuth flow
9. Return to **Connected Accounts**
10. Click **"Sync Data"**

---

## 📝 Information to Share If Getting Support

If you contact support, provide this information:

```
Account Status: [active/inactive/error]
Last Sync: [timestamp]
Campaigns Count: [number]
Metrics Rows: [number]

Error Message (if any):
[exact error text]

Steps You've Already Tried:
- [ ] Clicked "Sync Data" button
- [ ] Reconnected the account
- [ ] Checked credentials are correct
- [ ] Verified campaigns exist in Google Ads
- [ ] Checked browser console for errors
- [ ] Refreshed the page
```

---

## 🎯 Expected Behavior After Successful Sync

Once everything is working:

✅ **In Settings → Connected Accounts:**
- Google Ads Account card shows "active" status
- Shows "Account ID: 123-456-7890"
- Shows "Last Synced: [recent timestamp]"

✅ **In Dashboard:**
- Campaign Performance chart shows spend/revenue lines
- Metrics Overview shows total impressions/clicks/conversions/spend
- Platform Comparison shows Google Ads with green status

✅ **In AI Chat:**
- You can ask "How did my Google Ads perform last week?"
- AI provides relevant insights based on your real data

---

## 🆘 Still Not Working?

If you've tried all steps above and data still isn't populating:

1. **Document:**
   - Exact error message (screenshot)
   - Steps you've tried
   - Your Google Ads account ID
   - When you first connected (today/yesterday/etc)

2. **Check logs:**
   - Supabase → Logs → filter by "api"
   - Look for sync-data API calls
   - Copy the full error output

3. **Try a fresh connection:**
   - Remove your app access: https://myaccount.google.com/permissions
   - Disconnect account in app
   - Wait 5 minutes
   - Reconnect from scratch

4. **Contact Support** with the documentation from step 1

---

## 📚 Related Resources

- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs)
- [Quick Start Guide](./QUICK_START_FOR_USER.md)
- [OAuth Setup Guide](./OAUTH_SETUP_GUIDE.md)
- [API Integration Changes](./API_INTEGRATION_CHANGES.md)
