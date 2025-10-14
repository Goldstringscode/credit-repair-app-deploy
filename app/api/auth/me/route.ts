import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // For development, we'll use a simple mock authentication
    // In production, this would verify JWT tokens or session cookies
    
    // Check for a simple auth header or cookie
    const authHeader = request.headers.get('authorization')
    const authCookie = request.cookies.get('mlm-auth')?.value
    
    // For demo purposes, if no auth is provided, return a mock user
    // This allows the MLM system to work without complex authentication
    if (!authHeader && !authCookie) {
      return NextResponse.json({
        success: true,
        user: {
          id: 'demo-user-123',
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    }
    
    // If auth is provided, validate it (simplified for demo)
    const userId = authHeader?.replace('Bearer ', '') || authCookie || 'demo-user-123'
    
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Auth check failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Authentication failed'
    }, { status: 401 })
  }
}