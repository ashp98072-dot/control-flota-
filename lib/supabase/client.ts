import { createBrowserClient } from '@supabase/ssr'
import { mockSupabase } from './mock'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    console.warn('[AI Studio] Supabase URL or Key is missing. Using local mock client.')
    return mockSupabase as any
  }

  return createBrowserClient(url, key)
}