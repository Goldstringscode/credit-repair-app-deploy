import { NextRequest, NextResponse } from 'next/server'
import { auditLogger } from '@/lib/audit-logger'

export const POST = async (request: NextRequest) => {
  try {
    const { action } = await request.json()
    
    // Generate a simple log ID
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Log a test audit event
    await auditLogger.log(
      `test_${action}`,
      'test_audit',
      logId,
      {
        method: request.method,
        endpoint: request.nextUrl.pathname,
        statusCode: 200,
        severity: 'low',
        category: 'system'
      },
      { id: 'test_user', email: 'test@example.com' } as any, // Mock user for testing
      request as any
    )
    
    return NextResponse.json({ 
      success: true, 
      message: 'Audit logging test completed',
      logId: logId
    })
  } catch (error: any) {
    console.error('Audit test error:', error)
    return NextResponse.json({ 
      error: 'Audit logging test failed',
      message: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}
