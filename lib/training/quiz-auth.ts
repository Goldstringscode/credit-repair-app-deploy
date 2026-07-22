import { NextRequest } from "next/server"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { verifyToken } from "@/lib/jwt"

/**
 * Extract the authenticated user's id.
 *
 * This app's real sign-in flow (app/api/auth/login/route.ts) does NOT use
 * Supabase Auth — it looks up public.users (bcrypt password_hash) and issues
 * its own JWT (lib/jwt.ts, payload.userId) stored in an HttpOnly `accessToken`
 * cookie. This must be verified the same way, with the same secret/issuer/
 * audience, not decoded as an unverified Supabase Auth token.
 */
export function extractUserId(request: NextRequest): string | null {
  try {
    let token: string | undefined

    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7)
    }

    if (!token) {
      token = request.cookies.get("accessToken")?.value
    }
    if (!token) {
      // Legacy/alternate cookie name also set at login
      token = request.cookies.get("auth-token")?.value
    }

    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    return payload.userId || null
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
