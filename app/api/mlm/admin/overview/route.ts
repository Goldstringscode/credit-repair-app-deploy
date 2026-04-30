import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: me } = await db().from('users').select('role').eq('id', user.id).maybeSingle()
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // ── SOURCE OF TRUTH: users table ──
  const [
    { data: allUsers },
    { data: allMlmUsers },
    { data: allTeams },
    { data: allChannels },
    { data: allMessages },
    { data: allCommissions },
  ] = await Promise.all([
    db().from('users').select('id, email, first_name, last_name, role, subscription_tier, subscription_status, created_at').order('created_at', { ascending: true }),
    db().from('mlm_users').select('id, user_id, rank, status, total_earnings, current_month_earnings, join_date, team_id, mlm_code'),
    db().from('mlm_teams').select('id, name, team_code, status, is_active, plan, created_at, founder_id, leader_id'),
    db().from('mlm_channels').select('id, team_id, name, is_active').eq('is_active', true),
    db().from('mlm_messages').select('id, team_id, created_at').order('created_at', { ascending: false }).limit(500),
    db().from('mlm_commissions').select('commission_amount, status, recipient_user_id'),
  ])

  const mlmMap = new Map((allMlmUsers||[]).map((m: any) => [m.user_id, m]))
  const teamMap = new Map((allTeams||[]).map((t: any) => [t.id, t]))

  // Build enriched user list from ALL users
  const enrichedUsers = (allUsers||[]).map((u: any) => {
    const mlm = mlmMap.get(u.id)
    const team = mlm ? teamMap.get(mlm.team_id) : null
    let userType = 'credit_repair'
    if (u.role === 'admin') userType = 'admin'
    else if (mlm && u.subscription_status === 'active') userType = 'both'
    else if (mlm) userType = 'mlm'
    return {
      id: u.id,
      email: u.email,
      name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email,
      role: u.role || 'user',
      userType,
      subscriptionTier: u.subscription_tier || 'free',
      subscriptionStatus: u.subscription_status || 'inactive',
      createdAt: u.created_at,
      rank: mlm?.rank || null,
      status: mlm?.status || null,
      totalEarnings: Number(mlm?.total_earnings) || 0,
      monthlyEarnings: Number(mlm?.current_month_earnings) || 0,
      joinDate: mlm?.join_date || null,
      mlmCode: mlm?.mlm_code || null,
      teamId: mlm?.team_id || null,
      teamName: team?.name || null,
      teamCode: team?.team_code || null,
      canCreateTeam: ['premium','enterprise'].includes(u.subscription_tier||''),
    }
  })

  // Global stats derived from ALL users
  const global = {
    totalUsers: allUsers?.length || 0,
    totalTeams: allTeams?.length || 0,
    totalMembers: allMlmUsers?.length || 0,
    activeMembers: (allMlmUsers||[]).filter((m: any) => m.status === 'active').length,
    creditRepairOnly: enrichedUsers.filter(u => u.userType === 'credit_repair').length,
    mlmOnly: enrichedUsers.filter(u => u.userType === 'mlm').length,
    both: enrichedUsers.filter(u => u.userType === 'both').length,
    admins: enrichedUsers.filter(u => u.userType === 'admin').length,
    activeSubscriptions: (allUsers||[]).filter((u: any) => u.subscription_status === 'active').length,
    totalEarningsPaid: (allCommissions||[]).filter((c: any) => c.status === 'paid').reduce((s: number, c: any) => s + Number(c.commission_amount), 0),
    rankBreakdown: (allMlmUsers||[]).reduce((acc: any, m: any) => { acc[m.rank||'associate'] = (acc[m.rank||'associate']||0)+1; return acc }, {}),
    subscriptionBreakdown: (allUsers||[]).reduce((acc: any, u: any) => { const t=u.subscription_tier||'free'; acc[t]=(acc[t]||0)+1; return acc }, {}),
    canCreateTeamCount: (allUsers||[]).filter((u: any) => ['premium','enterprise'].includes(u.subscription_tier||'')).length,
  }

  // Build team summaries
  const teamSummaries = (allTeams||[]).map((team: any) => {
    const teamMlmUsers = (allMlmUsers||[]).filter((m: any) => m.team_id === team.id)
    const teamUserIds = teamMlmUsers.map((m: any) => m.user_id)
    const teamChannels = (allChannels||[]).filter((c: any) => c.team_id === team.id)
    const teamMessages = (allMessages||[]).filter((m: any) => m.team_id === team.id)
    const teamComms = (allCommissions||[]).filter((c: any) => teamUserIds.includes(c.recipient_user_id))
    const totalPaid = teamComms.filter((c: any) => c.status === 'paid').reduce((s: number, c: any) => s + Number(c.commission_amount), 0)
    const totalPending = teamComms.filter((c: any) => c.status !== 'paid').reduce((s: number, c: any) => s + Number(c.commission_amount), 0)

    const members = teamMlmUsers.map((m: any) => {
      const u = enrichedUsers.find((u: any) => u.id === m.user_id)
      return u ? {
        ...u,
        rank: m.rank || 'associate',
        status: m.status,
        totalEarnings: Number(m.total_earnings)||0,
        monthlyEarnings: Number(m.current_month_earnings)||0,
        joinDate: m.join_date,
        mlmCode: m.mlm_code,
      } : null
    }).filter(Boolean)

    return {
      id: team.id,
      name: team.name,
      teamCode: team.team_code,
      status: team.status || (team.is_active ? 'active' : 'inactive'),
      plan: team.plan,
      createdAt: team.created_at,
      memberCount: teamMlmUsers.length,
      activeMembers: teamMlmUsers.filter((m: any) => m.status === 'active').length,
      channelCount: teamChannels.length,
      messageCount: teamMessages.length,
      totalPaid: parseFloat(totalPaid.toFixed(2)),
      totalPending: parseFloat(totalPending.toFixed(2)),
      members,
      channels: teamChannels.map((c: any) => ({ id: c.id, name: c.name })),
    }
  })

  return NextResponse.json({ success: true, global, teams: teamSummaries, allUsers: enrichedUsers })
}