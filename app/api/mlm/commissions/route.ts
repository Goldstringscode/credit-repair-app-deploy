import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: mlmUser } = await supabase.from('mlm_users').select('id,rank,pending_earnings,total_earnings').eq('user_id', user.id).maybeSingle()
  if (!mlmUser) return NextResponse.json({ commissions: [], summary: { pending: 0, paid: 0, total: 0 } })
  const { data: list } = await supabase.from('mlm_commissions').select('id,commission_type,commission_amount,sale_amount,status,payable_at,paid_at,created_at').eq('recipient_user_id', user.id).order('created_at',{ascending:false}).limit(50)
  const comms = list ?? []
  const pending = comms.filter(c=>c.status==='pending'||c.status==='payable').reduce((s,c)=>s+(c.commission_amount||0),0)
  const paid = comms.filter(c=>c.status==='paid').reduce((s,c)=>s+(c.commission_amount||0),0)
  return NextResponse.json({ commissions: comms, summary: { pending: parseFloat(pending.toFixed(2)), paid: parseFloat(paid.toFixed(2)), total: parseFloat((pending+paid).toFixed(2)) }, mlmUser })
}