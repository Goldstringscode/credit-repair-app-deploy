import { NextRequest, NextResponse } from 'next/server'
import { auditLogger } from '@/lib/audit-logger'

export const POST = async (request: NextRequest) => {
  try {
    const { action } = await request.json()
    
    // Generate a simple log ID
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Log a test audit event
    auditLogger.log({
      id: logId,
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      action: `test_${action}`,
      resource: 'test_audit',
      method: request.method,
      endpoint: request.nextUrl.pathname,
      statusCode: 200,
      severity: 'low',
      category: 'system'
    })
    
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
