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

// ── JWT verification (Edge-compatible, signature-checked) ──────────────────
// Mirrors lib/jwt.ts's signing config exactly: same secret, issuer, audience.
// jsonwebtoken cannot run in the Edge runtime, so we use `jose` here instead —
// but the trust boundary (HMAC signature + issuer/audience + expiry) is identical.

let cachedSecretKey: Uint8Array | null = null

function getSecretKey(): Uint8Array {
  if (cachedSecretKey) return cachedSecretKey
  const secret = process.env.JWT_SECRET
  if (!secret) {
    // Fail loudly — never run with auth disabled because a secret is missing.
    throw new Error('JWT_SECRET environment variable is required')
  }
  cachedSecretKey = new TextEncoder().encode(secret)
  return cachedSecretKey
}

/**
 * Verify the JWT's signature, issuer, audience, and expiry.
 * Returns the verified payload, or null if the token is missing, malformed,
 * unsigned-or-mis-signed, expired, or fails issuer/audience checks.
 */
async function getValidToken(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    let token: string | undefined

    // Primary: check the app's own auth-token cookie (set by /api/auth routes)
    token = request.cookies.get('auth-token')?.value

    // Fallback: app's accessToken cookie (legacy name used by createTokenCookies)
    if (!token) {
      token = request.cookies.get('accessToken')?.value
    }

    // Fallback: Supabase sb-access-token cookie
    if (!token) {
      token = request.cookies.get('sb-access-token')?.value
    }

    // Fallback: Supabase default session cookie pattern (sb-<project>-auth-token)
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

    // Fallback: Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7)
      }
    }

    if (!token) return null

    // jwtVerify checks: signature validity, exp, and (since we pass them) iss/aud.
    // Throws on any failure — caught below, treated as unauthenticated.
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: 'credit-repair-app',
      audience: 'credit-repair-users',
    })

    return payload as Record<string, unknown>
  } catch {
    // Any verification failure (bad signature, expired, wrong issuer/audience,
    // malformed token) is treated as "not authenticated" — same as before,
    // but now the bar to pass is an actual valid signature, not just shape.
    return null
  }
}

// ── In-memory rate limiter (sliding window per IP) ─────────────────────────
// Limits protect against brute force on auth, payment, and admin routes.
// Uses a Map of { count, windowStart } per key — resets per Edge instance
// which is acceptable: per-instance limits still block single-IP attacks.

interface RLEntry { count: number; windowStart: number }
const RL_STORE = new Map<string, RLEntry>()

// Clean up entries older than 2x the longest window to prevent memory growth
function rlCleanup() {
  const now = Date.now()
  for (const [key, entry] of RL_STORE) {
    if (now - entry.windowStart > 30 * 60 * 1000) RL_STORE.delete(key)
  }
}

/**
 * Check rate limit. Returns true if request is allowed, false if rate limited.
 * @param key Unique key (e.g. "ip:auth" or "ip:admin")
 * @param limit Max requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = RL_STORE.get(key)

  if (!entry || now - entry.windowStart >= windowMs) {
    // New window
    RL_STORE.set(key, { count: 1, windowStart: now })
    if (RL_STORE.size > 10000) rlCleanup() // keep memory bounded
    return true
  }

  entry.count++
  if (entry.count > limit) return false
  return true
}

// Distributed rate limiter backed by Upstash Redis REST (Edge-compatible, fetch-based).
// Falls back to the in-memory checkRateLimit when Upstash env vars are not configured,
// so behavior is unchanged until UPSTASH_REDIS_REST_URL / _TOKEN are provisioned.
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

async function checkRateLimitDistributed(key: string, limit: number, windowMs: number): Promise<boolean> {
  // No Redis configured → use the per-instance limiter (best-effort).
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return checkRateLimit(key, limit, windowMs)
  }
  try {
    // Atomic INCR; set the expiry only on the first hit of a window (NX).
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
      // Never let the limiter hang the request path.
      signal: AbortSignal.timeout(800),
    })
    if (!res.ok) {
      // Redis unhappy → fail OPEN (allow) rather than locking users out.
      return checkRateLimit(key, limit, windowMs)
    }
    const data = await res.json()
    const count = Array.isArray(data) ? Number(data[0]?.result ?? 0) : 0
    if (!count) return checkRateLimit(key, limit, windowMs)
    return count <= limit
  } catch {
    // Network error / timeout → fail open via the local limiter.
    return checkRateLimit(key, limit, windowMs)
  }
}

function getRateLimitKey(request: NextRequest, suffix: string): string {
  // Prefer CF-Connecting-IP (set by Cloudflare/Vercel), fall back to x-forwarded-for
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

    // Block debug/test routes immediately with 404
    if (DEBUG_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 })
      }
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }

    // ── Rate limiting ───────────────────────────────────────────────────────
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'

    // Auth routes: 10 req / 15 min (brute force protection)
    if (pathname.startsWith('/api/auth')) {
      if (!(await checkRateLimitDistributed(ip + ':auth', 10, 15 * 60 * 1000))) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please wait 15 minutes before trying again.' },
          { status: 429, headers: { 'Retry-After': '900' } }
        )
      }
    }
    // Payment routes: 20 req / min
    else if (pathname.startsWith('/api/stripe') || pathname.startsWith('/api/billing') || pathname.startsWith('/api/payments')) {
      if (!(await checkRateLimitDistributed(ip + ':payment', 20, 60 * 1000))) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again shortly.' },
          { status: 429, headers: { 'Retry-After': '60' } }
        )
      }
    }
    // Admin routes: 60 req / min
    else if (pathname.startsWith('/api/admin')) {
      if (!(await checkRateLimitDistributed(ip + ':admin', 60, 60 * 1000))) {
        return NextResponse.json(
          { success: false, error: 'Too many admin requests. Please slow down.' },
          { status: 429, headers: { 'Retry-After': '60' } }
        )
      }
    }
    // All other API routes: 120 req / min
    else if (pathname.startsWith('/api/')) {
      if (!(await checkRateLimitDistributed(ip + ':api', 120, 60 * 1000))) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again shortly.' },
          { status: 429, headers: { 'Retry-After': '60' } }
        )
      }
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

    // Validate the JWT token (signature, issuer, audience, expiry — all checked)
    const payload = await getValidToken(request)

    if (!payload) {
      // Unauthenticated request
      if (isProtectedApi) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
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

    // Forward request with user identity headers derived from JWT payload
    const userId = (payload.userId ?? payload.sub ?? payload.id) as string | undefined
    const userRole = (payload.role) as string | undefined

    // Build modified request headers so route handlers can read them
    const requestHeaders = new Headers(request.headers)
    if (userId) requestHeaders.set('x-user-id', String(userId))
    if (userRole) requestHeaders.set('x-user-role', String(userRole))

    const response = NextResponse.next({ request: { headers: requestHeaders } })
    // Also set on the response so the browser/client can see them if needed
    if (userId) response.headers.set('x-user-id', String(userId))
    if (userRole) response.headers.set('x-user-role', String(userRole))
    return response
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
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

/**
 * Manually decode a JWT payload (base64url) without external dependencies.
 * Returns the payload object or null if invalid.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Extract and validate the JWT token from the request.
 * Returns the decoded payload if valid and not expired, null otherwise.
 */
function getValidToken(request: NextRequest): Record<string, unknown> | null {
  try {
    let token: string | undefined;

    // Primary: check the app's own auth-token cookie (set by /api/auth routes)
    token = request.cookies.get('auth-token')?.value;

    // Fallback: app's accessToken cookie (legacy name used by createTokenCookies)
    if (!token) {
      token = request.cookies.get('accessToken')?.value;
    }

    // Fallback: Supabase sb-access-token cookie
    if (!token) {
      token = request.cookies.get('sb-access-token')?.value;
    }

    // Fallback: Supabase default session cookie pattern (sb-<project>-auth-token)
    if (!token) {
      const allCookies = request.cookies.getAll();
      for (const cookie of allCookies) {
        if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
          try {
            const session = JSON.parse(cookie.value);
            token = session?.access_token;
          } catch {
            token = cookie.value;
          }
          break;
        }
      }
    }

    // Fallback: Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload) return null;

    // Check expiry
    const exp = payload.exp as number | undefined;
    if (exp && Date.now() / 1000 > exp) return null;

    return payload;
  } catch {
    return null;
  }
}


// ── In-memory rate limiter (sliding window per IP) ─────────────────────────
// Limits protect against brute force on auth, payment, and admin routes.
// Uses a Map of { count, windowStart } per key — resets per Edge instance
// which is acceptable: per-instance limits still block single-IP attacks.

interface RLEntry { count: number; windowStart: number }
const RL_STORE = new Map<string, RLEntry>()

// Clean up entries older than 2x the longest window to prevent memory growth
function rlCleanup() {
  const now = Date.now()
  for (const [key, entry] of RL_STORE) {
    if (now - entry.windowStart > 30 * 60 * 1000) RL_STORE.delete(key)
  }
}

/**
 * Check rate limit. Returns true if request is allowed, false if rate limited.
 * @param key      Unique key (e.g. "ip:auth" or "ip:admin")
 * @param limit    Max requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = RL_STORE.get(key)

  if (!entry || now - entry.windowStart >= windowMs) {
    // New window
    RL_STORE.set(key, { count: 1, windowStart: now })
    if (RL_STORE.size > 10000) rlCleanup() // keep memory bounded
    return true
  }

  entry.count++
  if (entry.count > limit) return false
  return true
}

// Distributed rate limiter backed by Upstash Redis REST (Edge-compatible, fetch-based).
// Falls back to the in-memory checkRateLimit when Upstash env vars are not configured,
// so behavior is unchanged until UPSTASH_REDIS_REST_URL / _TOKEN are provisioned.
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

async function checkRateLimitDistributed(key: string, limit: number, windowMs: number): Promise<boolean> {
  // No Redis configured → use the per-instance limiter (best-effort).
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return checkRateLimit(key, limit, windowMs)
  }
  try {
    // Atomic INCR; set the expiry only on the first hit of a window (NX).
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
      // Never let the limiter hang the request path.
      signal: AbortSignal.timeout(800),
    })
    if (!res.ok) {
      // Redis unhappy → fail OPEN (allow) rather than locking users out.
      return checkRateLimit(key, limit, windowMs)
    }
    const data = await res.json()
    const count = Array.isArray(data) ? Number(data[0]?.result ?? 0) : 0
    if (!count) return checkRateLimit(key, limit, windowMs)
    return count <= limit
  } catch {
    // Network error / timeout → fail open via the local limiter.
    return checkRateLimit(key, limit, windowMs)
  }
}

function getRateLimitKey(request: NextRequest, suffix: string): string {
  // Prefer CF-Connecting-IP (set by Cloudflare/Vercel), fall back to x-forwarded-for
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  return ip + ':' + suffix
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Block debug/test routes immediately with 404
    if (DEBUG_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }

    // ── Rate limiting ────────────────────────────────────────────────────────
    // (pathname extracted below in auth section; ip extracted here)
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'

    // Auth routes: 10 req / 15 min (brute force protection)
    if (pathname.startsWith('/api/auth')) {
      if (!(await checkRateLimitDistributed(ip + ':auth', 10, 15 * 60 * 1000))) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please wait 15 minutes before trying again.' },
          { status: 429, headers: { 'Retry-After': '900' } }
        )
      }
    }
    // Payment routes: 20 req / min
    else if (pathname.startsWith('/api/stripe') || pathname.startsWith('/api/billing') || pathname.startsWith('/api/payments')) {
      if (!(await checkRateLimitDistributed(ip + ':payment', 20, 60 * 1000))) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again shortly.' },
          { status: 429, headers: { 'Retry-After': '60' } }
        )
      }
    }
    // Admin routes: 60 req / min
    else if (pathname.startsWith('/api/admin')) {
      if (!(await checkRateLimitDistributed(ip + ':admin', 60, 60 * 1000))) {
        return NextResponse.json(
          { success: false, error: 'Too many admin requests. Please slow down.' },
          { status: 429, headers: { 'Retry-After': '60' } }
        )
      }
    }
    // All other API routes: 120 req / min
    else if (pathname.startsWith('/api/')) {
      if (!(await checkRateLimitDistributed(ip + ':api', 120, 60 * 1000))) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again shortly.' },
          { status: 429, headers: { 'Retry-After': '60' } }
        )
      }
    }

    // Allow public routes
    if (PUBLIC_ROUTES.some(route => pathname === route || (route !== '/' && pathname.startsWith(route)))) {
      return NextResponse.next();
    }

    // Check if this is a protected API route
    const isProtectedApi = PROTECTED_API_ROUTES.some(route => pathname.startsWith(route));
    // Check if this is a protected page route
    const isProtectedPage = PROTECTED_PAGE_ROUTES.some(route => pathname.startsWith(route));

    if (!isProtectedApi && !isProtectedPage) {
      return NextResponse.next();
    }

    // Validate the JWT token
    const payload = getValidToken(request);

    if (!payload) {
      // Unauthenticated request
      if (isProtectedApi) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      // Redirect page requests to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }

    // Admin route extra protection: check for admin role in JWT
    const isAdminPage = pathname.startsWith('/admin');
    const isAdminApi = pathname.startsWith('/api/admin');
    if (isAdminPage || isAdminApi) {
      const role = payload.role as string | undefined;
      if (role !== 'admin') {
        if (isAdminApi) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/access-denied', request.url));
      }
    }

    // Forward request with user identity headers derived from JWT payload
    const userId = (payload.userId ?? payload.sub ?? payload.id) as string | undefined;
    const userRole = (payload.role) as string | undefined;

    // Build modified request headers so route handlers can read them
    const requestHeaders = new Headers(request.headers);
    if (userId) requestHeaders.set('x-user-id', String(userId));
    if (userRole) requestHeaders.set('x-user-role', String(userRole));

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    // Also set on the response so the browser/client can see them if needed
    if (userId) response.headers.set('x-user-id', String(userId));
    if (userRole) response.headers.set('x-user-role', String(userRole));
    return response;
  } catch (error) {
    // Safety net: never break the app due to middleware errors
    console.error('Middleware error:', error);
    return NextResponse.next();
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
