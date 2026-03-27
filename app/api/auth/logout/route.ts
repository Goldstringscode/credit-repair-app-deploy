import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'
import { requireAuth } from '@/lib/auth'
import { clearTokenCookies } from '@/lib/jwt'
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

      // Clear token cookies
      const cookies = clearTokenCookies()

      return NextResponse.json({
        success: true,
        message: 'Logout successful'
      }, {
        headers: {
          'Set-Cookie': `${cookies.accessToken}, ${cookies.refreshToken}`
        }
      })

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

