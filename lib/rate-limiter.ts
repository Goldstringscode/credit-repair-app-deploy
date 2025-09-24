import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimitStore = {}
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key]
      }
    })
  }

  private getKey(request: NextRequest): string {
    // Use IP address as the key, with fallback to user agent
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    return ip
  }

  isAllowed(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getKey(request)
    const now = Date.now()
    const windowMs = this.config.windowMs
    const maxRequests = this.config.maxRequests

    if (!this.store[key] || this.store[key].resetTime < now) {
      // First request or window expired
      this.store[key] = {
        count: 1,
        resetTime: now + windowMs
      }
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: this.store[key].resetTime
      }
    }

    if (this.store[key].count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.store[key].resetTime
      }
    }

    this.store[key].count++
    return {
      allowed: true,
      remaining: maxRequests - this.store[key].count,
      resetTime: this.store[key].resetTime
    }
  }
}

// Create different rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiting
  general: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // 1000 requests per window (increased for testing)
    message: 'Too many requests from this IP, please try again later.'
  }),

  // Strict rate limiting for auth endpoints
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50, // 50 login attempts per window (increased for testing)
    message: 'Too many authentication attempts, please try again later.'
  }),

  // Rate limiting for file uploads
  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 uploads per hour
    message: 'Too many file uploads, please try again later.'
  }),

  // Rate limiting for AI requests
  ai: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 AI requests per minute
    message: 'Too many AI requests, please wait before trying again.'
  }),

  // Rate limiting for dispute generation
  disputes: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 dispute letters per hour
    message: 'Too many dispute letters generated, please try again later.'
  }),

  // Rate limiting for testing (very permissive)
  test: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000, // 1000 requests per minute
    message: 'Too many test requests, please wait before trying again.'
  })
}

export function withRateLimit(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  limiterType: keyof typeof rateLimiters = 'general'
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const limiter = rateLimiters[limiterType]
    const { allowed, remaining, resetTime } = limiter.isAllowed(request)

    if (!allowed) {
      const resetTimeSeconds = Math.ceil((resetTime - Date.now()) / 1000)
      
      return NextResponse.json(
        {
          error: limiter.config.message || 'Rate limit exceeded',
          retryAfter: resetTimeSeconds
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetTimeSeconds.toString(),
            'X-RateLimit-Limit': limiter.config.maxRequests.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': resetTime.toString()
          }
        }
      )
    }

    // Add rate limit headers to successful responses
    const response = await handler(request, context)
    response.headers.set('X-RateLimit-Limit', limiter.config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', resetTime.toString())

    return response
  }
}

// Middleware for Next.js middleware.ts
export function rateLimitMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Apply different rate limits based on the endpoint
  if (pathname.startsWith('/api/auth/')) {
    const { allowed } = rateLimiters.auth.isAllowed(request)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many authentication attempts' },
        { status: 429 }
      )
    }
  } else if (pathname.startsWith('/api/upload/')) {
    const { allowed } = rateLimiters.upload.isAllowed(request)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many file uploads' },
        { status: 429 }
      )
    }
  } else if (pathname.startsWith('/api/ai/')) {
    const { allowed } = rateLimiters.ai.isAllowed(request)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many AI requests' },
        { status: 429 }
      )
    }
  } else if (pathname.startsWith('/api/disputes/')) {
    const { allowed } = rateLimiters.disputes.isAllowed(request)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many dispute requests' },
        { status: 429 }
      )
    }
  } else if (pathname.startsWith('/api/')) {
    const { allowed } = rateLimiters.general.isAllowed(request)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}

