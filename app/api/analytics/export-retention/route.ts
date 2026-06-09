import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sanitizeError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { cohort, type } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Fetch real data for export
    const [{ data: users }, { data: payments }] = await Promise.all([
      supabase.from('users').select('id, email, created_at, subscription_status, subscription_tier').order('created_at'),
      supabase.from('payments').select('user_id, amount, status, created_at').eq('status', 'succeeded').order('created_at'),
    ])

    const allUsers = users || []
    const allPayments = payments || []

    // Index payments by user
    const paymentsByUser: Record<string, typeof allPayments> = {}
    for (const p of allPayments) {
      if (!paymentsByUser[p.user_id]) paymentsByUser[p.user_id] = []
      paymentsByUser[p.user_id].push(p)
    }

    const toYM = (d: string) => d.slice(0, 7)

    if (type === 'cohort' || !type) {
      // Export cohort-level summary
      const cohortMap: Record<string, typeof allUsers> = {}
      for (const u of allUsers) {
        const m = toYM(u.created_at)
        if (!cohortMap[m]) cohortMap[m] = []
        cohortMap[m].push(u)
      }

      const rows: string[][] = [['Cohort Month', 'Cohort Size', 'Active Users', 'Revenue ($)', 'Avg LTV ($)', 'Retention Rate (%)', 'Churn Rate (%)']]
      for (const [month, cohortUsers] of Object.entries(cohortMap).sort().reverse().slice(0, 12)) {
        if (cohort && cohort !== 'all' && cohort !== month) continue
        const active = cohortUsers.filter(u => u.subscription_status === 'active').length
        const revenue = cohortUsers.reduce((s, u) => s + (paymentsByUser[u.id] || []).reduce((ss: number, p: any) => ss + (p.amount || 0), 0), 0)
        const avgLTV = cohortUsers.length > 0 ? (revenue / cohortUsers.length / 100).toFixed(2) : '0.00'
        const retention = cohortUsers.length > 0 ? ((active / cohortUsers.length) * 100).toFixed(1) : '0.0'
        const churn = (100 - Number(retention)).toFixed(1)
        rows.push([month, String(cohortUsers.length), String(active), (revenue/100).toFixed(2), avgLTV, retention, churn])
      }

      const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n')
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="retention-cohorts-' + new Date().toISOString().split('T')[0] + '.csv"',
        }
      })
    }

    // User-level export
    const rows: string[][] = [['User ID', 'Email', 'Signup Month', 'Tier', 'Status', 'Total Payments', 'Total Revenue ($)', 'LTV ($)']]
    for (const u of allUsers) {
      const userPayments = paymentsByUser[u.id] || []
      const revenue = userPayments.reduce((s: number, p: any) => s + (p.amount || 0), 0)
      rows.push([
        u.id.slice(0, 8),
        u.email,
        toYM(u.created_at),
        u.subscription_tier || 'none',
        u.subscription_status || 'unknown',
        String(userPayments.length),
        (revenue / 100).toFixed(2),
        (revenue / 100).toFixed(2),
      ])
    }

    const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n')
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="retention-users-' + new Date().toISOString().split('T')[0] + '.csv"',
      }
    })
  } catch (err: any) {
    console.error('Export retention error:', err.message)
    return NextResponse.json({ success: false, error: sanitizeError(err) }, { status: 500 })
  }
}