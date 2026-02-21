# Environment Variables Required

## Required For App Runtime

1. `NEXT_PUBLIC_SUPABASE_URL`
- What: Supabase project URL.
- Where to get: Supabase Dashboard -> Project Settings -> API -> Project URL.
- Example: `NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co`

2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- What: Supabase anonymous public key.
- Where to get: Supabase Dashboard -> Project Settings -> API -> anon/public key.
- Example: `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`

3. `AI_GATEWAY_API_KEY`
- What: API key for AI Gateway provider used by `/api/chat`.
- Where to get: Your AI Gateway provider dashboard.
- Example: `AI_GATEWAY_API_KEY=vck_...`

4. `ENCRYPTION_KEY`
- What: 32-byte AES key in hex for token encryption/decryption (64 hex chars).
- Where to get: Generate with `openssl rand -hex 32`.
- Example: `ENCRYPTION_KEY=0123abcd...` (64 chars)

## Required For Admin/Service Operations

5. `SUPABASE_SERVICE_ROLE_KEY`
- What: Supabase service-role key for privileged server operations.
- Where to get: Supabase Dashboard -> Project Settings -> API -> service_role key.
- Example: `SUPABASE_SERVICE_ROLE_KEY=eyJ...`
- Notes: Never expose to client. Keep server-only.

## Optional / Compatibility Vars

6. `SUPABASE_URL`
- What: Alternate Supabase URL used by `lib/supabase.ts` fallback path.
- Where to get: same as `NEXT_PUBLIC_SUPABASE_URL`.
- Example: `SUPABASE_URL=https://your-project-ref.supabase.co`

7. `SUPABASE_ANON_KEY`
- What: Alternate anon key used by `lib/supabase.ts` fallback path.
- Where to get: same as `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Example: `SUPABASE_ANON_KEY=eyJ...`

## Platform Credential Inputs (Stored In DB, Not Env In Current Implementation)
These are required for platform connection but are currently entered in Settings and stored in `ad_accounts.metadata` per tenant:

1. Google Ads
- `client_id` (Google Cloud OAuth client ID)
- `client_secret` (Google Cloud OAuth client secret)
- `developer_token` (Google Ads developer token)
- `account_id` (Google Ads customer ID)
- Optional: `login_customer_id` (for MCC manager access)

2. Meta Ads
- `app_id` (Meta App ID)
- `app_secret` (Meta App Secret)
- `account_id` populated after OAuth from Graph API ad accounts

3. LinkedIn Ads
- `client_id` (LinkedIn app client ID)
- `client_secret` (LinkedIn app client secret)
- `account_id` populated after OAuth from LinkedIn ad accounts

## Source References for Platform Credentials
- Google Ads developer token: Google Ads API Center in Google Ads Manager account.
- Google OAuth credentials: Google Cloud Console -> APIs & Services -> Credentials.
- Meta app credentials: Meta for Developers -> My Apps -> App Dashboard.
- LinkedIn app credentials: LinkedIn Developer Portal -> Your App -> Auth.
