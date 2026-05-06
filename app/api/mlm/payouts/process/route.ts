import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { amount, method } = body

  if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

  const { data: mlmUser } = await db().from('mlm_users')
    .select('id').eq('user_id', user.id).maybeSingle()

  if (!mlmUser) return NextResponse.json({ error: 'No MLM account found' }, { status: 404 })

  // Check available balance (payable commissions)
  const { data: payableComms } = await db().from('mlm_commissions')
    .select('id, commission_amount')
    .eq('recipient_user_id', user.id)
    .in('status', ['payable', 'pending'])

  const available = (payableComms || []).reduce((s: number, c: any) => s + Number(c.commission_amount), 0)

  if (amount > available) {
    return NextResponse.json({ error: 'Amount exceeds available balance' }, { status: 400 })
  }

  // Create payout record
  const { data: payout, error } = await db().from('mlm_payouts').insert({
    user_id: user.id,
    amount,
    currency: 'USD',
    payout_method: method || 'bank_account',
    status: 'pending',
    requested_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Log to audit
  await db().from('mlm_audit_log').insert({
    user_id: user.id,
    action: 'payout_requested',
    details: { amount, method, payoutId: payout.id },
    created_at: new Date().toISOString(),
  }).catch(() => {}) // non-fatal

  return NextResponse.json({ success: true, payout })
}