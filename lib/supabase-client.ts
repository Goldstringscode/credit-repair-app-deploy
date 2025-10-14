import { createClient } from '@supabase/supabase-js'

let _supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!_supabaseClient) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables')
    }
    _supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  }
  return _supabaseClient
}
