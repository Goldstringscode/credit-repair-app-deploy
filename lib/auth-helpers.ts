import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export interface AuthUser {
  userId: string
  email: string
  role: string
}

interface JwtPayload {
  userId?: string
  sub?: string
  id?: string
  email: string
  role?: string
  exp?: number
}

export function getAuthenticatedUser(request: NextRequest): AuthUser | null {
  try {
    let token: string | undefined

    // Primary: auth-token cookie
    token = request.cookies.get('auth-token')?.value

    // Fallback: Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7)
      }
    }

    if (!token) return null

    const secret = process.env.JWT_SECRET
    if (!secret) return null

    const decoded = jwt.verify(token, secret) as JwtPayload

    const userId = decoded.userId ?? decoded.sub ?? decoded.id
    if (!userId) return null

    return {
      userId,
      email: decoded.email,
      role: decoded.role ?? 'user',
    }
  } catch {
    return null
  }
}
