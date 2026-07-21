import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { mockSupabase } from './mock'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return mockSupabase as any
  }

  return createSupabaseClient(
    url,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}