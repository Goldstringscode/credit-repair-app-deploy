import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const db = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  try {
    const supabase = db()

    // Get all certified mail requests with user info
    const { data: mailData, error: mailError } = await supabase
      .from('certified_mail_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (mailError) console.error('payouts mail error:', JSON.stringify(mailError))

    // Get users for cross-referencing
    const { data: usersData } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, stripe_customer_id')

    const usersMap: Record<string, any> = {}
    for (const u of (usersData || [])) {
      usersMap[u.id] = u
    }

    const mail = mailData || []
    const paidMail = mail.filter((m: any) => ['sent', 'delivered', 'completed'].includes(m.status))

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const totalRevenue = paidMail.reduce((s: number, m: any) => s + (m.amount_cents || 0), 0) / 100
    const monthlyRevenue = paidMail.filter((m: any) => new Date(m.created_at) >= thisMonth)
      .reduce((s: number, m: any) => s + (m.amount_cents || 0), 0) / 100
    const lastMonthRevenue = paidMail.filter((m: any) => {
      const d = new Date(m.created_at)
      return d >= lastMonth && d < thisMonth
    }).reduce((s: number, m: any) => s + (m.amount_cents || 0), 0) / 100

    // Build transaction list
    const transactions = mail.slice(0, 100).map((m: any) => {
      const user = usersMap[m.user_id] || {}
      const userName = ((user.first_name || '') + ' ' + (user.last_name || '')).trim() || user.email?.split('@')[0] || 'Unknown'
      return {
        id: m.id,
        userId: m.user_id,
        userName,
        userEmail: user.email || '',
        bureauName: m.bureau_name || 'Unknown Bureau',
        serviceTier: m.service_tier || 'certified',
        status: m.status,
        amountCents: m.amount_cents || 0,
        amount: (m.amount_cents || 0) / 100,
        trackingNumber: m.tracking_number || '',
        stripePaymentIntentId: m.stripe_payment_intent_id || '',
        createdAt: m.created_at,
        sentAt: m.sent_at,
      }
    })

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        monthlyRevenue,
        lastMonthRevenue,
        totalTransactions: mail.length,
        paidTransactions: paidMail.length,
        pendingTransactions: mail.filter((m: any) => m.status === 'pending_payment').length,
        failedTransactions: mail.filter((m: any) => m.status === 'failed').length,
      },
      transactions,
    })
  } catch (err: any) {
    console.error('Admin payouts error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
