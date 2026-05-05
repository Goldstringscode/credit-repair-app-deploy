import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get commission payment history as invoices
  const { data: commissions } = await db().from('mlm_commissions')
    .select('id, commission_amount, commission_type, status, paid_at, created_at')
    .eq('recipient_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get actual payout records too
  const { data: payouts } = await db().from('mlm_payouts')
    .select('id, amount, status, processed_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Merge and shape as Invoice[] matching the page interface
  const commissionInvoices = (commissions || []).map((c: any) => ({
    id: c.id,
    date: c.paid_at || c.created_at,
    amount: Number(c.commission_amount) || 0,
    status: c.status === 'paid' ? 'paid' : c.status === 'payable' ? 'payable' : 'pending',
    pdf_url: null,
    type: 'commission',
    description: c.commission_type?.replace(/_/g, ' ') || 'Commission',
  }))

  const payoutInvoices = (payouts || []).map((p: any) => ({
    id: p.id,
    date: p.processed_at || p.created_at,
    amount: Number(p.amount) || 0,
    status: p.status,
    pdf_url: null,
    type: 'payout',
    description: 'Payout',
  }))

  const invoices = [...commissionInvoices, ...payoutInvoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json({ success: true, invoices })
}