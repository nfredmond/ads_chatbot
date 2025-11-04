# 🚀 Google Ads Data Sync - Quick Fix Guide

**Your Google Ads account is connected, but data isn't showing. Follow this quick fix guide.**

---

## ⚡ The #1 Most Common Issue (Try This First!)

### You Haven't Clicked "Sync Data" Yet

**Location:** Settings → Connected Accounts

**What you need to do:**
1. Click the **"Sync Data"** button on the right side of the page
2. Wait 15-30 seconds for the sync to complete
3. You should see a green message: "✅ Data synced successfully!"
4. Refresh your browser (Ctrl+F5)
5. Go to Dashboard - your campaigns should now appear!

**That's it!** If this works, you're done. ✅

---

## ❌ If That Didn't Work - Try These in Order

### Quick Fix #1: Refresh Everything (30 seconds)

```
1. Go to Settings → Connected Accounts
2. Refresh browser (Ctrl+F5 or Cmd+Shift+R on Mac)
3. Click "Sync Data" button
4. Wait 20 seconds
5. Go to Dashboard and refresh again
```

**Success?** ✅ You're done!  
**Still nothing?** ➡️ Try Quick Fix #2

---

### Quick Fix #2: Verify Your Google Ads Has Campaigns (2 minutes)

The API can only sync campaigns if they actually exist.

```
1. Log in to your Google Ads account
2. Click "Campaigns" in the left menu
3. Should show at least ONE campaign
4. That campaign should have data from the last 30 days
   (Impressions, Clicks, Conversions, or Spend)
```

**Don't have any campaigns?**
- Create a test campaign or promote an existing one
- Campaigns need at least 1 impression/click in last 30 days

**Campaigns exist?** ➡️ Try Quick Fix #3

---

### Quick Fix #3: Clear the Connection and Reconnect (5 minutes)

Sometimes tokens get corrupted. A fresh reconnection usually fixes it.

```
STEP 1: Disconnect
- Settings → Connected Accounts
- Click "Disconnect" on your Google Ads account
- Confirm when prompted
- Wait 10 seconds

STEP 2: Reconnect
- Settings → Ad Platforms → Google Ads
- Verify all 4 fields are filled:
  ☐ Client ID
  ☐ Client Secret
  ☐ Developer Token
  ☐ Customer ID
- Click "Connect Google Ads (OAuth)"
- Complete the Google login/permission flow

STEP 3: Sync
- Settings → Connected Accounts
- Click "Sync Data"
- Wait 20 seconds
```

**Success?** ✅ You're done!  
**Still not working?** ➡️ Go to detailed troubleshooting

---

### Quick Fix #4: Force Google to Issue a New Refresh Token (3 minutes)

Google sometimes "remembers" that you already authorized. This forces a new permission flow.

```
STEP 1: Remove your app's access
- Visit: https://myaccount.google.com/permissions
- Find your app in the list
- Click it and click "Remove Access"
- Confirm

STEP 2: Reconnect with fresh permissions
- Back to app: Settings → Ad Platforms → Google Ads
- Click "Connect Google Ads (OAuth)"
- THIS TIME: You should see a "Confirm Permissions" screen
  (not just a quick redirect)
- Click "Allow"

STEP 3: Sync
- Settings → Connected Accounts
- Click "Sync Data"
```

**This usually works!** ✅

---

## 🔍 Verify Everything Worked

After syncing, check these:

✅ **In Settings → Connected Accounts:**
- Your Google Ads account shows "active" (green checkmark)
- Account ID is displayed
- "Last Synced" shows a recent time

✅ **In Dashboard:**
- "Campaign Performance" section shows a chart
- Metrics Overview shows numbers (impressions, clicks, etc)
- No empty state message

✅ **In AI Chat:**
- Ask "What are my Google Ads metrics?"
- You get real data, not "no data found"

---

## 📋 Troubleshooting Checklist

If you've tried all quick fixes and still have issues, check:

### Do You See an Error Message?

**"Google Ads refresh token missing"**
- Go to `Quick Fix #4` above (remove access and reconnect)

**"Credentials incomplete"**
- Go to Settings → Ad Platforms → Google Ads
- Make sure ALL 4 fields have values:
  - Client ID (ends with `.apps.googleusercontent.com`)
  - Client Secret (20+ characters)
  - Developer Token (40 characters, all caps)
  - Customer ID (format: 123-456-7890)

**"Invalid developer token" or "Rate limit exceeded"**
- Go to [Google Ads API Center](https://ads.google.com/aw/apicenter)
- Click the eye icon next to Developer Token
- Copy the ENTIRE token
- Paste it back into your app settings

**Other error?**
- Note the exact message
- See `GOOGLE_ADS_DATA_TROUBLESHOOTING.md` for detailed help

### Is Your Account Setup Correct?

1. **Do you have a Manager Account (MCC)?**
   - Google Ads API requires this
   - Go to [Google Ads API Center](https://ads.google.com/aw/apicenter)
   - If it says "Test Access" - your access level is limited
   - Switch to a Manager Account or request "Basic Access"

2. **Do your campaigns have data?**
   - Log into Google Ads
   - Go to Campaigns
   - Should show campaigns with recent activity
   - If not, create a campaign with some spend

3. **Is the API service working?**
   - Check [Google Cloud Status](https://status.cloud.google.com)
   - Look for "Google Ads API"
   - Should show "Operational" (green)

---

## 🎯 What Happens After Sync Works

Once data is syncing:

✅ Your real campaign names appear in the dashboard  
✅ Real metrics: Impressions, Clicks, Conversions, Spend, Revenue  
✅ 30 days of historical data automatically loaded  
✅ AI Chat can analyze your real performance  
✅ Data updates when you click "Sync Data" again  

---

## 📞 Need More Help?

For detailed troubleshooting of complex issues:
- See: `GOOGLE_ADS_DATA_TROUBLESHOOTING.md`

For setting up Google Ads originally:
- See: `OAUTH_SETUP_GUIDE.md`

For understanding the overall system:
- See: `QUICK_START_FOR_USER.md`

---

## ✨ Summary

| Issue | Solution | Time |
|-------|----------|------|
| Haven't clicked Sync Data yet | Go to Connected Accounts, click "Sync Data" | 30s |
| Data not appearing after sync | Refresh browser and try again | 1m |
| No campaigns in your account | Create campaigns in Google Ads first | 5m |
| Still not working | Clear connection and reconnect | 5m |
| Token issues | Remove app access and reconnect (Quick Fix #4) | 3m |
| All else fails | Use detailed troubleshooting guide | varies |

**Most people find their issue in the first 3 quick fixes. Try them in order!** 🚀
