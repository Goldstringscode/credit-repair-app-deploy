import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)


const RANK_CONFIG = {
  associate:    { label:'Associate',    level:1, minPersonalVolume:0,    minTeamVolume:0,      nextRank:'consultant' },
  consultant:   { label:'Consultant',   level:2, minPersonalVolume:500,  minTeamVolume:1000,   nextRank:'manager' },
  manager:      { label:'Manager',      level:3, minPersonalVolume:1000, minTeamVolume:5000,   nextRank:'director' },
  director:     { label:'Director',     level:4, minPersonalVolume:2000, minTeamVolume:15000,  nextRank:'executive' },
  executive:    { label:'Executive',    level:5, minPersonalVolume:3000, minTeamVolume:50000,  nextRank:'presidential' },
  presidential: { label:'Presidential', level:6, minPersonalVolume:5000, minTeamVolume:150000, nextRank:null },
}

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: mlmUser, error } = await supabase
    .from('mlm_users')
    .select('id,user_id,mlm_code,rank,status,commission_rate,total_earnings,current_month_earnings,lifetime_earnings,personal_volume,team_volume,active_downlines,total_downlines,join_date,created_at,updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!mlmUser) return NextResponse.json({ error: 'MLM user not found' }, { status: 404 })

  const { data: commissions } = await supabase
    .from('mlm_commissions')
    .select('id,commission_type,commission_amount,status,created_at')
    .eq('recipient_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: genealogy } = await supabase
    .from('mlm_genealogy')
    .select('user_id,joined_at')
    .eq('sponsor_mlm_id', mlmUser.id)
    .limit(10)

  const downlineUserIds = (genealogy || []).map((g: any) => g.user_id)
  let recentMembers: any[] = []

  if (downlineUserIds.length > 0) {
    const { data: members } = await supabase.from('users')
      .select('id,email,first_name,last_name').in('id', downlineUserIds)
    recentMembers = (members || []).map((m: any) => ({
      id: m.id,
      name: [m.first_name, m.last_name].filter(Boolean).join(' ') || m.email,
      email: m.email,
      joinedAt: (genealogy || []).find((g: any) => g.user_id === m.id)?.joined_at,
    }))
  }

  const rankKey = (mlmUser.rank || 'associate') as keyof typeof RANK_CONFIG
    const rankCfg = RANK_CONFIG[rankKey] || RANK_CONFIG.associate
    const nextRankCfg = rankCfg.nextRank ? RANK_CONFIG[rankCfg.nextRank as keyof typeof RANK_CONFIG] : null

    return NextResponse.json({
    success: true,
    user: {
      id: mlmUser.user_id,
      mlmId: mlmUser.id,
      teamCode: mlmUser.mlm_code,
      rank: {
        name: rankKey,
        label: rankCfg.label,
        level: rankCfg.level,
        requirements: { personalVolume: rankCfg.minPersonalVolume, teamVolume: rankCfg.minTeamVolume },
        nextRank: rankCfg.nextRank,
        nextRankRequirements: nextRankCfg ? { personalVolume: nextRankCfg.minPersonalVolume, teamVolume: nextRankCfg.minTeamVolume } : null,
      },
      status: mlmUser.status,
      commissionRate: mlmUser.commission_rate,
      monthlyEarnings: mlmUser.current_month_earnings || 0,
      currentMonthEarnings: mlmUser.current_month_earnings || 0,
      totalEarnings: mlmUser.total_earnings || 0,
      lifetimeEarnings: mlmUser.lifetime_earnings || 0,
      personalVolume: mlmUser.personal_volume || 0,
      teamVolume: mlmUser.team_volume || 0,
      activeDownlines: mlmUser.active_downlines || 0,
      totalDownlines: mlmUser.total_downlines || 0,
      joinDate: mlmUser.join_date,
    },
    recentCommissions: commissions || [],
    recentMembers,
    teamStats: {
      totalMembers: mlmUser.total_downlines || 0,
      activeMembers: mlmUser.active_downlines || 0,
      teamVolume: mlmUser.team_volume || 0,
    }
  })
}