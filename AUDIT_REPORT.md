# Ads Chatbot Audit Report

## Scope Audited
- `app/api/*` (all API routes)
- `lib/google-ads/*`
- `lib/meta-ads/*`
- `lib/linkedin-ads/*`
- `lib/supabase/*`
- `lib/ads-data.ts`
- `.env.local`
- `middleware.ts`

## Executive Summary
- Priority 1 (Google sync failure): **fixed in code**.
- Priority 2 (Meta integration incomplete): **implemented and hardened in code**.
- Priority 3 (LinkedIn integration incomplete): **implemented and hardened in code**.
- Main remaining blockers are operational: missing platform credentials setup per tenant and production secrets hygiene.

## What Was Implemented vs Broken vs Missing

### Google Ads
Implemented:
- OAuth connect/callback flow in `app/auth/google/route.ts`.
- Token encryption/decryption flow for stored credentials.
- Campaign/ad group/ad fetch + transform in `lib/google-ads/client.ts`.
- Sync pipeline and Supabase upserts in `app/api/sync-data/route.ts`.

Broken before fixes:
- Sync forced `login_customer_id` fallback to customer ID, which can cause request failures for non-manager/direct account setups.
- Partial sync failures were swallowed into vague results, making frontend appear successful with no meaningful diagnostics.
- Ad-group/ad metric upserts lacked explicit conflict targets, risking duplicate rows or failed repeated syncs depending on DB constraints.

Fixed now:
- Removed unsafe Google fallback and only send `login-customer-id` when explicitly configured.
- Added clearer sync response shape with `hasErrors` and per-platform error messages.
- Added conflict-safe upserts for ad group/ad metric tables.

Still missing / action needed:
- If using MCC, `login_customer_id` must be entered in account metadata (currently no dedicated UI field).

### Meta Ads
Implemented:
- OAuth connect flow + long-lived token exchange in `app/auth/meta/route.ts`.
- Campaign/ad set/ad fetch in `lib/meta-ads/client.ts`.
- Sync into campaigns/ad_groups/ads + metrics in `app/api/sync-data/route.ts`.

Broken before fixes:
- Campaign list could be empty if no insight rows existed, causing valid campaigns with zero delivery to disappear.
- Repeated metrics sync could duplicate/fail depending on unique constraints (missing conflict targets on some upserts).
- Invalid placeholder account IDs (`pending`) were not pre-validated before API calls.

Fixed now:
- Transform now preserves campaign metadata even when insights are empty.
- Added conflict-safe upserts for campaign/ad group/ad metrics.
- Added account ID validation guardrails (`pending`/invalid IDs fail early with actionable errors).

Still missing / action needed:
- Ensure Meta app has required permissions approved in production app mode.

### LinkedIn Ads
Implemented:
- OAuth connect flow and account discovery in `app/auth/linkedin/route.ts`.
- Campaign and creative fetch in `lib/linkedin-ads/client.ts`.
- Pseudo ad-group model + creative sync in `app/api/sync-data/route.ts`.

Broken before fixes:
- URN vs raw ID mismatch in analytics joins could produce campaigns/creatives but zero metrics.
- Analytics request payload used IDs where URNs are commonly required.
- Repeated metric sync could duplicate/fail due missing conflict targets.
- Placeholder account IDs (`pending`) were not pre-validated.

Fixed now:
- Added LinkedIn ID/URN normalization helpers and applied them to campaign + creative analytics mapping.
- Analytics finder payload now uses URN lists for campaign/creative pivots.
- Added conflict-safe upserts for LinkedIn metrics.
- Added account ID guardrails in sync flow.

Still missing / action needed:
- LinkedIn Marketing API partner/app permissions must be approved for the production app.

## Data Flow (Expected)
1. User enters platform app credentials in Settings (stored in `ad_accounts.metadata`).
2. User completes platform OAuth (`/auth/google`, `/auth/meta`, `/auth/linkedin`).
3. Callback stores encrypted tokens in `ad_accounts` and marks account active.
4. User clicks Sync (or auto-sync runs from Settings page).
5. `POST /api/sync-data` decrypts account tokens and runs per-platform sync.
6. Platform clients fetch campaigns/ad groups/ads + metrics.
7. Sync route transforms and upserts into Supabase tables:
   - `campaigns`, `campaign_metrics`
   - `ad_groups`, `ad_group_metrics`
   - `ads`, `ad_metrics`
8. Dashboard and chat endpoints read aggregated data from those tables.

## Environment Variables Needed But Absent in Current `.env.local`
Missing from current file:
- `SUPABASE_SERVICE_ROLE_KEY` (needed by `lib/supabase/service-role.ts` and token migration helpers).

Not currently env-driven in this app (stored per-tenant in DB metadata instead):
- Google OAuth client ID/secret, Google Ads developer token.
- Meta app ID/secret.
- LinkedIn client ID/secret.

## Bugs Fixed In This Audit
- `app/api/sync-data/route.ts`
  - Removed unsafe Google `login_customer_id` fallback.
  - Added explicit per-platform sync error propagation (`hasErrors`, detailed messages).
  - Added conflict-safe upserts for `campaign_metrics`, `ad_group_metrics`, and `ad_metrics` where missing.
  - Added early validation for unconfigured Meta/LinkedIn account IDs.
- `lib/meta-ads/client.ts`
  - Added account ID normalization/validation.
  - Included metadata campaigns even without insight rows.
- `lib/linkedin-ads/client.ts`
  - Added URN/ID normalization utilities.
  - Fixed analytics pivot payloads and mapping for campaigns/creatives.
  - Normalized IDs in transformed records to align with DB mapping.
- `app/dashboard/settings/page.tsx`
  - Sync UI now shows partial-success summaries and per-platform failures instead of silent “success”.

## Code Quality Assessment
Strengths:
- Good separation of provider clients and sync orchestration.
- Token encryption path is present and used by OAuth callbacks.
- Logging and rate-limiter abstractions exist.

Issues:
- Very large route handlers (`app/api/chat/route.ts`, `app/api/sync-data/route.ts`) reduce maintainability.
- Broad `any` typing across critical data transforms increases regression risk.
- Secrets are currently present in `.env.local` in workspace; these should be rotated and moved to secret manager controls.
- No automated test coverage around sync transforms and DB persistence.

## Remaining Action Items
- Add an explicit Google `login_customer_id` input in Settings for MCC users.
- Add provider integration tests (mocked API responses for Google/Meta/LinkedIn).
- Rotate exposed API keys and enforce secure env handling policy.
