import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { verifyAdminRequest } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// One-time password reset — delete this file after use
export async function GET(request: NextRequest) {
  const _auth = await verifyAdminRequest(request)
  if ('error' in _auth) return _auth.error

  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== 'reset2025now') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const email = 'adminceo@creditrepair.com'
  const newPassword = 'Greatprogress6!'

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Hash with same rounds as login (10)
  const hash = await bcrypt.hash(newPassword, 10)

  const { data, error } = await db
    .from('users')
    .update({ password_hash: hash, updated_at: new Date().toISOString() })
    .eq('email', email)
    .select('id, email, first_name')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    updated: data.email,
    message: 'Password set to Greatprogress6! — log in now then delete this route',
    hash_preview: hash.substring(0, 20) + '...',
  })
}
