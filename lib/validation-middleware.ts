import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateRequest } from './validation-schemas'

interface ValidationOptions {
  body?: z.ZodSchema
  query?: z.ZodSchema
  params?: z.ZodSchema
  headers?: z.ZodSchema
}

export function withValidation(options: ValidationOptions) {
  return function (handler: (request: NextRequest, validatedData?: any) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        const validatedData: any = {}

        // Validate request body
        if (options.body) {
          const body = await request.json().catch(() => ({}))
          const bodyValidation = validateRequest(options.body, body)
          if (!bodyValidation.success) {
            return NextResponse.json(
              { 
                error: 'Validation failed', 
                details: bodyValidation.errors 
              },
              { status: 400 }
            )
          }
          validatedData.body = bodyValidation.data
        }

        // Validate query parameters
        if (options.query) {
          const url = new URL(request.url)
          const queryParams = Object.fromEntries(url.searchParams.entries())
          const queryValidation = validateRequest(options.query, queryParams)
          if (!queryValidation.success) {
            return NextResponse.json(
              { 
                error: 'Query validation failed', 
                details: queryValidation.errors 
              },
              { status: 400 }
            )
          }
          validatedData.query = queryValidation.data
        }

        // Validate route parameters
        if (options.params) {
          const params = request.nextUrl.pathname.split('/').filter(Boolean)
          const paramsValidation = validateRequest(options.params, params)
          if (!paramsValidation.success) {
            return NextResponse.json(
              { 
                error: 'Parameter validation failed', 
                details: paramsValidation.errors 
              },
              { status: 400 }
            )
          }
          validatedData.params = paramsValidation.data
        }

        // Validate headers
        if (options.headers) {
          const headers = Object.fromEntries(request.headers.entries())
          const headersValidation = validateRequest(options.headers, headers)
          if (!headersValidation.success) {
            return NextResponse.json(
              { 
                error: 'Header validation failed', 
                details: headersValidation.errors 
              },
              { status: 400 }
            )
          }
          validatedData.headers = headersValidation.data
        }

        return await handler(request, validatedData)
      } catch (error) {
        console.error('Validation middleware error:', error)
        return NextResponse.json(
          { error: 'Internal validation error' },
          { status: 500 }
        )
      }
    }
  }
}

// Common validation schemas for headers
export const authHeaderSchema = z.object({
  authorization: z.string().regex(/^Bearer\s+.+/, 'Invalid authorization header format'),
})

export const contentTypeSchema = z.object({
  'content-type': z.string().includes('application/json', 'Content-Type must be application/json'),
})

// Rate limiting validation
export const rateLimitSchema = z.object({
  'x-rate-limit-limit': z.string().optional(),
  'x-rate-limit-remaining': z.string().optional(),
  'x-rate-limit-reset': z.string().optional(),
})

// File upload validation
export const fileUploadSchema = z.object({
  'content-type': z.string().includes('multipart/form-data', 'Content-Type must be multipart/form-data'),
  'content-length': z.string().regex(/^\d+$/, 'Content-Length must be a number'),
})

// API key validation
export const apiKeySchema = z.object({
  'x-api-key': z.string().min(1, 'API key is required'),
})

// CORS validation
export const corsSchema = z.object({
  origin: z.string().optional(),
  'access-control-request-method': z.string().optional(),
  'access-control-request-headers': z.string().optional(),
})

// Security headers validation
export const securityHeadersSchema = z.object({
  'user-agent': z.string().min(1, 'User-Agent is required'),
  'x-forwarded-for': z.string().optional(),
  'x-real-ip': z.string().optional(),
})

// Request size validation
export function validateRequestSize(request: NextRequest, maxSize: number = 10 * 1024 * 1024): boolean {
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > maxSize) {
    return false
  }
  return true
}

// IP address validation
export function validateIPAddress(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

// URL validation
export function validateURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone number validation
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

// SSN validation
export function validateSSN(ssn: string): boolean {
  const ssnRegex = /^\d{4}$/
  return ssnRegex.test(ssn)
}

// Credit card validation (basic)
export function validateCreditCard(cardNumber: string): boolean {
  const cardRegex = /^\d{13,19}$/
  return cardRegex.test(cardNumber.replace(/\s/g, ''))
}

// ZIP code validation
export function validateZIPCode(zip: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zip)
}

// State validation
export function validateState(state: string): boolean {
  const validStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]
  return validStates.includes(state.toUpperCase())
}

// Date validation
export function validateDate(dateString: string): boolean {
  const date = new Date(dateString)
  return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/)
}

// Age validation
export function validateAge(dateOfBirth: string, minAge: number = 18): boolean {
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= minAge
  }
  
  return age >= minAge
}

