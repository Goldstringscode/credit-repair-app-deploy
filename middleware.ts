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
  '/api/admin/seed',
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

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Block debug/test routes immediately with 404
    if (DEBUG_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
      return NextResponse.rewrite(new URL('/not-found', request.url));
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