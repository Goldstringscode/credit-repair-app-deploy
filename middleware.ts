import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Routes always accessible without auth
const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/admin/login',
    '/signup',
    '/join',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/access-denied',
    '/privacy',
    '/terms',
    '/support',
    '/pricing',
    '/test-communication',
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

// Debug/test route prefixes to block (specific routes, not blanket /test-)
const DEBUG_ROUTE_PREFIXES = [
    '/test-security',
    '/test-advanced-analysis',
    '/test-advanced-billing',
    '/test-ai-letters',
    '/test-auth',
    '/test-billing-summary',
    '/test-compliance',
    '/test-deployment',
    '/test-documentation',
    '/test-emails',
    '/test-env',
    '/test-integration',
    '/test-notifications',
    '/test-openai-status',
    '/test-openai',
    '/test-payment-simple',
    '/test-pdf-processing',
    '/test-recent-improvements',
    '/test-score-extraction',
    '/test-setup',
    '/test-simple',
    '/test-stripe',
    '/test-system',
    '/test-ultimate-analysis',
    '/debug-',
    '/simple-test',
    '/api/test',
    '/api/debug',
    '/api/stripe/test',
    '/api/v2/test',
    '/api/v4/test',
    '/api/mlm/notifications/test',
    '/api/notifications/test',
    '/dashboard/test-automation',
  ]

// JWT verification (Edge-compatible, signature-checked)
// Mirrors lib/jwt.ts signing config exactly: same secret, issuer, audience.
// jsonwebtoken cannot run in the Edge runtime, so we use jose here instead -
// but the trust boundary (HMAC signature + issuer/audience + expiry) is identical.

let cachedSecretKey: Uint8Array | null = null

  function getSecretKey(): Uint8Array {
      if (cachedSecretKey) return cachedSecretKey
      const secret = process.env.JWT_SECRET
      if (!secret) {
            throw new Error('JWT_SECRET environment variable is required')
      }
      cachedSecretKey = new TextEncoder().encode(secret)
      return cachedSecretKey
  }

async function getValidToken(request: NextRequest): Promise<Record<string, unknown> | null> {
    try {
          let token: string | undefined

      token = request.cookies.get('auth-token')?.value

      if (!token) {
              token = request.cookies.get('accessToken')?.value
      }

      if (!token) {
              token = request.cookies.get('sb-access-token')?.value
      }

      if (!token) {
              const allCookies = request.cookies.getAll()
              for (const cookie of allCookies) {
                        if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
                                    try {
                                                  const session = JSON.parse(cookie.value)
                                                  token = session?.access_token
                                    } catch {
                                                  token = cookie.value
                                    }
                                    break
                        }
              }
      }

      if (!token) {
              const authHeader = request.headers.get('authorization')
              if (authHeader?.startsWith('Bearer ')) {
                        token = authHeader.slice(7)
              }
      }

      if (!token) return null

      const { payload } = await jwtVerify(token, getSecretKey(), {
              issuer: 'credit-repair-app',
              audience: 'credit-repair-users',
      })

      return payload as Record<string, unknown>
    } catch {
          return null
    }
}

interface RLEntry { count: number; windowStart: number }
const RL_STORE = new Map<string, RLEntry>()

function rlCleanup() {
  const now = Date.now()
  for (const [key, entry] of RL_STORE) {
    if (now - entry.windowStart > 30 * 60 * 1000) RL_STORE.delete(key)
  }
}

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = RL_STORE.get(key)

if (!entry || now - entry.windowStart >= windowMs) {
  RL_STORE.set(key, { count: 1, windowStart: now })
  if (RL_STORE.size > 10000) rlCleanup()
  return true
}

entry.count++
  if (entry.count > limit) return false
  return true
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

async function checkRateLimitDistributed(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return checkRateLimit(key, limit, windowMs)
  }
  try {
    const res = await fetch(UPSTASH_URL + '/pipeline', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + UPSTASH_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', 'rl:' + key],
        ['PEXPIRE', 'rl:' + key, String(windowMs), 'NX'],
        ]),
      signal: AbortSignal.timeout(800),
    })
    if (!res.ok) {
      return checkRateLimit(key, limit, windowMs)
    }
    const data = await res.json()
    const count = Array.isArray(data) ? Number(data[0]?.result ?? 0) : 0
    if (!count) return checkRateLimit(key, limit, windowMs)
    return count <= limit
  } catch {
    return checkRateLimit(key, limit, windowMs)
  }
}

function getRateLimitKey(request: NextRequest, suffix: string): string {
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  return ip + ':' + suffix
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

  if (DEBUG_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }
    return NextResponse.rewrite(new URL('/not-found', request.url))
  }

  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  if (pathname.startsWith('/api/auth')) {
    if (!(await checkRateLimitDistributed(ip + ':auth', 10, 15 * 60 * 1000))) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait 15 minutes before trying again.' },
        { status: 429, headers: { 'Retry-After': '900' } }
        )
    }
  }
    else if (pathname.startsWith('/api/stripe') || pathname.startsWith('/api/billing') || pathname.startsWith('/api/payments')) {
      if (!(await checkRateLimitDistributed(ip + ':payment', 20, 60 * 1000))) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again shortly.' },
          { status: 429, headers: { 'Retry-After': '60' } }
          )
      }
    }
    else if (pathname.startsWith('/api/admin')) {
      if (!(await checkRateLimitDistributed(ip + ':admin', 60, 60 * 1000))) {
        return NextResponse.json(
          { success: false, error: 'Too many admin requests. Please slow down.' },
          { status: 429, headers: { 'Retry-After': '60' } }
          )
      }
    }
    else if (pathname.startsWith('/api/')) {
      if (!(await checkRateLimitDistributed(ip + ':api', 120, 60 * 1000))) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again shortly.' },
          { status: 429, headers: { 'Retry-After': '60' } }
          )
      }
    }

  if (PUBLIC_ROUTES.some(route => pathname === route || (route !== '/' && pathname.startsWith(route)))) {
    return NextResponse.next()
  }

  const isProtectedApi = PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))
    const isProtectedPage = PROTECTED_PAGE_ROUTES.some(route => pathname.startsWith(route))

  if (!isProtectedApi && !isProtectedPage) {
    return NextResponse.next()
  }

  const payload = await getValidToken(request)

  if (!payload) {
    if (isProtectedApi) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', encodeURIComponent(pathname))
    return NextResponse.redirect(loginUrl)
  }

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

  const userId = (payload.userId ?? payload.sub ?? payload.id) as string | undefined
    const userRole = (payload.role) as string | undefined

  const requestHeaders = new Headers(request.headers)
    if (userId) requestHeaders.set('x-user-id', String(userId))
    if (userRole) requestHeaders.set('x-user-role', String(userRole))

  const response = NextResponse.next({ request: { headers: requestHeaders } })
    if (userId) response.headers.set('x-user-id', String(userId))
    if (userRole) response.headers.set('x-user-role', String(userRole))
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
