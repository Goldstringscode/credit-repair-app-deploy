import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get MLM user data
  const { data: mlmUser } = await db().from('mlm_users')
    .select('id, total_earnings, current_month_earnings, lifetime_earnings')
    .eq('user_id', user.id).maybeSingle()

  if (!mlmUser) return NextResponse.json({ error: 'No MLM account found' }, { status: 404 })

  // Get payout history
  const { data: payouts } = await db().from('mlm_payouts')
    .select('id, amount, currency, payout_method, status, requested_at, processed_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get payable commissions (pending/payable status)
  const { data: payableComms } = await db().from('mlm_commissions')
    .select('commission_amount')
    .eq('recipient_user_id', user.id)
    .in('status', ['payable', 'pending'])

  // Get all paid commissions grouped by month for chart
  const { data: paidComms } = await db().from('mlm_commissions')
    .select('commission_amount, created_at')
    .eq('recipient_user_id', user.id)
    .eq('status', 'paid')
    .order('created_at', { ascending: true })

  // Total paid out via payouts
  const { data: paidPayouts } = await db().from('mlm_payouts')
    .select('amount')
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const totalEarnings = Number(mlmUser.lifetime_earnings || mlmUser.total_earnings) || 0
  const thisMonth = Number(mlmUser.current_month_earnings) || 0
  const availableBalance = (payableComms || []).reduce((s: number, c: any) => s + Number(c.commission_amount), 0)
  const totalPaidOut = (paidPayouts || []).reduce((s: number, p: any) => s + Number(p.amount), 0)

  // Build monthly earnings chart data (last 6 months)
  const monthlyMap: Record<string, number> = {}
  ;(paidComms || []).forEach((c: any) => {
    const month = new Date(c.created_at).toLocaleString('default', { month: 'short', year: '2-digit' })
    monthlyMap[month] = (monthlyMap[month] || 0) + Number(c.commission_amount)
  })
  const monthlyEarnings = Object.entries(monthlyMap)
    .map(([month, amount]) => ({ month, amount: parseFloat(amount.toFixed(2)) }))
    .slice(-6)

  // Shape payouts list for the page
  const payoutsList = (payouts || []).map((p: any) => ({
    id: p.id,
    date: p.processed_at || p.created_at,
    amount: Number(p.amount) || 0,
    method: p.payout_method || 'bank_account',
    status: p.status,
  }))

  return NextResponse.json({
    success: true,
    totalEarnings: parseFloat(totalEarnings.toFixed(2)),
    availableBalance: parseFloat(availableBalance.toFixed(2)),
    thisMonth: parseFloat(thisMonth.toFixed(2)),
    totalPaidOut: parseFloat(totalPaidOut.toFixed(2)),
    payouts: payoutsList,
    monthlyEarnings,
  })
}