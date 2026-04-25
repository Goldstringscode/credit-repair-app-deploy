import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase
    .from('mlm_direct_messages')
    .select('id, from_user_id, to_user_id, content, is_read, created_at')
    .or('from_user_id.eq.'+user.id+',to_user_id.eq.'+user.id)
    .order('created_at', { ascending: false }).limit(50)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data: data ?? [] })
}
export async function POST(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { to_user_id, toUserId, content } = await req.json().catch(() => ({}))
  const toId = to_user_id || toUserId
  if (!toId || !content?.trim()) return NextResponse.json({ success: false, error: 'toUserId and content required' }, { status: 400 })
  const { data: msg, error } = await supabase.from('mlm_direct_messages')
    .insert({ from_user_id: user.id, to_user_id: toId, content: content.trim(), is_read: false })
    .select().single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data: msg }, { status: 201 })
}