import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.slice(7)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: messages, error } = await supabase
    .from('mlm_direct_messages')
    .select('id, from_user_id, to_user_id, content, is_read, created_at')
    .or('from_user_id.eq.' + user.id + ',to_user_id.eq.' + user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: messages ?? [] })
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.slice(7)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to_user_id, content } = await req.json().catch(() => ({}))
  if (!to_user_id || !content?.trim()) return NextResponse.json({ error: 'to_user_id and content required' }, { status: 400 })

  const { data: message, error } = await supabase
    .from('mlm_direct_messages')
    .insert({ from_user_id: user.id, to_user_id, content: content.trim(), is_read: false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message }, { status: 201 })
}