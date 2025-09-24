import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest) => {
  const response = NextResponse.json({ 
    success: true, 
    message: 'Security headers test endpoint'
  })
  
  // Add additional security headers for testing
  response.headers.set('X-Test-Header', 'security-test')
  response.headers.set('X-Custom-Security', 'enabled')
  
  return response
}

