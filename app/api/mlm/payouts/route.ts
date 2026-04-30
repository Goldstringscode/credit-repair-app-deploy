import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: payouts } = await getSupabase().from('mlm_payouts').select('id,amount,currency,payout_method,status,requested_at,processed_at,created_at').eq('user_id', user.id).order('created_at',{ascending:false}).limit(20)
  const { data: payable } = await getSupabase().from('mlm_commissions').select('commission_amount').eq('recipient_user_id', user.id).eq('status','payable')
  const balance = (payable||[]).reduce((s,c)=>s+(c.commission_amount||0),0)
  return NextResponse.json({ payouts: payouts??[], payableBalance: parseFloat(balance.toFixed(2)), minimumPayout: 25 })
}
export async function POST(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { amount, payoutMethod='paypal' } = await req.json().catch(()=>({}))
  if (!amount || amount < 25) return NextResponse.json({ error: 'Minimum payout is $25' }, { status: 400 })
  const { data: mlmUser } = await getSupabase().from('mlm_users').select('id').eq('user_id', user.id).maybeSingle()
  if (!mlmUser) return NextResponse.json({ error: 'MLM account not found' }, { status: 404 })
  const { data: payable } = await getSupabase().from('mlm_commissions').select('id,commission_amount').eq('recipient_user_id', user.id).eq('status','payable')
  const balance = (payable||[]).reduce((s,c)=>s+(c.commission_amount||0),0)
  if (amount > balance) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  const { data: payout, error } = await getSupabase().from('mlm_payouts').insert({ user_id:user.id, mlm_user_id:mlmUser.id, amount, currency:'usd', payout_method:payoutMethod, status:'pending', requested_at:new Date().toISOString(), created_at:new Date().toISOString() }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const ids = (payable||[]).map(c=>c.id)
  if (ids.length) await getSupabase().from('mlm_commissions').update({ status:'paid', paid_at:new Date().toISOString() }).in('id', ids)
  return NextResponse.json({ success: true, payout })
}