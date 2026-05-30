import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const db = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Use service role - admin routes don't need user-level auth
    const supabase = db()

    const [usersResult, disputesResult, certMailResult, templatesResult] = await Promise.allSettled([
      supabase.from('users').select('id, email, first_name, last_name, role, created_at, is_verified, subscription_tier, subscription_status'),
      supabase.from('disputes').select('id, user_id, status, created_at, bureau, dispute_type'),
      supabase.from('certified_mail_requests').select('id, user_id, status, amount_cents, created_at, sent_at, tracking_number'),
      supabase.from('letter_templates').select('id, user_id, name, letter_type, created_at'),
    ])

    const users = usersResult.status === 'fulfilled' ? (usersResult.value.data || []) : []
    const disputes = disputesResult.status === 'fulfilled' ? (disputesResult.value.data || []) : []
    const certMail = certMailResult.status === 'fulfilled' ? (certMailResult.value.data || []) : []
    const templates = templatesResult.status === 'fulfilled' ? (templatesResult.value.data || []) : []

    // Log what we got for debugging
    console.log('Admin overview - users:', users.length, 'disputes:', disputes.length, 'mail:', certMail.length)
    if (usersResult.status === 'fulfilled' && usersResult.value.error) {
      console.error('Users query error:', usersResult.value.error)
    }

    const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0)

    const totalUsers = users.length
    const activeUsers = users.filter(u => u.subscription_status === 'active').length
    const newUsersThisMonth = users.filter(u => new Date(u.created_at) >= thisMonth).length

    const totalDisputes = disputes.length
    const activeDisputes = disputes.filter(d => ['pending','in_progress','submitted'].includes(d.status)).length
    const completedDisputes = disputes.filter(d => ['completed','resolved'].includes(d.status)).length
    const newDisputesThisMonth = disputes.filter(d => new Date(d.created_at) >= thisMonth).length

    const paidMail = certMail.filter(m => m.status === 'sent' || m.status === 'delivered')
    const totalRevenue = paidMail.reduce((s,m) => s + (m.amount_cents||0), 0) / 100
    const monthlyRevenue = paidMail.filter(m => new Date(m.created_at) >= thisMonth).reduce((s,m) => s + (m.amount_cents||0), 0) / 100

    const recentUsers = [...users]
      .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        name: ((u.first_name||'') + ' ' + (u.last_name||'')).trim() || u.email?.split('@')[0] || 'User',
        email: u.email,
        plan: u.subscription_tier || 'free',
        status: u.subscription_status || 'inactive',
        joined: u.created_at,
        role: u.role || 'user',
        isVerified: u.is_verified || false,
      }))

    const allUsers = users.map(u => ({
      id: u.id,
      name: ((u.first_name||'') + ' ' + (u.last_name||'')).trim() || u.email?.split('@')[0] || 'User',
      email: u.email,
      plan: u.subscription_tier || 'free',
      status: u.subscription_status || 'inactive',
      joined: u.created_at,
      role: u.role || 'user',
      isVerified: u.is_verified || false,
    }))

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      users: { total: totalUsers, active: activeUsers, newThisMonth: newUsersThisMonth, recent: recentUsers, all: allUsers },
      disputes: { total: totalDisputes, active: activeDisputes, completed: completedDisputes, newThisMonth: newDisputesThisMonth },
      revenue: { total: totalRevenue, thisMonth: monthlyRevenue, currency: 'USD' },
      certifiedMail: {
        total: certMail.length,
        pending: certMail.filter(m=>m.status==='pending_payment').length,
        processing: certMail.filter(m=>m.status==='processing').length,
        sent: paidMail.length,
        failed: certMail.filter(m=>m.status==='failed').length,
      },
      templates: { total: templates.length },
    })
  } catch (err: any) {
    console.error('Admin overview error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
