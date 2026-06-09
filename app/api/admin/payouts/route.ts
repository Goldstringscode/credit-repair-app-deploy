import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminRequest } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

const db = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  const _auth = await verifyAdminRequest(request)
  if ('error' in _auth) return _auth.error

  try {
    const supabase = db()

    // Fetch all payment sources in parallel
    const [usersRes, paymentsRes, certMailRes] = await Promise.all([
      supabase.from('users').select('id, email, first_name, last_name'),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('certified_mail_requests').select('*').order('created_at', { ascending: false }),
    ])

    if (paymentsRes.error) console.error('payments error:', JSON.stringify(paymentsRes.error))
    if (certMailRes.error) console.error('certMail error:', JSON.stringify(certMailRes.error))

    // Build user lookup map
    const usersMap: Record<string, any> = {}
    for (const u of (usersRes.data || [])) usersMap[u.id] = u

    const getUserName = (userId: string) => {
      const u = usersMap[userId]
      if (!u) return 'Unknown'
      return ((u.first_name || '') + ' ' + (u.last_name || '')).trim() || u.email?.split('@')[0] || 'User'
    }

    // 1. Subscription / plan payments (from Stripe webhook -> payments table)
    const planTransactions = (paymentsRes.data || []).map((p: any) => ({
      id: p.id,
      type: 'subscription',
      category: 'Subscription',
      userId: p.user_id,
      userName: getUserName(p.user_id),
      userEmail: usersMap[p.user_id]?.email || '',
      description: p.plan_type ? 'Plan: ' + p.plan_type.charAt(0).toUpperCase() + p.plan_type.slice(1) : 'Subscription Payment',
      status: p.status || 'succeeded',
      amount: parseFloat(p.amount) || 0,
      currency: p.currency || 'usd',
      stripePaymentIntentId: p.stripe_payment_intent_id || '',
      trackingNumber: '',
      bureauName: '',
      createdAt: p.created_at,
      sentAt: null,
    }))

    // 2. Certified mail payments (letter delivery fees)
    const certMailTransactions = (certMailRes.data || []).map((m: any) => ({
      id: m.id,
      type: 'certified_mail',
      category: 'Certified Mail',
      userId: m.user_id,
      userName: getUserName(m.user_id),
      userEmail: usersMap[m.user_id]?.email || '',
      description: (m.dispute_type ? m.dispute_type.replace(/_/g,' ') + ' Letter' : 'Dispute Letter') + (m.bureau_name ? ' → ' + m.bureau_name : ''),
      status: m.status || 'unknown',
      amount: (m.amount_cents || 0) / 100,
      currency: 'usd',
      stripePaymentIntentId: m.stripe_payment_intent_id || '',
      trackingNumber: m.tracking_number || '',
      bureauName: m.bureau_name || '',
      serviceTier: m.service_tier || 'certified',
      createdAt: m.created_at,
      sentAt: m.sent_at,
    }))

    // Merge and sort by date descending
    const allTransactions = [...planTransactions, ...certMailTransactions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Summary stats
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const paidStatuses = ['succeeded', 'sent', 'delivered', 'completed']
    const paid = allTransactions.filter(t => paidStatuses.includes(t.status))
    const totalRevenue = paid.reduce((s, t) => s + t.amount, 0)
    const monthlyRevenue = paid.filter(t => new Date(t.createdAt) >= thisMonth).reduce((s, t) => s + t.amount, 0)
    const lastMonthRevenue = paid.filter(t => {
      const d = new Date(t.createdAt); return d >= lastMonth && d < thisMonth
    }).reduce((s, t) => s + t.amount, 0)

    const subscriptionRevenue = planTransactions.filter(t=>paidStatuses.includes(t.status)).reduce((s,t)=>s+t.amount,0)
    const certMailRevenue = certMailTransactions.filter(t=>paidStatuses.includes(t.status)).reduce((s,t)=>s+t.amount,0)

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        monthlyRevenue,
        lastMonthRevenue,
        subscriptionRevenue,
        certMailRevenue,
        totalTransactions: allTransactions.length,
        paidTransactions: paid.length,
        pendingTransactions: allTransactions.filter(t => t.status === 'pending_payment').length,
        failedTransactions: allTransactions.filter(t => t.status === 'failed').length,
        subscriptionCount: planTransactions.length,
        certMailCount: certMailTransactions.length,
      },
      transactions: allTransactions,
    })
  } catch (err: any) {
    console.error('Admin payouts error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
