# ✅ Google Ads Data Sync - Diagnostic Checklist

**Work through this checklist systematically to identify why your data isn't syncing.**

---

## 📋 SECTION 1: Connection Status (5 minutes)

### Connection Check

```
☐ Step 1: Go to Settings → Connected Accounts tab
☐ Step 2: Look for "Google Ads Account" card
☐ Step 3: Check if card shows:
    ☐ Status badge (should show "active" with green checkmark)
    ☐ Account ID (format: 123-456-7890)
    ☐ Last Synced timestamp
```

**All checkboxes marked?** ✅ Connection is OK → Go to SECTION 2  
**Any missing?** ❌ Connection failed → [Fix: Reconnect Account](#fix-reconnect-account)

---

## 📋 SECTION 2: Data Sync Attempt (10 minutes)

### Try Syncing

```
☐ Step 1: In Connected Accounts, click "Sync Data" button
☐ Step 2: Wait 15-30 seconds (don't close or navigate away)
☐ Step 3: Look for message at top of page

Check what message you see:
```

**What message appeared?**

| Message | Status | Action |
|---------|--------|--------|
| ✅ "Data synced successfully!" | ✅ Sync worked | → Go to SECTION 3 |
| ⏳ No message (still loading) | ⏳ Loading | → Wait longer, up to 60 seconds |
| ❌ Error message | ❌ Sync failed | → Note error text, see [Error Messages](#error-messages) |
| 🔴 Red alert box | ❌ Sync failed | → Note error text, see [Error Messages](#error-messages) |

---

## 📋 SECTION 3: Data Appeared in Dashboard (5 minutes)

### Dashboard Check

```
☐ Step 1: Click "Dashboard" in top menu
☐ Step 2: Scroll down to "Campaign Performance" section
☐ Step 3: Check what you see
```

**What do you see?**

| What You See | Status | Action |
|--------------|--------|--------|
| Line chart with "Spend" and "Revenue" lines | ✅ Data loaded | ✅ Success! Troubleshooting complete |
| Empty gray box with "No campaign data available" | ❌ No data in DB | → Go to SECTION 4 |
| Loading spinner (bouncing dots) | ⏳ Still loading | → Wait, then refresh browser |
| Error message in dashboard | ❌ Dashboard error | → Note error, see [Error Messages](#error-messages) |

---

## 📋 SECTION 4: Database Verification (3 minutes)

### Check if Data Made It to Database

Only do this section if sync said "success" but dashboard shows no data.

**In Supabase Dashboard:**

```
☐ Step 1: Go to your Supabase project
☐ Step 2: Click "SQL Editor" tab
☐ Step 3: Copy and paste this query:
```

```sql
SELECT COUNT(*), platform 
FROM campaigns 
WHERE tenant_id IN (
  SELECT tenant_id FROM profiles WHERE id = auth.uid()
)
GROUP BY platform;
```

```
☐ Step 4: Click "Run" (or Ctrl+Enter)
☐ Step 5: Check results
```

**What do the results show?**

| Results | Status | Action |
|---------|--------|--------|
| `google_ads | 5` (or any number > 0) | ✅ Campaigns in DB | → Try refreshing dashboard, or see "Dashboard Rendering Issue" below |
| `(no rows)` or empty result | ❌ No data in DB | → Go to SECTION 5 |
| Error message like "permission denied" | ❌ DB permission issue | → See "Database Permission Error" section below |

**Also check metrics:**

```sql
SELECT COUNT(*), DATE(date) as sync_date
FROM campaign_metrics 
WHERE tenant_id IN (
  SELECT tenant_id FROM profiles WHERE id = auth.uid()
)
GROUP BY DATE(date)
ORDER BY sync_date DESC
LIMIT 10;
```

**Expected:** Several rows with recent dates and high numbers (100+)  
**If result is empty:** No metrics synced → Go to SECTION 5

---

## 📋 SECTION 5: API-Level Diagnostics (5 minutes)

### Do You Have Campaigns in Google Ads?

```
☐ Step 1: Log in to your Google Ads account
☐ Step 2: Click "Campaigns" in left menu
☐ Step 3: Do you see any campaigns listed?
```

**Campaigns visible?**

| Result | Status | Action |
|--------|--------|--------|
| Yes, I see 1+ campaigns | ✅ Campaigns exist | → Go to SECTION 6 |
| No campaigns listed | ❌ No campaigns | → Create a test campaign first (see box below) |
| Campaigns exist but they're all paused | ⚠️ Paused campaigns | → Google may not return data; active campaigns work better |

**Need to create a test campaign?**
```
1. In Google Ads, click "Campaigns" + button
2. Choose any campaign type (Search recommended)
3. Create a campaign with at least $1 daily budget
4. Let it run for a few hours to generate impressions
5. Then try syncing again
```

### Do Your Campaigns Have Data?

```
☐ Step 1: Click any campaign name
☐ Step 2: Look at the date range at the top
☐ Step 3: Change to "Last 30 days"
☐ Step 4: Check the metrics below:
    - Impressions: should be a number (0 or higher)
    - Clicks: should be a number (0 or higher)
    - Conversions: should be a number (0 or higher)
    - Cost: should show an amount (even if $0.00)
```

**Campaigns have data?**

| Result | Status | Action |
|--------|--------|--------|
| Yes, I see metrics in the table | ✅ Data exists | → Go to SECTION 6 |
| Metrics show 0 for everything | ⚠️ No activity | → Data still may sync; try anyway |
| Can't access campaigns, says "Permission Denied" | ❌ No access | → Use a different Google Ads account |

---

## 📋 SECTION 6: Google API Access Level (3 minutes)

### Check Your API Access Tier

```
☐ Step 1: Go to https://ads.google.com/aw/apicenter
☐ Step 2: Look for "API access tier" or "Access level"
☐ Step 3: Check which tier you have
```

**What access level do you have?**

| Tier | Can Use? | Action |
|------|----------|--------|
| Test Access | ❌ Limited (test accounts only) | → Request "Basic Access" (1-2 weeks) |
| Basic Access | ✅ Works | → You're good; continue troubleshooting |
| Standard Access | ✅ Works (best) | → You're good; continue troubleshooting |
| (Can't find it) | ❓ Unknown | → Contact Google Ads support |

**How to request upgrade:**
1. Go to https://ads.google.com/aw/apicenter
2. Click "Request access" (if visible)
3. Select "Standard Access"
4. Google will review in 1-4 weeks
5. Meanwhile, use Test Access if available

---

## 📋 SECTION 7: Google OAuth Credentials (5 minutes)

### Verify Your Credentials Are Correct

Go to Settings → Ad Platforms → Google Ads

```
☐ Check EACH of these 4 fields:

1. CLIENT ID:
   ☐ Should end with: .apps.googleusercontent.com
   ☐ Should be 50+ characters long
   ☐ Should NOT be empty

2. CLIENT SECRET:
   ☐ Should be 20+ characters long
   ☐ Should NOT start with "GOCSPX-"  (if it does, you copied the wrong thing)
   ☐ Should NOT be empty

3. DEVELOPER TOKEN:
   ☐ Should be exactly 40 characters long
   ☐ Should be ALL UPPERCASE letters and numbers
   ☐ Should NOT be empty
   ☐ Should NOT have spaces or dashes

4. CUSTOMER ID:
   ☐ Should have hyphens (format: 123-456-7890)
   ☐ Should be 11 characters long including hyphens
   ☐ Should NOT be empty
   ☐ Should only contain numbers and hyphens
```

**How many fields look correct?**

| Correct Fields | Status | Action |
|---|---|---|
| All 4 fields look right | ✅ Credentials OK | → Go to SECTION 8 |
| 1-3 fields look wrong | ❌ Invalid credentials | → [Fix: Re-copy credentials](#fix-recopy-credentials) |
| Any field is empty | ❌ Missing credential | → [Fix: Find missing credential](#fix-find-missing-credential) |

---

## 📋 SECTION 8: Refresh Token Issue (3 minutes)

### Check If Refresh Token Was Saved

This is a known Google OAuth quirk. Try this:

```
☐ Step 1: Settings → Connected Accounts
☐ Step 2: Click "Disconnect"
☐ Step 3: Confirm when asked
☐ Step 4: Go to https://myaccount.google.com/permissions
☐ Step 5: Find your app in the list
☐ Step 6: Click it, then "Remove Access"
☐ Step 7: Go back to Settings → Ad Platforms → Google Ads
☐ Step 8: Click "Connect Google Ads (OAuth)"
☐ Step 9: THIS TIME, you should see a "Confirm Permissions" screen
          (instead of just redirecting)
☐ Step 10: Click "Allow" on the permissions screen
☐ Step 11: You should return to the app
☐ Step 12: Go to Connected Accounts and click "Sync Data"
```

**Did data sync this time?**

| Result | Status | Action |
|--------|--------|--------|
| Yes! Data synced successfully! | ✅ Success | ✅ Problem solved! |
| Still no sync or same error | ❌ Still broken | → Go to SECTION 9 |

---

## 📋 SECTION 9: Advanced Checks (if nothing else worked)

### Check Browser Console for Errors

```
☐ Step 1: Press F12 to open Developer Tools
☐ Step 2: Click "Console" tab
☐ Step 3: Click "Sync Data"
☐ Step 4: Watch the console for red error messages
☐ Step 5: Take a screenshot of any error text
```

**What errors do you see?**

| Error | Meaning | Solution |
|-------|---------|----------|
| `tenant_id is null` | Not logged in properly | Log out and back in |
| `supabase is not defined` | Connection issue | Refresh page, check internet |
| `401 Unauthorized` | Auth failed | Reconnect account |
| Network errors (CORS, failed to fetch) | Server unreachable | Check app is running; contact support |

### Check Network Requests

```
☐ Step 1: Press F12, go to "Network" tab
☐ Step 2: Clear any existing requests (trash icon)
☐ Step 3: Click "Sync Data"
☐ Step 4: Look for these requests:
    - /api/sync-data
    - googleads.googleapis.com
☐ Step 5: Click each request and check "Status"
    - Should show 200 or 201 for success
    - Will show 400/401/403/429 for errors
```

**What status codes do you see?**

| Status | Meaning | Action |
|--------|---------|--------|
| 200 / 201 | Success | Check database (SECTION 4) |
| 400 Bad Request | Invalid request | Credentials wrong (SECTION 7) |
| 401 Unauthorized | Auth failed | Token issue (SECTION 8) |
| 403 Forbidden | Permission denied | Access level or account issue |
| 429 Rate Limited | API quota hit | Wait and retry later |
| 500 Server Error | Backend crashed | Contact support |

---

## 🔧 Quick Fixes

### Fix: Reconnect Account

```
1. Settings → Connected Accounts
2. Click "Disconnect" on Google Ads account
3. Settings → Ad Platforms → Google Ads
4. Verify all 4 credentials are filled
5. Click "Connect Google Ads (OAuth)"
6. Complete the login flow
7. Settings → Connected Accounts → "Sync Data"
8. Wait 20 seconds
```

### Fix: Re-copy Credentials

```
For Client ID and Client Secret:
1. Go to https://console.cloud.google.com
2. In sidebar: APIs & Services → Credentials
3. Find "OAuth 2.0 Client ID" of type "Web application"
4. Click it
5. Copy Client ID (not the one at top, use the one in the details)
6. For secret, click the copy icon next to it
7. Paste both into your app

For Developer Token:
1. Go to https://ads.google.com/aw/apicenter
2. Look for "Developer Token" section
3. Click the eye icon to show it
4. Copy the entire token
5. Paste into your app

For Customer ID:
1. Log in to your Google Ads account
2. Top right, next to profile picture, see a number like "123-456-7890"
3. That's your Customer ID
4. Paste it in your app
```

### Fix: Find Missing Credential

**Need Client ID/Client Secret?**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Left sidebar: APIs & Services → Credentials
4. Create a new "OAuth 2.0 Client ID" (Web application type)
5. Add redirect URI: `http://localhost:3000/auth/google` (or your domain)
6. Copy the ID and Secret

**Need Developer Token?**
1. Go to [Google Ads API Center](https://ads.google.com/aw/apicenter)
2. Should show your Developer Token
3. If not visible, you may not have Manager Account access

**Need Customer ID?**
1. Log in to Google Ads account
2. Top right, next to your profile
3. You'll see a 10-digit number with hyphens
4. That's your Customer ID

---

## 📝 Summary Sheet

**Print this out or keep it open:**

| Item | Status | Notes |
|------|--------|-------|
| Connection shows "active" | ☐ | |
| Clicked "Sync Data" button | ☐ | |
| Sync shows success message | ☐ | |
| Data appears in dashboard | ☐ | |
| Campaigns exist in Google Ads | ☐ | |
| Campaigns have recent data | ☐ | |
| Have "Basic Access" or higher | ☐ | |
| All 4 credentials filled correctly | ☐ | |
| No error messages | ☐ | |
| No network errors in console | ☐ | |

**If all boxes are checked: ✅ Everything working!**

**If any boxes are unchecked: Find that item above and follow its fix.**

---

## ❌ Error Messages

### Full Error Messages Reference

#### "Google Ads refresh token missing"
→ See SECTION 8: Refresh Token Issue

#### "Google Ads credentials incomplete"
→ See SECTION 7: Google OAuth Credentials

#### "Invalid developer token"
→ Go to [Google Ads API Center](https://ads.google.com/aw/apicenter), copy token with eye icon

#### "Failed to refresh access token"
→ See SECTION 8: Refresh Token Issue

#### "No campaigns found"
→ See SECTION 5: Do You Have Campaigns in Google Ads?

#### "Rate limit exceeded"
→ Wait 1 hour and try again, or upgrade API access tier in SECTION 6

#### "Invalid redirect URI"
→ Check your Google Cloud Console that redirect URI matches exactly

#### Other error
→ Go to SECTION 9: Advanced Checks

---

## 🎯 Final Decision Tree

```
START HERE
    ↓
✅ Sync said "success"?
    ├─→ NO: Go to SECTION 1 (Connection Issue)
    └─→ YES: Go to next question
        ↓
✅ Data appeared in Dashboard?
    ├─→ NO: Go to SECTION 4 (Database Check)
    └─→ YES: ✅ YOU'RE DONE!
        ↓
✅ Data in database?
    ├─→ NO: Go to SECTION 5 (API Check)
    └─→ YES: Dashboard Rendering Issue
        - Refresh browser (Ctrl+F5)
        - Log out and back in
        - Check browser console (F12)
        ↓
✅ Have campaigns in Google Ads?
    ├─→ NO: Create a test campaign (SECTION 5 box)
    └─→ YES: Go to SECTION 6
        ↓
✅ Have "Basic Access" or higher?
    ├─→ NO: Request upgrade or use account with access
    └─→ YES: Go to SECTION 7
        ↓
✅ All credentials correct?
    ├─→ NO: Re-copy from console (Fix section)
    └─→ YES: Go to SECTION 8
        ↓
✅ Try removing & re-adding access?
    ├─→ NO: Do it now (SECTION 8)
    └─→ YES (and still broken): Go to SECTION 9
        ↓
🆘 Contact Support with:
    - Error message (screenshot)
    - Steps tried
    - Account ID
    - Console errors (screenshot)
```

---

**The key is working through the sections in order. Most issues are caught in the first 4 sections!**
