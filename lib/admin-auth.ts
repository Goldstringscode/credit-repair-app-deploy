import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Server-side admin verification for /api/admin/* routes.
 * Reads the Supabase session from the Authorization header or sb-* cookie,
 * verifies the user exists and has role='admin' in the users table.
 * Returns { error: NextResponse } if unauthorized, or { userId, email } if valid.
 */
export async function verifyAdminRequest(request: NextRequest): Promise<
  | { error: NextResponse }
  | { userId: string; email: string }
> {
  try {
    // 1. Extract token — prefer Authorization header, fall back to cookie
    let token: string | undefined
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    } else {
      // Try Supabase cookie formats
      const cookies = request.cookies
      const sbCookie = cookies.getAll().find(
        c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
      )
      if (sbCookie) {
        try {
          const parsed = JSON.parse(decodeURIComponent(sbCookie.value))
          token = parsed.access_token || parsed[0]
        } catch {
          token = sbCookie.value
        }
      }
      if (!token) token = cookies.get('auth-token')?.value
      if (!token) token = cookies.get('accessToken')?.value
    }

    if (!token) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Unauthorized: No authentication token' },
          { status: 401 }
        )
      }
    }

    // 2. Verify token with Supabase and get user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Unauthorized: Invalid or expired token' },
          { status: 401 }
        )
      }
    }

    // 3. Check admin role in users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Unauthorized: User profile not found' },
          { status: 401 }
        )
      }
    }

    if (profile.role !== 'admin') {
      return {
        error: NextResponse.json(
          { success: false, error: 'Forbidden: Admin access required' },
          { status: 403 }
        )
      }
    }

    return { userId: user.id, email: user.email ?? '' }
  } catch (err: any) {
    console.error('Admin auth error:', err.message)
    return {
      error: NextResponse.json(
        { success: false, error: 'Internal auth error' },
        { status: 500 }
      )
    }
  }
}