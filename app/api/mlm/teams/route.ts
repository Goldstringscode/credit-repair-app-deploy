import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
import { MLM_PERMISSIONS } from '@/lib/mlm-subscription-permissions'

const supabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET /api/mlm/teams — list all teams (admin) or user's team
export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = supabase()
  const { data: userData } = await db.from('users').select('role, subscription_tier, subscription_status').eq('id', user.id).maybeSingle()
  const isAdmin = userData?.role === 'admin'

  if (isAdmin) {
    const { data: teams } = await db.from('mlm_teams').select('*').order('created_at', { ascending: true })
    return NextResponse.json({ success: true, teams })
  }

  const { data: mlmUser } = await db.from('mlm_users').select('team_id').eq('user_id', user.id).maybeSingle()
  if (!mlmUser?.team_id) return NextResponse.json({ success: true, team: null })

  const { data: team } = await db.from('mlm_teams').select('*').eq('id', mlmUser.team_id).maybeSingle()
  return NextResponse.json({ success: true, team })
}

// POST /api/mlm/teams — create a new team (Premium/Enterprise only)
export async function POST(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = supabase()

  // Check subscription tier
  const { data: userData } = await db.from('users')
    .select('role, subscription_tier, subscription_status')
    .eq('id', user.id).maybeSingle()

  const isAdmin = userData?.role === 'admin'
  const tier = userData?.subscription_tier || 'free'

  if (!isAdmin && !MLM_PERMISSIONS.canCreateTeam(tier)) {
    return NextResponse.json({
      error: 'Team creation requires a Premium or Enterprise subscription',
      requiredTier: 'premium',
      currentTier: tier,
      upgradeUrl: '/billing',
    }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const { name, description, teamCode } = body

  if (!name || !teamCode) return NextResponse.json({ error: 'Name and team code required' }, { status: 400 })

  // Check team code is unique
  const { data: existing } = await db.from('mlm_teams').select('id').eq('team_code', teamCode.toUpperCase()).maybeSingle()
  if (existing) return NextResponse.json({ error: 'Team code already taken' }, { status: 409 })

  // Get user's MLM record
  const { data: mlmUser } = await db.from('mlm_users').select('id').eq('user_id', user.id).maybeSingle()
  if (!mlmUser) return NextResponse.json({ error: 'No MLM account found' }, { status: 404 })

  // Create team
  const { data: team, error } = await db.from('mlm_teams').insert({
    name: name.trim(),
    description: description?.trim() || null,
    team_code: teamCode.toUpperCase().trim(),
    leader_id: mlmUser.id,
    founder_id: user.id,
    is_active: true,
    status: 'active',
    plan: tier,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Assign user to their new team
  await db.from('mlm_users').update({ team_id: team.id }).eq('id', mlmUser.id)

  // Seed default channels for the new team
  const defaultChannels = ['general', 'announcements', 'wins', 'support']
  for (const channelName of defaultChannels) {
    await db.from('mlm_channels').insert({
      name: channelName,
      description: channelName === 'general' ? 'General team discussion'
        : channelName === 'announcements' ? 'Important team announcements'
        : channelName === 'wins' ? 'Share your wins!'
        : 'Get help from the team',
      team_id: team.id,
      created_by: user.id,
      is_active: true,
      created_at: new Date().toISOString(),
    })
  }

  // Seed commission rules
  const commRules = [[1,0.10],[2,0.08],[3,0.06],[4,0.05],[5,0.04],[6,0.03],[7,0.02]]
  for (const [depth, pct] of commRules) {
    await db.from('mlm_team_commission_rules').insert({
      team_id: team.id, level_depth: depth, commission_pct: pct
    })
  }

  return NextResponse.json({ success: true, team })
}
