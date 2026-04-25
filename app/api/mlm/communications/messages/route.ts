import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const channelId = searchParams.get('channelId') || searchParams.get('channel_id')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)
  const before = searchParams.get('before')
  if (!channelId) return NextResponse.json({ success: false, error: 'channelId required' }, { status: 400 })
  let q = supabase.from('mlm_messages').select('id,channel_id,sender_id,sender_name,sender_avatar,content,message_type,attachment_url,attachment_name,created_at').eq('channel_id',channelId).eq('is_deleted',false).order('created_at',{ascending:true}).limit(limit)
  if (before) q = q.lt('created_at', before)
  const { data, error } = await q
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data: data ?? [] })
}

export async function POST(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const { channelId, channel_id, content, messageType, message_type } = body
  const chId = channelId || channel_id
  const msgType = messageType || message_type || 'text'
  if (!chId || !content?.trim()) return NextResponse.json({ success: false, error: 'channelId and content required' }, { status: 400 })
  const { data: ud } = await supabase.from('users').select('first_name,last_name,email').eq('id', user.id).maybeSingle()
  const sn = ud ? [ud.first_name, ud.last_name].filter(Boolean).join(' ') || ud.email : user.email ?? 'Member'
  const { data: msg, error } = await supabase.from('mlm_messages').insert({ channel_id: chId, sender_id: user.id, sender_name: sn, content: content.trim(), message_type: msgType, created_at: new Date().toISOString() }).select('id,channel_id,sender_id,sender_name,content,message_type,created_at').single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data: msg }, { status: 201 })
}