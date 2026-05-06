import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || 'month' // month | all
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

  // Get current user's team
  const { data: mlmUser } = await db().from('mlm_users')
    .select('id, team_id, mlm_code, rank, current_month_earnings, total_earnings, total_downlines')
    .eq('user_id', user.id).maybeSingle()

  if (!mlmUser) return NextResponse.json({ success: true, leaderboard: [], currentUser: null })

  // Get all users in same team
  const { data: teamMembers } = await db().from('mlm_users')
    .select('id, user_id, mlm_code, rank, current_month_earnings, total_earnings, total_downlines, status')
    .eq('team_id', mlmUser.team_id)
    .eq('status', 'active')
    .order(period === 'month' ? 'current_month_earnings' : 'total_earnings', { ascending: false })
    .limit(limit)

  const userIds = (teamMembers||[]).map((m:any) => m.user_id)
  const { data: users } = userIds.length > 0
    ? await db().from('users').select('id, first_name, last_name, email').in('id', userIds)
    : { data: [] }

  const leaderboard = (teamMembers||[]).map((m:any, i:number) => {
    const u = (users||[]).find((u:any) => u.id === m.user_id)
    const isCurrentUser = m.user_id === user.id
    return {
      rank: i + 1,
      userId: m.user_id,
      mlmCode: m.mlm_code,
      name: u ? [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email : 'Member',
      mlmRank: m.rank || 'associate',
      monthlyEarnings: Number(m.current_month_earnings) || 0,
      totalEarnings: Number(m.total_earnings) || 0,
      teamSize: Number(m.total_downlines) || 0,
      isCurrentUser,
    }
  })

  const currentUserEntry = leaderboard.find(m => m.isCurrentUser)

  return NextResponse.json({
    success: true,
    leaderboard,
    currentUser: currentUserEntry || null,
    period,
    teamId: mlmUser.team_id,
  })
}