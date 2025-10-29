# 🎉 Complete Production Setup Guide

## Overview

This comprehensive guide will walk you through setting up the Marketing Analytics application with all advanced production features enabled.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Developer accounts on advertising platforms (Google Ads, Meta Ads, LinkedIn Ads)
- Redis instance (optional but recommended)
- Email service (optional for notifications)

---

## 🚀 Quick Start (5 Steps)

### Step 1: Clone and Install

```bash
cd ads-chatbot
npm install
```

### Step 2: Configure Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Generate encryption key
openssl rand -hex 32

# Edit .env.local and add all required values
```

**Minimum Required Variables**:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
ANTHROPIC_API_KEY=your_anthropic_key
ENCRYPTION_KEY=your_64_char_hex_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Apply Database Migrations

All migrations have been applied via Supabase MCP. Verify tables exist:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should see:
-- - ad_accounts (updated with encryption fields)
-- - api_logs (new)
-- - campaign_metrics
-- - campaigns
-- - conversion_events (new)
-- - conversations
-- - insights
-- - leads (new)
-- - messages
-- - profiles (updated with email preferences)
-- - social_engagements (new)
-- - tenants
```

### Step 4: Start Redis (Optional)

```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:alpine

# Verify
redis-cli ping
# Should return: PONG
```

### Step 5: Run the Application

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🔧 Detailed Feature Setup

### 1. Token Encryption Setup

**Required for production security**

```bash
# Generate encryption key (run once)
openssl rand -hex 32

# Add to .env.local
ENCRYPTION_KEY=<your_generated_key>
```

**Test encryption**:
```typescript
import { testEncryption } from '@/lib/security/encryption'
console.log('Encryption working:', testEncryption())
```

### 2. Redis Caching Setup

**Recommended for performance**

**Option A: Local Docker**:
```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

**Option B: Upstash (Cloud)**:
1. Sign up at https://upstash.com/
2. Create Redis database
3. Copy connection URL
4. Add to .env.local: `REDIS_URL=your_upstash_url`

**Option C: Redis Cloud**:
1. Sign up at https://redis.com/
2. Create free database
3. Get connection URL
4. Add to .env.local

**Test Redis**:
```bash
redis-cli ping
# or
curl http://localhost:3000/api/health
# Check services.redis = true
```

### 3. Email Notifications Setup

**Optional but useful**

**For Gmail**:
1. Enable 2-Factor Authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Create new App Password for "Mail"
4. Add to .env.local:
   ```bash
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password
   EMAIL_FROM=noreply@yourdomain.com
   ```

**For SendGrid**:
```bash
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
```

**Test email**:
```typescript
import { getEmailService } from '@/lib/email/email-service'
const service = getEmailService()
await service.sendEmail({
  to: 'test@example.com',
  subject: 'Test',
  text: 'Testing email service'
})
```

### 4. Meta Webhooks Setup

**For real-time lead ads and engagement tracking**

**Local Development (using ngrok)**:
```bash
# Install ngrok
npm install -g ngrok

# Start your app
npm run dev

# In another terminal, expose locally
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

**Configure in Meta App**:
1. Go to https://developers.facebook.com/apps
2. Select your app → Products → Webhooks
3. Click "Edit Subscription" for Page webhooks
4. Callback URL: `https://yourdomain.com/api/webhooks/meta`
5. Verify Token: (same as `META_WEBHOOK_VERIFY_TOKEN` in .env)
6. Subscribe to fields: `leadgen`, `feed`, `comments`
7. Save

**Add to .env.local**:
```bash
META_WEBHOOK_VERIFY_TOKEN=your_unique_token_123
META_APP_SECRET=your_meta_app_secret
```

**Test webhook**:
1. Use Meta's webhook testing tool in developer dashboard
2. Check logs: `tail -f logs/combined.log`
3. Verify leads table receives data

### 5. Conversions API Setup

**For server-side conversion tracking**

**Get your Pixel ID**:
1. Go to Meta Events Manager
2. Select your Pixel
3. Copy Pixel ID

**Usage in your app**:
```typescript
import { createPurchaseEvent, sendConversionEvent } from '@/lib/meta-ads/conversions-api'

// Track a purchase
const event = createPurchaseEvent(
  {
    email: user.email,
    phone: user.phone,
    clientIpAddress: request.ip,
    clientUserAgent: request.headers.get('user-agent')
  },
  orderTotal,
  'USD',
  orderId
)

await sendConversionEvent(
  process.env.META_PIXEL_ID,
  accessToken,
  appSecret,
  event
)
```

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# Error logs only
tail -f logs/error.log

# All logs
tail -f logs/combined.log

# API-specific logs
tail -f logs/api.log
```

### Check System Health

```bash
curl http://localhost:3000/api/health
```

**Expected response**:
```json
{
  "status": "healthy",
  "services": {
    "encryption": true,
    "redis": true,
    "rateLimiter": true
  },
  "uptime": 12345,
  "timestamp": "2025-10-28T..."
}
```

### Manual Token Check

Trigger token expiration monitoring manually:

```bash
curl -X POST http://localhost:3000/api/cron/check-tokens \
  -H "Authorization: Bearer your_cron_secret"
```

### View Rate Limiter Status

In your code:
```typescript
import { getRateLimiter } from '@/lib/rate-limiting/limiter'
const limiter = getRateLimiter()
console.log(limiter.getAllStatus())
```

### Clear Cache

```typescript
import { invalidateUserCache } from '@/lib/cache/redis-client'
await invalidateUserCache(userId)
```

---

## 🗄️ Database Verification

### Check Schema Updates

```sql
-- Verify ad_accounts encryption fields
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'ad_accounts' 
  AND column_name LIKE '%encrypted%';

-- Should return:
-- access_token_encrypted
-- access_token_iv
-- access_token_auth_tag
-- refresh_token_encrypted
-- refresh_token_iv
-- refresh_token_auth_tag

-- Verify new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('leads', 'social_engagements', 'conversion_events', 'api_logs')
  AND table_schema = 'public';

-- Should return all 4 tables
```

### Sample Queries

```sql
-- Check connected accounts
SELECT platform, account_name, status, token_expires_at
FROM ad_accounts
WHERE tenant_id = 'your_tenant_id'
ORDER BY platform;

-- View recent API logs
SELECT platform, operation, success, duration_ms, created_at
FROM api_logs
ORDER BY created_at DESC
LIMIT 20;

-- Check for new leads
SELECT email, full_name, status, created_at
FROM leads
WHERE tenant_id = 'your_tenant_id'
ORDER BY created_at DESC
LIMIT 10;

-- View social engagements
SELECT platform, engagement_type, message, sentiment, status
FROM social_engagements
WHERE tenant_id = 'your_tenant_id'
  AND status = 'unread'
ORDER BY created_at DESC;
```

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] App starts without errors
- [ ] Health check returns healthy status
- [ ] User can sign up and login
- [ ] Onboarding wizard works

### OAuth Flows
- [ ] Google Ads OAuth completes successfully
- [ ] Meta Ads OAuth completes successfully
- [ ] LinkedIn Ads OAuth completes successfully
- [ ] Refresh tokens stored in database
- [ ] Success messages display in Settings

### Data Syncing
- [ ] Click "Sync Data" in Settings
- [ ] Real campaigns appear (no dummy data)
- [ ] Metrics populated correctly
- [ ] Last synced timestamp updates

### Advanced Features
- [ ] Encryption working (test endpoint)
- [ ] Redis caching (check health endpoint)
- [ ] Logs being written to logs/ directory
- [ ] Rate limiting active (check console logs)
- [ ] Token expiration monitoring running

### Chatbot
- [ ] Chat interface loads
- [ ] Chatbot responds to queries
- [ ] Campaign data reflected in responses
- [ ] Conversations saved to database

### Webhooks (if configured)
- [ ] Meta webhook verification succeeds
- [ ] Lead ads trigger webhook
- [ ] Leads saved to database
- [ ] Comments tracked in social_engagements

---

## 🚨 Troubleshooting

### "ENCRYPTION_KEY not set" error
```bash
# Generate new key
openssl rand -hex 32

# Add to .env.local
ENCRYPTION_KEY=<generated_key>

# Restart app
```

### Redis connection failed
```bash
# Check if Redis is running
redis-cli ping

# Start Redis with Docker
docker run -d -p 6379:6379 redis:alpine

# Or disable caching (app will work without Redis)
# Remove REDIS_URL from .env.local
```

### Email not sending
```bash
# For Gmail, use App-Specific Password, not regular password
# Go to: https://myaccount.google.com/apppasswords

# Check email service logs
# The app will work without email configured
```

### Webhook verification failed
```bash
# Ensure META_WEBHOOK_VERIFY_TOKEN matches exactly
# Check META_APP_SECRET is correct
# Verify callback URL uses HTTPS in production
```

### Rate limit errors
```bash
# Check platform quotas in developer consoles
# Monitor logs/api.log for rate limit warnings
# Increase retry delays if needed
```

### Linter errors
```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

---

## 📦 Production Deployment

### Pre-Deployment Checklist

**Environment**:
- [ ] All required env variables set
- [ ] ENCRYPTION_KEY is secure (32 bytes)
- [ ] NEXT_PUBLIC_APP_URL set to production domain
- [ ] Redis configured (Upstash or similar)
- [ ] Email service configured

**OAuth Configuration**:
- [ ] Google Cloud Console: Add production redirect URI
- [ ] Meta App: Add production redirect URI
- [ ] LinkedIn App: Add production redirect URI

**Database**:
- [ ] All migrations applied
- [ ] Row Level Security enabled on all tables
- [ ] Indexes created for performance
- [ ] Backup strategy in place

**Security**:
- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] Database encryption at rest enabled
- [ ] API keys rotated regularly
- [ ] CORS configured properly

**Monitoring**:
- [ ] Log rotation configured
- [ ] Error tracking (Sentry, etc.)
- [ ] Uptime monitoring
- [ ] Performance monitoring

### Deployment Commands

**Vercel**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

**Docker**:
```bash
# Build
docker build -t marketing-analytics .

# Run
docker run -p 3000:3000 --env-file .env.local marketing-analytics
```

**PM2 (Node.js)**:
```bash
# Install PM2
npm install -g pm2

# Build
npm run build

# Start
pm2 start npm --name "marketing-analytics" -- start

# Monitor
pm2 logs marketing-analytics
```

---

## 🎯 Post-Deployment

### Verify Services

1. **Health Check**:
   ```bash
   curl https://yourdomain.com/api/health
   ```

2. **Test OAuth**:
   - Connect one ad platform
   - Verify tokens saved
   - Check encryption worked

3. **Test Data Sync**:
   - Click "Sync Data"
   - Verify real campaigns appear
   - Check logs for errors

4. **Test Chatbot**:
   - Ask question about campaigns
   - Verify contextual responses
   - Check conversation saved

5. **Monitor Logs**:
   ```bash
   # Check for errors
   grep "error" logs/combined.log | tail -20
   
   # Check API calls
   grep "API Success" logs/api.log | tail -20
   ```

### Set Up Monitoring

1. **Cron Jobs**:
   - Token expiration: Runs daily at 9 AM
   - Expired token cleanup: Runs every hour
   - No manual setup needed

2. **Email Notifications**:
   - Users receive expiration warnings 7 days before
   - Sync errors trigger notifications
   - Welcome emails on signup

3. **Webhook Monitoring**:
   - Check Meta webhook logs in developer dashboard
   - Monitor leads table for new entries
   - Track engagement in social_engagements table

---

## 📊 Feature Matrix

| Feature | Status | Setup Required | Optional |
|---------|--------|----------------|----------|
| OAuth Authentication | ✅ | Yes | No |
| Token Encryption | ✅ | Yes | No |
| Real Data Loading | ✅ | Yes | No |
| Winston Logging | ✅ | No | No |
| Redis Caching | ✅ | Yes | Yes |
| Rate Limiting | ✅ | No | No |
| Email Notifications | ✅ | Yes | Yes |
| Token Monitoring | ✅ | No | No |
| Meta Webhooks | ✅ | Yes | Yes |
| Conversions API | ✅ | Yes | Yes |
| App Secret Proof | ✅ | No | No |
| Cross-Platform Analytics | ✅ | No | No |
| Chatbot Integration | ✅ | Yes | No |

---

## 🎁 What You Get

### Security Features
✅ AES-256-GCM token encryption  
✅ CSRF protection in OAuth flows  
✅ App Secret Proof for Meta API  
✅ Secure cookie handling  
✅ Row Level Security in database  

### Performance Features
✅ Redis caching with configurable TTL  
✅ Platform-specific rate limiting  
✅ Concurrent request management  
✅ Automatic retry with exponential backoff  
✅ Query optimization with indexes  

### Monitoring Features
✅ Structured Winston logging  
✅ API call tracking  
✅ Performance metrics (duration_ms)  
✅ Error tracking with stack traces  
✅ Rate limit monitoring  

### Automation Features
✅ Token expiration monitoring (daily)  
✅ Expired token cleanup (hourly)  
✅ Email notifications  
✅ Automatic token refresh (Google)  
✅ Webhook event processing  

### Integration Features
✅ Real-time Meta webhooks  
✅ Server-side conversion tracking  
✅ Cross-platform data normalization  
✅ Unified metrics aggregation  
✅ AI chatbot with campaign context  

---

## 📚 API Endpoints

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System health check |
| `/auth/google` | GET | Google OAuth flow |
| `/auth/meta` | GET | Meta OAuth flow |
| `/auth/linkedin` | GET | LinkedIn OAuth flow |

### Authenticated Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sync-data` | POST | Sync data from ad platforms |
| `/api/chat` | POST | Chatbot conversation |
| `/api/analytics/aggregated` | GET | Cross-platform analytics |
| `/api/webhooks/meta` | GET/POST | Meta webhook handler |
| `/api/cron/check-tokens` | POST | Manual token check |
| `/api/init` | GET/POST | App initialization |

---

## 🔐 Security Best Practices

1. **Encryption Key**:
   - Generate securely: `openssl rand -hex 32`
   - Store in secure vault (not in code)
   - Rotate every 6-12 months
   - Keep backup in secure location

2. **OAuth Credentials**:
   - Never commit to version control
   - Use different credentials for dev/prod
   - Rotate client secrets periodically
   - Monitor for unauthorized access

3. **Database**:
   - Enable RLS on all tables
   - Use encrypted connections
   - Regular backups
   - Monitor for anomalies

4. **API Keys**:
   - Store in environment variables
   - Use different keys per environment
   - Monitor usage quotas
   - Implement key rotation

5. **Webhooks**:
   - Always verify signatures
   - Use HTTPS only
   - Validate payload structure
   - Rate limit webhook endpoints

---

## 📈 Performance Optimization

### Caching Strategy

- **Campaigns**: 1 hour TTL
- **Accounts**: 24 hours TTL
- **Metrics**: 5 minutes TTL
- **User Data**: 30 minutes TTL

### Rate Limiting

- **Google Ads**: 5 concurrent, 5 QPS
- **Meta Ads**: 10 concurrent, 10 QPS
- **LinkedIn Ads**: 5 concurrent, 3 QPS

### Database Optimization

- Indexes on frequently queried columns
- Proper foreign key relationships
- Automatic cleanup of old logs (30 days)
- Connection pooling

---

## 🎉 Success Criteria

Your application is fully set up when:

✅ Health endpoint returns all services healthy  
✅ OAuth flows complete for all 3 platforms  
✅ Real campaign data syncs successfully  
✅ No dummy/sample data appears  
✅ Chatbot provides contextual answers  
✅ Logs being written to logs/ directory  
✅ Redis caching working (if configured)  
✅ Email notifications sent (if configured)  
✅ Webhooks receiving events (if configured)  

---

## 🆘 Support

### Documentation Files

- `QUICK_START_FOR_USER.md` - Simple user guide
- `OAUTH_SETUP_GUIDE.md` - OAuth setup details
- `ADVANCED_FEATURES_GUIDE.md` - Advanced features
- `DATABASE_SCHEMA_UPDATE.md` - Database schema
- `API_INTEGRATION_CHANGES.md` - Technical changes
- `IMPLEMENTATION_COMPLETE.md` - Feature summary
- `COMPLETE_SETUP_GUIDE.md` - This file

### Common Issues

1. **App won't start**: Check Node.js version (18+)
2. **OAuth fails**: Verify redirect URIs match exactly
3. **No data syncs**: Check API credentials and approvals
4. **Encryption errors**: Verify ENCRYPTION_KEY is 64 characters
5. **Redis errors**: Check Redis is running or disable caching

### Getting Help

- Check logs in `logs/` directory
- Review error messages in browser console
- Verify environment variables
- Check Supabase logs
- Review platform API documentation

---

## 🚀 You're Ready!

Your Marketing Analytics application is now production-ready with:

- ✅ Secure OAuth authentication
- ✅ Token encryption
- ✅ High-performance caching
- ✅ Comprehensive logging
- ✅ Rate limiting
- ✅ Email notifications
- ✅ Real-time webhooks
- ✅ Conversion tracking
- ✅ Cross-platform analytics
- ✅ AI-powered chatbot

**Start connecting your advertising accounts and let the insights flow!** 🎊

