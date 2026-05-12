import { Resend } from 'resend'

let _resend: Resend | null = null
export function getResend(): Resend {
  if (!_resend) {
    const k = process.env.RESEND_API_KEY
    if (!k) throw new Error('RESEND_API_KEY not set')
    _resend = new Resend(k)
  }
  return _resend
}

export const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'
export const FROM_NAME  = process.env.FROM_NAME  || 'Credit Repair AI'
export const FROM       = `${FROM_NAME} <${FROM_EMAIL}>`
export const DEV_TO_EMAIL = process.env.DEV_TO_EMAIL || null
export const APP_URL    = process.env.NEXT_PUBLIC_APP_URL || 'https://creditrepairai.com'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: { name: string; value: string }[]
}
export interface SendEmailResult { success: boolean; id?: string; error?: string }

export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.log('📧 [DEV no key] Would send to:', opts.to, '| Subject:', opts.subject)
      return { success: true, id: 'dev-'+Date.now() }
    }
    const resend = getResend()
    const recipients = DEV_TO_EMAIL ? [DEV_TO_EMAIL] : (Array.isArray(opts.to) ? opts.to : [opts.to])
    if (DEV_TO_EMAIL) console.log(`📧 [TEST] ${Array.isArray(opts.to)?opts.to.join(','):opts.to} → ${DEV_TO_EMAIL}`)
    const payload: any = { from: FROM, to: recipients, subject: opts.subject, html: opts.html }
    if (opts.text) payload.text = opts.text
    if (opts.replyTo) payload.reply_to = opts.replyTo
    if (opts.tags?.length) payload.tags = opts.tags
    console.log('📧 Sending:', opts.subject, '→', recipients)
    const { data, error } = await resend.emails.send(payload)
    if (error) { console.error('📧 Resend error:', JSON.stringify(error)); return { success: false, error: (error as any).message || JSON.stringify(error) } }
    console.log('📧 Sent! id:', data?.id)
    return { success: true, id: data?.id }
  } catch (err: any) {
    console.error('📧 sendEmail exception:', err.message)
    return { success: false, error: err.message }
  }
}

// ─── Branded HTML Builder ──────────────────────────────────────────────────────
// Used by all email functions for a consistent, professional look

export function buildEmail(opts: {
  preheader?: string
  headerTitle?: string
  headerSubtitle?: string
  accentColor?: string
  body: string
  ctaUrl?: string
  ctaText?: string
  footerNote?: string
}): string {
  const accent = opts.accentColor || '#667eea'
  const appUrl = APP_URL
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${opts.headerTitle || 'Credit Repair AI'}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden">${opts.preheader}</div>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

<!-- HEADER -->
<tr><td style="background:linear-gradient(135deg,${accent} 0%,#764ba2 100%);border-radius:12px 12px 0 0;padding:40px 40px 32px;text-align:center">
  <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:16px">
    <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center">
      <span style="color:white;font-size:18px;font-weight:bold">C</span>
    </div>
    <span style="color:rgba(255,255,255,0.9);font-size:16px;font-weight:600;letter-spacing:0.5px">Credit Repair AI</span>
  </div>
  ${opts.headerTitle ? `<h1 style="margin:0 0 8px;color:white;font-size:28px;font-weight:700;letter-spacing:-0.5px">${opts.headerTitle}</h1>` : ''}
  ${opts.headerSubtitle ? `<p style="margin:0;color:rgba(255,255,255,0.85);font-size:15px">${opts.headerSubtitle}</p>` : ''}
</td></tr>

<!-- BODY -->
<tr><td style="background:#ffffff;padding:40px">
  ${opts.body}
  ${opts.ctaUrl ? `
  <div style="text-align:center;margin:32px 0 8px">
    <a href="${opts.ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,${accent} 0%,#764ba2 100%);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.3px">${opts.ctaText || 'Get Started'}</a>
  </div>` : ''}
</td></tr>

<!-- FOOTER -->
<tr><td style="background:#f8f9fa;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;border-top:1px solid #e9ecef">
  ${opts.footerNote ? `<p style="margin:0 0 12px;color:#6c757d;font-size:13px">${opts.footerNote}</p>` : ''}
  <p style="margin:0 0 8px;color:#6c757d;font-size:13px">© 2025 Credit Repair AI. All rights reserved.</p>
  <p style="margin:0;font-size:12px">
    <a href="${appUrl}/privacy" style="color:#667eea;text-decoration:none">Privacy Policy</a>
    &nbsp;·&nbsp;
    <a href="${appUrl}/terms" style="color:#667eea;text-decoration:none">Terms of Service</a>
    &nbsp;·&nbsp;
    <a href="${appUrl}/support" style="color:#667eea;text-decoration:none">Support</a>
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

// ─── Helper: info row for email body ──────────────────────────────────────────
export function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;color:#5a6c7d;font-size:14px;border-bottom:1px solid #f0f0f0">${label}</td>
    <td style="padding:10px 0;font-size:14px;font-weight:600;color:#2c3e50;text-align:right;border-bottom:1px solid #f0f0f0">${value}</td>
  </tr>`
}

export function infoTable(rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">${rows}</table>`
}

export function textToHtml(text: string): string {
  return buildEmail({
    body: text.split('\n').map(l=>l.trim() ? `<p style="margin:0 0 14px;color:#2c3e50;font-size:15px;line-height:1.6">${l}</p>` : '').join('')
  })
}
