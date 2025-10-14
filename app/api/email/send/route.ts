import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Public email API endpoint (bypasses deployment protection)
export async function POST(request: NextRequest) {
  try {
    console.log('📧 Public Email API called')
    
    const body = await request.json()
    const { to, subject, body: emailBody, template, priority = 'normal' } = body

    // Validate required fields
    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required fields: to, subject, body" 
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid email address format" 
        },
        { status: 400 }
      )
    }

    // Check if Resend API key is available
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Email service not configured" 
        },
        { status: 500 }
      )
    }

    // For testing, send to verified email address
    const isTestMode = true // Always test mode for now
    const testEmail = 'jstringscode@gmail.com'
    
    // Convert to HTML
    const htmlBody = emailBody.replace(/\n/g, '<br>')
    
    const emailPayload = {
      from: 'onboarding@resend.dev',
      to: [testEmail],
      subject: `[TEST TO: ${to}] ${subject}`,
      html: `
        <div style="background: #f0f8ff; padding: 20px; border-left: 4px solid #007bff; margin-bottom: 20px;">
          <h3 style="color: #007bff; margin: 0 0 10px 0;">🧪 TEST EMAIL</h3>
          <p style="margin: 0; color: #666;"><strong>Intended Recipient:</strong> ${to}</p>
          <p style="margin: 5px 0 0 0; color: #666;"><strong>Test Mode:</strong> This email was sent to your verified address for testing.</p>
        </div>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Credit Repair App</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Professional Credit Repair Services</p>
            </div>
            <div style="padding: 40px 30px;">
              ${htmlBody}
            </div>
            <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #718096; font-size: 14px; font-weight: 600; color: #2d3748; margin-bottom: 10px;">Credit Repair App</p>
              <p style="margin: 0; color: #718096; font-size: 14px;">Professional Credit Repair Services</p>
              <p style="margin: 5px 0 0 0; color: #718096; font-size: 14px;">© ${new Date().getFullYear()} Credit Repair App. All rights reserved.</p>
            </div>
          </div>
        </div>
      `
    }

    // Send email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    })

    const resendResult = await resendResponse.json()

    if (!resendResponse.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Email service error: ${resendResult.message || 'Unknown error'}`,
          details: resendResult
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        messageId: resendResult.id,
        to: testEmail,
        intendedRecipient: to,
        subject,
        timestamp: new Date().toISOString(),
        status: 'sent',
        service: 'resend',
        testMode: true
      },
      message: `Test email sent successfully to ${testEmail} (intended for ${to})`
    })

  } catch (error) {
    console.error('❌ Error in public email API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to send email",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
