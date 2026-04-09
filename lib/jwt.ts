import jwt from 'jsonwebtoken'
import { User } from './types'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return secret
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'credit-repair-app',
    audience: 'credit-repair-users'
  })
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: '30d', // Refresh tokens last longer
    issuer: 'credit-repair-app',
    audience: 'credit-repair-users'
  })
}

/**
 * Generate token pair (access + refresh)
 */
export function generateTokenPair(user: User): TokenPair {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  }
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: 'credit-repair-app',
      audience: 'credit-repair-users'
    }) as JWTPayload

    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }
  
  return parts[1]
}

/**
 * Check if token is expired
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  if (!payload.exp) return true
  
  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}

/**
 * Get token expiration date
 */
export function getTokenExpiration(payload: JWTPayload): Date | null {
  if (!payload.exp) return null
  
  return new Date(payload.exp * 1000)
}

/**
 * Create secure HTTP-only cookies for tokens
 */
export function createTokenCookies(tokens: TokenPair): { accessToken: string; refreshToken: string } {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }

  const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }

  const accessTokenCookie = `accessToken=${tokens.accessToken}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=strict; Path=/; Max-Age=${Math.floor(cookieOptions.maxAge / 1000)}`
  const refreshTokenCookie = `refreshToken=${tokens.refreshToken}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=strict; Path=/; Max-Age=${Math.floor(refreshCookieOptions.maxAge / 1000)}`

  return {
    accessToken: accessTokenCookie,
    refreshToken: refreshTokenCookie
  }
}

/**
 * Clear token cookies
 */
export function clearTokenCookies(): { accessToken: string; refreshToken: string } {
  return {
    accessToken: 'accessToken=; HttpOnly; Secure; SameSite=strict; Path=/; Max-Age=0',
    refreshToken: 'refreshToken=; HttpOnly; Secure; SameSite=strict; Path=/; Max-Age=0'
  }
}
