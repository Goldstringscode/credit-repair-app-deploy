import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes always accessible without auth
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/join',
  '/verify-email',
  '/access-denied',
  '/privacy',
  '/terms',
  '/support',
  '/pricing',
  '/_next',
  '/favicon.ico',
  '/api/auth',
  '/api/webhooks',
  '/api/public',
  '/api/health',
]

// Page routes that require authentication
const PROTECTED_PAGE_ROUTES = [
  '/dashboard',
  '/admin',
  '/billing',
  '/mlm',
  '/onboarding',
  '/referrals',
  '/affiliate',
  '/attorney',
  '/checkout',
]

// API routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/admin',
  '/api/billing',
  '/api/mlm',
  '/api/disputes',
  '/api/credit-reports',
  '/api/ai',
  '/api/analytics',
  '/api/users',
  '/api/notifications',
  '/api/stripe',
  '/api/certified-mail',
  '/api/invoices',
  '/api/milestones',
  '/api/onboarding',
  '/api/leaderboard',
  '/api/rewards',
  '/api/journey-tracking',
  '/api/credit-monitoring',
  '/api/credit-improvement',
  '/api/sms',
  '/api/email',
  '/api/compliance',
  '/api/affiliate',
  '/api/action-plan',
  '/api/dashboard',
  '/api/training',
]

// Debug/test route prefixes to block
const DEBUG_ROUTE_PREFIXES = [
  '/test-',
  '/debug-',
  '/simple-test',
  '/api/test',
  '/api/debug',
  '/dashboard/test-automation',
]

/**
 * Manually decode a JWT payload (base64url) without external dependencies.
 * Returns the payload object or null if invalid.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const decoded = atob(padded)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * Extract and validate the JWT token from the request.
 * Returns the decoded payload if valid and not expired, null otherwise.
 */
function getValidToken(request: NextRequest): Record<string, unknown> | null {
  try {
    // Try cookies (Supabase stores session in sb-access-token or sb-<project>-auth-token)
    let token: string | undefined

    // Check for sb-access-token cookie first
    token = request.cookies.get('sb-access-token')?.value

    // Check Supabase default session cookie pattern
    if (!token) {
      const cookies = request.cookies.getAll()
      for (const cookie of cookies) {
        if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
          try {
            // Supabase stores the session as JSON in this cookie
            const session = JSON.parse(cookie.value)
            token = session?.access_token
          } catch {
            token = cookie.value
          }
          break
        }
      }
    }

    // Fallback: Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7)
      }
    }

    if (!token) return null

    const payload = decodeJwtPayload(token)
    if (!payload) return null

    // Check expiry
    const exp = payload.exp as number | undefined
    if (exp && Date.now() / 1000 > exp) return null

    return payload
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Block debug/test routes immediately with 404
    if (DEBUG_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 })
      }
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }

    // Allow public routes
    if (PUBLIC_ROUTES.some(route => pathname === route || (route !== '/' && pathname.startsWith(route)))) {
      return NextResponse.next()
    }

    // Check if this is a protected API route
    const isProtectedApi = PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))
    // Check if this is a protected page route
    const isProtectedPage = PROTECTED_PAGE_ROUTES.some(route => pathname.startsWith(route))

    if (!isProtectedApi && !isProtectedPage) {
      return NextResponse.next()
    }

    // Validate the JWT token
    const payload = getValidToken(request)

    if (!payload) {
      // Unauthenticated request
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      // Redirect page requests to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', encodeURIComponent(pathname))
      return NextResponse.redirect(loginUrl)
    }

    // Admin route extra protection: check for admin role in JWT
    const isAdminPage = pathname.startsWith('/admin')
    const isAdminApi = pathname.startsWith('/api/admin')
    if (isAdminPage || isAdminApi) {
      const role = payload.role as string | undefined
      if (role !== 'admin') {
        if (isAdminApi) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/access-denied', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    // Safety net: never break the app due to middleware errors
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
