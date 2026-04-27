import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated||!user) return NextResponse.json({ error:'Unauthorized' },{ status:401 })
  const { data: m } = await supabase.from('mlm_users').select('id,rank,status,mlm_code,commission_rate,total_earnings,current_month_earnings,lifetime_earnings,personal_volume,team_volume,active_downlines,total_downlines,join_date').eq('user_id',user.id).maybeSingle()
  if (!m) return NextResponse.json({ stats:{ totalTeamMembers:0,activeMembers:0,totalEarnings:0,pendingEarnings:0,rank:'associate',mlmCode:null } })
  const { data: payable } = await supabase.from('mlm_commissions').select('commission_amount').eq('recipient_user_id',user.id).eq('status','payable')
  const pending=(payable||[]).reduce((s,c)=>s+(c.commission_amount||0),0)
  return NextResponse.json({ stats:{ rank:m.rank||'associate', mlmCode:m.mlm_code, commissionRate:m.commission_rate, totalTeamMembers:m.total_downlines||0, activeMembers:m.active_downlines||0, pendingEarnings:parseFloat(pending.toFixed(2)), totalEarnings:m.total_earnings||0, currentMonthEarnings:m.current_month_earnings||0, lifetimeEarnings:m.lifetime_earnings||0, personalVolume:m.personal_volume||0, teamVolume:m.team_volume||0, status:m.status, memberSince:m.join_date } })
}