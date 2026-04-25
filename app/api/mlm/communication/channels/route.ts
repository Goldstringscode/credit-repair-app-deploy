import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: channels, error } = await supabase
    .from('mlm_channels')
    .select('id, name, description, channel_type, member_count')
    .eq('is_active', true)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const channelsWithUnread = await Promise.all((channels ?? []).map(async ch => {
    const { data: member } = await supabase
      .from('mlm_channel_members')
      .select('last_read_at')
      .eq('channel_id', ch.id)
      .eq('user_id', user.id)
      .maybeSingle()

    const { count } = await supabase
      .from('mlm_messages')
      .select('id', { count: 'exact', head: true })
      .eq('channel_id', ch.id)
      .eq('is_deleted', false)
      .gt('created_at', member?.last_read_at ?? '1970-01-01')
      .neq('sender_id', user.id)

    await supabase.from('mlm_channel_members')
      .upsert({ channel_id: ch.id, user_id: user.id }, { onConflict: 'channel_id,user_id', ignoreDuplicates: true })

    return { ...ch, unread_count: count ?? 0 }
  }))

  return NextResponse.json({ channels: channelsWithUnread })
}