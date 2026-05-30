import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const db = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser(request)
    if (!isAuthenticated || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = db()

    // Run all queries in parallel for speed
    const [
      usersResult,
      disputesResult,
      certMailResult,
      templatesResult,
      subscriptionsResult,
    ] = await Promise.allSettled([
      supabase.from('users').select('id, email, first_name, last_name, role, created_at, updated_at, is_verified, subscription_tier, subscription_status'),
      supabase.from('disputes').select('id, user_id, status, created_at, updated_at, bureau, dispute_type'),
      supabase.from('certified_mail_requests').select('id, user_id, status, amount_cents, created_at, sent_at, tracking_number'),
      supabase.from('letter_templates').select('id, user_id, name, letter_type, created_at'),
      supabase.from('users').select('id, subscription_tier, subscription_status'),
    ])

    // Extract results safely
    const users = usersResult.status === 'fulfilled' ? (usersResult.value.data || []) : []
    const disputes = disputesResult.status === 'fulfilled' ? (disputesResult.value.data || []) : []
    const certMail = certMailResult.status === 'fulfilled' ? (certMailResult.value.data || []) : []
    const templates = templatesResult.status === 'fulfilled' ? (templatesResult.value.data || []) : []

    // ─── User Stats ───────────────────────────────────────────────────────────
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.subscription_status === 'active').length
    const verifiedUsers = users.filter(u => u.is_verified).length
    const adminUsers = users.filter(u => u.role === 'admin').length

    // Users by plan
    const usersByPlan = users.reduce((acc: any, u) => {
      const plan = u.subscription_tier || 'free'
      acc[plan] = (acc[plan] || 0) + 1
      return acc
    }, {})

    // New users this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0,0,0,0)
    const newUsersThisMonth = users.filter(u => new Date(u.created_at) >= thisMonth).length

    // ─── Dispute Stats ────────────────────────────────────────────────────────
    const totalDisputes = disputes.length
    const activeDisputes = disputes.filter(d => ['pending', 'in_progress', 'submitted'].includes(d.status)).length
    const completedDisputes = disputes.filter(d => d.status === 'completed' || d.status === 'resolved').length
    const disputesByBureau = disputes.reduce((acc: any, d) => {
      const bureau = d.bureau || 'unknown'
      acc[bureau] = (acc[bureau] || 0) + 1
      return acc
    }, {})
    const newDisputesThisMonth = disputes.filter(d => new Date(d.created_at) >= thisMonth).length

    // ─── Revenue Stats (from certified mail payments) ─────────────────────────
    const paidMail = certMail.filter(m => m.status === 'sent' || m.status === 'delivered')
    const totalRevenueCents = paidMail.reduce((sum, m) => sum + (m.amount_cents || 0), 0)
    const totalRevenue = totalRevenueCents / 100
    const thisMonthMail = paidMail.filter(m => new Date(m.created_at) >= thisMonth)
    const monthlyRevenue = thisMonthMail.reduce((sum, m) => sum + (m.amount_cents || 0), 0) / 100
    const totalLettersSent = paidMail.length
    const lettersThisMonth = thisMonthMail.length

    // ─── Certified Mail Stats ─────────────────────────────────────────────────
    const pendingMail = certMail.filter(m => m.status === 'pending_payment').length
    const processingMail = certMail.filter(m => m.status === 'processing').length
    const sentMail = certMail.filter(m => m.status === 'sent' || m.status === 'delivered').length
    const failedMail = certMail.filter(m => m.status === 'failed').length

    // ─── Templates Stats ──────────────────────────────────────────────────────
    const totalTemplates = templates.length
    const templatesByType = templates.reduce((acc: any, t) => {
      const type = t.letter_type || 'other'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    // ─── Recent Activity ──────────────────────────────────────────────────────
    const recentUsers = [...users]
      .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(u => ({
        id: u.id,
        name: (u.first_name || '') + ' ' + (u.last_name || ''),
        email: u.email,
        plan: u.subscription_tier || 'free',
        status: u.subscription_status || 'inactive',
        joined: u.created_at,
        role: u.role,
      }))

    const recentDisputes = [...disputes]
      .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(d => ({
        id: d.id,
        userId: d.user_id,
        status: d.status,
        bureau: d.bureau,
        type: d.dispute_type,
        created: d.created_at,
      }))

    const recentMail = [...certMail]
      .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(m => ({
        id: m.id,
        userId: m.user_id,
        status: m.status,
        amount: (m.amount_cents || 0) / 100,
        trackingNumber: m.tracking_number,
        created: m.created_at,
        sent: m.sent_at,
      }))

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      users: {
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
        admins: adminUsers,
        newThisMonth: newUsersThisMonth,
        byPlan: usersByPlan,
        recent: recentUsers,
      },
      disputes: {
        total: totalDisputes,
        active: activeDisputes,
        completed: completedDisputes,
        newThisMonth: newDisputesThisMonth,
        byBureau: disputesByBureau,
        recent: recentDisputes,
      },
      revenue: {
        total: totalRevenue,
        thisMonth: monthlyRevenue,
        currency: 'USD',
      },
      certifiedMail: {
        total: certMail.length,
        pending: pendingMail,
        processing: processingMail,
        sent: sentMail,
        failed: failedMail,
        lettersSent: totalLettersSent,
        lettersThisMonth: lettersThisMonth,
        recent: recentMail,
      },
      templates: {
        total: totalTemplates,
        byType: templatesByType,
      },
    })
  } catch (err: any) {
    console.error('Admin overview error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
