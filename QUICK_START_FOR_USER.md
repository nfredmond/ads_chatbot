# 🚀 Quick Start Guide - Connect Your Ad Platforms

## ✅ What's Been Fixed

Your application now has **production-ready OAuth 2.0 authentication** for all three advertising platforms:

- ✅ Google Ads API (v21)
- ✅ Meta Ads API (v21.0)  
- ✅ LinkedIn Ads API (202505)

**Most importantly**: All dummy/sample data has been removed. The app will ONLY show your real campaign data.

---

## 🎯 Your Next Steps

### Option 1: Quick Test (Recommended First)

1. **Start the development server** (if not already running):
   ```bash
   cd ads-chatbot
   npm run dev
   ```

2. **Open browser**: http://localhost:3000

3. **Login/Signup** and complete onboarding

4. **Go to Settings** → **Ad Platforms** tab

5. **You'll see three sections**:
   - Google Ads
   - Meta Ads
   - LinkedIn Ads

### Option 2: Full Production Setup

Follow the comprehensive guide in `OAUTH_SETUP_GUIDE.md` to:
1. Create developer accounts on each platform
2. Get OAuth credentials
3. Configure redirect URIs
4. Complete API approval processes

---

## 🔑 What You Need for Each Platform

### Google Ads

You need 4 things:
1. **OAuth Client ID** - Get from [Google Cloud Console](https://console.cloud.google.com)
2. **OAuth Client Secret** - Get from Google Cloud Console
3. **Developer Token** - Get from [Google Ads API Center](https://ads.google.com/aw/apicenter)
4. **Customer ID** - Find in your Google Ads account (top-right corner, format: 123-456-7890)

**Important**: You need a Google Ads **Manager Account (MCC)** to get a developer token. Standard accounts won't work.

### Meta Ads (Facebook/Instagram)

You need 2 things:
1. **App ID** - Get from [Meta for Developers](https://developers.facebook.com/apps)
2. **App Secret** - Get from Meta for Developers

**Note**: You'll need to request "Advanced Access" for Marketing API (takes 1-2 weeks).

### LinkedIn Ads

You need 2 things:
1. **Client ID** - Get from [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. **Client Secret** - Get from LinkedIn Developers

**Note**: You need "Marketing Developer Platform" access approved (can take weeks to months).

---

## 📝 Step-by-Step Connection Process

### For Google Ads:

1. Go to **Settings** → **Ad Platforms** → **Google Ads**
2. Enter your 4 credentials
3. Click **"Connect Google Ads (OAuth)"**
4. You'll be redirected to Google
5. Sign in and authorize access
6. You'll be redirected back with "✅ Google Ads connected successfully!"
7. Go to **Connected Accounts** tab
8. Click **"Sync Data"**
9. Your real campaigns will appear!

### For Meta Ads:

1. Go to **Settings** → **Ad Platforms** → **Meta Ads**
2. Enter App ID and App Secret
3. Click **"Connect Meta Ads (OAuth)"**
4. You'll be redirected to Facebook
5. Sign in and authorize access
6. Select your ad account if prompted
7. You'll be redirected back with "✅ Meta Ads connected successfully!"
8. Click **"Sync Data"** to load your campaigns

### For LinkedIn Ads:

1. Go to **Settings** → **Ad Platforms** → **LinkedIn Ads**
2. Enter Client ID and Client Secret
3. Click **"Connect LinkedIn Ads (OAuth)"**
4. You'll be redirected to LinkedIn
5. Sign in and authorize access
6. You'll be redirected back with "✅ LinkedIn Ads connected successfully!"
7. Click **"Sync Data"** to load your campaigns

---

## ⚠️ Important Notes

### API Approval Timeline

**Be patient - approvals take time:**

- **Google Ads**: 
  - Initial: Test Access (immediate, test accounts only)
  - Basic Access: 1-2 weeks (15,000 operations/day)
  - Standard Access: 2-4 weeks (unlimited operations)
  
- **Meta Ads**:
  - Development Mode: Immediate (limited testing)
  - Advanced Access: 1-2 weeks after app review
  - Required: Privacy Policy URL, Terms of Service, Business verification
  
- **LinkedIn Ads**:
  - Marketing Developer Platform: **Weeks to months**
  - Longest approval process of all three platforms
  - Requires company page association and detailed use case

### Data Freshness & Limitations

**Important to know:**

- **Google Ads**: Data updates every few hours, no real-time webhooks
- **Meta Ads**: Near real-time data, webhooks available for leads/conversions
- **LinkedIn Ads**: **24-hour delay** on analytics data (yesterday's data available today)

### Rate Limits Built-In

The app automatically handles rate limiting:

- **Google Ads**: Max 15,000 operations/day (Basic Access), 5 queries/second
- **Meta Ads**: Dynamic throttling (pauses when reaching 80% limit)
- **LinkedIn Ads**: Application-level daily limits, ~3 queries/second

You don't need to worry about these - the system manages them automatically!

### Redirect URIs Must Match

When setting up OAuth apps, make sure redirect URIs **exactly** match:

**For Development** (localhost):
```
Google: http://localhost:3000/auth/google
Meta: http://localhost:3000/auth/meta
LinkedIn: http://localhost:3000/auth/linkedin
```

**For Production** (your domain):
```
Google: https://yourdomain.com/auth/google
Meta: https://yourdomain.com/auth/meta
LinkedIn: https://yourdomain.com/auth/linkedin
```

### Token Expiration & Auto-Refresh

- **Google Ads**: Refresh tokens **never expire**! ✅
  - Access tokens refresh automatically every hour
  - No reconnection needed once set up
  - System uses refresh token to get new access tokens
  
- **Meta Ads**: Long-lived tokens last **60 days**
  - You'll receive email warning 7 days before expiration
  - Must reconnect manually via OAuth
  - System automatically converts short-lived to long-lived tokens
  
- **LinkedIn Ads**: Access tokens last **60 days**
  - You'll receive email warning 7 days before expiration
  - Must reconnect manually via OAuth
  - No automatic refresh available from LinkedIn

### No Dummy Data Anymore

The app used to fall back to dummy/sample data when API calls failed. **This has been completely removed**. Now you'll either see:
- ✅ Your real campaign data, OR
- ❌ A clear error message explaining what went wrong

---

## 🐛 Troubleshooting

### "No refresh token received" (Google Ads)

**Why this happens**: Google only issues refresh tokens on the first authorization with `prompt=consent`. If you've authorized before, Google assumes you already have the refresh token.

**Fix**: 
1. Go to https://myaccount.google.com/permissions
2. Find your app and click "Remove Access"
3. Try connecting again - you'll get a new refresh token

### "No ad accounts found" (Meta or LinkedIn)

**Why this happens**: The account you're signing in with doesn't have access to any ad accounts.

**Fix**: 
- **Meta**: Make sure you're using an account connected to Facebook Business Manager with ad accounts
- **LinkedIn**: Ensure your LinkedIn account has Campaign Manager access
- Personal accounts without business access won't work

### "Invalid redirect URI"

**Why this happens**: The redirect URI in your OAuth app doesn't match what the app is using.

**Fix**: 
1. Check OAuth app settings on the platform
2. Ensure redirect URI matches **exactly**:
   - Protocol: `http://` vs `https://`
   - Domain: `localhost:3000` vs `yourdomain.com`
   - Path: `/auth/google` (no trailing slash)

### "Failed to sync data"

**Common causes**:
1. **Token expired** - Reconnect the account
2. **API approval pending** - Check developer console
3. **No campaigns exist** - Create campaigns on the platform first
4. **Rate limit reached** - Wait and try again (system auto-retries)
5. **API credentials invalid** - Recheck Client ID, Secret, Developer Token

**Fix**: 
1. Check the specific error message
2. View logs in Settings → Connected Accounts
3. Verify credentials are correct
4. Ensure campaigns exist on the platform
5. Check platform's developer console for API status

### "Rate limit exceeded"

**What it means**: You've hit the platform's API quota

**What happens**:
- System automatically retries with exponential backoff
- Pauses requests to avoid further rate limiting
- Logs the event for monitoring

**You should**:
- Wait a few minutes and try again
- Check if you need to upgrade API access tier
- Reduce frequency of manual sync requests

### Email notifications not working

**This is optional** - the app works fine without email configured.

**To enable**:
1. Add email settings to environment variables
2. For Gmail: Use App-Specific Password (not regular password)
3. Test by triggering a manual sync error

### "Webhook verification failed" (Meta)

**Only relevant if you're using webhooks for lead ads**

**Fix**:
1. Verify `META_WEBHOOK_VERIFY_TOKEN` in .env matches Meta app settings
2. Ensure webhook URL uses HTTPS in production
3. Use ngrok for local testing: `ngrok http 3000`
4. Check Meta's webhook testing tool shows green checkmark

---

## 📚 More Help

- **Setup Details**: See `OAUTH_SETUP_GUIDE.md`
- **Technical Details**: See `API_INTEGRATION_CHANGES.md`
- **Implementation Summary**: See `IMPLEMENTATION_COMPLETE.md`

---

## 🎉 What You'll See After Syncing

Once connected and synced, your dashboard will show:

- 📊 **Real campaign names** from your accounts
- 📈 **Real metrics**: Impressions, Clicks, Spend, Conversions, Revenue
- 📅 **Last 30 days** of performance data
- 🔄 **Auto-refreshing data** when you click "Sync Data"
- 🎯 **Cross-platform comparison** of all your campaigns

**No more dummy data like "Summer Sale 2025 (Sample)" or random numbers!**

---

## 🚀 Ready to Go!

Your application is ready for production use. Just:

1. Get your API credentials from each platform
2. Enter them in Settings
3. Complete OAuth
4. Sync your data
5. See your real campaigns! 🎊

**Questions?** Check the detailed guides in the `OAUTH_SETUP_GUIDE.md` file.

