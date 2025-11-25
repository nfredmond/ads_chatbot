# Marketing Analytics Chatbot - Setup Instructions

## 🚨 ACTION REQUIRED

I've completed the code review and fixed all the code issues. There are a few things you need to do manually in your Supabase Dashboard to complete the setup.

---

## Step 1: Enable Email Authentication in Supabase (CRITICAL!)

The error "Anonymous sign-ins are disabled" means email authentication needs to be enabled in your Supabase project.

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/pfatayebacwjehlfxipx/auth/providers
2. Find **Email** in the list of providers
3. Make sure the toggle is **ON** (enabled)
4. Under Email settings:
   - ✅ Optionally **disable** "Confirm email" for easier testing (you can enable it later)
   - ✅ Enable "Secure email change"
5. Click **Save**

**This is the most important step!** Without this, signup will always fail.

---

## Step 2: Run the Database Setup SQL

1. Go to: https://supabase.com/dashboard/project/pfatayebacwjehlfxipx/sql/new
2. Copy and paste the entire contents of `DATABASE_SETUP.sql` (in this folder)
3. Click **Run** to execute the SQL

This creates all the required tables:
- `tenants` - Multi-tenancy support
- `profiles` - User profiles
- `ad_accounts` - Connected ad platforms
- `campaigns` - Ad campaigns
- `campaign_metrics` - Daily metrics
- `insights` - AI-generated insights
- `conversations` - Chat history
- `messages` - Chat messages
- `leads` - Lead tracking
- `social_engagements` - Engagement data
- `conversion_events` - Conversion tracking
- `api_logs` - API call logging

---

## Step 3: Get Your Service Role Key

1. Go to: https://supabase.com/dashboard/project/pfatayebacwjehlfxipx/settings/api
2. Find **service_role** key (under "Project API keys")
3. Copy the key
4. Update your `.env.local` file:

```
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

---

## Step 4: (Optional) Add Your Anthropic API Key

For the AI chat to work, you need a valid Anthropic API key:

1. Get an API key from https://console.anthropic.com/
2. Update your `.env.local` file:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

---

## Step 5: Restart the Dev Server

After making all changes:

```bash
cd "C:\Code\Mike Strickler\ADs Chatbot\ads-chatbot"
npm run dev
```

---

## What I Fixed in the Code

### Database Schema
- ✅ Added missing `conversations` and `messages` tables for chat
- ✅ Added missing `organization`, `phone`, `onboarding_completed` columns to profiles
- ✅ Added unique constraint for ad_accounts upsert
- ✅ Created comprehensive RLS policies

### Code Fixes
- ✅ Fixed 307 linter errors → 0 errors, 129 warnings (acceptable)
- ✅ Fixed React hooks dependencies in dashboard components
- ✅ Fixed unused variables
- ✅ Fixed service role client to handle missing env vars gracefully
- ✅ Fixed ESLint configuration for better developer experience
- ✅ Build now compiles successfully

### Security
- ✅ Fixed RLS policies to use optimized `(SELECT auth.uid())` pattern
- ✅ Fixed function search_path for security
- ✅ Added proper SECURITY DEFINER settings

### Files Created
- `DATABASE_SETUP.sql` - Complete database setup script
- `.env.example` - Example environment variables
- `SETUP_INSTRUCTIONS.md` - This file

---

## Testing the App

After completing the setup:

1. **Sign Up**: http://localhost:3000/signup
2. **Dashboard**: http://localhost:3000/dashboard
3. **Settings**: http://localhost:3000/dashboard/settings
4. **AI Chat**: http://localhost:3000/dashboard/chat

---

## Troubleshooting

### "Anonymous sign-ins are disabled"
→ Enable Email provider in Supabase Dashboard (Step 1)

### "Failed to fetch"
→ Check that your Supabase URL and anon key are correct in `.env.local`

### Database errors
→ Run the `DATABASE_SETUP.sql` script in Supabase SQL Editor (Step 2)

### AI Chat not working
→ Add a valid Anthropic API key (Step 4)

---

## Current Environment Variables

Your `.env.local` should look like this:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pfatayebacwjehlfxipx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# AI
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Security
ENCRYPTION_KEY=3944f286d34a5a5b6fccb8a1afd38582d815ad5ad70138d31fd7d31f68e9bc2b

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Need Help?

If you run into issues, check:
1. Supabase Dashboard logs: https://supabase.com/dashboard/project/pfatayebacwjehlfxipx/logs/edge-logs
2. Browser console (F12) for client-side errors
3. Terminal output for server-side errors

