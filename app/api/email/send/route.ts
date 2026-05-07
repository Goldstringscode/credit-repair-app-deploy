import { type NextRequest, NextResponse } from 'next/server'
import { sendEmail, textToHtml } from '@/lib/resend'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, body: emailBody, html, template, from } = body

    if (!to || !subject) {
      return NextResponse.json({ success: false, error: 'Missing required fields: to, subject' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const toEmails = Array.isArray(to) ? to : [to]
    const invalidEmails = toEmails.filter(e => !emailRegex.test(e))
    if (invalidEmails.length) {
      return NextResponse.json({ success: false, error: 'Invalid email: ' + invalidEmails.join(', ') }, { status: 400 })
    }

    const content = html || emailBody || ''
    const htmlContent = content.includes('<html') || content.includes('<p') || content.includes('<div')
      ? content
      : textToHtml(content)
    const textContent = content.replace(/<[^>]+>/g, '').trim()

    const result = await sendEmail({
      to: toEmails,
      subject,
      html: htmlContent,
      text: textContent,
      tags: template ? [{ name: 'template', value: template }] : undefined,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: result.id, message: 'Email sent successfully' })
  } catch (err: any) {
    console.error('Email send route error:', err)
    return NextResponse.json({ success: false, error: err.message || 'Failed to send email' }, { status: 500 })
  }
}

export async function GET() {
  const hasKey = !!process.env.RESEND_API_KEY
  return NextResponse.json({
    status: hasKey ? 'configured' : 'not_configured',
    provider: 'Resend',
    from: process.env.FROM_EMAIL || 'noreply@creditrepairai.com',
  })
}
