-- Migration: Fix ad_accounts duplicate entries and update unique constraint
-- Date: 2025-01-13
-- Purpose: Allow users to update credentials for the same platform without creating duplicates

-- ============================================================================
-- STEP 1: Backup existing data (optional - for safety)
-- ============================================================================
-- Uncomment if you want to create a backup table first
-- CREATE TABLE ad_accounts_backup AS SELECT * FROM ad_accounts;

-- ============================================================================
-- STEP 2: Identify and remove duplicate ad_accounts
-- ============================================================================

-- This CTE finds duplicate entries (same tenant_id + platform) and keeps only the most recent
WITH duplicates AS (
  SELECT
    id,
    tenant_id,
    platform,
    ROW_NUMBER() OVER (
      PARTITION BY tenant_id, platform
      ORDER BY updated_at DESC, created_at DESC
    ) as row_num
  FROM ad_accounts
)
-- Delete older duplicates, keep only the most recent (row_num = 1)
DELETE FROM ad_accounts
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- ============================================================================
-- STEP 3: Drop the old unique constraint
-- ============================================================================

-- First, find the constraint name (it might vary)
-- The constraint is typically named: ad_accounts_tenant_id_platform_account_id_key

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- Find the existing unique constraint on (tenant_id, platform, account_id)
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'ad_accounts'::regclass
    AND contype = 'u'
    AND array_length(conkey, 1) = 3;

  -- Drop it if found
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE ad_accounts DROP CONSTRAINT IF EXISTS %I', constraint_name);
    RAISE NOTICE 'Dropped old constraint: %', constraint_name;
  END IF;
END $$;

-- Also drop any other constraints that might exist
ALTER TABLE ad_accounts DROP CONSTRAINT IF EXISTS ad_accounts_tenant_id_platform_account_id_key;
ALTER TABLE ad_accounts DROP CONSTRAINT IF EXISTS ad_accounts_tenant_id_platform_key;

-- ============================================================================
-- STEP 4: Add the new unique constraint
-- ============================================================================

-- Each tenant should have only ONE account per platform
-- The account_id can change during OAuth, so we don't include it in the constraint
ALTER TABLE ad_accounts
  ADD CONSTRAINT ad_accounts_tenant_platform_unique
  UNIQUE (tenant_id, platform);

-- ============================================================================
-- STEP 5: Add helpful indexes if they don't exist
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ad_accounts_tenant_platform
  ON ad_accounts(tenant_id, platform);

CREATE INDEX IF NOT EXISTS idx_ad_accounts_status
  ON ad_accounts(status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_ad_accounts_expires_at
  ON ad_accounts(token_expires_at)
  WHERE status = 'active' AND token_expires_at IS NOT NULL;

-- ============================================================================
-- STEP 6: Verify the changes
-- ============================================================================

-- Count remaining accounts per tenant/platform (should all be 1 or 0)
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT tenant_id, platform, COUNT(*) as cnt
    FROM ad_accounts
    GROUP BY tenant_id, platform
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE WARNING 'Still found % duplicate tenant/platform combinations!', duplicate_count;
  ELSE
    RAISE NOTICE 'Success! No duplicate tenant/platform combinations found.';
  END IF;
END $$;

-- Show summary of accounts
SELECT
  platform,
  status,
  COUNT(*) as account_count
FROM ad_accounts
GROUP BY platform, status
ORDER BY platform, status;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- You can now update credentials for a platform and it will update the existing
-- record instead of creating a duplicate.
