import { NextResponse } from "next/server"
import { verifyAdminRequest } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM
  
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not set' })
  }

  // Send a real test email and return the full Resend response
  const payload = {
    from: emailFrom || 'onboarding@resend.dev',
    to: ['jstringscode@gmail.com'],
    subject: 'Credit Repair AI - Debug Test Email',
    html: '<h1>Debug Test</h1><p>If you received this, email sending works!</p>',
  }

  console.log('Debug send - EMAIL_FROM env:', emailFrom)
  console.log('Debug send - using from:', payload.from)
  console.log('Debug send - RESEND_API_KEY length:', apiKey?.length)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  return NextResponse.json({
    success: res.ok,
    status: res.status,
    resendResponse: data,
    sentFrom: payload.from,
    sentTo: payload.to,
    emailFromEnv: emailFrom || '(not set - using fallback)',
    apiKeyLength: apiKey?.length,
    apiKeyPrefix: apiKey?.substring(0, 10) + '...',
  })
}
