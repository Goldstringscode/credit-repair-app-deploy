import { Resend } from 'resend'

// Singleton Resend client - initialized lazily to avoid build-time errors
let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY environment variable is not set')
    _resend = new Resend(apiKey)
  }
  return _resend
}

export const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@creditrepairai.com'
export const FROM_NAME = process.env.FROM_NAME || 'Credit Repair AI'
export const FROM = `${FROM_NAME} <${FROM_EMAIL}>`

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: { name: string; value: string }[]
}

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Core send function used by all email helpers.
 * Falls back to console log in development if RESEND_API_KEY is not set.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      // Development fallback - log to console
      console.log('📧 [EMAIL - no RESEND_API_KEY] Would send to:', opts.to)
      console.log('   Subject:', opts.subject)
      console.log('   Body preview:', opts.text?.substring(0, 100) || opts.html.replace(/<[^>]+>/g,'').substring(0, 100))
      return { success: true, id: 'dev-'+Date.now() }
    }

    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      reply_to: opts.replyTo,
      tags: opts.tags,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log('📧 Email sent via Resend:', data?.id, '→', opts.to)
    return { success: true, id: data?.id }
  } catch (err: any) {
    console.error('sendEmail error:', err)
    return { success: false, error: err.message || 'Failed to send email' }
  }
}

/**
 * Converts plain text to basic HTML email
 */
export function textToHtml(text: string): string {
  return `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
${text.split('\n').map(line => line.trim() ? `<p style="margin:0 0 12px">${line}</p>` : '<br>').join('')}
<hr style="border:none;border-top:1px solid #eee;margin:20px 0">
<p style="font-size:12px;color:#999">Credit Repair AI | <a href="https://creditrepairai.com" style="color:#3b82f6">creditrepairai.com</a></p>
</body></html>`
}
