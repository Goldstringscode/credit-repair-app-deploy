import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const RANK_CONFIG = {
  associate:    { label:'Associate',    level:1, minPersonalVolume:0,    minTeamVolume:0,      nextRank:'consultant' as string|null },
  consultant:   { label:'Consultant',   level:2, minPersonalVolume:500,  minTeamVolume:1000,   nextRank:'manager' as string|null },
  manager:      { label:'Manager',      level:3, minPersonalVolume:1000, minTeamVolume:5000,   nextRank:'director' as string|null },
  director:     { label:'Director',     level:4, minPersonalVolume:2000, minTeamVolume:15000,  nextRank:'executive' as string|null },
  executive:    { label:'Executive',    level:5, minPersonalVolume:3000, minTeamVolume:50000,  nextRank:'presidential' as string|null },
  presidential: { label:'Presidential', level:6, minPersonalVolume:5000, minTeamVolume:150000, nextRank:null as string|null },
}

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: m, error } = await supabase
    .from('mlm_users')
    .select('id,user_id,mlm_code,rank,status,commission_rate,total_earnings,current_month_earnings,lifetime_earnings,personal_volume,team_volume,active_downlines,total_downlines,join_date')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!m) return NextResponse.json({ success: false, error: 'MLM user not found' }, { status: 404 })

  const rankKey = ((m.rank || 'associate') as string) as keyof typeof RANK_CONFIG
  const rankCfg = RANK_CONFIG[rankKey] || RANK_CONFIG.associate
  const nextKey = rankCfg.nextRank as keyof typeof RANK_CONFIG | null
  const nextCfg = nextKey ? RANK_CONFIG[nextKey] : null

  const { data: commissions } = await supabase
    .from('mlm_commissions')
    .select('id,commission_type,commission_amount,status,created_at')
    .eq('recipient_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: genealogy } = await supabase
    .from('mlm_genealogy')
    .select('user_id,joined_at')
    .eq('sponsor_mlm_id', m.id)
    .limit(10)

  const downlineIds = (genealogy || []).map((g: any) => g.user_id)
  let recentMembers: any[] = []
  if (downlineIds.length > 0) {
    const { data: members } = await supabase.from('users')
      .select('id,email,first_name,last_name').in('id', downlineIds)
    recentMembers = (members || []).map((mb: any) => ({
      id: mb.id,
      name: [mb.first_name, mb.last_name].filter(Boolean).join(' ') || mb.email,
      email: mb.email,
      joinedAt: (genealogy || []).find((g: any) => g.user_id === mb.id)?.joined_at,
    }))
  }

  return NextResponse.json({
    success: true,
    user: {
      id: m.user_id,
      mlmId: m.id,
      teamCode: m.mlm_code,
      rank: {
        name: rankKey,
        label: rankCfg.label,
        level: rankCfg.level,
        requirements: {
          personalVolume: rankCfg.minPersonalVolume,
          teamVolume: rankCfg.minTeamVolume,
        },
        nextRank: rankCfg.nextRank,
        nextRankRequirements: nextCfg
          ? { personalVolume: nextCfg.minPersonalVolume, teamVolume: nextCfg.minTeamVolume }
          : null,
      },
      status: m.status,
      commissionRate: m.commission_rate,
      currentMonthEarnings: Number(m.current_month_earnings) || 0,
      monthlyEarnings: Number(m.current_month_earnings) || 0,
      totalEarnings: Number(m.total_earnings) || 0,
      lifetimeEarnings: Number(m.lifetime_earnings) || 0,
      personalVolume: Number(m.personal_volume) || 0,
      teamVolume: Number(m.team_volume) || 0,
      activeDownlines: Number(m.active_downlines) || 0,
      totalDownlines: Number(m.total_downlines) || 0,
      joinDate: m.join_date,
    },
    recentCommissions: (commissions || []).map((c: any) => ({
      ...c,
      amount: Number(c.commission_amount) || 0,
    })),
    recentMembers,
    teamStats: {
      totalMembers: Number(m.total_downlines) || 0,
      activeMembers: Number(m.active_downlines) || 0,
      teamVolume: Number(m.team_volume) || 0,
    },
  })
}