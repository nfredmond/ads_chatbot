# Advanced Production Features Guide

## 🎉 Overview

This document describes all the advanced production features that have been implemented in your Marketing Analytics application.

---

## ✅ Implemented Features

### 1. **Token Encryption (AES-256-GCM)** 🔐

**Location**: `lib/security/encryption.ts`

**What it does**:
- Encrypts all access tokens and refresh tokens before storing in database
- Uses AES-256-GCM encryption (industry standard)
- Generates unique IV (initialization vector) and auth tag for each encrypted value
- Prevents token theft even if database is compromised

**Usage**:
```typescript
import { encryptToken, decryptToken } from '@/lib/security/encryption'

// Encrypt before saving
const encrypted = encryptToken('your-access-token')
// Save encrypted.encrypted, encrypted.iv, encrypted.authTag to database

// Decrypt when retrieving
const token = decryptToken({
  encrypted: row.access_token_encrypted,
  iv: row.access_token_iv,
  authTag: row.access_token_auth_tag
})
```

**Setup**:
1. Generate encryption key: `openssl rand -hex 32`
2. Add to `.env.local`: `ENCRYPTION_KEY=your_64_char_hex_here`

---

### 2. **Redis Caching Layer** ⚡

**Location**: `lib/cache/redis-client.ts`

**What it does**:
- Caches API responses to reduce API calls
- Configurable TTL (Time To Live) for different data types
- Automatic cache invalidation
- Pattern-based cache deletion

**Cache TTL Settings**:
- Campaigns: 1 hour
- Accounts: 24 hours
- Metrics: 5 minutes
- User Data: 30 minutes
- Ad Insights: 10 minutes

**Usage**:
```typescript
import { getCached, setCached, CACHE_TTL, generateCacheKey } from '@/lib/cache/redis-client'

// Generate cache key
const key = generateCacheKey('google_ads', 'campaigns', userId)

// Try to get from cache
const cached = await getCached(key)
if (cached) return cached

// Fetch from API and cache
const data = await fetchFromAPI()
await setCached(key, data, CACHE_TTL.CAMPAIGNS)
```

**Setup**:
1. Install Redis: `docker run -d -p 6379:6379 redis:alpine`
2. Add to `.env.local`: `REDIS_URL=redis://localhost:6379`

---

### 3. **Winston Structured Logging** 📝

**Location**: `lib/logging/logger.ts`

**What it does**:
- Comprehensive logging for all operations
- Separate log files for errors, API calls, and general logs
- Structured JSON format for easy parsing
- Color-coded console output
- Automatic log rotation

**Log Files**:
- `logs/error.log` - Error-level logs
- `logs/combined.log` - All logs
- `logs/api.log` - API-specific logs

**Usage**:
```typescript
import logger, { 
  PlatformAPIError,
  logAPISuccess,
  logOAuthEvent,
  logSyncOperation
} from '@/lib/logging/logger'

// General logging
logger.info('User logged in', { userId, timestamp })
logger.error('Failed to fetch data', { error, context })

// Platform API errors
throw new PlatformAPIError('google_ads', 'fetchCampaigns', error, 429, 'RATE_LIMIT')

// OAuth events
logOAuthEvent('meta_ads', 'success', userId)

// Data sync
logSyncOperation('linkedin_ads', 'completed', {
  userId,
  campaignsCount: 10,
  duration: 2500
})
```

---

### 4. **Bottleneck Rate Limiting** 🚦

**Location**: `lib/rate-limiting/limiter.ts`

**What it does**:
- Platform-specific rate limits matching API quotas
- Automatic retry with exponential backoff
- Queue management
- Real-time status monitoring

**Rate Limits**:
- **Google Ads**: 5 concurrent, 5 QPS, 15,000 ops/day
- **Meta Ads**: 10 concurrent, 10 QPS
- **LinkedIn Ads**: 5 concurrent, ~3 QPS

**Usage**:
```typescript
import { withRateLimit } from '@/lib/rate-limiting/limiter'

// Wrap API calls with rate limiting
const campaigns = await withRateLimit('google_ads', async () => {
  return await fetchGoogleAdsCampaigns(config)
})

// Check Meta rate limit headers
const rateLimiter = getRateLimiter()
rateLimiter.checkMetaRateLimit(response.headers)
```

---

### 5. **Token Expiration Monitoring** ⏰

**Location**: `lib/cron/token-monitor.ts`

**What it does**:
- Daily checks for expiring tokens (7-day warning)
- Hourly checks for expired tokens
- Automatic status updates
- Email notifications to users

**Schedule**:
- Token expiration check: Daily at 9 AM
- Expired token deactivation: Every hour

**Setup**:
Cron jobs initialize automatically on app startup. No additional setup needed.

---

### 6. **Email Notifications** 📧

**Location**: `lib/email/email-service.ts`

**What it does**:
- Token expiration warnings
- Sync error notifications
- Welcome emails
- Beautiful HTML email templates

**Email Types**:
1. **Token Expiration Warning** - 7 days before expiration
2. **Sync Error Notification** - When data sync fails
3. **Welcome Email** - For new users

**Setup**:
Add to `.env.local`:
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@yourdomain.com
```

For Gmail:
1. Enable 2-Factor Authentication
2. Generate App-Specific Password
3. Use that password in EMAIL_PASSWORD

---

### 7. **Meta Webhooks** 🔔

**Location**: `app/api/webhooks/meta/route.ts`

**What it does**:
- Receives real-time notifications from Meta
- Handles lead ads submissions
- Tracks comments and engagement
- Automatic signature verification

**Webhook Types**:
- Lead Gen (Lead Ads)
- Comments
- Post Engagement

**Setup**:
1. Add to `.env.local`:
   ```bash
   META_WEBHOOK_VERIFY_TOKEN=your_unique_token
   META_APP_SECRET=your_meta_app_secret
   ```

2. In Meta App Dashboard:
   - Go to Products → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/meta`
   - Enter verify token
   - Subscribe to: `leadgen`, `feed`, `comments`

---

### 8. **Meta Conversions API** 📊

**Location**: `lib/meta-ads/conversions-api.ts`

**What it does**:
- Server-side conversion tracking
- Better attribution than pixel alone
- iOS 14+ compatible
- Automatic PII hashing

**Event Types**:
- Purchase
- Lead
- AddToCart
- ViewContent
- Custom events

**Usage**:
```typescript
import { 
  sendConversionEvent,
  createPurchaseEvent,
  createLeadEvent
} from '@/lib/meta-ads/conversions-api'

// Track a purchase
const event = createPurchaseEvent(
  {
    email: 'user@example.com',
    phone: '1234567890',
    clientIpAddress: req.ip,
    clientUserAgent: req.headers['user-agent']
  },
  99.99,
  'USD',
  'order-12345'
)

await sendConversionEvent(pixelId, accessToken, appSecret, event)
```

---

### 9. **App Secret Proof (Meta)** 🔒

**Location**: `lib/meta-ads/app-secret-proof.ts`

**What it does**:
- Adds extra security layer to Meta API calls
- Proves you have the app secret
- Prevents unauthorized API usage

**Usage**:
```typescript
import { generateAppsecretProof, addAppsecretProofToParams } from '@/lib/meta-ads/app-secret-proof'

// Add to API request
const params = new URLSearchParams({ access_token: token })
addAppsecretProofToParams(params, token, appSecret)

// Or generate manually
const proof = generateAppsecretProof(token, appSecret)
```

---

### 10. **Cross-Platform Metrics Aggregator** 📈

**Location**: `lib/analytics/cross-platform-aggregator.ts`

**What it does**:
- Fetches data from all platforms in parallel
- Normalizes metrics across platforms
- Calculates derived metrics (CTR, CPC, CPM, ROAS)
- Automatic caching
- Platform-specific status/cost handling

**Normalized Metrics**:
- Impressions
- Clicks
- Spend (always in dollars)
- Conversions
- Revenue
- CTR (%)
- CPC ($)
- CPM ($)
- ROAS (ratio)
- Conversion Rate (%)
- Cost Per Conversion ($)

**Usage**:
```typescript
import { getMetricsAggregator } from '@/lib/analytics/cross-platform-aggregator'

const aggregator = getMetricsAggregator()
const metrics = await aggregator.fetchAllPlatformMetrics(userId, {
  start: '2025-01-01',
  end: '2025-01-31'
})

// Aggregate by platform
const byPlatform = aggregator.aggregateByPlatform(metrics)

// Get total across all platforms
const total = aggregator.getTotalMetrics(metrics)
```

---

## 🗄️ Database Schema Updates

**File**: `DATABASE_SCHEMA_UPDATE.md`

New tables created:
1. **leads** - Store leads from Meta Lead Ads
2. **social_engagements** - Track comments, likes, shares
3. **conversion_events** - Track Conversions API events
4. **api_logs** - API call logging for monitoring

Updated tables:
- **ad_accounts** - Added encryption fields for tokens
- **profiles** - Added email notification preferences

**Migration**: Run the SQL in `DATABASE_SCHEMA_UPDATE.md`

---

## 🚀 Application Initialization

**File**: `lib/init/app-initialization.ts`

**What it does**:
- Initializes all services on app startup
- Tests encryption
- Connects to Redis
- Sets up rate limiters
- Starts cron jobs
- Graceful shutdown handling

**Usage in Next.js**:

Add to your main layout or API route:
```typescript
import { initializeApplication } from '@/lib/init/app-initialization'

// In app startup or middleware
await initializeApplication()
```

---

## 📋 Environment Variables Checklist

Add all of these to `.env.local`:

```bash
# Existing
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# New - Encryption
ENCRYPTION_KEY=  # Generate with: openssl rand -hex 32

# New - Redis
REDIS_URL=redis://localhost:6379

# New - Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@yourdomain.com

# New - Meta Webhooks
META_WEBHOOK_VERIFY_TOKEN=your_unique_verify_token
META_APP_SECRET=your_meta_app_secret

# New - App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 🧪 Testing

### Test Encryption
```bash
# In Node.js console
const { testEncryption, generateEncryptionKey } = require('./lib/security/encryption')
console.log('Encryption test:', testEncryption())
console.log('New key:', generateEncryptionKey())
```

### Test Redis
```bash
redis-cli ping
# Should return: PONG
```

### Test Email
```typescript
import { getEmailService } from '@/lib/email/email-service'

const emailService = getEmailService()
await emailService.sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'This is a test',
})
```

### Test Webhooks
1. Use ngrok for local testing:
   ```bash
   ngrok http 3000
   ```

2. Configure webhook URL in Meta App Dashboard
3. Use Meta's webhook testing tool

---

## 📊 Monitoring & Observability

### Check Logs
```bash
# View error logs
tail -f logs/error.log

# View all logs
tail -f logs/combined.log

# View API logs
tail -f logs/api.log
```

### Check Rate Limiter Status
```typescript
import { getRateLimiter } from '@/lib/rate-limiting/limiter'

const limiter = getRateLimiter()
const status = limiter.getAllStatus()
console.log(status)
```

### Check Cache Status
```typescript
import { getRedisClient, getTTL } from '@/lib/cache/redis-client'

const redis = getRedisClient()
const keys = await redis.keys('*')
console.log('Cached keys:', keys)
```

---

## 🎯 Best Practices

1. **Always use rate limiting** for API calls
2. **Cache aggressively** to reduce API costs
3. **Monitor logs** for errors and performance issues
4. **Encrypt sensitive data** before storing
5. **Test webhooks thoroughly** before production
6. **Set up email notifications** for critical events
7. **Rotate encryption keys** every 6-12 months
8. **Monitor token expiration** proactively
9. **Use Conversions API** alongside Meta Pixel
10. **Implement health checks** for monitoring

---

## 🚨 Troubleshooting

### Encryption errors
- Check `ENCRYPTION_KEY` is 64 hex characters
- Verify key is set in environment
- Test with `testEncryption()`

### Redis connection errors
- Verify Redis is running: `redis-cli ping`
- Check `REDIS_URL` in environment
- Check firewall/security groups

### Email not sending
- Verify email credentials
- Check spam folder
- Enable "less secure apps" or use app-specific password
- Check email service logs

### Rate limit errors
- Check platform-specific quotas
- Monitor rate limiter status
- Implement exponential backoff
- Consider upgrading API access tier

### Webhook verification failed
- Check `META_WEBHOOK_VERIFY_TOKEN` matches
- Verify signature validation logic
- Check `META_APP_SECRET` is correct
- Use Meta's webhook testing tool

---

## 📚 Additional Resources

- [Winston Logging Documentation](https://github.com/winstonjs/winston)
- [Bottleneck Rate Limiting](https://github.com/SGrondin/bottleneck)
- [ioredis Documentation](https://github.com/redis/ioredis)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Node-cron Documentation](https://github.com/node-cron/node-cron)
- [Meta Conversions API Docs](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Meta Webhooks Docs](https://developers.facebook.com/docs/graph-api/webhooks)

---

## 🎉 Summary

You now have a **production-ready** marketing analytics application with:

✅ Secure token encryption  
✅ High-performance caching  
✅ Comprehensive logging  
✅ Platform-specific rate limiting  
✅ Automated token monitoring  
✅ Email notifications  
✅ Real-time webhooks  
✅ Server-side conversion tracking  
✅ Cross-platform analytics  
✅ Graceful error handling  

**All features follow industry best practices and are ready for production deployment!**

