import { NextRequest, NextResponse } from 'next/server'
import { sendCreditRepairTemplateEmail } from '@/lib/email-service'
import { creditRepairEmailTemplates } from '@/lib/credit-repair-email-templates-beautiful'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, templateId, to, variables, testData } = body

    console.log(`📧 Credit Repair Email API: ${action} request for template ${templateId}`)

    switch (action) {
      case 'send_test':
        if (!templateId || !to) {
          return NextResponse.json(
            { success: false, error: 'Template ID and recipient email are required' },
            { status: 400 }
          )
        }

        // Get the actual template
        const template = creditRepairEmailTemplates.find(t => t.id === templateId)
        
        let testSubject: string
        let testHtml: string
        let testText: string
        
        if (template) {
          // Use the beautiful template
          testSubject = template.subject
          testHtml = template.htmlContent
          testText = template.textContent
          
          // Replace template variables (handle escaped format)
          if (testData) {
            Object.keys(testData).forEach(key => {
              const escapedRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
              testHtml = testHtml.replace(escapedRegex, testData[key] || '')
              testText = testText.replace(escapedRegex, testData[key] || '')
            })
          }
          
          // Replace common variables with defaults if not provided (handle escaped format)
          testHtml = testHtml.replace(/\{\{userName\}\}/g, testData?.userName || 'Test User')
          testHtml = testHtml.replace(/\{\{userEmail\}\}/g, to)
          testHtml = testHtml.replace(/\{\{dashboardUrl\}\}/g, testData?.dashboardUrl || 'http://localhost:3000/dashboard')
          
          testText = testText.replace(/\{\{userName\}\}/g, testData?.userName || 'Test User')
          testText = testText.replace(/\{\{userEmail\}\}/g, to)
          testText = testText.replace(/\{\{dashboardUrl\}\}/g, testData?.dashboardUrl || 'http://localhost:3000/dashboard')
        } else {
          // Fallback to simple test email
          testSubject = `Test Email - ${templateId}`
          testHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Test Email</title>
            </head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #333; text-align: center;">Test Email from Credit Repair App</h1>
                <p>Hello ${testData?.userName || 'Test User'},</p>
                <p>This is a test email for template: <strong>${templateId}</strong></p>
                <p>Template variables received:</p>
                <pre style="background: #e9ecef; padding: 15px; border-radius: 5px; overflow-x: auto;">
${JSON.stringify(testData || {}, null, 2)}
                </pre>
                <p>If you received this email, the email system is working correctly!</p>
                <p>Best regards,<br>Credit Repair App Team</p>
              </div>
            </body>
            </html>
          `
          testText = `
Test Email from Credit Repair App

Hello ${testData?.userName || 'Test User'},

This is a test email for template: ${templateId}

Template variables received:
${JSON.stringify(testData || {}, null, 2)}

If you received this email, the email system is working correctly!

Best regards,
Credit Repair App Team
          `
        }

        try {
          const result = await sendCreditRepairTemplateEmail({
            to,
            subject: testSubject,
            htmlContent: testHtml,
            textContent: testText
          })

          console.log(`✅ Test email sent successfully: ${result.messageId}`)
          return NextResponse.json({
            success: true,
            messageId: result.messageId,
            message: 'Test email sent successfully'
          })
        } catch (emailError) {
          console.error(`❌ Failed to send test email:`, emailError)
          return NextResponse.json(
            { success: false, error: `Failed to send email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}` },
            { status: 500 }
          )
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Credit Repair Email API Error:', error)
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'get_templates'

    console.log(`📧 Credit Repair Email API: GET request - ${action}`)

    switch (action) {
      case 'get_templates':
        return NextResponse.json({
          success: true,
          templates: creditRepairEmailTemplates.map(template => ({
            id: template.id,
            name: template.name,
            category: template.category,
            description: template.description
          }))
        })

      case 'get_categories':
        return NextResponse.json({
          success: true,
          categories: ['welcome', 'onboarding', 'dispute', 'success', 'billing', 'follow-up', 'reminder', 'support', 'marketing', 'compliance']
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Credit Repair Email API Error:', error)
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