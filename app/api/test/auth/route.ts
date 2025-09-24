import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest) => {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ 
        error: 'No authorization header',
        message: 'Authentication test - missing token'
      }, { status: 401 })
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Invalid authorization format',
        message: 'Authentication test - invalid token format'
      }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    
    if (token === 'invalid-token') {
      return NextResponse.json({ 
        error: 'Invalid token',
        message: 'Authentication test - invalid token'
      }, { status: 401 })
    }
    
    // Simulate successful authentication
    return NextResponse.json({ 
      success: true, 
      message: 'Authentication test passed',
      user: {
        id: 'test-user-123',
        email: 'test@example.com',
        role: 'user'
      }
    })
  } catch (error: any) {
    console.error('Auth test error:', error)
    return NextResponse.json({ 
      error: 'Authentication test failed',
      message: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}
