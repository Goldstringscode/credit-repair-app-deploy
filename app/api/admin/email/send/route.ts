import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminRequest } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
  const _auth = await verifyAdminRequest(request)
  if ('error' in _auth) return _auth.error

  try {
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const { to, subject, body: emailBody, template, priority = 'normal' } = body

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      )
    }

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json(
        { success: false, error: 'Email service not configured: RESEND_API_KEY missing' },
        { status: 500 }
      )
    }

    const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev'
    const htmlBody = convertToHtmlEmail(emailBody, subject, template)

    const payload = {
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: htmlBody,
    }

    console.log('📧 Sending email:', { from: payload.from, to: payload.to, subject })

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + resendApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const resendData = await resendRes.json()
    console.log('📧 Resend response:', resendRes.status, JSON.stringify(resendData))

    if (!resendRes.ok) {
      console.error('❌ Resend error:', resendData)
      return NextResponse.json(
        { success: false, error: resendData?.message || 'Failed to send email', details: resendData },
        { status: resendRes.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully to ' + (Array.isArray(to) ? to.join(', ') : to),
      emailId: resendData.id,
      to: payload.to,
    })

  } catch (err: any) {
    console.error('❌ Send route error:', err.message)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
