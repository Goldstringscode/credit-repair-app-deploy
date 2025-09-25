import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, extractTokenFromHeader, isTokenExpired } from './jwt'
import { database } from './database-config'

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  subscriptionId?: string
  customerId?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResult {
  user: User | null
  isAuthenticated: boolean
  error?: string
}

/**
 * Get current user from request using JWT authentication
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthResult> {
  try {
    // Extract JWT token from Authorization header or cookies
    const authHeader = request.headers.get('authorization')
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value
    
    let token: string | null = null
    
    if (authHeader) {
      token = extractTokenFromHeader(authHeader)
    } else if (accessToken) {
      token = accessToken
    }
    
    if (!token) {
      return {
        user: null,
        isAuthenticated: false,
        error: 'No authentication token provided'
      }
    }
    
    // Verify JWT token
    const payload = verifyToken(token)
    if (!payload) {
      return {
        user: null,
        isAuthenticated: false,
        error: 'Invalid or expired token'
      }
    }
    
    // Check if token is expired
    if (isTokenExpired(payload)) {
      return {
        user: null,
        isAuthenticated: false,
        error: 'Token has expired'
      }
    }
    
    // Get user from database
    const user = await database.getUser(payload.userId)
    if (!user) {
      return {
        user: null,
        isAuthenticated: false,
        error: 'User not found'
      }
    }
    
    // Check if user is active (you might want to add an 'active' field)
    if (user.role === 'banned' || user.role === 'suspended') {
      return {
        user: null,
        isAuthenticated: false,
        error: 'User account is not active'
      }
    }
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'user' | 'admin',
        subscriptionId: user.subscriptionId,
        customerId: user.customerId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      isAuthenticated: true
    }
    
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      user: null,
      isAuthenticated: false,
      error: 'Authentication failed'
    }
  }
}

/**
 * Require authentication for API routes
 */
export function requireAuth(handler: (request: NextRequest, user: User) => Promise<Response | NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await getCurrentUser(request)
    
    if (!authResult.isAuthenticated || !authResult.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication required',
          message: authResult.error || 'Please log in to access this resource'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    return handler(request, authResult.user)
  }
}

/**
 * Require admin role for API routes
 */
export function requireAdmin(handler: (request: NextRequest, user: User) => Promise<Response>) {
  return async (request: NextRequest) => {
    const authResult = await getCurrentUser(request)
    
    if (!authResult.isAuthenticated || !authResult.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to access this resource'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    if (authResult.user.role !== 'admin') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required'
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    return handler(request, authResult.user)
  }
}
