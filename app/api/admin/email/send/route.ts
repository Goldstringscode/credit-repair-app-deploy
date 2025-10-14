import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email API called')
    
    const body = await request.json()
    console.log('📧 Request body:', { 
      to: body.to, 
      subject: body.subject, 
      hasBody: !!body.body,
      template: body.template,
      priority: body.priority
    })
    
    const { to, subject, body: emailBody, template, priority = 'normal' } = body

    // Validate required fields
    if (!to || !subject || !emailBody) {
      console.log('❌ Missing required fields:', { to: !!to, subject: !!subject, body: !!emailBody })
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
      console.error('❌ RESEND_API_KEY not found in environment variables')
      return NextResponse.json(
        { 
          success: false, 
          error: "Email service not configured. Please contact support." 
        },
        { status: 500 }
      )
    }

    console.log('📧 Sending email via Resend API:', {
      to,
      subject,
      template,
      priority,
      bodyLength: emailBody.length
    })

    // For testing, we'll send to the verified email address and include the intended recipient in the subject
    const isTestMode = process.env.NODE_ENV === 'development' || !process.env.RESEND_VERIFIED_DOMAIN
    const testEmail = 'jstringscode@gmail.com' // Your verified email for testing
    
    const emailPayload = isTestMode ? {
      from: 'onboarding@resend.dev',
      to: [testEmail],
      subject: `[TEST TO: ${to}] ${subject}`,
      html: `
        <div style="background: #f0f8ff; padding: 20px; border-left: 4px solid #007bff; margin-bottom: 20px;">
          <h3 style="color: #007bff; margin: 0 0 10px 0;">🧪 TEST EMAIL</h3>
          <p style="margin: 0; color: #666;"><strong>Intended Recipient:</strong> ${to}</p>
          <p style="margin: 5px 0 0 0; color: #666;"><strong>Test Mode:</strong> This email was sent to your verified address for testing.</p>
        </div>
        ${emailBody}
      `
    } : {
      from: `noreply@${process.env.RESEND_VERIFIED_DOMAIN}`,
      to: [to],
      subject: subject,
      html: emailBody
    }

    console.log('📧 Email payload:', {
      isTestMode,
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject
    })

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

    console.log('📧 Resend API response:', {
      status: resendResponse.status,
      ok: resendResponse.ok,
      result: resendResult
    })

    if (!resendResponse.ok) {
      console.error('❌ Resend API error:', {
        status: resendResponse.status,
        statusText: resendResponse.statusText,
        result: resendResult
      })
      return NextResponse.json(
        { 
          success: false, 
          error: `Email service error: ${resendResult.message || resendResult.error || 'Unknown error'}`,
          details: {
            status: resendResponse.status,
            statusText: resendResponse.statusText,
            resendError: resendResult
          }
        },
        { status: 500 }
      )
    }

    console.log('✅ Email sent successfully via Resend:', resendResult)

    return NextResponse.json({
      success: true,
      data: {
        messageId: resendResult.id,
        to: isTestMode ? testEmail : to,
        intendedRecipient: to,
        subject,
        timestamp: new Date().toISOString(),
        status: 'sent',
        service: 'resend',
        testMode: isTestMode
      },
      message: isTestMode 
        ? `Test email sent successfully to ${testEmail} (intended for ${to})`
        : `Email sent successfully to ${to}`
    })

  } catch (error) {
    console.error('❌ Error sending email:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to send email",
        details: {
          message: error instanceof Error ? error.message : "Unknown error",
          type: error instanceof Error ? error.constructor.name : typeof error,
          stack: error instanceof Error ? error.stack : undefined
        }
      },
      { status: 500 }
    )
  }
}
