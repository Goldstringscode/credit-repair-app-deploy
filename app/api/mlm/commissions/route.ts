import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated||!user) return NextResponse.json({ error:'Unauthorized' },{ status:401 })
  const { data: m } = await supabase.from('mlm_users').select('id,rank,total_earnings,current_month_earnings,lifetime_earnings').eq('user_id',user.id).maybeSingle()
  if (!m) return NextResponse.json({ success: false, commissions:[],summary:{ pending:0,paid:0,total:0 } })
  const { data: list } = await supabase.from('mlm_commissions').select('id,commission_type,commission_amount,sale_amount,status,payable_at,paid_at,created_at').eq('recipient_user_id',user.id).order('created_at',{ascending:false}).limit(50)
  const comms=list??[]
  const pending=comms.filter(c=>c.status==='pending'||c.status==='payable').reduce((s,c)=>s+(c.commission_amount||0),0)
  const paid=comms.filter(c=>c.status==='paid').reduce((s,c)=>s+(c.commission_amount||0),0)
  return NextResponse.json({ success: true, commissions:comms.map((c:any)=>({...c,amount:c.commission_amount})), summary:{ pending:parseFloat(pending.toFixed(2)),paid:parseFloat(paid.toFixed(2)),total:parseFloat((pending+paid).toFixed(2)) }, mlmUser:{ rank:m.rank,totalEarnings:m.total_earnings,monthlyEarnings:m.current_month_earnings,lifetimeEarnings:m.lifetime_earnings } })
}