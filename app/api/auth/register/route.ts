import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { generateTokenPair } from '@/lib/jwt'
import { getSupabaseClient } from '@/lib/supabase-client'
import { auditLogger } from '@/lib/audit-logger'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const POST = withRateLimit(
  withValidation({
    body: registerSchema
  })(
    async (request: NextRequest, validatedData?: any) => {
      try {
        const { email, password, name } = validatedData?.body

        const supabase = getSupabaseClient()

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', email.toLowerCase())
          .maybeSingle()

        if (existingUser) {
          return NextResponse.json({
            success: false,
            error: 'User already exists',
            message: 'An account with this email already exists'
          }, { status: 409 })
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 12)

        // Split name into first and last (everything after first space is last name)
        const trimmedName = name.trim()
        const spaceIdx = trimmedName.indexOf(' ')
        const firstName = spaceIdx === -1 ? trimmedName : trimmedName.slice(0, spaceIdx)
        const lastName = spaceIdx === -1 ? '' : trimmedName.slice(spaceIdx + 1).trim()

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex')

        // Insert new user into Supabase
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            email: email.toLowerCase(),
            password_hash: passwordHash,
            first_name: firstName,
            last_name: lastName,
            email_verified: false,
            email_verification_token: emailVerificationToken,
            subscription_status: 'inactive',
            subscription_tier: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id, email, first_name, last_name, subscription_status, subscription_tier')
          .single()

        if (insertError || !newUser) {
          return NextResponse.json({
            success: false,
            error: 'Registration failed',
            message: insertError?.message ?? 'Unknown error'
          }, { status: 500 })
        }

        const userForToken = { id: newUser.id, email: newUser.email, role: 'user' }

        // Generate JWT tokens
        const tokens = generateTokenPair(userForToken as any)

        // Log registration event
        await auditLogger.log('user_registered', 'user', newUser.id, {
          email: newUser.email,
          name,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }, userForToken as any, request)

        const response = NextResponse.json({
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: `${newUser.first_name ?? ''} ${newUser.last_name ?? ''}`.trim(),
            role: 'user'
          },
          message: 'Registration successful'
        })

        const isProduction = process.env.NODE_ENV === 'production'
        const accessCookieOptions = {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax' as const,
          path: '/',
          maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
        }

        response.cookies.set('auth-token', tokens.accessToken, accessCookieOptions)
        response.cookies.set('accessToken', tokens.accessToken, accessCookieOptions)
        response.cookies.set('refreshToken', tokens.refreshToken, {
          ...accessCookieOptions,
          maxAge: 30 * 24 * 60 * 60 // 30 days in seconds
        })

        return response

      } catch (error: any) {
        console.error('❌ Registration failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Registration failed',
          message: error.message
        }, { status: 500 })
      }
    }
  ),
  'general'
)