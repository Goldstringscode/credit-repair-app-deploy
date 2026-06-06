import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = db()
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'
    const days = range === '7d' ? 7 : range === '90d' ? 90 : range === '1y' ? 365 : 30
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    const now = new Date().toISOString()

    // Fetch all counts in parallel
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: newUsers },
      { count: totalDisputes },
      { count: openDisputes },
      { count: resolvedDisputes },
      { count: totalPayments },
      { count: succeededPayments },
      { count: totalCertifiedMail },
      { count: totalTemplates },
      { count: totalCampaigns },
      { data: recentUsers },
      { data: recentDisputes },
      { data: recentPayments },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', since),
      supabase.from('disputes').select('*', { count: 'exact', head: true }),
      supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
      supabase.from('payments').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'succeeded'),
      supabase.from('certified_mail_requests').select('*', { count: 'exact', head: true }),
      supabase.from('letter_templates').select('*', { count: 'exact', head: true }),
      supabase.from('email_campaigns').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('id, created_at').gte('created_at', since).order('created_at'),
      supabase.from('disputes').select('id, created_at, status').gte('created_at', since).order('created_at'),
      supabase.from('payments').select('id, amount, status, created_at').gte('created_at', since).order('created_at'),
    ])

    const tu = totalUsers || 0
    const au = activeUsers || 0
    const nu = newUsers || 0
    const td = totalDisputes || 0
    const rd = resolvedDisputes || 0
    const tp = totalPayments || 0
    const sp = succeededPayments || 0
    const tcm = totalCertifiedMail || 0

    // Revenue calculation from real payments
    const totalRevenue = (recentPayments || []).filter((p: any) => p.status === 'succeeded').reduce((s: number, p: any) => s + (p.amount || 0), 0)
    const revenueFormatted = (totalRevenue / 100).toFixed(2)

    // Conversion rates from real funnel data
    const signupToDispute = tu > 0 ? Math.round((td / tu) * 100 * 10) / 10 : 0
    const disputeResolution = td > 0 ? Math.round((rd / td) * 100 * 10) / 10 : 0
    const signupToPayment = tu > 0 ? Math.round((sp / tu) * 100 * 10) / 10 : 0
    const activeRate = tu > 0 ? Math.round((au / tu) * 100 * 10) / 10 : 0

    // Build daily growth chart data (last 7 days)
    const dailyData = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dayEnd = new Date(Date.now() - (i - 1) * 24 * 60 * 60 * 1000)
      const dayStr = dayStart.toISOString().split('T')[0]
      const dayUsers = (recentUsers || []).filter((u: any) => {
        const d = new Date(u.created_at)
        return d >= dayStart && d < dayEnd
      }).length
      const dayDisputes = (recentDisputes || []).filter((d: any) => {
        const dt = new Date(d.created_at)
        return dt >= dayStart && dt < dayEnd
      }).length
      const dayRevenue = (recentPayments || []).filter((p: any) => {
        const dt = new Date(p.created_at)
        return dt >= dayStart && dt < dayEnd && p.status === 'succeeded'
      }).reduce((s: number, p: any) => s + (p.amount || 0), 0)
      dailyData.push({ date: dayStr, users: dayUsers, disputes: dayDisputes, revenue: dayRevenue / 100 })
    }

    // Funnel steps - real progression
    const funnel = [
      { step: 'signup', name: 'User Signups', users: tu, conversionRate: 100, stepConversionRate: 100 },
      { step: 'active', name: 'Active Users', users: au, conversionRate: tu > 0 ? Math.round(au/tu*100*10)/10 : 0, stepConversionRate: tu > 0 ? Math.round(au/tu*100*10)/10 : 0 },
      { step: 'dispute_filed', name: 'Filed Dispute', users: td, conversionRate: tu > 0 ? Math.round(td/tu*100*10)/10 : 0, stepConversionRate: au > 0 ? Math.round(td/au*100*10)/10 : 0 },
      { step: 'payment_made', name: 'Made Payment', users: sp, conversionRate: tu > 0 ? Math.round(sp/tu*100*10)/10 : 0, stepConversionRate: td > 0 ? Math.round(sp/td*100*10)/10 : 0 },
      { step: 'certified_mail', name: 'Sent Certified Mail', users: tcm, conversionRate: tu > 0 ? Math.round(tcm/tu*100*10)/10 : 0, stepConversionRate: sp > 0 ? Math.round(tcm/sp*100*10)/10 : 0 },
    ]

    // Event analytics - real counts
    const events = [
      { event: 'user_signup', name: 'User Signups', count: tu, periodCount: nu, trend: nu > 0 ? Math.round(nu/Math.max(tu-nu,1)*100) : 0 },
      { event: 'dispute_filed', name: 'Disputes Filed', count: td, periodCount: (recentDisputes||[]).length, trend: 0 },
      { event: 'payment_succeeded', name: 'Payments Succeeded', count: sp, periodCount: (recentPayments||[]).filter((p:any)=>p.status==='succeeded').length, trend: tp > 0 ? Math.round(sp/tp*100) : 0 },
      { event: 'certified_mail_sent', name: 'Certified Mail Sent', count: tcm, periodCount: tcm, trend: 0 },
      { event: 'template_saved', name: 'Templates Saved', count: totalTemplates||0, periodCount: totalTemplates||0, trend: 0 },
      { event: 'campaign_sent', name: 'Email Campaigns', count: totalCampaigns||0, periodCount: totalCampaigns||0, trend: 0 },
    ]

    // Optimization recommendations based on real data
    const recommendations = []
    if (au < tu * 0.5) recommendations.push({ type: 'warning', title: 'Low Active User Rate', description: au + ' of ' + tu + ' users are active (' + activeRate + '%). Consider improving onboarding or re-engagement emails.', impact: 'high' })
    if (td > 0 && rd < td * 0.5) recommendations.push({ type: 'warning', title: 'Low Dispute Resolution Rate', description: rd + ' of ' + td + ' disputes resolved (' + disputeResolution + '%). Review dispute handling workflow.', impact: 'high' })
    if (tp > 0 && sp < tp * 0.9) recommendations.push({ type: 'warning', title: 'Payment Success Rate', description: sp + ' of ' + tp + ' payments succeeded (' + (tp > 0 ? Math.round(sp/tp*100) : 0) + '%). Check for payment failures.', impact: 'medium' })
    if (nu === 0) recommendations.push({ type: 'info', title: 'No New Users in Period', description: 'No new signups in the last ' + days + ' days. Consider marketing campaigns.', impact: 'high' })
    if (recommendations.length === 0) recommendations.push({ type: 'success', title: 'All Metrics Healthy', description: 'Active rate ' + activeRate + '%, dispute resolution ' + disputeResolution + '%, payment success ' + (tp > 0 ? Math.round(sp/tp*100) : 100) + '%. No critical issues detected.', impact: 'low' })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers: tu,
          activeUsers: au,
          newUsers: nu,
          totalDisputes: td,
          resolvedDisputes: rd,
          totalPayments: tp,
          succeededPayments: sp,
          totalCertifiedMail: tcm,
          totalRevenue: revenueFormatted,
          signupToDispute,
          disputeResolution,
          signupToPayment,
          activeRate,
        },
        funnel,
        events,
        dailyData,
        recommendations,
        timeRange: { startDate: since, endDate: now, days },
      }
    })
  } catch (err: any) {
    console.error('Analytics route error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}