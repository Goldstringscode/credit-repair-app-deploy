import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, extractTokenFromHeader, isTokenExpired } from './jwt'

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
    const accessToken = cookieStore.get('auth-token')?.value || cookieStore.get('accessToken')?.value
    
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
    
    // Look up user in Supabase
    const { getSupabaseClient } = await import('./supabase-client')
    const supabase = getSupabaseClient()
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, subscription_status, subscription_tier, stripe_customer_id, created_at, updated_at')
      .eq('id', payload.userId)
      .maybeSingle()

    if (dbError || !dbUser) {
      return {
        user: null,
        isAuthenticated: false,
        error: 'User not found'
      }
    }

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: [dbUser.first_name, dbUser.last_name].filter(Boolean).join(' ') || dbUser.email,
        role: (payload.role as 'user' | 'admin') ?? 'user',
        subscriptionId: dbUser.subscription_status ?? undefined,
        customerId: dbUser.stripe_customer_id ?? undefined,
        createdAt: dbUser.created_at ?? new Date().toISOString(),
        updatedAt: dbUser.updated_at ?? new Date().toISOString(),
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
export function requireAuth(handler: (request: NextRequest, user: User) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await getCurrentUser(request)
    
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        message: authResult.error || 'Please log in to access this resource'
      }, { status: 401 })
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
