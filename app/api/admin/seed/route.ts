import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * ONE-TIME admin seed endpoint.
 * DELETE THIS FILE after running it once.
 * Protected by SEED_SECRET env var so only you can call it.
 */
export async function POST(req: NextRequest) {
  // Gate: must pass the seed secret
  const { secret } = await req.json()
  if (!secret || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Hash the password server-side with bcrypt cost factor 12
    const passwordHash = await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD!, 12)

    // Ensure users table has the role column
    await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','admin','moderator'));`
    }).catch(() => {}) // ignore if rpc doesn't exist — column may already exist

    // Upsert the admin user
    const { data, error } = await supabase
      .from('users')
      .upsert({
        email: process.env.ADMIN_SEED_EMAIL!,
        password_hash: passwordHash,
        first_name: 'Admin',
        last_name: 'CEO',
        role: 'admin',
        is_admin: true,
        is_active: true,
        email_verified: true,
        subscription_tier: 'enterprise',
        subscription_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' })
      .select('id, email, role')
      .single()

    if (error) {
      console.error('Seed error:', error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created. DELETE app/api/admin/seed/route.ts now.',
      user: data,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}