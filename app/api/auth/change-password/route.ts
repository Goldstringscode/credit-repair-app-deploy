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
async function writeAudit(supabase: any, opts: {
  userId?: string|null, email?: string|null, ip: string, ua: string,
  success: boolean, reason?: string
}) {
  try {
    await supabase.from('password_reset_audit').insert({
      event: 'change', user_id: opts.userId||null, email: opts.email||null,
      ip_address: opts.ip, user_agent: opts.ua,
      success: opts.success, failure_reason: opts.reason||null,
    })
  } catch(e) { console.error('[Audit] write failed:', e) }
}

export async function POST(request: NextRequest) {
  const ip = getIp(request)
  const ua = getUa(request)
  const supabase = db()

  try {
    const { userId, currentPassword, newPassword } = await request.json()

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'User ID, current password, and new password are required' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }
    if (currentPassword === newPassword) {
      return NextResponse.json({ error: 'New password must differ from current password' }, { status: 400 })
    }

    // Fetch user
    const { data: user, error: findError } = await supabase
      .from('users').select('id, email, password').eq('id', userId).single()

    if (findError || !user) {
      await writeAudit(supabase, { userId, ip, ua, success: false, reason: 'user_not_found' })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password || '')
    if (!isValid) {
      await writeAudit(supabase, { userId: user.id, email: user.email, ip, ua, success: false, reason: 'wrong_current_password' })
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    const { error: updateError } = await supabase.from('users').update({
      password: hashedPassword,
      password_changed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    if (updateError) {
      await writeAudit(supabase, { userId: user.id, email: user.email, ip, ua, success: false, reason: 'db_update_failed' })
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    await writeAudit(supabase, { userId: user.id, email: user.email, ip, ua, success: true })
    return NextResponse.json({ success: true, message: 'Password changed successfully' })

  } catch (err: any) {
    console.error('[ChangePassword] Error:', err.message)
    return NextResponse.json({ error: sanitizeError(err, 'change-password') }, { status: 500 })
  }
}
