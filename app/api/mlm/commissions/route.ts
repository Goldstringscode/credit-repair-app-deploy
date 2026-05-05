import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: m } = await supabase.from('mlm_users')
    .select('id,rank,total_earnings,current_month_earnings,lifetime_earnings')
    .eq('user_id', user.id).maybeSingle()

  if (!m) return NextResponse.json({ success: true, commissions: [], summary: { pending: 0, paid: 0, total: 0 } })

  const { data: list } = await supabase.from('mlm_commissions')
    .select('id,commission_type,commission_amount,status,paid_at,created_at,level_depth')
    .eq('recipient_user_id', user.id)
    .order('created_at', { ascending: false }).limit(50)

  const comms = list ?? []
  const pending = comms.filter((c:any) => c.status === 'pending' || c.status === 'payable').reduce((s:number, c:any) => s + (Number(c.commission_amount) || 0), 0)
  const paid = comms.filter((c:any) => c.status === 'paid').reduce((s:number, c:any) => s + (Number(c.commission_amount) || 0), 0)

  return NextResponse.json({
    success: true,
    commissions: comms.map((c: any) => ({
      id: c.id,
      amount: Number(c.commission_amount) || 0,
      commission_amount: Number(c.commission_amount) || 0,
      type: c.commission_type || 'commission',
      commission_type: c.commission_type || 'commission',
      description: (() => {
        const labels: Record<string,string> = {
          direct_referral: 'Direct Referral Commission',
          unilevel: 'Unilevel Commission',
          binary: 'Binary Commission',
          matrix: 'Matrix Commission',
          matching_bonus: 'Matching Bonus',
          rank_advancement: 'Rank Advancement Bonus',
          leadership_bonus: 'Leadership Bonus',
          fast_start: 'Fast Start Bonus',
          infinity_bonus: 'Infinity Bonus',
        }
        return labels[c.commission_type] || 'Commission'
      })(),
      status: c.status || 'pending',
      date: c.paid_at || c.created_at,
      created_at: c.created_at,
      paid_at: c.paid_at,
      level: Number(c.level_depth) || 1,
    })),
    summary: {
      pending: parseFloat(pending.toFixed(2)),
      paid: parseFloat(paid.toFixed(2)),
      total: parseFloat((pending + paid).toFixed(2)),
    },
    mlmUser: {
      rank: m.rank,
      totalEarnings: Number(m.total_earnings) || 0,
      monthlyEarnings: Number(m.current_month_earnings) || 0,
      lifetimeEarnings: Number(m.lifetime_earnings) || 0,
    },
  })
}