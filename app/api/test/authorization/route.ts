import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest) => {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization')
    const userRole = request.headers.get('x-user-role')
    
    if (!authHeader) {
      return NextResponse.json({ 
        error: 'No authorization header',
        message: 'Authorization test - missing token'
      }, { status: 401 })
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Invalid authorization format',
        message: 'Authorization test - invalid token format'
      }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    
    if (token === 'invalid-token') {
      return NextResponse.json({ 
        error: 'Invalid token',
        message: 'Authorization test - invalid token'
      }, { status: 401 })
    }
    
    // Check role authorization
    const allowedRoles = ['user', 'admin', 'super_admin']
    const role = userRole || 'user'
    
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        message: 'Authorization test - insufficient role'
      }, { status: 403 })
    }
    
    // Simulate successful authorization
    return NextResponse.json({ 
      success: true, 
      message: 'Authorization test passed',
      user: {
        id: 'test-user-123',
        email: 'test@example.com',
        role: role
      }
    })
  } catch (error: any) {
    console.error('Authorization test error:', error)
    return NextResponse.json({ 
      error: 'Authorization test failed',
      message: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}
