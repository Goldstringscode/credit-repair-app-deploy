import { NextRequest } from "next/server"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

/**
 * Extract user ID from the JWT token in Authorization header or cookies.
 * Returns null if token is missing or invalid.
 *
 * Same auth pattern as /api/training/progress, which is proven working in
 * production for lesson/video progress.
 */
export function extractUserId(request: NextRequest): string | null {
  try {
    let token: string | undefined

    // Check Authorization header first
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7)
    }

    // Fall back to Supabase cookies
    if (!token) {
      token = request.cookies.get("sb-access-token")?.value
    }

    if (!token) {
      const cookies = request.cookies.getAll()
      for (const cookie of cookies) {
        if (cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")) {
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

    // Decode JWT payload (base64url)
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    const payload = JSON.parse(atob(padded))

    // Check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) return null

    return (payload.sub as string) || null
  } catch {
    return null
  }
}

export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase configuration")
  return createClient(url, key)
}
