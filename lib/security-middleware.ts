import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from './rate-limiter'
import { withCors } from './cors'
import { withValidation } from './validation-middleware'
import { auditLogger, logSecurityEvent } from './audit-logger'
import { encryptionService } from './encryption'
import jwt from 'jsonwebtoken'

interface SecurityConfig {
  requireAuth?: boolean
  requireApiKey?: boolean
  allowedRoles?: string[]
  rateLimit?: boolean
  cors?: boolean
  validation?: boolean
  audit?: boolean
  encryption?: boolean
}

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: string
    subscriptionTier: string
  }
}

class SecurityMiddleware {
  private apiKeys: Set<string> = new Set()
  private blockedIPs: Set<string> = new Set()
  private suspiciousIPs: Map<string, { count: number; lastSeen: Date }> = new Map()

  constructor() {
    // Load API keys from environment
    const apiKeys = process.env.API_KEYS?.split(',') || []
    apiKeys.forEach(key => this.apiKeys.add(key))

    // Load blocked IPs from environment
    const blockedIPs = process.env.BLOCKED_IPS?.split(',') || []
    blockedIPs.forEach(ip => this.blockedIPs.add(ip))
  }

  /**
   * Main security middleware
   */
  withSecurity(config: SecurityConfig = {}) {
    return function (handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
      return async (request: NextRequest): Promise<NextResponse> => {
        try {
          // 1. IP Blocking
          const clientIP = this.getClientIP(request)
          if (this.blockedIPs.has(clientIP)) {
            logSecurityEvent('unauthorized_access', request, { reason: 'blocked_ip', ip: clientIP })
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
          }

          // 2. Suspicious Activity Detection
          if (this.isSuspiciousActivity(request)) {
            logSecurityEvent('suspicious_activity', request, { ip: clientIP })
            return NextResponse.json({ error: 'Suspicious activity detected' }, { status: 429 })
          }

          // 3. API Key Validation
          if (config.requireApiKey) {
            const apiKey = request.headers.get('x-api-key')
            if (!apiKey || !this.apiKeys.has(apiKey)) {
              logSecurityEvent('unauthorized_access', request, { reason: 'invalid_api_key' })
              return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
            }
          }

          // 4. Authentication
          if (config.requireAuth) {
            const authResult = await this.authenticate(request)
            if (!authResult.success) {
              logSecurityEvent('unauthorized_access', request, { reason: 'authentication_failed' })
              return NextResponse.json({ error: authResult.error }, { status: 401 })
            }
            (request as AuthenticatedRequest).user = authResult.user
          }

          // 5. Role-based Authorization
          if (config.allowedRoles && (request as AuthenticatedRequest).user) {
            const user = (request as AuthenticatedRequest).user!
            if (!config.allowedRoles.includes(user.role)) {
              logSecurityEvent('unauthorized_access', request, { 
                reason: 'insufficient_permissions', 
                userId: user.id,
                requiredRoles: config.allowedRoles,
                userRole: user.role
              })
              return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
            }
          }

          // 6. Rate Limiting
          if (config.rateLimit !== false) {
            const rateLimitResult = this.checkRateLimit(request)
            if (!rateLimitResult.allowed) {
              logSecurityEvent('rate_limit_exceeded', request, { ip: clientIP })
              return NextResponse.json({ 
                error: 'Rate limit exceeded',
                retryAfter: rateLimitResult.retryAfter
              }, { status: 429 })
            }
          }

          // 7. CORS
          if (config.cors !== false) {
            const corsResult = this.checkCORS(request)
            if (!corsResult.allowed) {
              return NextResponse.json({ error: 'CORS policy violation' }, { status: 403 })
            }
          }

          // 8. Request Validation
          if (config.validation !== false) {
            const validationResult = this.validateRequest(request)
            if (!validationResult.valid) {
              return NextResponse.json({ 
                error: 'Invalid request',
                details: validationResult.errors
              }, { status: 400 })
            }
          }

          // 9. Audit Logging
          if (config.audit !== false) {
            this.logRequest(request)
          }

          // 10. Execute handler
          const response = await handler(request as AuthenticatedRequest)

          // 11. Response Security Headers
          this.addSecurityHeaders(response)

          // 12. Audit Response
          if (config.audit !== false) {
            this.logResponse(request, response)
          }

          return response

        } catch (error) {
          console.error('Security middleware error:', error)
          logSecurityEvent('system_error', request, { error: error.message })
          return NextResponse.json({ error: 'Internal security error' }, { status: 500 })
        }
      }
    }
  }

  /**
   * Authenticate user from JWT token
   */
  private async authenticate(request: NextRequest): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { success: false, error: 'Missing or invalid authorization header' }
      }

      const token = authHeader.substring(7)
      const secret = process.env.JWT_SECRET
      if (!secret) {
        return { success: false, error: 'JWT secret not configured' }
      }

      const decoded = jwt.verify(token, secret) as any
      
      // Check if token is expired
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        return { success: false, error: 'Token expired' }
      }

      return {
        success: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role || 'user',
          subscriptionTier: decoded.subscriptionTier || 'basic'
        }
      }
    } catch (error) {
      return { success: false, error: 'Invalid token' }
    }
  }

  /**
   * Check for suspicious activity
   */
  private isSuspiciousActivity(request: NextRequest): boolean {
    const clientIP = this.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''
    const now = new Date()

    // Check for suspicious user agents
    const suspiciousPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /java/i
    ]

    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      return true
    }

    // Check for rapid requests from same IP
    const suspiciousData = this.suspiciousIPs.get(clientIP)
    if (suspiciousData) {
      const timeDiff = now.getTime() - suspiciousData.lastSeen.getTime()
      if (timeDiff < 1000) { // Less than 1 second
        suspiciousData.count++
        suspiciousData.lastSeen = now
        return suspiciousData.count > 10 // More than 10 requests per second
      } else {
        suspiciousData.count = 1
        suspiciousData.lastSeen = now
      }
    } else {
      this.suspiciousIPs.set(clientIP, { count: 1, lastSeen: now })
    }

    return false
  }

  /**
   * Check rate limit
   */
  private checkRateLimit(request: NextRequest): { allowed: boolean; retryAfter?: number } {
    // This would integrate with your rate limiter
    // For now, return allowed
    return { allowed: true }
  }

  /**
   * Check CORS
   */
  private checkCORS(request: NextRequest): { allowed: boolean } {
    const origin = request.headers.get('origin')
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
    
    if (!origin) {
      return { allowed: true } // Same-origin request
    }

    return { allowed: allowedOrigins.includes(origin) }
  }

  /**
   * Validate request
   */
  private validateRequest(request: NextRequest): { valid: boolean; errors?: string[] } {
    const errors: string[] = []

    // Check content length
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
      errors.push('Request too large')
    }

    // Check content type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        errors.push('Invalid content type')
      }
    }

    // Check for malicious patterns in URL
    const url = request.nextUrl.pathname
    const maliciousPatterns = [
      /\.\./, // Directory traversal
      /<script/i, // XSS
      /javascript:/i, // JavaScript protocol
      /on\w+=/i // Event handlers
    ]

    if (maliciousPatterns.some(pattern => pattern.test(url))) {
      errors.push('Malicious URL pattern detected')
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Add security headers to response
   */
  private addSecurityHeaders(response: NextResponse): void {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  }

  /**
   * Log request
   */
  private logRequest(request: NextRequest): void {
    auditLogger.log({
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      action: 'api_request',
      resource: 'api',
      method: request.method,
      endpoint: request.nextUrl.pathname,
      statusCode: 0, // Will be updated in response
      severity: 'low',
      category: 'system'
    })
  }

  /**
   * Log response
   */
  private logResponse(request: NextRequest, response: NextResponse): void {
    // This would update the existing log entry with response details
    // For now, we'll create a new entry
    auditLogger.log({
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      action: 'api_response',
      resource: 'api',
      method: request.method,
      endpoint: request.nextUrl.pathname,
      statusCode: response.status,
      severity: response.status >= 400 ? 'medium' : 'low',
      category: 'system'
    })
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const clientIP = request.ip

    return forwarded?.split(',')[0] || realIP || clientIP || 'unknown'
  }

  /**
   * Block IP address
   */
  blockIP(ip: string): void {
    this.blockedIPs.add(ip)
  }

  /**
   * Unblock IP address
   */
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip)
  }

  /**
   * Add API key
   */
  addAPIKey(key: string): void {
    this.apiKeys.add(key)
  }

  /**
   * Remove API key
   */
  removeAPIKey(key: string): void {
    this.apiKeys.delete(key)
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    blockedIPs: number
    suspiciousIPs: number
    apiKeys: number
    recentBlocks: string[]
  } {
    return {
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      apiKeys: this.apiKeys.size,
      recentBlocks: Array.from(this.blockedIPs).slice(-10)
    }
  }
}

// Create singleton instance
export const securityMiddleware = new SecurityMiddleware()

// Convenience functions
export function withAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return securityMiddleware.withSecurity({ requireAuth: true })(handler)
}

export function withRole(roles: string[], handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return securityMiddleware.withSecurity({ requireAuth: true, allowedRoles: roles })(handler)
}

export function withAPIKey(handler: (request: NextRequest) => Promise<NextResponse>) {
  return securityMiddleware.withSecurity({ requireApiKey: true })(handler)
}

export function withFullSecurity(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return securityMiddleware.withSecurity({
    requireAuth: true,
    rateLimit: true,
    cors: true,
    validation: true,
    audit: true
  })(handler)
}

// Export the main security middleware
export { securityMiddleware as withSecurity }

