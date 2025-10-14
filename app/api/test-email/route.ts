import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if Resend API key is available
    const resendApiKey = process.env.RESEND_API_KEY
    
    console.log('🔍 Testing Resend API configuration...')
    console.log('RESEND_API_KEY exists:', !!resendApiKey)
    console.log('RESEND_API_KEY length:', resendApiKey ? resendApiKey.length : 0)
    console.log('RESEND_API_KEY starts with:', resendApiKey ? resendApiKey.substring(0, 10) + '...' : 'undefined')

    if (!resendApiKey) {
      return NextResponse.json({
        success: false,
        error: "RESEND_API_KEY not found in environment variables",
        environment: process.env.NODE_ENV,
        availableEnvVars: Object.keys(process.env).filter(key => key.includes('RESEND') || key.includes('EMAIL'))
      })
    }

    // Test Resend API connection
    console.log('🧪 Testing Resend API connection...')
    
    const testResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Credit Repair App <noreply@creditrepairapp.com>',
        to: ['test@example.com'],
        subject: 'Test Email from Credit Repair App',
        html: '<p>This is a test email to verify Resend API integration.</p>'
      })
    })

    const testResult = await testResponse.json()
    
    console.log('📧 Resend API test response:', {
      status: testResponse.status,
      ok: testResponse.ok,
      result: testResult
    })

    return NextResponse.json({
      success: testResponse.ok,
      status: testResponse.status,
      resendApiKey: {
        exists: !!resendApiKey,
        length: resendApiKey.length,
        startsWith: resendApiKey.substring(0, 10) + '...'
      },
      testResult,
      environment: process.env.NODE_ENV
    })

  } catch (error) {
    console.error('❌ Test email error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      environment: process.env.NODE_ENV
    })
  }
}
