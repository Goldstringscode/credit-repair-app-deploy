import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 })
    }

    // Service role bypasses RLS - must use this for admin queries
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Query all tables - use * to avoid missing column errors
    const [usersRes, disputesRes, certMailRes, templatesRes] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('disputes').select('id, user_id, status, created_at, bureau, dispute_type').order('created_at', { ascending: false }),
      supabase.from('certified_mail_requests').select('id, user_id, status, amount_cents, created_at, sent_at, tracking_number').order('created_at', { ascending: false }),
      supabase.from('letter_templates').select('id, user_id, letter_type, created_at'),
    ])

    // Log errors for debugging
    if (usersRes.error) console.error('users query error:', JSON.stringify(usersRes.error))
    if (disputesRes.error) console.error('disputes query error:', JSON.stringify(disputesRes.error))
    if (certMailRes.error) console.error('certMail query error:', JSON.stringify(certMailRes.error))
    if (templatesRes.error) console.error('templates query error:', JSON.stringify(templatesRes.error))

    const users = usersRes.data || []
    const disputes = disputesRes.data || []
    const certMail = certMailRes.data || []
    const templates = templatesRes.data || []

    console.log('Admin overview counts - users:', users.length, 'disputes:', disputes.length, 'certMail:', certMail.length, 'templates:', templates.length)

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // User stats
    const activeUsers = users.filter((u: any) => u.subscription_status === 'active').length
    const newUsersThisMonth = users.filter((u: any) => new Date(u.created_at) >= thisMonth).length

    // Dispute stats
    const activeDisputes = disputes.filter((d: any) => ['pending', 'in_progress', 'submitted'].includes(d.status)).length
    const completedDisputes = disputes.filter((d: any) => ['completed', 'resolved'].includes(d.status)).length
    const newDisputesThisMonth = disputes.filter((d: any) => new Date(d.created_at) >= thisMonth).length

    // Revenue from certified mail
    const paidMail = certMail.filter((m: any) => ['sent', 'delivered', 'completed'].includes(m.status))
    const totalRevenue = paidMail.reduce((s: number, m: any) => s + (m.amount_cents || 0), 0) / 100
    const monthlyRevenue = paidMail.filter((m: any) => new Date(m.created_at) >= thisMonth)
      .reduce((s: number, m: any) => s + (m.amount_cents || 0), 0) / 100

    // Map users to consistent shape - handle both name formats
    const mapUser = (u: any) => ({
      id: u.id,
      name: (u.first_name || u.name || '') + (u.last_name ? ' ' + u.last_name : '') || u.email?.split('@')[0] || 'User',
      email: u.email,
      plan: u.subscription_tier || u.plan || 'free',
      status: u.subscription_status || u.status || 'inactive',
      joined: u.created_at,
      role: u.role || 'user',
      phone: u.phone || '',
      stripeCustomerId: u.stripe_customer_id || '',
    })

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      users: {
        total: users.length,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        all: users.map(mapUser),
        recent: users.slice(0, 10).map(mapUser),
      },
      disputes: {
        total: disputes.length,
        active: activeDisputes,
        completed: completedDisputes,
        newThisMonth: newDisputesThisMonth,
        recent: disputes.slice(0, 10),
      },
      revenue: { total: totalRevenue, thisMonth: monthlyRevenue, currency: 'USD' },
      certifiedMail: {
        total: certMail.length,
        pending: certMail.filter((m: any) => m.status === 'pending_payment').length,
        processing: certMail.filter((m: any) => m.status === 'processing').length,
        sent: paidMail.length,
        failed: certMail.filter((m: any) => m.status === 'failed').length,
        recent: certMail.slice(0, 10),
      },
      templates: { total: templates.length },
    })
  } catch (err: any) {
    console.error('Admin overview error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
