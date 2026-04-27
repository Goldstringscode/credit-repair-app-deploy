import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: mlmUser } = await supabase.from('mlm_users').select('id,rank,subscription_status,mlm_code,commission_rate,pending_earnings,total_earnings,created_at').eq('user_id', user.id).maybeSingle()

  if (!mlmUser) {
    return NextResponse.json({ stats: { totalTeamMembers: 0, activeMembers: 0, totalEarnings: 0, pendingEarnings: 0, rank: 'associate', mlmCode: null } })
  }

  // Direct downlines
  const { count: directCount } = await supabase.from('mlm_genealogy').select('id',{count:'exact',head:true}).eq('sponsor_mlm_id', mlmUser.id)

  // Active downlines
  const { data: genealogy } = await supabase.from('mlm_genealogy').select('user_id').eq('sponsor_mlm_id', mlmUser.id)
  const downlineUserIds = (genealogy||[]).map(g=>g.user_id)
  
  let activeCount = 0
  if (downlineUserIds.length > 0) {
    const { count } = await supabase.from('mlm_users').select('id',{count:'exact',head:true}).in('user_id', downlineUserIds).eq('subscription_status','active')
    activeCount = count || 0
  }

  // Monthly volume
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const { data: pvData } = await supabase.from('mlm_commissions').select('sale_amount').eq('source_user_id', user.id).gte('created_at', monthStart).neq('status','voided')
  const personalVolume = (pvData||[]).reduce((s,r)=>s+(r.sale_amount||0),0)

  return NextResponse.json({
    stats: {
      rank: mlmUser.rank || 'associate',
      mlmCode: mlmUser.mlm_code,
      commissionRate: mlmUser.commission_rate,
      totalTeamMembers: directCount || 0,
      activeMembers: activeCount,
      pendingEarnings: mlmUser.pending_earnings || 0,
      totalEarnings: mlmUser.total_earnings || 0,
      personalVolumeThisMonth: parseFloat(personalVolume.toFixed(2)),
      subscriptionStatus: mlmUser.subscription_status,
      memberSince: mlmUser.created_at,
    }
  })
}