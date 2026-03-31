import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { generateTokenPair } from '@/lib/jwt'
import { getSupabaseClient } from '@/lib/supabase-client'
import { auditLogger } from '@/lib/audit-logger'
import bcrypt from 'bcryptjs'
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

        const supabase = getSupabaseClient()

        // Look up user by email in Supabase
        const { data: user, error: lookupError } = await supabase
          .from('users')
          .select('id, email, password_hash, first_name, last_name, email_verified, subscription_status, subscription_tier')
          .eq('email', email.toLowerCase())
          .maybeSingle()

        if (lookupError || !user) {
          await auditLogger.log('login_failed', 'user', 'unknown', {
            email,
            reason: 'User not found',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
          }, { id: 'unknown', email: 'unknown', name: 'Unknown', role: 'user' } as any, request)

          return NextResponse.json({
            success: false,
            error: 'Invalid credentials',
            message: 'Email or password is incorrect'
          }, { status: 401 })
        }

        // Compare submitted password against stored hash
        const passwordMatch = await bcrypt.compare(password, user.password_hash)
        if (!passwordMatch) {
          await auditLogger.log('login_failed', 'user', user.id, {
            email,
            reason: 'Invalid password',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
          }, { id: user.id, email: user.email, name: '', role: 'user' } as any, request)

          return NextResponse.json({
            success: false,
            error: 'Invalid credentials',
            message: 'Email or password is incorrect'
          }, { status: 401 })
        }

        const userForToken = { id: user.id, email: user.email, role: (user as any).role ?? 'user' }

        // Generate JWT tokens
        const tokens = generateTokenPair(userForToken as any)

        // Log authentication event
        await auditLogger.log('user_login', 'user', user.id, {
          email: user.email,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }, userForToken as any, request)

        const response = NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
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