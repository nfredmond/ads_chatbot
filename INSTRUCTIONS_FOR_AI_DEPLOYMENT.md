# Instructions for AI Assistant with Supabase/Vercel Access

Execute these tasks in order. You have access to Supabase and Vercel tools.

---

## TASK 1: Apply Database Migration to Supabase

**Context**: There's a critical database migration that fixes duplicate ad_accounts entries.

**Steps**:

1. Read the migration file at: `/home/user/ads_chatbot/migrations/fix_ad_accounts_duplicates.sql`

2. Connect to the Supabase database and execute the entire SQL script

3. Verify the migration succeeded by running:
```sql
-- Should return 0 rows (no duplicates)
SELECT tenant_id, platform, COUNT(*) as count
FROM ad_accounts
GROUP BY tenant_id, platform
HAVING COUNT(*) > 1;
```

4. Confirm the new constraint exists:
```sql
-- Should show constraint: ad_accounts_tenant_platform_unique
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'ad_accounts'::regclass
AND contype = 'u';
```

5. Report the results:
   - Number of duplicate rows removed
   - Confirmation that constraint was updated
   - Current count of ad_accounts per platform

---

## TASK 2: Verify Vercel Deployment Status

**Context**: Code changes have been pushed to branch `claude/fix-app-issues-011CV57tWqRivHj4eBa95CwH`

**Steps**:

1. Check if Vercel has auto-deployed the latest commit (`4192f68`)

2. If not deployed, trigger a new deployment from the branch

3. Wait for deployment to complete

4. Verify the deployment is live and healthy:
   - Check `/api/health` endpoint returns 200
   - Verify environment variables are set:
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY
     - ANTHROPIC_API_KEY
     - ENCRYPTION_KEY

5. Report:
   - Deployment URL
   - Deployment status
   - Any missing environment variables

---

## TASK 3: Test Basic Flow (Optional but Recommended)

**Only if you have the ability to interact with the web app**:

1. Navigate to the deployed URL `/dashboard/settings`

2. Check that the Ad Platforms tab loads without errors

3. Verify the Connected Accounts tab shows existing accounts (if any)

4. Report any errors or issues found

---

## EXPECTED OUTCOMES

After completing these tasks:

✅ **Database**:
- No duplicate ad_accounts entries
- Constraint changed to UNIQUE(tenant_id, platform)
- Each tenant has max 1 account per platform

✅ **Deployment**:
- Latest code deployed to Vercel
- All environment variables configured
- Application is live and accessible

✅ **Result**:
- Users can now update credentials without creating duplicates
- Dashboard will display real campaign data
- Chatbot will have access to all platform data

---

## IMPORTANT NOTES

- The migration is **idempotent** - safe to run multiple times
- If duplicates exist, it keeps the most recent record per (tenant_id, platform)
- The code changes are already committed and pushed
- This fixes a critical issue preventing the app from working

---

## IF SOMETHING FAILS

**Migration fails**:
- Check for existing duplicates first
- Try running just the cleanup part (DELETE statement)
- Then run the constraint changes

**Deployment fails**:
- Check build logs for errors
- Verify all dependencies are in package.json
- Ensure environment variables are set

**Report back**:
- Exact error message
- Which step failed
- Current state of database/deployment

---

## SUMMARY

This is a **critical fix** for an ads chatbot app. The database constraint was allowing duplicate account entries when users updated credentials, which broke:
- Dashboard data display
- Campaign data syncing
- AI chatbot functionality

The fix changes the database constraint and updates the code to prevent duplicates. This must be applied before the app will work properly for users.

Execute TASK 1 (database migration) first, then TASK 2 (deployment verification). Report results of each task.
