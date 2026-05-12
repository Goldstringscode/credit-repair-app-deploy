import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  const { data: user, error } = await db.from('users')
    .select('id, email, first_name, subscription_status')
    .eq('email', email.toLowerCase())
    .single()

  return NextResponse.json({
    found: !!user,
    error: error?.message,
    email: user?.email,
    id: user?.id?.substring(0,8),
    firstName: user?.first_name,
  })
}
