import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev'
  const devTo = process.env.DEV_TO_EMAIL

  // Return config status without sending
  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : null,
    fromEmail,
    devToEmail: devTo || null,
    nodeEnv: process.env.NODE_ENV,
  })
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'RESEND_API_KEY not set' }, { status: 500 })
    }

    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev'
    const toEmail = process.env.DEV_TO_EMAIL || 'jstringscode@gmail.com'

    console.log('TEST EMAIL: apiKey prefix:', apiKey.substring(0, 8))
    console.log('TEST EMAIL: from:', fromEmail)
    console.log('TEST EMAIL: to:', toEmail)

    const resend = new Resend(apiKey)

    const { data, error } = await resend.emails.send({
      from: 'Credit Repair AI <' + fromEmail + '>',
      to: [toEmail],
      subject: 'Test Email - Credit Repair AI',
      html: '<h1>Test Email</h1><p>If you see this, Resend is working!</p>',
      text: 'Test Email - If you see this, Resend is working!',
    })

    if (error) {
      console.error('TEST EMAIL Resend error:', JSON.stringify(error))
      return NextResponse.json({
        success: false,
        error: JSON.stringify(error),
        from: fromEmail,
        to: toEmail,
      }, { status: 500 })
    }

    console.log('TEST EMAIL success, id:', data?.id)
    return NextResponse.json({
      success: true,
      id: data?.id,
      from: fromEmail,
      to: toEmail,
      message: 'Email sent! Check ' + toEmail,
    })
  } catch (err: any) {
    console.error('TEST EMAIL caught error:', err.message)
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack?.substring(0, 500),
    }, { status: 500 })
  }
}
