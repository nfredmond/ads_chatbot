# OAuth Setup Guide for Ad Platform Integrations

This guide explains how to properly configure OAuth 2.0 authentication for Google Ads, Meta Ads, and LinkedIn Ads APIs.

## Important: OAuth Flow Required

**All three advertising platforms require proper OAuth 2.0 authentication.** You cannot simply paste access tokens - you must complete the OAuth flow for each platform to get valid, long-lived credentials.

---

## Google Ads API Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the **Google Ads API** in the API Library

### Step 2: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Select **Web application** as the application type
4. Add authorized redirect URI:
   ```
   https://yourdomain.com/auth/google
   ```
   For local development:
   ```
   http://localhost:3000/auth/google
   ```
5. Save the **Client ID** and **Client Secret**

### Step 3: Get Developer Token

1. Create a **Google Ads Manager Account** (MCC) at [ads.google.com](https://ads.google.com)
   - ⚠️ **CRITICAL**: Standard Google Ads accounts **CANNOT** obtain developer tokens
   - You **MUST** have a Manager Account (MCC - My Client Center)
   - This is a hard requirement that cannot be bypassed
   
2. Go to **Tools** → **Setup** → **API Center**

3. Click **Request a developer token**

4. Fill in detailed information:
   - Will you manage campaigns? (Yes/No)
   - Will you retrieve reporting data? (Yes/No)
   - Describe your use case in detail
   
5. **Initial Access Level**: Test Access
   - Only works with test accounts
   - 15,000 operations per day limit
   - Good for development
   
6. **Apply for Production Access**:
   - **Basic Access**: 15,000 ops/day, works with production accounts (1-2 weeks)
   - **Standard Access**: Unlimited operations (2-4 weeks, requires more scrutiny)
   
7. Copy your developer token (22-character alphanumeric string like: `Abc123XyzDEF456GhiJKL789`)

### Step 4: Find Your Customer ID

1. Log into your Google Ads account
2. Look at the top-right corner
3. Copy the Customer ID (format: 123-456-7890)

### Step 5: Configure in Application

1. Go to **Settings** → **Ad Platforms** → **Google Ads**
2. Enter:
   - OAuth Client ID
   - OAuth Client Secret
   - Developer Token
   - Customer ID
3. Click **Connect Google Ads (OAuth)**
4. Authorize your Google account when prompted
5. You'll be redirected back with a success message

---

## Meta Ads (Facebook/Instagram) API Setup

### Step 1: Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/apps)
2. Click **Create App**
3. Select **Business** as the app type
4. Fill in app details and create

### Step 2: Add Marketing API

1. In your app dashboard, click **Add Product**
2. Find **Marketing API** and click **Set Up**
3. This will add the Marketing API to your app

### Step 3: Configure OAuth Settings

1. Go to **Settings** → **Basic**
2. Copy your **App ID** and **App Secret**
3. Add your **Privacy Policy URL** and **Terms of Service URL**
4. Go to **Facebook Login** → **Settings**
5. Add Valid OAuth Redirect URI:
   ```
   https://yourdomain.com/auth/meta
   ```
   For local development:
   ```
   http://localhost:3000/auth/meta
   ```

### Step 4: Request Advanced Access

**Before App Review**:
- App must be in **Development Mode** initially
- You can test with your own accounts
- Limited to admins/developers/testers only

**Required Documentation**:
1. Privacy Policy URL (must be publicly accessible)
2. Terms of Service URL (must be publicly accessible)
3. App icon and screenshots
4. Detailed use case description

**Request Advanced Access**:
1. Go to **App Review** → **Permissions and Features**
2. Request Advanced Access for:
   - `ads_management` - Create and manage ads
   - `ads_read` - Read ad account and campaign data
   - `business_management` - Access Business Manager data
   - `pages_read_engagement` - Read Page data (for lead ads)
   
3. Fill in detailed questionnaire:
   - How will you use each permission?
   - Screenshots of your app using the permission
   - Step-by-step instructions for reviewers
   
4. Submit for review

**Timeline**:
- Review typically takes **1-2 weeks**
- May be rejected if documentation is incomplete
- Can resubmit with improvements

**During Review**:
- App stays in Development Mode
- You can continue testing
- No production users yet

**After Approval**:
- Switch to Live Mode
- All users can access
- Monitor usage in Analytics dashboard

### Step 5: Configure in Application

1. Go to **Settings** → **Ad Platforms** → **Meta Ads**
2. Enter:
   - App ID
   - App Secret
3. Click **Connect Meta Ads (OAuth)**
4. Authorize your Facebook account and select ad account
5. You'll be redirected back with a success message
6. The system will automatically:
   - Exchange code for short-lived token
   - Convert to long-lived token (60 days)
   - Fetch your ad account ID
   - Save everything to database

---

## LinkedIn Ads API Setup

### Step 1: Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **Create app**
3. Fill in required information:
   - App name
   - LinkedIn Company Page (required)
   - Privacy policy URL
   - Logo

### Step 2: Request Marketing Developer Platform Access

1. In your app settings, go to **Products**
2. Find **Marketing Developer Platform**
3. Click **Request access**
4. Fill in detailed use case information
5. Wait for approval (can take weeks to months)

### Step 3: Configure OAuth Settings

1. Go to **Auth** tab
2. Copy your **Client ID** and **Client Secret**
3. Add OAuth 2.0 redirect URL:
   ```
   https://yourdomain.com/auth/linkedin
   ```
   For local development:
   ```
   http://localhost:3000/auth/linkedin
   ```

### Step 4: Configure in Application

1. Go to **Settings** → **Ad Platforms** → **LinkedIn Ads**
2. Enter:
   - Client ID
   - Client Secret
3. Click **Connect LinkedIn Ads (OAuth)**
4. Authorize your LinkedIn account
5. You'll be redirected back with a success message
6. The system will automatically:
   - Fetch your LinkedIn ad accounts
   - Use the first active account found
   - Save access token (60-day expiration)

---

## OAuth Flow Summary

### Understanding OAuth Token Types

**Google Ads** - Dual Token System:
- **Access Token**: Valid ~1 hour, used for API requests
- **Refresh Token**: **Never expires** (unless revoked), used to get new access tokens
- System automatically refreshes access tokens using refresh token
- ✅ **Best token management** of all three platforms

**Meta Ads** - Two-Stage Conversion:
- **Short-lived Token**: Valid 1-2 hours (initial OAuth response)
- **Long-lived Token**: Valid 60 days (converted from short-lived)
- System automatically converts tokens
- ⚠️ Must manually reconnect every 60 days

**LinkedIn Ads** - Single Long Token:
- **Access Token**: Valid 60 days (no conversion needed)
- ❌ **No programmatic refresh** available
- ⚠️ Must manually reconnect every 60 days
- Email warnings sent 7 days before expiration

### Google Ads Flow

1. User enters credentials in settings
2. Clicks "Connect Google Ads (OAuth)"
3. System saves credentials with `status: pending`
4. Redirects to `/auth/google`
5. OAuth route redirects to Google OAuth URL with:
   - `access_type=offline` (to get refresh token)
   - `prompt=consent` (force consent screen)
6. User authorizes at Google
7. Google redirects back with authorization code
8. System exchanges code for:
   - Access token (1 hour)
   - Refresh token (never expires)
9. Saves tokens to database with `status: active`
10. Redirects to settings with success message

### Meta Ads Flow

1. User enters App ID and Secret
2. Clicks "Connect Meta Ads (OAuth)"
3. System saves credentials with `status: pending`
4. Redirects to `/auth/meta`
5. OAuth route redirects to Facebook OAuth URL
6. User authorizes at Facebook
7. Facebook redirects back with authorization code
8. System:
   - Exchanges code for short-lived token (1-2 hours)
   - Converts to long-lived token (60 days)
   - Fetches user's ad accounts
   - Stores first account ID and token
9. Sets `status: active`
10. Redirects to settings with success message

### LinkedIn Ads Flow

1. User enters Client ID and Secret
2. Clicks "Connect LinkedIn Ads (OAuth)"
3. System saves credentials with `status: pending`
4. Redirects to `/auth/linkedin`
5. OAuth route redirects to LinkedIn OAuth URL
6. User authorizes at LinkedIn
7. LinkedIn redirects back with authorization code
8. System:
   - Exchanges code for access token (60 days)
   - Fetches user's ad accounts via API
   - Stores first account ID and token
9. Sets `status: active`
10. Redirects to settings with success message

---

## Data Syncing

After OAuth is complete and accounts are connected:

1. Go to **Settings** → **Connected Accounts**
2. Click **Sync Data** button
3. System will:
   - Fetch campaigns from last 30 days for each platform
   - Use proper authentication (refresh token for Google, access token for others)
   - Transform data to normalized format
   - Store campaigns and metrics in database
   - **NO DUMMY DATA** - only real campaign data is stored

---

## Troubleshooting

### Google Ads: "No refresh token received"

**Solution**: Revoke access at https://myaccount.google.com/permissions and try OAuth flow again. The `prompt=consent` parameter forces a new refresh token.

### Meta Ads: "No ad accounts found"

**Solution**: Ensure you're using a personal Facebook account that has access to a Business Manager with ad accounts. System accounts or accounts without ad account access will fail.

### LinkedIn Ads: "Failed to fetch ad accounts"

**Solution**: 
1. Verify your app has Marketing Developer Platform access approved
2. Ensure your LinkedIn account has access to active LinkedIn ad accounts
3. Check that all required scopes are approved: `r_ads`, `r_ads_reporting`, `rw_ads`

### "Token expired" errors

**Platform-Specific Solutions**:

**Google Ads** (Automatic):
- ✅ System automatically refreshes using refresh token
- Happens transparently every hour
- No user action needed
- Only fails if refresh token is revoked

**Meta Ads** (Manual - 60 days):
- ⚠️ Tokens expire after exactly 60 days
- Email warning sent 7 days before
- Must reconnect via OAuth
- System marks account as 'expired' automatically
- Dashboard shows "Reconnect Required" message

**LinkedIn Ads** (Manual - 60 days):
- ⚠️ Tokens expire after exactly 60 days (5,184,000 seconds)
- Email warning sent 7 days before
- Must reconnect via OAuth
- No programmatic refresh available
- Plan to reconnect bi-monthly

**Pro Tips**:
- Set calendar reminders for Meta/LinkedIn reconnection
- Monitor email notifications
- Check Settings → Connected Accounts regularly
- System automatically shows expiration dates

---

## API Version Information

The application uses the following API versions (as of October 2025):

- **Google Ads API**: v21
- **Meta Graph API**: v21.0
- **LinkedIn Marketing API**: 202505 (YYYYMM format)

---

## Security Best Practices

1. **Never share your credentials**:
   - Client secrets
   - Developer tokens
   - Access tokens
   - Refresh tokens

2. **Use HTTPS in production**: All OAuth redirect URIs must use HTTPS

3. **Rotate credentials periodically**: Regenerate client secrets every 6-12 months

4. **Monitor token expiration**: The system tracks expiration dates in the database

5. **Revoke access when not needed**: Remove connections you're not using

---

## Platform-Specific Quirks & Important Details

### Google Ads API

**Monetary Values in Micros**:
- All cost metrics returned in "micros" (1/1,000,000 of currency)
- Example: `cost_micros: 5000000` = $5.00
- System automatically converts by dividing by 1,000,000
- ⚠️ **Critical**: Don't forget to divide or you'll show inflated costs!

**Dual Authentication Requirement**:
- Developer Token (identifies your app)
- OAuth Token (identifies user)
- Both required for every API call
- Unique to Google Ads (Meta/LinkedIn only need OAuth)

**No Real-Time Webhooks**:
- Data updates every few hours
- Must poll for fresh data
- Use Change Status resource for updates
- Lead Form Extensions have webhook support

**Access Levels Matter**:
- Test Access: Test accounts only
- Basic Access: Production accounts, 15K ops/day
- Standard Access: Unlimited operations
- Upgrade as you scale

### Meta Ads API

**Token Conversion Process**:
1. Authorization code → Short-lived token (1-2 hours)
2. Short-lived → Long-lived token (60 days)
3. System does both steps automatically
4. You only see the long-lived token stored

**Account ID vs App ID**:
- ⚠️ **Don't confuse** App ID with Ad Account ID
- App ID: Identifies your Meta app
- Ad Account ID: Specific ad account (format: `act_123456789`)
- System automatically fetches and stores correct account ID

**Dynamic Rate Limiting**:
- Not a fixed quota
- Based on percentage usage across call count, CPU time, total time
- Each tracked separately in headers
- System auto-pauses at 80% to avoid throttling
- Limits reset over rolling window

**Error Subcodes Matter**:
- Error 190 has multiple subcodes (460, 463, 467)
- Each subcode means different thing
- 460 = password changed
- 463 = token expired
- 467 = user changed password
- System handles all automatically

### LinkedIn Ads API

**24-Hour Data Delay**:
- ⚠️ **Analytics data is delayed 24 hours**
- Today you see yesterday's data
- Plan reporting accordingly
- Not suitable for real-time dashboards

**URN Format Required**:
- LinkedIn uses URN identifiers
- Format: `urn:li:sponsoredAccount:123456`
- System handles conversion automatically
- Don't try to use plain IDs

**Strict Approval Process**:
- **Longest of all three platforms**
- Weeks to months timeline
- High rejection rate
- Must have legitimate business need
- Personal projects usually rejected

**Rest.li Protocol**:
- Uses LinkedIn's Rest.li 2.0.0 protocol
- Requires specific headers:
  - `X-Restli-Protocol-Version: 2.0.0`
  - `LinkedIn-Version: 202505` (YYYYMM format)
- System adds these automatically

**No Refresh Tokens**:
- 60-day tokens cannot be refreshed
- Must complete full OAuth flow again
- Plan for bi-monthly reconnection
- Set up email notifications

## Campaign Hierarchy Differences

Understanding different structures:

**Google Ads** (4 levels):
```
Account
  └─ Campaign
      └─ Ad Group
          └─ Ad
              └─ Creative Assets
```

**Meta Ads** (4 levels):
```
Ad Account
  └─ Campaign (Objective level)
      └─ Ad Set (Targeting & Budget)
          └─ Ad
              └─ Ad Creative
```

**LinkedIn Ads** (3 levels):
```
Ad Account
  └─ Campaign Group
      └─ Campaign
          └─ Creative
```

**Why this matters**:
- Data normalization happens at campaign level
- Different levels control different settings
- Budget can be at different levels per platform
- Reporting granularity varies

## Metrics That Matter

### Standard Metrics (All Platforms)

- **Impressions**: Times ad was shown
- **Clicks**: Times ad was clicked
- **Spend**: Total cost in local currency
- **Conversions**: Completed actions (purchase, signup, etc.)

### Calculated Metrics

- **CTR** (Click-Through Rate): (Clicks ÷ Impressions) × 100
- **CPC** (Cost Per Click): Spend ÷ Clicks
- **CPM** (Cost Per Mille): (Spend ÷ Impressions) × 1000
- **ROAS** (Return On Ad Spend): Revenue ÷ Spend
- **Conversion Rate**: (Conversions ÷ Clicks) × 100
- **CPA** (Cost Per Acquisition): Spend ÷ Conversions

### Platform-Specific Metrics

**Google Ads**:
- Search impression share
- Quality Score
- Ad Rank
- Auction insights

**Meta Ads**:
- Reach vs Impressions
- Frequency
- Relevance Score
- Social engagement (shares, comments, likes)

**LinkedIn Ads**:
- Member characteristics
- Industry targeting performance
- Company size insights
- Seniority distribution

## Support

If you encounter issues:

1. Check browser console for detailed error messages
2. Review logs in `logs/` directory (error.log, combined.log, api.log)
3. Verify all credentials are correct
4. Ensure OAuth redirect URIs match exactly (including http:// vs https://)
5. Confirm API approvals are complete for each platform
6. Check that ad accounts actually exist on each platform
7. Test health endpoint: `/api/health`
8. Check system status in Settings → Connected Accounts
9. Review email notifications if configured
10. Check rate limiter status in logs

