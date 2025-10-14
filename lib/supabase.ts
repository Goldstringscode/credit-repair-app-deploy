import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// For server-side operations
export const supabaseAdmin = isSupabaseConfigured && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return isSupabaseConfigured && supabase !== null
}

// Helper function to create a client with error handling
export const createSupabaseClient = () => {
  if (!isSupabaseAvailable()) {
    console.log('Supabase is not configured. Returning null.')
    return null
  }
  return supabase
}

// Export createClient for compatibility
export { createSupabaseClient as createClient }
