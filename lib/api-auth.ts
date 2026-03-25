import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Extract the authenticated user ID from the JWT token present in the
 * Authorization header or Supabase session cookies.
 * Returns null if no valid, unexpired token is found.
 */
export function extractUserId(request: NextRequest): string | null {
  try {
    let token: string | undefined

    // 1. Bearer token in Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    }

    // 2. Explicit Supabase access-token cookie
    if (!token) {
      token = request.cookies.get('sb-access-token')?.value
    }

    // 3. Supabase session cookie (sb-*-auth-token)
    if (!token) {
      for (const cookie of request.cookies.getAll()) {
        if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
          try {
            const session = JSON.parse(cookie.value)
            token = session?.access_token
          } catch {
            token = cookie.value
          }
          break
        }
      }
    }

    if (!token) return null

    // Decode JWT payload (base64url → JSON)
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const payload = JSON.parse(atob(padded))

    // Reject expired tokens
    if (payload.exp && Date.now() / 1000 > payload.exp) return null

    return (payload.sub as string) || null
  } catch {
    return null
  }
}

/**
 * Create a Supabase service-role client for server-side operations.
 * Throws if the required environment variables are not set.
 */
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase configuration')
  return createClient(url, key)
}
