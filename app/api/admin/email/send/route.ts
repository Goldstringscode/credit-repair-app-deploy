import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
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

    // Send email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Credit Repair App <noreply@creditrepairapp.com>',
        to: [to],
        subject: subject,
        html: emailBody,
        // Add priority headers if needed
        headers: {
          'X-Priority': priority === 'urgent' ? '1' : priority === 'high' ? '2' : '3'
        }
      })
    })

    const resendResult = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('❌ Resend API error:', resendResult)
      return NextResponse.json(
        { 
          success: false, 
          error: `Email service error: ${resendResult.message || 'Unknown error'}`,
          details: resendResult
        },
        { status: 500 }
      )
    }

    console.log('✅ Email sent successfully via Resend:', resendResult)

    return NextResponse.json({
      success: true,
      data: {
        messageId: resendResult.id,
        to,
        subject,
        timestamp: new Date().toISOString(),
        status: 'sent',
        service: 'resend'
      },
      message: `Email sent successfully to ${to}`
    })

  } catch (error) {
    console.error('❌ Error sending email:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
