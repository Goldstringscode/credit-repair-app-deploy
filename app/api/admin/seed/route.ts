import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ONE-TIME endpoint — delete this file after use
export async function POST(req: NextRequest) {
  const { secret } = await req.json()
  if (!secret || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Generate bcryptjs-compatible hash (uses $2b$ prefix)
    const passwordHash = await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD!, 12)

    // Update the existing admin user with the correct hash
    const { data, error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('email', process.env.ADMIN_SEED_EMAIL!)
      .select('id, email, role, password_hash')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Verify the hash works immediately
    const valid = await bcrypt.compare(process.env.ADMIN_SEED_PASSWORD!, data.password_hash)

    return NextResponse.json({
      success: true,
      valid,
      message: valid
        ? 'Password hash updated and verified. Login should now work. DELETE this file now.'
        : 'Hash updated but verification failed — something is wrong.',
      email: data.email,
      role: data.role,
      hashPrefix: data.password_hash.substring(0, 7),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}