import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { generateTokenPair, createTokenCookies } from '@/lib/jwt'
import { database } from '@/lib/database-config'
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

        // Supabase Auth path
        if (
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ) {
          const { createClient } = await import('@supabase/supabase-js')
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          )

          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (!authError && authData.user) {
            const sbUser = authData.user
            const user = {
              id: sbUser.id,
              email: sbUser.email ?? email,
              name: sbUser.user_metadata?.full_name ?? sbUser.user_metadata?.name ?? email.split('@')[0],
              role: (sbUser.user_metadata?.role as string) ?? 'user',
            }

            const tokens = generateTokenPair(user as any)
            const cookieStrings = createTokenCookies(tokens)

            await auditLogger.log('user_login', 'user', user.id, {
              email: user.email,
              ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
              userAgent: request.headers.get('user-agent') || 'unknown',
              method: 'supabase',
            }, user as any, request).catch(() => {})

            return NextResponse.json(
              { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role }, message: 'Login successful' },
              { headers: { 'Set-Cookie': `${cookieStrings.accessToken}, ${cookieStrings.refreshToken}` } }
            )
          }

          // Supabase returned an auth error — invalid credentials
          return NextResponse.json(
            { success: false, error: 'Invalid credentials', message: 'Email or password is incorrect' },
            { status: 401 }
          )
        }

        // Demo / fallback path (no Supabase configured)
        if (email === 'demo@example.com' && password === 'demo123') {
          let user = await database.getUser('demo-user-123').catch(() => null)
          if (!user) {
            user = await database.createUser({
              email: 'demo@example.com',
              name: 'Demo User',
              role: 'user',
              customerId: 'cus_demo_123',
              subscriptionId: 'sub_demo_123',
            }).catch(() => ({
              id: 'demo-user-123',
              email: 'demo@example.com',
              name: 'Demo User',
              role: 'user',
            } as any))
          }

          const tokens = generateTokenPair(user!)
          const cookieStrings = createTokenCookies(tokens)

          await auditLogger.log('user_login', 'user', user!.id, {
            email: user!.email,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            method: 'demo',
          }, user! as any, request).catch(() => {})

          return NextResponse.json(
            { success: true, user: { id: user!.id, email: user!.email, name: user!.name, role: user!.role }, message: 'Login successful' },
            { headers: { 'Set-Cookie': `${cookieStrings.accessToken}, ${cookieStrings.refreshToken}` } }
          )
        }

        // Invalid credentials
        await auditLogger.log('login_failed', 'user', 'unknown', {
          email,
          reason: 'Invalid credentials',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }, { id: 'unknown', email: 'unknown', name: 'Unknown', role: 'user' } as any, request).catch(() => {})

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