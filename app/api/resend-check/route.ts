import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

export async function GET() {
  const key = process.env.RESEND_API_KEY
  const from = process.env.FROM_EMAIL || 'onboarding@resend.dev'
  const devTo = process.env.DEV_TO_EMAIL

  if (!key) {
    return NextResponse.json({ 
      error: 'RESEND_API_KEY not set',
      from, devTo, env: process.env.NODE_ENV
    })
  }

  // Try to actually call Resend API to verify key works
  try {
    const resend = new Resend(key)
    const { data, error } = await resend.emails.send({
      from: 'Credit Repair AI <' + from + '>',
      to: [devTo || 'delivered@resend.dev'],
      subject: 'Resend API Key Test',
      html: '<p>API key is working! Sent at: ' + new Date().toISOString() + '</p>',
    })

    return NextResponse.json({
      keyPrefix: key.substring(0, 12) + '...',
      from,
      to: devTo || 'delivered@resend.dev',
      env: process.env.NODE_ENV,
      resendData: data,
      resendError: error,
      success: !error,
    })
  } catch (err: any) {
    return NextResponse.json({
      keyPrefix: key.substring(0, 12) + '...',
      from, env: process.env.NODE_ENV,
      caught: err.message,
      success: false,
    })
  }
}
