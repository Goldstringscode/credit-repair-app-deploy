import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, textToHtml } from "@/lib/resend"

export async function POST(request: NextRequest) {
  try {
    const { type, to, subject, body: emailBody, html, data } = await request.json()

    if (!to) {
      return NextResponse.json({ error: 'Missing required field: to' }, { status: 400 })
    }

    // Build subject and content from type or direct params
    const emailSubject = subject || (type ? type.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) + ' - Credit Repair AI' : 'Message from Credit Repair AI')
    const content = html || emailBody || (data?.message || data?.content || '')
    const htmlContent = content && (content.includes('<html') || content.includes('<p'))
      ? content : textToHtml(content || 'No content provided')

    const result = await sendEmail({ to, subject: emailSubject, html: htmlContent })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: result.id, message: 'Email sent' })
  } catch (err: any) {
    console.error('send-email route error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
