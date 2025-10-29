# Database Schema Updates for Production Features

## Overview

This document describes the database schema updates needed to support token encryption, webhooks, leads tracking, and social engagement monitoring.

---

## 1. Update `ad_accounts` Table

Add encryption fields for tokens:

```sql
-- Add encryption fields for access_token
ALTER TABLE ad_accounts
  ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS access_token_iv TEXT,
  ADD COLUMN IF NOT EXISTS access_token_auth_tag TEXT;

-- Add encryption fields for refresh_token (Google Ads only)
ALTER TABLE ad_accounts
  ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token_iv TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token_auth_tag TEXT;

-- Add token_expires_at if not exists
ALTER TABLE ad_accounts
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP;

-- Update status column to include 'expired' status
-- Existing statuses: 'pending', 'active', 'archived'
-- No ALTER needed, just use 'expired' as a valid value

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ad_accounts_expires_at 
  ON ad_accounts(token_expires_at) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_ad_accounts_platform_tenant 
  ON ad_accounts(platform, tenant_id);
```

**Migration Steps**:

1. Run the ALTER TABLE statements above
2. Migrate existing tokens:
   ```sql
   -- Note: You'll need to encrypt existing tokens using the encryption utility
   -- This should be done via a migration script, not directly in SQL
   -- See: lib/security/encryption.ts
   ```

---

## 2. Create `leads` Table

Store leads from Meta Lead Ads:

```sql
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'meta_ads',
  leadgen_id TEXT NOT NULL,
  page_id TEXT,
  form_id TEXT,
  ad_id TEXT,
  campaign_id TEXT,
  
  -- Lead data
  email TEXT,
  phone TEXT,
  full_name TEXT,
  company TEXT,
  
  -- Custom fields (store additional form fields as JSON)
  custom_fields JSONB,
  
  -- Metadata
  raw_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Status tracking
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'rejected'
  assigned_to UUID REFERENCES profiles(id),
  
  -- Constraints
  UNIQUE(leadgen_id, tenant_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_tenant ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_platform ON leads(platform);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email) WHERE email IS NOT NULL;

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view leads from their tenant"
  ON leads FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert leads to their tenant"
  ON leads FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );
```

---

## 3. Create `social_engagements` Table

Store comments, likes, and other social interactions:

```sql
CREATE TABLE IF NOT EXISTS social_engagements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'meta_ads', 'linkedin_ads', etc.
  engagement_type TEXT NOT NULL, -- 'comment', 'like', 'share', 'mention', etc.
  
  -- Post/Ad information
  post_id TEXT,
  ad_id TEXT,
  campaign_id TEXT,
  
  -- Engagement details
  comment_id TEXT,
  message TEXT,
  created_time TIMESTAMP,
  
  -- User information
  from_user JSONB, -- {id, name, etc.}
  
  -- Sentiment analysis (can be added by AI)
  sentiment TEXT, -- 'positive', 'negative', 'neutral'
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  
  -- Status
  status TEXT DEFAULT 'unread', -- 'unread', 'read', 'responded', 'hidden'
  responded_at TIMESTAMP,
  response_text TEXT,
  
  -- Metadata
  raw_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(platform, comment_id, tenant_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_engagements_tenant ON social_engagements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_engagements_platform ON social_engagements(platform);
CREATE INDEX IF NOT EXISTS idx_engagements_type ON social_engagements(engagement_type);
CREATE INDEX IF NOT EXISTS idx_engagements_status ON social_engagements(status);
CREATE INDEX IF NOT EXISTS idx_engagements_created_at ON social_engagements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagements_sentiment ON social_engagements(sentiment) WHERE sentiment IS NOT NULL;

-- Enable RLS
ALTER TABLE social_engagements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view engagements from their tenant"
  ON social_engagements FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );
```

---

## 4. Create `conversion_events` Table

Store Meta Conversions API events for tracking:

```sql
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'meta_ads',
  pixel_id TEXT NOT NULL,
  
  -- Event details
  event_id TEXT NOT NULL, -- Deduplication ID
  event_name TEXT NOT NULL, -- 'Purchase', 'Lead', 'AddToCart', etc.
  event_time TIMESTAMP NOT NULL,
  action_source TEXT NOT NULL,
  
  -- Event data (hashed for privacy)
  user_data_hash TEXT, -- Hash of user identifying information
  
  -- Custom data
  currency TEXT,
  value DECIMAL(10,2),
  content_name TEXT,
  order_id TEXT,
  
  -- Metadata
  custom_data JSONB,
  sent_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'sent', -- 'sent', 'confirmed', 'failed'
  error_message TEXT,
  
  -- Matching (updated when Meta confirms match)
  matched_at TIMESTAMP,
  match_quality DECIMAL(3,2), -- 0.0 to 1.0
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(event_id, pixel_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversion_events_tenant ON conversion_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_pixel ON conversion_events(pixel_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_name ON conversion_events(event_name);
CREATE INDEX IF NOT EXISTS idx_conversion_events_time ON conversion_events(event_time DESC);
CREATE INDEX IF NOT EXISTS idx_conversion_events_status ON conversion_events(status);

-- Enable RLS
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view conversion events from their tenant"
  ON conversion_events FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );
```

---

## 5. Create `api_logs` Table

Store API call logs for monitoring and debugging:

```sql
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'google_ads', 'meta_ads', 'linkedin_ads'
  operation TEXT NOT NULL, -- 'fetch_campaigns', 'sync_data', etc.
  
  -- Request details
  endpoint TEXT,
  method TEXT,
  
  -- Response details
  status_code INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  error_code TEXT,
  
  -- Performance metrics
  duration_ms INTEGER, -- Response time in milliseconds
  rate_limited BOOLEAN DEFAULT FALSE,
  retries INTEGER DEFAULT 0,
  
  -- Metadata
  request_data JSONB,
  response_data JSONB,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_logs_tenant ON api_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_platform ON api_logs(platform);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_success ON api_logs(success);
CREATE INDEX IF NOT EXISTS idx_api_logs_rate_limited ON api_logs(rate_limited) WHERE rate_limited = TRUE;

-- Auto-delete old logs (keep 30 days)
-- This should be run as a cron job or scheduled task
-- Example: DELETE FROM api_logs WHERE created_at < NOW() - INTERVAL '30 days';

-- Enable RLS
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view api logs from their tenant"
  ON api_logs FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );
```

---

## 6. Update `profiles` Table

Add fields for email notifications:

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_token_expiration BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_sync_errors BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_new_leads BOOLEAN DEFAULT FALSE;
```

---

## Environment Variables Required

Add these to your `.env.local`:

```bash
# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your_64_character_hex_string_here

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Email Service
EMAIL_SERVICE=gmail  # or 'sendgrid', 'mailgun', etc.
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@yourdomain.com

# Meta Webhooks
META_WEBHOOK_VERIFY_TOKEN=your_unique_verify_token_here
META_APP_SECRET=your_meta_app_secret

# App URL (for email links)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Migration Script

Run this complete migration:

```sql
BEGIN;

-- 1. Update ad_accounts table
ALTER TABLE ad_accounts
  ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS access_token_iv TEXT,
  ADD COLUMN IF NOT EXISTS access_token_auth_tag TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token_iv TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token_auth_tag TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_ad_accounts_expires_at ON ad_accounts(token_expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_ad_accounts_platform_tenant ON ad_accounts(platform, tenant_id);

-- 2. Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'meta_ads',
  leadgen_id TEXT NOT NULL,
  page_id TEXT,
  form_id TEXT,
  ad_id TEXT,
  campaign_id TEXT,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  company TEXT,
  custom_fields JSONB,
  raw_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'new',
  assigned_to UUID REFERENCES profiles(id),
  UNIQUE(leadgen_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_leads_tenant ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_platform ON leads(platform);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 3. Create social_engagements table
CREATE TABLE IF NOT EXISTS social_engagements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  engagement_type TEXT NOT NULL,
  post_id TEXT,
  ad_id TEXT,
  campaign_id TEXT,
  comment_id TEXT,
  message TEXT,
  created_time TIMESTAMP,
  from_user JSONB,
  sentiment TEXT,
  sentiment_score DECIMAL(3,2),
  status TEXT DEFAULT 'unread',
  responded_at TIMESTAMP,
  response_text TEXT,
  raw_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform, comment_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_engagements_tenant ON social_engagements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_engagements_platform ON social_engagements(platform);
CREATE INDEX IF NOT EXISTS idx_engagements_type ON social_engagements(engagement_type);
CREATE INDEX IF NOT EXISTS idx_engagements_status ON social_engagements(status);
CREATE INDEX IF NOT EXISTS idx_engagements_created_at ON social_engagements(created_at DESC);

ALTER TABLE social_engagements ENABLE ROW LEVEL SECURITY;

-- 4. Create conversion_events table
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'meta_ads',
  pixel_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_time TIMESTAMP NOT NULL,
  action_source TEXT NOT NULL,
  user_data_hash TEXT,
  currency TEXT,
  value DECIMAL(10,2),
  content_name TEXT,
  order_id TEXT,
  custom_data JSONB,
  sent_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  matched_at TIMESTAMP,
  match_quality DECIMAL(3,2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, pixel_id)
);

CREATE INDEX IF NOT EXISTS idx_conversion_events_tenant ON conversion_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_pixel ON conversion_events(pixel_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_name ON conversion_events(event_name);
CREATE INDEX IF NOT EXISTS idx_conversion_events_time ON conversion_events(event_time DESC);

ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

-- 5. Create api_logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  operation TEXT NOT NULL,
  endpoint TEXT,
  method TEXT,
  status_code INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  error_code TEXT,
  duration_ms INTEGER,
  rate_limited BOOLEAN DEFAULT FALSE,
  retries INTEGER DEFAULT 0,
  request_data JSONB,
  response_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_tenant ON api_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_platform ON api_logs(platform);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_success ON api_logs(success);

ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- 6. Update profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_token_expiration BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_sync_errors BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_new_leads BOOLEAN DEFAULT FALSE;

COMMIT;
```

---

## Post-Migration Steps

1. **Generate encryption key**:
   ```bash
   openssl rand -hex 32
   ```
   Add to `.env.local` as `ENCRYPTION_KEY`

2. **Set up Redis**:
   ```bash
   # Option 1: Local Redis
   docker run -d -p 6379:6379 redis:alpine
   
   # Option 2: Use a managed service (Upstash, Redis Cloud, etc.)
   ```

3. **Configure email service**:
   - For Gmail: Enable 2FA and create App-Specific Password
   - For SendGrid: Get API key from account settings
   - Add credentials to `.env.local`

4. **Migrate existing tokens** (if any):
   - Run a migration script to encrypt existing tokens
   - Use `lib/security/encryption.ts` utilities

5. **Test webhooks**:
   - Set up ngrok or similar for local testing
   - Configure webhook URL in Meta App Dashboard
   - Test using Meta's webhook testing tool

---

## Verification

After migration, verify:

```sql
-- Check new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ad_accounts' 
  AND column_name LIKE '%encrypted%';

-- Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('leads', 'social_engagements', 'conversion_events', 'api_logs');

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('leads', 'social_engagements', 'conversion_events', 'api_logs');
```

