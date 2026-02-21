# Recommendations

## Feature Improvements
1. Add account-level diagnostics panel in Settings.
- Show last sync per platform, last error, row counts inserted, and token expiry countdown.

2. Add per-platform sync controls.
- Let Mike sync Google/Meta/LinkedIn independently and avoid full retries when one API is down.

3. Add MCC/sub-account support UX for Google.
- Add optional `login_customer_id` and customer selector to support agency manager hierarchies.

4. Add actionable AI "playbooks".
- Prebuilt prompts: Budget Reallocation, Low-ROAS Triage, Ad Copy Audit, Weekly Client Summary.

5. Add scheduled sync jobs.
- Background sync every N hours via cron/queue, with alerts if stale beyond SLA.

## Security Issues Found
1. Secrets exposure risk.
- `.env.local` currently contains sensitive keys in workspace. Rotate all exposed keys immediately.

2. Service-role key missing and key handling inconsistency.
- Add `SUPABASE_SERVICE_ROLE_KEY` only in secure server env, never client-exposed.

3. Improve token lifecycle controls.
- Add explicit token age monitoring and proactive reconnect prompts before expiry windows.

4. Strengthen audit logs.
- Log structured sync attempts with request IDs and user/tenant IDs, excluding sensitive payloads.

## Performance Improvements
1. Split monolithic API routes.
- Break `sync-data` and `chat` routes into service modules to reduce complexity and improve testability.

2. Add incremental sync mode.
- Pull only changed data since last successful sync, then full backfill on demand.

3. Add data retention/aggregation strategy.
- Keep raw daily metrics but build summarized materialized views for dashboard/chat reads.

4. Add caching for heavy reads.
- Cache common dashboard aggregates per tenant/date filter with short TTL.

## Pricing Justification Notes
Estimated market value depends on production hardening level:

1. Current codebase (post-fix, limited automation/tests):
- Typical US market range: **$12,000 - $30,000**.

2. Production-grade version (tests, monitoring, scheduler, robust onboarding):
- Typical US market range: **$35,000 - $85,000**.

3. Ongoing maintenance retainer:
- Typical US market range: **$1,500 - $6,000/month** depending on SLA, support hours, and feature velocity.

Rationale:
- Multi-platform ad API integrations + OAuth + secure token storage + analytics UX + AI interface is specialized SaaS integration work with meaningful maintenance overhead.
