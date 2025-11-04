import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const rawServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!rawUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set')
}

if (!rawServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
}

const supabaseUrl: string = rawUrl
const supabaseServiceRoleKey: string = rawServiceRoleKey

export function createServiceRoleClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  })
}
