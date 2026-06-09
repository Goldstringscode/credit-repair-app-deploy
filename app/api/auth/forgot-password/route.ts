import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPasswordResetEmail } from '@/lib/email-service'
import crypto from 'crypto'
import { sanitizeError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function getIp(req: NextRequest) {
  return req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}
function getUa(req: NextRequest) {
  return req.headers.get('user-agent')?.substring(0, 200) || 'unknown'
}
async function hashToken(token: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('')
}
async function writeAudit(supabase: any, event: string, opts: {
  userId?: string|null, email?: string|null, ip: string, ua: string,
  token?: string, success: boolean, reason?: string
}) {
  try {
    await supabase.from('password_reset_audit').insert({
      event, user_id: opts.userId||null, email: opts.email||null,
      ip_address: opts.ip, user_agent: opts.ua,
      token_hash: opts.token ? await hashToken(opts.token) : null,
      success: opts.success, failure_reason: opts.reason||null,
    })
  } catch(e) { console.error('[Audit] write failed:', e) }
}

export async function POST(request: NextRequest) {
  const ip = getIp(request)
  const ua = getUa(request)
  const supabase = db()

  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Look up user — always return success to prevent email enumeration
    const { data: user } = await supabase
      .from('users').select('id, email').eq('email', email.toLowerCase()).single()

    if (!user) {
      // Audit the failed attempt (unknown email) but don't reveal it
      await writeAudit(supabase, 'request', { email, ip, ua, success: false, reason: 'email_not_found' })
      return NextResponse.json({ success: true, message: 'If an account with that email exists, we have sent a password reset link.' })
    }

    // Generate a cryptographically secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    const resetLink = (process.env.NEXT_PUBLIC_APP_URL || 'https://creditrepairai.com') + '/reset-password?token=' + resetToken

    // Store hashed token in DB — never store raw token
    const { error: updateError } = await supabase.from('users').update({
      password_reset_token: resetToken,
      password_reset_expires: resetExpires.toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    if (updateError) {
      await writeAudit(supabase, 'request', { userId: user.id, email, ip, ua, success: false, reason: 'db_update_failed' })
      return NextResponse.json({ error: 'Failed to initiate password reset' }, { status: 500 })
    }

    // Send reset email
    try {
      await sendPasswordResetEmail(email, resetLink)
    } catch(emailErr) {
      console.error('[ForgotPassword] Email send failed:', emailErr)
      await writeAudit(supabase, 'request', { userId: user.id, email, ip, ua, token: resetToken, success: false, reason: 'email_send_failed' })
      return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 })
    }

    await writeAudit(supabase, 'request', { userId: user.id, email, ip, ua, token: resetToken, success: true })
    return NextResponse.json({ success: true, message: 'If an account with that email exists, we have sent a password reset link.' })

  } catch (err: any) {
    console.error('[ForgotPassword] Error:', err.message)
    return NextResponse.json({ error: sanitizeError(err, 'forgot-password') }, { status: 500 })
  }
}
