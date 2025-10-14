import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// Convert plain text email to beautiful HTML template
function convertToHtmlEmail(body: string, subject: string, template?: string): string {
  // Convert line breaks to HTML
  const htmlBody = body.replace(/\n/g, '<br>')
  
  // Create beautiful email template
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .email-container {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .email-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .email-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .email-header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
          font-size: 16px;
        }
        .email-body {
          padding: 40px 30px;
        }
        .email-body h2 {
          color: #2d3748;
          font-size: 24px;
          margin: 0 0 20px 0;
          font-weight: 600;
        }
        .email-body p {
          font-size: 16px;
          line-height: 1.7;
          margin: 0 0 20px 0;
          color: #4a5568;
        }
        .email-body ul {
          margin: 20px 0;
          padding-left: 20px;
        }
        .email-body li {
          margin: 8px 0;
          color: #4a5568;
          font-size: 16px;
        }
        .email-footer {
          background: #f7fafc;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .email-footer p {
          margin: 0;
          color: #718096;
          font-size: 14px;
        }
        .email-footer .company-name {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 10px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .highlight-box {
          background: #f0f8ff;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 6px 6px 0;
        }
        .highlight-box h3 {
          margin: 0 0 10px 0;
          color: #2d3748;
          font-size: 18px;
        }
        .highlight-box p {
          margin: 0;
          color: #4a5568;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>Credit Repair App</h1>
          <p>Professional Credit Repair Services</p>
        </div>
        
        <div class="email-body">
          ${htmlBody}
        </div>
        
        <div class="email-footer">
          <p class="company-name">Credit Repair App</p>
          <p>Professional Credit Repair Services</p>
          <p>© ${new Date().getFullYear()} Credit Repair App. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

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
    
    // Convert plain text email to beautiful HTML template
    const htmlEmailBody = convertToHtmlEmail(emailBody, subject, template)
    
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
        ${htmlEmailBody}
      `
    } : {
      from: `noreply@${process.env.RESEND_VERIFIED_DOMAIN}`,
      to: [to],
      subject: subject,
      html: htmlEmailBody
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
