import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { generateTokenPair, createTokenCookies } from '@/lib/jwt'
import { database } from '@/lib/database-config'
import { emailService } from '@/lib/email-service'
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

        // In production, you would:
        // 1. Hash the password with bcrypt
        // 2. Compare with stored hash
        // 3. Use proper password validation
        
        // For now, we'll use a simple demo authentication
        if (email === 'demo@example.com' && password === 'demo123') {
          // Get or create demo user
          let user = await database.getUser('demo-user-123')
          if (!user) {
            user = await database.createUser({
              email: 'demo@example.com',
              name: 'Demo User',
              role: 'user',
              customerId: 'cus_demo_123',
              subscriptionId: 'sub_demo_123'
            })
          }

          // Generate JWT tokens
          const tokens = generateTokenPair(user)
          const cookies = createTokenCookies(tokens)

          // Log authentication event
          await auditLogger.log('user_login', 'user', user.id, {
            email: user.email,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }, user, request)

          // Send login confirmation email
          await emailService.sendBillingNotification(user, 'subscription_created', {
            planName: 'Demo Plan',
            billingCycle: 'Monthly',
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
          })

          return NextResponse.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            },
            token: tokens.accessToken,
            message: 'Login successful'
          }, {
            headers: {
              'Set-Cookie': [cookies.accessToken, cookies.refreshToken]
            }
          })
        }

        // Invalid credentials
        await auditLogger.log('login_failed', 'user', 'unknown', {
          email,
          reason: 'Invalid credentials',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }, { id: 'unknown', email: 'unknown', name: 'Unknown', role: 'user' } as any, request)

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