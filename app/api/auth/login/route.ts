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
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const POST = withRateLimit(
  withValidation({ body: loginSchema })(
    async (request: NextRequest, validatedData?: any) => {
      try {
        const { email, password } = validatedData?.body

        const supabase = getSupabaseClient()

        // Look up user by email in the custom users table
        const { data: user, error: lookupError } = await supabase
          .from('users')
          .select('id, email, password_hash, first_name, last_name, role')
          .eq('email', email.toLowerCase())
          .maybeSingle()

        if (lookupError) {
          console.error('❌ Login user lookup error:', lookupError)
          return NextResponse.json(
            { success: false, error: 'Invalid credentials', message: 'Email or password is incorrect' },
            { status: 401 }
          )
        }

        if (!user) {
          return NextResponse.json(
            { success: false, error: 'Invalid credentials', message: 'Email or password is incorrect' },
            { status: 401 }
          )
        }

        // Verify password against stored bcrypt hash
        const passwordMatch = await bcrypt.compare(password, user.password_hash)
        if (!passwordMatch) {
          return NextResponse.json(
            { success: false, error: 'Invalid credentials', message: 'Email or password is incorrect' },
            { status: 401 }
          )
        }

        const userForToken = { id: user.id, email: user.email, role: user.role }
        const tokens = generateTokenPair(userForToken as any)

        await auditLogger.log('user_login', 'user', user.id, {
          email: user.email,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }, userForToken as any, request).catch(() => { /* non-blocking */ })

        const response = NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
            role: user.role,
          },
          message: 'Login successful',
        })

        const isProduction = process.env.NODE_ENV === 'production'
        const cookieOptions = {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax' as const,
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        }

        response.cookies.set('auth-token', tokens.accessToken, cookieOptions)
        response.cookies.set('accessToken', tokens.accessToken, cookieOptions)
        response.cookies.set('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 })

        return response
      } catch (error: any) {
        console.error('❌ Login failed:', error)
        return NextResponse.json(
          { success: false, error: 'Login failed', message: error.message },
          { status: 500 }
        )
      }
    }
  ),
  'general'
)