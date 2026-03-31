import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { generateTokenPair } from '@/lib/jwt'
import { getSupabaseClient } from '@/lib/supabase-client'
import { auditLogger } from '@/lib/audit-logger'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const POST = withRateLimit(
  withValidation({ body: adminLoginSchema })(
    async (request: NextRequest, validatedData?: any) => {
      try {
        const { email, password } = validatedData?.body

        const supabase = getSupabaseClient()

        // Look up user by email — must exist and have role = 'admin'
        const { data: user, error: lookupError } = await supabase
          .from('users')
          .select('id, email, password_hash, first_name, last_name, role')
          .eq('email', email.toLowerCase())
          .maybeSingle()

        if (lookupError || !user) {
          return NextResponse.json(
            { success: false, error: 'Invalid credentials', message: 'Email or password is incorrect' },
            { status: 401 }
          )
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash)
        if (!passwordMatch) {
          return NextResponse.json(
            { success: false, error: 'Invalid credentials', message: 'Email or password is incorrect' },
            { status: 401 }
          )
        }

        // Enforce admin role
        if (user.role !== 'admin') {
          await auditLogger.log('admin_login_denied', 'user', user.id, {
            email: user.email,
            reason: 'Not an admin',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          }, { id: user.id, email: user.email, name: '', role: user.role } as any, request)

          return NextResponse.json(
            { success: false, error: 'Forbidden', message: 'Admin access required' },
            { status: 403 }
          )
        }

        const userForToken = { id: user.id, email: user.email, role: 'admin' as const }
        const tokens = generateTokenPair(userForToken as any)

        await auditLogger.log('admin_login', 'user', user.id, {
          email: user.email,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }, userForToken as any, request)

        const response = NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
            role: 'admin',
          },
          message: 'Admin login successful',
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
        console.error('❌ Admin login failed:', error)
        return NextResponse.json(
          { success: false, error: 'Login failed', message: error.message },
          { status: 500 }
        )
      }
    }
  ),
  'general'
)
