import { NextRequest, NextResponse } from 'next/server'

interface CorsOptions {
  origin?: string | string[] | ((origin: string) => boolean)
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
  preflightContinue?: boolean
  optionsSuccessStatus?: number
}

/**
 * Build the allowed-origins list from environment variables.
 * Reads ALLOWED_ORIGINS (comma-separated) first; falls back to NEXT_PUBLIC_APP_URL.
 */
function getAllowedOriginsFromEnv(): string[] {
  const raw = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGINS
  if (raw) {
    return raw.split(',').map(o => o.trim()).filter(Boolean)
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl) {
    // Also allow the www subdomain variant when the URL doesn't already have www
    const url = appUrl.replace(/\/$/, '')
    const origins = [url]
    if (!url.includes('://www.')) {
      origins.push(url.replace('://', '://www.'))
    }
    return origins
  }
  return []
}

const defaultOptions: CorsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? getAllowedOriginsFromEnv()
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Forwarded-For',
    'X-Real-IP',
    'User-Agent',
    'Cache-Control',
    'Pragma',
    'Expires'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Total-Count',
    'X-Page-Count'
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
}

function isOriginAllowed(origin: string, allowedOrigins: string | string[] | ((origin: string) => boolean)): boolean {
  if (typeof allowedOrigins === 'string') {
    return origin === allowedOrigins
  }
  
  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.includes(origin)
  }
  
  if (typeof allowedOrigins === 'function') {
    return allowedOrigins(origin)
  }
  
  return false
}

function setCorsHeaders(response: NextResponse, origin: string, options: CorsOptions = defaultOptions): NextResponse {
  // Set origin header
  if (isOriginAllowed(origin, options.origin || defaultOptions.origin!)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  } else {
    response.headers.set('Access-Control-Allow-Origin', 'null')
  }

  // Set credentials header
  if (options.credentials !== false) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  // Set methods header
  const methods = options.methods || defaultOptions.methods!
  response.headers.set('Access-Control-Allow-Methods', methods.join(', '))

  // Set allowed headers
  const allowedHeaders = options.allowedHeaders || defaultOptions.allowedHeaders!
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))

  // Set exposed headers
  const exposedHeaders = options.exposedHeaders || defaultOptions.exposedHeaders!
  response.headers.set('Access-Control-Expose-Headers', exposedHeaders.join(', '))

  // Set max age
  const maxAge = options.maxAge || defaultOptions.maxAge!
  response.headers.set('Access-Control-Max-Age', maxAge.toString())

  return response
}

export function cors(options: CorsOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options }

  return function (handler: (request: NextRequest) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const origin = request.headers.get('Origin') || ''
      const method = request.method

      // Handle preflight requests
      if (method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 })
        return setCorsHeaders(response, origin, mergedOptions)
      }

      // Check if origin is allowed
      if (origin && !isOriginAllowed(origin, mergedOptions.origin!)) {
        return new NextResponse(
          JSON.stringify({ error: 'CORS policy violation: Origin not allowed' }),
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'null'
            }
          }
        )
      }

      // Process the request
      const response = await handler(request)

      // Set CORS headers on the response
      return setCorsHeaders(response, origin, mergedOptions)
    }
  }
}

// CORS middleware for API routes
export function withCors(options: CorsOptions = {}) {
  return cors(options)
}

// CORS configuration for different environments
export const corsConfigs = {
  development: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  },
  
  staging: {
    origin: getAllowedOriginsFromEnv(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  },
  
  production: {
    origin: getAllowedOriginsFromEnv(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  }
}

// Get CORS config based on environment
export function getCorsConfig(): CorsOptions {
  const env = process.env.NODE_ENV || 'development'
  return corsConfigs[env as keyof typeof corsConfigs] || corsConfigs.development
}

// CORS preflight handler
export function handleCorsPreflight(request: NextRequest): NextResponse {
  const origin = request.headers.get('Origin') || ''
  const config = getCorsConfig()
  
  const response = new NextResponse(null, { status: 200 })
  return setCorsHeaders(response, origin, config)
}

// CORS error response
export function corsError(message: string = 'CORS policy violation'): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: message }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'null'
      }
    }
  )
}

// Validate CORS origin
export function validateCorsOrigin(origin: string): boolean {
  const config = getCorsConfig()
  return isOriginAllowed(origin, config.origin!)
}

// CORS headers for static files
export function setCorsHeadersForStatic(response: NextResponse, origin: string): NextResponse {
  const config = getCorsConfig()
  
  if (isOriginAllowed(origin, config.origin!)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  return response
}

