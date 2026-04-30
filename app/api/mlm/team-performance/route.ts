import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: mlmUser } = await db().from('mlm_users')
    .select('id, team_id, rank, total_downlines, active_downlines, personal_volume, team_volume, current_month_earnings, total_earnings, lifetime_earnings, join_date')
    .eq('user_id', user.id).maybeSingle()

  if (!mlmUser) return NextResponse.json({ success: false, error: 'No MLM account' })

  // Team members in same team
  const { data: teamMembers } = await db().from('mlm_users')
    .select('id, user_id, rank, status, current_month_earnings, total_earnings, total_downlines, personal_volume, join_date')
    .eq('team_id', mlmUser.team_id)

  const activeMembers = (teamMembers||[]).filter((m:any) => m.status === 'active')

  // Rank distribution across team
  const rankDist = (teamMembers||[]).reduce((acc:any, m:any) => {
    const r = m.rank || 'associate'
    acc[r] = (acc[r]||0) + 1
    return acc
  }, {})

  // Commission data for this user
  const { data: commissions } = await db().from('mlm_commissions')
    .select('commission_amount, commission_type, status, created_at')
    .eq('recipient_user_id', user.id)
    .order('created_at', { ascending: true })

  // Group commissions by month for chart data
  const monthlyData: Record<string, number> = {}
  ;(commissions||[]).forEach((c:any) => {
    const month = c.created_at?.substring(0, 7) // YYYY-MM
    if (month) monthlyData[month] = (monthlyData[month]||0) + Number(c.commission_amount||0)
  })

  // Recent new members (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString()
  const recentMembers = (teamMembers||[]).filter((m:any) => m.join_date > thirtyDaysAgo).length

  return NextResponse.json({
    success: true,
    stats: {
      totalMembers: teamMembers?.length || 0,
      activeMembers: activeMembers.length,
      newMembersThisMonth: recentMembers,
      personalVolume: Number(mlmUser.personal_volume) || 0,
      teamVolume: Number(mlmUser.team_volume) || 0,
      currentMonthEarnings: Number(mlmUser.current_month_earnings) || 0,
      totalEarnings: Number(mlmUser.total_earnings) || 0,
      lifetimeEarnings: Number(mlmUser.lifetime_earnings) || 0,
      userRank: mlmUser.rank || 'associate',
      directDownlines: Number(mlmUser.total_downlines) || 0,
      activeDownlines: Number(mlmUser.active_downlines) || 0,
    },
    rankDistribution: Object.entries(rankDist).map(([rank, count]) => ({
      rank, count,
      label: rank.charAt(0).toUpperCase() + rank.slice(1),
    })),
    monthlyEarnings: Object.entries(monthlyData).map(([month, amount]) => ({ month, amount })).sort((a,b)=>a.month.localeCompare(b.month)),
    topPerformers: activeMembers
      .sort((a:any,b:any) => Number(b.current_month_earnings)-Number(a.current_month_earnings))
      .slice(0, 5)
      .map((m:any) => ({
        userId: m.user_id,
        rank: m.rank,
        monthlyEarnings: Number(m.current_month_earnings)||0,
        totalEarnings: Number(m.total_earnings)||0,
        teamSize: Number(m.total_downlines)||0,
      })),
  })
}