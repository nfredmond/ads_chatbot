# Deployment Guide

## Environment Variables Required

The following environment variables must be set in your Vercel project:

### **Required - Supabase Configuration:**
```
NEXT_PUBLIC_SUPABASE_URL=https://pfatayebacwjehlfxipx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmYXRheWViYWN3amVobGZ4aXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjMyOTMsImV4cCI6MjA3NjczOTI5M30.Q-MfA4eqteLtKAqEtZadEBNw3ak8OESTDFnBv0RXwzI
```

### **Required - AI API Configuration:**
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```
**Note**: Use the Anthropic API key provided separately by the project owner.

### Optional - OpenAI (for future use):
```
OPENAI_API_KEY=your_openai_key_here
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard: https://vercel.com/natford/ads-chatbot
2. Click on **"Settings"** tab
3. Click on **"Environment Variables"** in the left sidebar
4. Add each environment variable:
   - Enter the **Name** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the **Value** (the actual key/URL)
   - Select environments: **Production**, **Preview**, and **Development**
   - Click **"Save"**
5. Repeat for all required variables
6. After adding all variables, go to **"Deployments"** tab
7. Find the latest deployment and click **"Redeploy"**

## Project URLs

- **Production**: https://ads-chatbot-natford.vercel.app
- **GitHub Repo**: https://github.com/nfredmond/ads_chatbot
- **Supabase Dashboard**: https://supabase.com/dashboard/project/pfatayebacwjehlfxipx

## Features

✅ Complete marketing analytics dashboard
✅ AI-powered chatbot with Claude 3.5 Sonnet
✅ Multi-tenant database with Row Level Security
✅ Settings page for API keys and ad platform connections
✅ Dark mode / Light mode toggle
✅ Authentication with Supabase Auth
✅ Support for Google Ads, Meta Ads, LinkedIn Ads

## Next Steps After Deployment

1. Sign up for an account at your deployed URL
2. Go to Settings to configure your ad platform connections
3. Add your API keys for Google Ads, Meta Ads, or LinkedIn Ads
4. Start chatting with the AI assistant about your campaigns!

