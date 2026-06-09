import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
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
function getUa(req: NextRequest) { return req.headers.get('user-agent')?.substring(0,200)||'unknown' }
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
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Find user with valid, non-expired token
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, password_reset_token, password_reset_expires')
      .eq('password_reset_token', token)
      .single()

    if (findError || !user) {
      await writeAudit(supabase, 'fail_invalid_token', { ip, ua, token, success: false, reason: 'token_not_found' })
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    // Check expiry
    if (!user.password_reset_expires || new Date() > new Date(user.password_reset_expires)) {
      await writeAudit(supabase, 'fail_expired', { userId: user.id, email: user.email, ip, ua, token, success: false, reason: 'token_expired' })
      // Clear the expired token
      await supabase.from('users').update({ password_reset_token: null, password_reset_expires: null }).eq('id', user.id)
      return NextResponse.json({ error: 'Reset token has expired. Please request a new one.' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and clear the reset token atomically
    const { error: updateError } = await supabase.from('users').update({
      password: hashedPassword,
      password_reset_token: null,
      password_reset_expires: null,
      password_changed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    if (updateError) {
      await writeAudit(supabase, 'fail_invalid_token', { userId: user.id, email: user.email, ip, ua, token, success: false, reason: 'db_update_failed' })
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    await writeAudit(supabase, 'success', { userId: user.id, email: user.email, ip, ua, token, success: true })
    return NextResponse.json({ success: true, message: 'Password updated successfully' })

  } catch (err: any) {
    console.error('[ResetPassword] Error:', err.message)
    return NextResponse.json({ error: sanitizeError(err, 'reset-password') }, { status: 500 })
  }
}
