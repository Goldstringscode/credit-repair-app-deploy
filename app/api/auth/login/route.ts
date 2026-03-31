import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { generateTokenPair } from '@/lib/jwt'
import { auditLogger } from '@/lib/audit-logger'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const POST = withRateLimit(
  withValidation({
    body: loginSchema
  })(
    async (request: NextRequest, validatedData?: any) => {
      try {
        const { email, password } = validatedData?.body

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (supabaseUrl && supabaseAnonKey) {
          // Supabase Auth path
          const { createClient } = await import('@supabase/supabase-js')
          const supabase = createClient(supabaseUrl, supabaseAnonKey)

          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (authError || !authData.user) {
            await auditLogger.log('login_failed', 'user', 'unknown', {
              email,
              reason: authError?.message ?? 'Authentication failed',
              ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
            }, { id: 'unknown', email: 'unknown', name: 'Unknown', role: 'user' } as any, request).catch(() => { /* non-blocking */ })

            return NextResponse.json({
              success: false,
              error: 'Invalid credentials',
              message: 'Email or password is incorrect'
            }, { status: 401 })
          }

          const sbUser = authData.user
          const userForToken = {
            id: sbUser.id,
            email: sbUser.email ?? email,
            name: sbUser.user_metadata?.full_name ?? sbUser.user_metadata?.name ?? email.split('@')[0],
            role: (sbUser.user_metadata?.role as string) ?? 'user',
          }

          // Generate JWT tokens
          const tokens = generateTokenPair(userForToken as any)

          // Log authentication event
          await auditLogger.log('user_login', 'user', sbUser.id, {
            email: sbUser.email,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }, userForToken as any, request).catch(() => { /* non-blocking */ })

          const response = NextResponse.json({
            success: true,
            user: {
              id: userForToken.id,
              email: userForToken.email,
              name: userForToken.name,
              role: userForToken.role
            },
            message: 'Login successful'
          })

          const isProduction = process.env.NODE_ENV === 'production'
          const accessCookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
          }

          // Set auth-token cookie so middleware (getValidToken) can find it
          response.cookies.set('auth-token', tokens.accessToken, accessCookieOptions)

          // Also set accessToken cookie (legacy fallback read by middleware)
          response.cookies.set('accessToken', tokens.accessToken, accessCookieOptions)

          // Set refreshToken cookie
          response.cookies.set('refreshToken', tokens.refreshToken, {
            ...accessCookieOptions,
            maxAge: 30 * 24 * 60 * 60 // 30 days in seconds
          })

          return response
        }

        // Fallback demo path when Supabase env vars are not configured
        if (email === 'demo@example.com' && password === 'demo123') {
          const { getSupabaseClient } = await import('@/lib/supabase-client')
          const supabaseAdmin = (() => {
            try { return getSupabaseClient() } catch { return null }
          })()

          let demoUser: { id: string; email: string; role: string } | null = null

          if (supabaseAdmin) {
            const { data } = await supabaseAdmin
              .from('users')
              .select('id, email')
              .eq('email', email.toLowerCase())
              .maybeSingle()
              .catch(() => ({ data: null }))

            if (data) {
              demoUser = { id: data.id, email: data.email, role: 'user' }
            }
          }

          if (!demoUser) {
            demoUser = { id: 'demo-user', email: 'demo@example.com', role: 'user' }
          }

          const tokens = generateTokenPair(demoUser as any)

          const response = NextResponse.json({
            success: true,
            user: { id: demoUser.id, email: demoUser.email, name: 'Demo User', role: demoUser.role },
            message: 'Login successful'
          })

          const isProduction = process.env.NODE_ENV === 'production'
          const accessCookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            path: '/',
            maxAge: 7 * 24 * 60 * 60
          }

          response.cookies.set('auth-token', tokens.accessToken, accessCookieOptions)
          response.cookies.set('accessToken', tokens.accessToken, accessCookieOptions)
          response.cookies.set('refreshToken', tokens.refreshToken, {
            ...accessCookieOptions,
            maxAge: 30 * 24 * 60 * 60
          })

          return response
        }

        return NextResponse.json({
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        }, { status: 401 })

      } catch (error: any) {
        console.error('❌ Login failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Login failed',
          message: error.message
        }, { status: 500 })
      }
    }
  ),
  'general'
)