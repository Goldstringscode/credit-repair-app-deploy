import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { generateTokenPair, createTokenCookies } from '@/lib/jwt'
import { database } from '@/lib/database-config'
import { emailService } from '@/lib/email-service-server'
import { auditLogger } from '@/lib/audit-logger'
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

        // Check if user already exists
        const existingUser = await database.getUser(email) // Using email as ID for demo
        if (existingUser) {
          return NextResponse.json({
            success: false,
            error: 'User already exists',
            message: 'An account with this email already exists'
          }, { status: 409 })
        }

        // In production, you would:
        // 1. Hash the password with bcrypt
        // 2. Validate password strength
        // 3. Send email verification
        // 4. Create customer in payment provider

        // Create new user
        const user = await database.createUser({
          email,
          name,
          role: 'user',
          customerId: `cus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          subscriptionId: undefined // No subscription yet
        })

        // Generate JWT tokens
        const tokens = generateTokenPair(user)
        const cookies = createTokenCookies(tokens)

        // Log registration event
        await auditLogger.log('user_registered', 'user', user.id, {
          email: user.email,
          name: user.name,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }, user, request)

        // Send welcome email
        await emailService.sendBillingNotification(user, 'subscription_created', {
          planName: 'Welcome to Credit Repair App',
          billingCycle: 'Get started with a free trial',
          nextBillingDate: 'No subscription yet'
        })

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          message: 'Registration successful'
        }, {
          headers: {
            'Set-Cookie': `${cookies.accessToken}; ${cookies.refreshToken}`
          }
        })

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