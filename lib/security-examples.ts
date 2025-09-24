import { NextRequest, NextResponse } from 'next/server'
import { withSecurity, withAuth, withRole, withAPIKey } from './security-middleware'
import { withValidation } from './validation-middleware'
import { withCors } from './cors'
import { withRateLimit } from './rate-limiter'
import { registerSchema, loginSchema, creditReportUploadSchema } from './validation-schemas'
import { logAuthEvent, logDataAccess, logSecurityEvent } from './audit-logger'
import { fieldEncryption } from './encryption'

// Example 1: Secure Authentication Route
export const secureAuthHandler = withSecurity({
  requireAuth: false,
  rateLimit: true,
  cors: true,
  validation: true,
  audit: true
})(async (request: NextRequest) => {
  const { body } = request as any // Validated body from middleware
  
  // Additional business logic here
  const { email, password } = body
  
  // Log authentication attempt
  logAuthEvent('login', 'temp-user-id', request, true)
  
  return NextResponse.json({ success: true, message: 'Login successful' })
})

// Example 2: Protected User Data Route
export const protectedUserHandler = withAuth(async (request: NextRequest) => {
  const user = (request as any).user
  const { body } = request as any
  
  // Log data access
  logDataAccess('read', 'user_profile', user.id, user.id, request, true)
  
  return NextResponse.json({ 
    success: true, 
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  })
})

// Example 3: Admin-Only Route
export const adminHandler = withRole(['admin', 'super_admin'], async (request: NextRequest) => {
  const user = (request as any).user
  
  // Admin-specific logic here
  return NextResponse.json({ 
    success: true, 
    message: 'Admin access granted',
    adminData: 'sensitive admin information'
  })
})

// Example 4: API Key Protected Route
export const apiKeyHandler = withAPIKey(async (request: NextRequest) => {
  // API key validation is handled by middleware
  return NextResponse.json({ 
    success: true, 
    message: 'API access granted',
    data: 'protected API data'
  })
})

// Example 5: Credit Report Upload with Full Security
export const secureUploadHandler = withSecurity({
  requireAuth: true,
  rateLimit: true,
  cors: true,
  validation: true,
  audit: true,
  encryption: true
})(async (request: NextRequest) => {
  const user = (request as any).user
  const { body } = request as any
  
  try {
    // Encrypt sensitive data before storing
    const encryptedData = fieldEncryption.encryptCreditData({
      creditScore: body.creditScore,
      accountNumbers: body.accountNumbers,
      personalInfo: body.personalInfo
    })
    
    // Log data access
    logDataAccess('create', 'credit_report', 'new-report-id', user.id, request, true)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Credit report uploaded and encrypted',
      reportId: 'encrypted-report-id'
    })
  } catch (error) {
    logDataAccess('create', 'credit_report', 'new-report-id', user.id, request, false, error.message)
    return NextResponse.json({ 
      error: 'Upload failed' 
    }, { status: 500 })
  }
})

// Example 6: Dispute Generation with Validation
export const disputeHandler = withValidation({
  body: registerSchema // Using existing schema as example
})(async (request: NextRequest) => {
  const { body } = request as any
  
  // Additional validation and business logic
  return NextResponse.json({ 
    success: true, 
    message: 'Dispute generated successfully' 
  })
})

// Example 7: CORS-Protected Route
export const corsHandler = withCors()(async (request: NextRequest) => {
  return NextResponse.json({ 
    success: true, 
    message: 'CORS-protected response' 
  })
})

// Example 8: Rate Limited Route
export const rateLimitedHandler = withRateLimit('ai')(async (request: NextRequest) => {
  return NextResponse.json({ 
    success: true, 
    message: 'Rate-limited AI response' 
  })
})

// Example 9: Custom Security Middleware
export const customSecurityHandler = withSecurity({
  requireAuth: true,
  allowedRoles: ['user', 'premium'],
  rateLimit: true,
  cors: true,
  validation: true,
  audit: true
})(async (request: NextRequest) => {
  const user = (request as any).user
  
  // Custom business logic based on user role
  if (user.role === 'premium') {
    return NextResponse.json({ 
      success: true, 
      message: 'Premium feature accessed',
      data: 'premium data'
    })
  } else {
    return NextResponse.json({ 
      success: true, 
      message: 'Basic feature accessed',
      data: 'basic data'
    })
  }
})

// Example 10: Error Handling with Security
export const errorHandlingHandler = withSecurity({
  requireAuth: true,
  rateLimit: true,
  cors: true,
  validation: true,
  audit: true
})(async (request: NextRequest) => {
  try {
    // Simulate some operation that might fail
    const result = await someOperation()
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    })
  } catch (error) {
    // Log security event for errors
    logSecurityEvent('system_error', request, { 
      error: error.message,
      stack: error.stack 
    })
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
})

// Helper function for example
async function someOperation(): Promise<any> {
  // Simulate operation
  return { result: 'success' }
}

// Example 11: Multi-layer Security
export const multiLayerSecurityHandler = withCors()(
  withRateLimit('general')(
    withValidation({
      body: loginSchema
    })(
      withAuth(async (request: NextRequest) => {
        const user = (request as any).user
        const { body } = request as any
        
        // Multiple layers of security applied
        return NextResponse.json({ 
          success: true, 
          message: 'Multi-layer security applied',
          user: user.id
        })
      })
    )
  )
)

// Example 12: Security Headers Test
export const securityHeadersHandler = async (request: NextRequest) => {
  const response = NextResponse.json({ 
    success: true, 
    message: 'Security headers test' 
  })
  
  // Add custom security headers
  response.headers.set('X-Custom-Security-Header', 'test-value')
  response.headers.set('X-Content-Security-Policy', "default-src 'self'")
  
  return response
}

// Example 13: Audit Logging Test
export const auditLoggingHandler = withSecurity({
  requireAuth: true,
  audit: true
})(async (request: NextRequest) => {
  const user = (request as any).user
  
  // This will be automatically logged by the security middleware
  return NextResponse.json({ 
    success: true, 
    message: 'Audit logging test',
    userId: user.id
  })
})

// Example 14: Data Encryption Test
export const encryptionHandler = withSecurity({
  requireAuth: true,
  encryption: true
})(async (request: NextRequest) => {
  const user = (request as any).user
  const { body } = request as any
  
  // Encrypt sensitive data
  const encryptedSSN = fieldEncryption.encryptPII({
    ssn: body.ssn
  })
  
  return NextResponse.json({ 
    success: true, 
    message: 'Data encrypted successfully',
    encryptedData: encryptedSSN
  })
})

// Example 15: Environment Validation Test
export const envValidationHandler = async (request: NextRequest) => {
  // This would typically be done at application startup
  const { envValidator } = await import('./env-validation')
  
  if (!envValidator.isValid()) {
    return NextResponse.json({ 
      error: 'Environment validation failed',
      details: envValidator.getErrors()
    }, { status: 500 })
  }
  
  return NextResponse.json({ 
    success: true, 
    message: 'Environment validation passed' 
  })
}

