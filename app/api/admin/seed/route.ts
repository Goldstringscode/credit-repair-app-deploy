import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const passwordHash = await bcrypt.hash('Greatwork6!', 12)

    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('email', 'adminceo@creditrepair.com')
      .select('id, email, role, password_hash')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const valid = await bcrypt.compare('Greatwork6!', data.password_hash)

    return NextResponse.json({
      success: true,
      valid,
      email: data.email,
      role: data.role,
      hashPrefix: data.password_hash.substring(0, 7),
      message: valid ? 'Login ready. DELETE this file now.' : 'Hash mismatch - something went wrong.'
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}