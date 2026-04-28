import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { email } = await req.json().catch(()=>({}))
  const { data: mlmUser } = await supabase.from('mlm_users').select('mlm_code').eq('user_id', user.id).maybeSingle()
  const inviteLink = mlmUser?.mlm_code ? `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${mlmUser.mlm_code}` : null
  return NextResponse.json({ success: true, inviteLink, mlmCode: mlmUser?.mlm_code })
}
export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: mlmUser } = await supabase.from('mlm_users').select('mlm_code').eq('user_id', user.id).maybeSingle()
  const inviteLink = mlmUser?.mlm_code ? `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${mlmUser.mlm_code}` : null
  return NextResponse.json({ inviteLink, mlmCode: mlmUser?.mlm_code })
}