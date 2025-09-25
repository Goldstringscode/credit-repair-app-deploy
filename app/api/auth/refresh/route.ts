import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'
import { verifyToken, generateTokenPair, createTokenCookies } from '@/lib/jwt'
import { database } from '@/lib/database-config'
import { cookies } from 'next/headers'

export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      const cookieStore = await cookies()
      const refreshToken = cookieStore.get('refreshToken')?.value

      if (!refreshToken) {
        return NextResponse.json({
          success: false,
          error: 'No refresh token provided',
          message: 'Please log in again'
        }, { status: 401 })
      }

      // Verify refresh token
      const payload = verifyToken(refreshToken)
      if (!payload) {
        return NextResponse.json({
          success: false,
          error: 'Invalid refresh token',
          message: 'Please log in again'
        }, { status: 401 })
      }

      // Get user from database
      const user = await database.getUser(payload.userId)
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found',
          message: 'Please log in again'
        }, { status: 401 })
      }

      // Generate new token pair
      const tokens = generateTokenPair(user)
      const tokenCookies = createTokenCookies(tokens)

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        message: 'Tokens refreshed successfully'
      }, {
        headers: {
          'Set-Cookie': `${tokenCookies.accessToken}; ${tokenCookies.refreshToken}`
        }
      })

    } catch (error: any) {
      console.error('❌ Token refresh failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Token refresh failed',
        message: error.message
      }, { status: 500 })
    }
  },
  'general'
)

