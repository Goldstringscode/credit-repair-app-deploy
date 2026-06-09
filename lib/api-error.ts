import { NextResponse } from 'next/server'

/**
 * Sanitizes errors before sending to client.
 * In production: returns generic message, logs full detail server-side only.
 * In development: returns actual error message for debugging.
 */
export function sanitizeError(err: unknown, context?: string): string {
  const msg = err instanceof Error ? err.message : String(err)
  // Full error visible in Vercel function logs - never in client response
  console.error('[API Error]' + (context ? ' [' + context + ']' : '') + ':', msg)
  if (process.env.NODE_ENV === 'development') return msg
  return 'An internal error occurred. Please try again.'
}

export function safeErrorResponse(err: unknown, status = 500, context?: string) {
  return NextResponse.json(
    { success: false, error: sanitizeError(err, context) },
    { status }
  )
}
