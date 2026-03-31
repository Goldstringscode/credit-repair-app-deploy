import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'
import { requireAuth } from '@/lib/auth'
import { auditLogger } from '@/lib/audit-logger'

export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      // Log logout event
      await auditLogger.log('user_logout', 'user', user.id, {
        email: user.email,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }, user, request)

      const response = NextResponse.json({
        success: true,
        message: 'Logout successful'
      })

      // Clear all auth cookies so middleware stops recognising the session
      const clearOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 0
      }
      response.cookies.set('auth-token', '', clearOpts)
      response.cookies.set('accessToken', '', clearOpts)
      response.cookies.set('refreshToken', '', clearOpts)

      return response

    } catch (error: any) {
      console.error('❌ Logout failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Logout failed',
        message: error.message
      }, { status: 500 })
    }
  }),
  'general'
)

