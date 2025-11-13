#!/usr/bin/env node

/**
 * Database Migration Script - Fix Ad Accounts Duplicates
 *
 * This script applies the critical fix to prevent duplicate ad_accounts entries.
 *
 * Usage:
 *   node scripts/apply-fix-migration.js
 *
 * Prerequisites:
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable set
 *   - NEXT_PUBLIC_SUPABASE_URL environment variable set
 */

const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables')
  console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

console.log('🔧 Ad Accounts Duplicate Fix Migration')
console.log('=====================================\n')

async function runMigration() {
  try {
    // Read SQL migration file
    const sqlPath = path.join(__dirname, '../migrations/fix_ad_accounts_duplicates.sql')

    if (!fs.existsSync(sqlPath)) {
      console.error('❌ Error: Migration file not found at:', sqlPath)
      process.exit(1)
    }

    const migrationSQL = fs.readFileSync(sqlPath, 'utf8')

    console.log('📄 Migration file loaded:', sqlPath)
    console.log('🔍 Connecting to Supabase...\n')

    // Import Supabase client
    const { createClient } = require('@supabase/supabase-js')

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('✅ Connected to Supabase\n')

    // Step 1: Check for existing duplicates
    console.log('Step 1: Checking for duplicate ad_accounts...')

    const { data: duplicates, error: checkError } = await supabase
      .from('ad_accounts')
      .select('tenant_id, platform')

    if (checkError) {
      throw new Error(`Failed to check duplicates: ${checkError.message}`)
    }

    // Count duplicates
    const counts = {}
    duplicates.forEach(acc => {
      const key = `${acc.tenant_id}|${acc.platform}`
      counts[key] = (counts[key] || 0) + 1
    })

    const duplicateCount = Object.values(counts).filter(c => c > 1).length

    if (duplicateCount > 0) {
      console.log(`⚠️  Found ${duplicateCount} duplicate tenant/platform combination(s)`)
      console.log('   These will be cleaned up by the migration.\n')
    } else {
      console.log('✅ No duplicates found (good!)\n')
    }

    // Step 2: Check current constraint
    console.log('Step 2: Checking current unique constraints...')

    const { data: constraints, error: constraintError } = await supabase
      .rpc('get_table_constraints', { table_name: 'ad_accounts' })
      .catch(() => {
        // RPC function might not exist, that's okay
        return { data: null, error: null }
      })

    if (!constraintError && constraints) {
      console.log('   Current constraints:', constraints)
    }

    console.log('✅ Constraints checked\n')

    // Step 3: Apply migration
    console.log('Step 3: Applying migration...')
    console.log('⚠️  WARNING: This will:')
    console.log('   1. Remove duplicate ad_accounts (keep most recent)')
    console.log('   2. Drop old unique constraint')
    console.log('   3. Add new constraint: UNIQUE(tenant_id, platform)')
    console.log('')

    // Ask for confirmation if running interactively
    if (process.stdin.isTTY) {
      const readline = require('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      const answer = await new Promise(resolve => {
        rl.question('   Continue? (y/N): ', resolve)
      })

      rl.close()

      if (answer.toLowerCase() !== 'y') {
        console.log('\n❌ Migration cancelled by user')
        process.exit(0)
      }
    }

    console.log('\n🚀 Applying migration SQL...\n')

    // Execute the migration using Supabase's SQL execution
    // Note: The full SQL file should be run via Supabase SQL Editor or direct psql
    // This script guides the user through the process

    console.log('⚠️  IMPORTANT: The full migration must be run via Supabase SQL Editor')
    console.log('')
    console.log('📋 Instructions:')
    console.log('   1. Go to: ' + SUPABASE_URL.replace('.supabase.co', '.supabase.co/project/_/sql/new'))
    console.log('   2. Copy the contents of: migrations/fix_ad_accounts_duplicates.sql')
    console.log('   3. Paste into the SQL Editor')
    console.log('   4. Click "Run"')
    console.log('   5. Verify the output shows success')
    console.log('')

    // We can still do some checks and cleanup here
    console.log('🧹 Performing preliminary cleanup...\n')

    // Delete older duplicates programmatically
    if (duplicateCount > 0) {
      // Group duplicates
      const grouped = {}
      const { data: allAccounts } = await supabase
        .from('ad_accounts')
        .select('*')
        .order('updated_at', { ascending: false })

      allAccounts.forEach(acc => {
        const key = `${acc.tenant_id}|${acc.platform}`
        if (!grouped[key]) {
          grouped[key] = []
        }
        grouped[key].push(acc)
      })

      // Delete all but the most recent for each group
      let deletedCount = 0
      for (const [key, accounts] of Object.entries(grouped)) {
        if (accounts.length > 1) {
          // Keep the first (most recent), delete the rest
          const toDelete = accounts.slice(1)

          for (const acc of toDelete) {
            const { error: deleteError } = await supabase
              .from('ad_accounts')
              .delete()
              .eq('id', acc.id)

            if (deleteError) {
              console.error(`   ⚠️  Failed to delete duplicate: ${deleteError.message}`)
            } else {
              deletedCount++
              console.log(`   ✅ Deleted duplicate: ${acc.platform} (${acc.account_id})`)
            }
          }
        }
      }

      if (deletedCount > 0) {
        console.log(`\n✅ Deleted ${deletedCount} duplicate account(s)\n`)
      }
    }

    // Step 4: Verify
    console.log('Step 4: Verifying cleanup...')

    const { data: remaining, error: verifyError } = await supabase
      .from('ad_accounts')
      .select('tenant_id, platform')

    if (verifyError) {
      throw new Error(`Verification failed: ${verifyError.message}`)
    }

    const newCounts = {}
    remaining.forEach(acc => {
      const key = `${acc.tenant_id}|${acc.platform}`
      newCounts[key] = (newCounts[key] || 0) + 1
    })

    const remainingDuplicates = Object.values(newCounts).filter(c => c > 1).length

    if (remainingDuplicates > 0) {
      console.log(`⚠️  Still found ${remainingDuplicates} duplicate(s)`)
      console.log('   You may need to run the full SQL migration via Supabase SQL Editor')
    } else {
      console.log('✅ No duplicates remaining!\n')
    }

    // Show current state
    console.log('📊 Current ad_accounts state:')
    const { data: summary } = await supabase
      .from('ad_accounts')
      .select('platform, status')

    const platformCounts = {}
    summary.forEach(acc => {
      const key = `${acc.platform}_${acc.status}`
      platformCounts[key] = (platformCounts[key] || 0) + 1
    })

    Object.entries(platformCounts).forEach(([key, count]) => {
      const [platform, status] = key.split('_')
      console.log(`   ${platform}: ${count} (${status})`)
    })

    console.log('\n✅ Migration steps completed!')
    console.log('\n📋 Next steps:')
    console.log('   1. If the constraint update needs to be applied via SQL Editor, follow the instructions above')
    console.log('   2. Test connecting a platform in Settings')
    console.log('   3. Verify only ONE account per platform exists')
    console.log('   4. Test data sync')
    console.log('   5. Verify dashboard shows real data')
    console.log('')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error('\nError details:', error)
    process.exit(1)
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('✅ Script completed successfully\n')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
