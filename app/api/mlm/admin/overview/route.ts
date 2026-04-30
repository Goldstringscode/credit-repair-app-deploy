import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Admin only
  const { data: u } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
  if (u?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // All teams with stats
  const { data: teams } = await supabase.from('mlm_teams')
    .select('id, name, team_code, status, is_active, plan, created_at, founder_id, leader_id')
    .order('created_at', { ascending: true })

  const teamIds = (teams||[]).map((t:any) => t.id)

  // Member counts per team
  const { data: members } = await supabase.from('mlm_users')
    .select('id, team_id, rank, status, total_earnings, current_month_earnings, join_date, user_id')

  // Channel counts per team
  const { data: channels } = await supabase.from('mlm_channels')
    .select('id, team_id, name, is_active').eq('is_active', true)

  // Message counts per team
  const { data: messages } = await supabase.from('mlm_messages')
    .select('id, team_id, created_at').order('created_at', { ascending: false }).limit(1000)

  // Commission totals
  const { data: commissions } = await supabase.from('mlm_commissions')
    .select('commission_amount, status, recipient_user_id')

  // User details for all members
  const userIds = (members||[]).map((m:any) => m.user_id)
  const { data: userDetails } = userIds.length > 0
    ? await supabase.from('users').select('id, email, first_name, last_name, created_at').in('id', userIds)
    : { data: [] }

  // Build team summaries
  const teamSummaries = (teams||[]).map((team:any) => {
    const teamMembers = (members||[]).filter((m:any) => m.team_id === team.id)
    const teamChannels = (channels||[]).filter((c:any) => c.team_id === team.id)
    const teamMessages = (messages||[]).filter((m:any) => m.team_id === team.id)
    const teamComms = (commissions||[]).filter((c:any) =>
      teamMembers.some((m:any) => m.user_id === c.recipient_user_id)
    )
    const totalPaid = teamComms.filter((c:any)=>c.status==='paid').reduce((s:number,c:any)=>s+Number(c.commission_amount),0)
    const totalPending = teamComms.filter((c:any)=>c.status!=='paid').reduce((s:number,c:any)=>s+Number(c.commission_amount),0)

    const enrichedMembers = teamMembers.map((m:any) => {
      const ud = (userDetails||[]).find((u:any)=>u.id===m.user_id)
      return {
        id: m.id,
        userId: m.user_id,
        email: ud?.email || '',
        name: ud ? [ud.first_name,ud.last_name].filter(Boolean).join(' ')||ud.email : 'Unknown',
        rank: m.rank,
        status: m.status,
        totalEarnings: Number(m.total_earnings)||0,
        monthlyEarnings: Number(m.current_month_earnings)||0,
        joinDate: m.join_date,
      }
    })

    return {
      id: team.id,
      name: team.name,
      teamCode: team.team_code,
      status: team.status || (team.is_active ? 'active' : 'inactive'),
      plan: team.plan,
      createdAt: team.created_at,
      memberCount: teamMembers.length,
      activeMembers: teamMembers.filter((m:any)=>m.status==='active').length,
      channelCount: teamChannels.length,
      messageCount: teamMessages.length,
      totalPaid: parseFloat(totalPaid.toFixed(2)),
      totalPending: parseFloat(totalPending.toFixed(2)),
      members: enrichedMembers,
      channels: teamChannels.map((c:any)=>({id:c.id,name:c.name})),
    }
  })

  // Global stats
  const totalMembers = (members||[]).length
  const totalEarnings = (commissions||[]).filter((c:any)=>c.status==='paid').reduce((s:number,c:any)=>s+Number(c.commission_amount),0)
  const rankCounts = (members||[]).reduce((acc:any,m:any)=>{ acc[m.rank]=(acc[m.rank]||0)+1; return acc },{})

  return NextResponse.json({
    success: true,
    global: {
      totalTeams: teams?.length||0,
      totalMembers,
      activeMembers: (members||[]).filter((m:any)=>m.status==='active').length,
      totalEarningsPaid: parseFloat(totalEarnings.toFixed(2)),
      rankBreakdown: rankCounts,
    },
    teams: teamSummaries,
  })
}