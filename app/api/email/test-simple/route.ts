import { NextRequest, NextResponse } from 'next/server'
import { sendCreditRepairTemplateEmail } from '@/lib/email-service-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, userName = 'Test User' } = body

    console.log(`📧 Simple Email Test: Sending to ${to}`)

    const testSubject = 'Beautiful Email Test - CreditAI Pro'
    const testHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Beautiful Email Test</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                🎉 Beautiful Email Test!
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 18px; opacity: 0.9;">
                CSS styling is working perfectly!
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px; font-weight: 600;">
                Hello ${userName}! 👋
              </h2>
              
              <p style="margin: 0 0 25px 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                This is a test email to verify that our beautiful email templates are working correctly with proper CSS styling!
              </p>
              
              <!-- Highlight Box -->
              <div style="background: linear-gradient(135deg, #e8f4fd 0%, #f0f8ff 100%); padding: 25px; border-radius: 10px; border-left: 5px solid #667eea; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">
                  ✅ Email Features Working:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #5a6c7d; font-size: 16px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">🎨 Beautiful CSS styling</li>
                  <li style="margin-bottom: 8px;">📱 Responsive design</li>
                  <li style="margin-bottom: 8px;">🌈 Gradient backgrounds</li>
                  <li style="margin-bottom: 8px;">📧 Email client compatibility</li>
                </ul>
              </div>
              
              <p style="margin: 25px 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                If you can see this beautiful styling, then our email system is working perfectly! The CSS is rendering correctly in your email client.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  🎯 Go to Dashboard
                </a>
              </div>
              
              <p style="margin: 25px 0 0 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #2c3e50;">The CreditAI Pro Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #6c757d; font-size: 12px;">
                © 2024 CreditAI Pro. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    
    const testText = `Beautiful Email Test - CreditAI Pro

Hello ${userName},

This is a test email to verify that our beautiful email templates are working correctly with proper CSS styling!

Email Features Working:
- Beautiful CSS styling
- Responsive design
- Gradient backgrounds
- Email client compatibility

If you can see this beautiful styling, then our email system is working perfectly! The CSS is rendering correctly in your email client.

Go to Dashboard: http://localhost:3000/dashboard

Best regards,
The CreditAI Pro Team

© 2024 CreditAI Pro. All rights reserved.`

    try {
      const result = await sendCreditRepairTemplateEmail({
        to,
        subject: testSubject,
        htmlContent: testHtml,
        textContent: testText
      })

      console.log(`✅ Beautiful test email sent successfully: ${result.messageId}`)
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Beautiful test email sent successfully!'
      })
    } catch (emailError) {
      console.error(`❌ Failed to send beautiful test email:`, emailError)
      return NextResponse.json(
        { success: false, error: `Failed to send email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Simple Email Test API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
