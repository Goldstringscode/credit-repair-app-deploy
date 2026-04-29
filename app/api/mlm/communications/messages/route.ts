import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
import { getTeamContext, getVisibleTeamIds } from '@/lib/mlm-team-context'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET ?channel_id=xxx — fetch messages for a channel (must belong to user's visible teams)
export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const channelId = searchParams.get('channel_id')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
  if (!channelId) return NextResponse.json({ error: 'channel_id required' }, { status: 400 })

  const ctx = await getTeamContext(user.id)
  if (!ctx) return NextResponse.json({ success: false, data: [] })

  const teamIds = await getVisibleTeamIds(ctx)
  if (teamIds.length === 0) return NextResponse.json({ success: true, data: [] })

  // Verify channel belongs to a visible team (prevents cross-team peeking)
  const { data: channel } = await supabase
    .from('mlm_channels')
    .select('team_id')
    .eq('id', channelId)
    .maybeSingle()

  if (!channel || !teamIds.includes(channel.team_id)) {
    return NextResponse.json({ error: 'Channel not accessible' }, { status: 403 })
  }

  const { data: messages } = await supabase
    .from('mlm_messages')
    .select('id, channel_id, sender_id, sender_name, sender_avatar, content, attachment_url, attachment_name, team_id, created_at')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true })
    .limit(limit)

  return NextResponse.json({
    success: true,
    data: (messages || []).map((m: any) => ({
      ...m,
      can_delete: ctx.isAdmin || ctx.isTeamFounder || m.sender_id === user.id,
    })),
  })
}

// POST — send a message (any team member can post in their team's channels)
export async function POST(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { channel_id, content, attachment_url, attachment_name } = body
  if (!channel_id || (!content && !attachment_url)) {
    return NextResponse.json({ error: 'channel_id + content required' }, { status: 400 })
  }

  const ctx = await getTeamContext(user.id)
  if (!ctx) return NextResponse.json({ error: 'No MLM account' }, { status: 403 })

  const teamIds = await getVisibleTeamIds(ctx)

  // Verify channel belongs to user's team (or admin posting in any team)
  const { data: channel } = await supabase
    .from('mlm_channels')
    .select('id, team_id, is_active')
    .eq('id', channel_id)
    .maybeSingle()

  if (!channel || !channel.is_active) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  if (!teamIds.includes(channel.team_id)) return NextResponse.json({ error: 'Cannot post in this team' }, { status: 403 })

  // Get sender display info
  const { data: sender } = await supabase
    .from('users')
    .select('first_name, last_name, email')
    .eq('id', user.id)
    .maybeSingle()
  const senderName = sender ? [sender.first_name, sender.last_name].filter(Boolean).join(' ') || sender.email : 'Member'

  const { data: message, error } = await supabase
    .from('mlm_messages')
    .insert({
      channel_id,
      sender_id: user.id,
      sender_name: senderName,
      content: content || '',
      attachment_url: attachment_url || null,
      attachment_name: attachment_name || null,
      team_id: channel.team_id,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, message })
}

// DELETE ?id=msg_id — delete a message (admin, team founder, or sender)
export async function DELETE(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const messageId = searchParams.get('id')
  if (!messageId) return NextResponse.json({ error: 'message id required' }, { status: 400 })

  const ctx = await getTeamContext(user.id)
  if (!ctx) return NextResponse.json({ error: 'No MLM account' }, { status: 403 })

  const { data: message } = await supabase
    .from('mlm_messages')
    .select('id, sender_id, team_id')
    .eq('id', messageId)
    .maybeSingle()

  if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 })

  const isFounderOfThatTeam = ctx.teamId === message.team_id && ctx.isTeamFounder
  const isSender = message.sender_id === user.id
  if (!ctx.isAdmin && !isFounderOfThatTeam && !isSender) {
    return NextResponse.json({ error: 'Not authorized to delete' }, { status: 403 })
  }

  await supabase.from('mlm_messages').delete().eq('id', messageId)
  return NextResponse.json({ success: true })
}
