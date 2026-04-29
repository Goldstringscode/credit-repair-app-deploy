import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
import { getTeamContext, getVisibleTeamIds } from '@/lib/mlm-team-context'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET: list channels visible to the user
// - Regular member: only their team's channels
// - Admin: all channels across ALL teams
export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ctx = await getTeamContext(user.id)
  if (!ctx) return NextResponse.json({ success: false, data: [] })

  const teamIds = await getVisibleTeamIds(ctx)
  if (teamIds.length === 0) return NextResponse.json({ success: true, data: [] })

  const { data: channels } = await supabase
    .from('mlm_channels')
    .select('id, name, description, team_id, created_by, is_active, created_at')
    .in('team_id', teamIds)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  // Get unread counts per channel for this user
  const channelIds = (channels || []).map((c: any) => c.id)
  let unreadByChannel: Record<string, number> = {}
  if (channelIds.length > 0) {
    const { data: unread } = await supabase
      .from('mlm_messages')
      .select('channel_id, id')
      .in('channel_id', channelIds)
    // For now, just give a count - real read-tracking would need a read_at table
    unreadByChannel = (unread || []).reduce((acc: any, m: any) => {
      acc[m.channel_id] = (acc[m.channel_id] || 0) + 0 // placeholder
      return acc
    }, {})
  }

  return NextResponse.json({
    success: true,
    data: (channels || []).map((c: any) => ({
      ...c,
      unread_count: unreadByChannel[c.id] || 0,
      can_moderate: ctx.canModerate || c.created_by === user.id,
    })),
    teamContext: { teamId: ctx.teamId, teamCode: ctx.teamCode, isAdmin: ctx.isAdmin, canModerate: ctx.canModerate },
  })
}

// POST: create a new channel (admin OR team founder only)
export async function POST(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ctx = await getTeamContext(user.id)
  if (!ctx) return NextResponse.json({ error: 'No MLM account' }, { status: 403 })
  if (!ctx.canModerate) return NextResponse.json({ error: 'Only team founders or admin can create channels' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { name, description, team_id: bodyTeamId } = body

  if (!name) return NextResponse.json({ error: 'Channel name required' }, { status: 400 })

  // Admin can create channels for any team; founders only for their own
  const targetTeamId = ctx.isAdmin && bodyTeamId ? bodyTeamId : ctx.teamId
  if (!targetTeamId) return NextResponse.json({ error: 'No team specified' }, { status: 400 })

  const { data: channel, error } = await supabase
    .from('mlm_channels')
    .insert({
      name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 50),
      description: description || null,
      team_id: targetTeamId,
      created_by: user.id,
      is_active: true,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, channel })
}

// DELETE: remove a channel (admin OR creator OR team founder)
export async function DELETE(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const channelId = searchParams.get('id')
  if (!channelId) return NextResponse.json({ error: 'Channel id required' }, { status: 400 })

  const ctx = await getTeamContext(user.id)
  if (!ctx) return NextResponse.json({ error: 'No MLM account' }, { status: 403 })

  const { data: channel } = await supabase
    .from('mlm_channels')
    .select('id, team_id, created_by')
    .eq('id', channelId)
    .maybeSingle()

  if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })

  // Permission: admin OR (founder of THAT channel's team) OR creator
  const isFounderOfChannelTeam = ctx.teamId === channel.team_id && ctx.isTeamFounder
  const isCreator = channel.created_by === user.id
  if (!ctx.isAdmin && !isFounderOfChannelTeam && !isCreator) {
    return NextResponse.json({ error: 'Not authorized to delete this channel' }, { status: 403 })
  }

  // Soft-delete (mark inactive)
  await supabase.from('mlm_channels').update({ is_active: false }).eq('id', channelId)
  return NextResponse.json({ success: true })
}
