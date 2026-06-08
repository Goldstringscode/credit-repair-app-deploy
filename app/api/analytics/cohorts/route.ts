import { type NextRequest, NextResponse } from 'next/server'
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

// Group records by YYYY-MM
function toYearMonth(d: string) { return d.slice(0, 7) }

export async function GET(request: NextRequest) {
  try {
    const supabase = db()
    const { searchParams } = new URL(request.url)
    const period = Math.min(Number(searchParams.get('period') || '12'), 24)

    // Fetch all users and payments in parallel
    const [{ data: users }, { data: payments }] = await Promise.all([
      supabase.from('users').select('id, created_at, subscription_status, subscription_tier').order('created_at'),
      supabase.from('payments').select('user_id, amount, status, created_at').eq('status', 'succeeded').order('created_at'),
    ])

    const allUsers = users || []
    const allPayments = payments || []

    // Index payments by user_id for fast lookup
    const paymentsByUser: Record<string, typeof allPayments> = {}
    for (const p of allPayments) {
      if (!paymentsByUser[p.user_id]) paymentsByUser[p.user_id] = []
      paymentsByUser[p.user_id].push(p)
    }

    // Group users by signup month (cohort)
    const cohortMap: Record<string, typeof allUsers> = {}
    for (const u of allUsers) {
      const month = toYearMonth(u.created_at)
      if (!cohortMap[month]) cohortMap[month] = []
      cohortMap[month].push(u)
    }

    const now = new Date()
    const cohortMonths = Object.keys(cohortMap).sort().reverse().slice(0, 12)

    const cohorts = cohortMonths.map(cohortMonth => {
      const cohortUsers = cohortMap[cohortMonth]
      const cohortSize = cohortUsers.length
      const cohortDate = new Date(cohortMonth + '-01')

      // Build period-by-period retention
      const periods = []
      for (let i = 0; i < period; i++) {
        const periodStart = new Date(cohortDate)
        periodStart.setMonth(periodStart.getMonth() + i)
        const periodEnd = new Date(periodStart)
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        // A user is 'active' in a period if they made a payment that month
        const periodStartStr = periodStart.toISOString()
        const periodEndStr = periodEnd.toISOString()

        if (periodStart > now) break

        let activeCount = 0
        let periodRevenue = 0

        for (const u of cohortUsers) {
          const userPayments = (paymentsByUser[u.id] || []).filter((p: any) => {
            return p.created_at >= periodStartStr && p.created_at < periodEndStr
          })
          if (userPayments.length > 0) {
            activeCount++
            periodRevenue += userPayments.reduce((s: number, p: any) => s + (p.amount || 0), 0)
          } else if (i === 0) {
            // Period 0: count signup month as active even without payment
            activeCount++
          }
        }

        const retentionRate = cohortSize > 0 ? Math.round((activeCount / cohortSize) * 1000) / 10 : 0
        const avgRevenue = activeCount > 0 ? Math.round(periodRevenue / activeCount) : 0

        periods.push({
          period: i,
          activeUsers: activeCount,
          retentionRate,
          revenue: periodRevenue,
          avgRevenue,
          churnedUsers: cohortSize - activeCount,
          newRevenue: periodRevenue,
        })
      }

      // LTV from real payment totals
      const totalRevenue = cohortUsers.reduce((sum, u) => {
        return sum + (paymentsByUser[u.id] || []).reduce((s: number, p: any) => s + (p.amount || 0), 0)
      }, 0)
      const currentLTV = cohortSize > 0 ? Math.round(totalRevenue / cohortSize) / 100 : 0

      // Segment by subscription tier
      const highValue = cohortUsers.filter(u => u.subscription_tier === 'enterprise' || u.subscription_tier === 'premium').length
      const mediumValue = cohortUsers.filter(u => u.subscription_tier === 'basic').length
      const lowValue = cohortUsers.filter(u => !u.subscription_tier || u.subscription_tier === 'free').length
      const atRisk = cohortUsers.filter(u => u.subscription_status === 'past_due' || u.subscription_status === 'unpaid').length

      return {
        cohortMonth,
        cohortSize,
        periods,
        ltv: {
          current: currentLTV,
          predicted: Math.round(currentLTV * 1.15 * 100) / 100,
          confidence: Math.min(95, 60 + cohortSize * 2),
        },
        segments: { highValue, mediumValue, lowValue, atRisk },
      }
    })

    // Overall metrics
    const totalUsers = allUsers.length
    const activeUsers = allUsers.filter(u => u.subscription_status === 'active').length
    const totalRevenue = allPayments.reduce((s, p) => s + (p.amount || 0), 0)
    const avgLTV = totalUsers > 0 ? Math.round(totalRevenue / totalUsers) / 100 : 0

    // Tier breakdown
    const tierCounts = {
      basic: allUsers.filter(u => u.subscription_tier === 'basic').length,
      premium: allUsers.filter(u => u.subscription_tier === 'premium').length,
      enterprise: allUsers.filter(u => u.subscription_tier === 'enterprise').length,
    }
    const statusCounts = {
      active: allUsers.filter(u => u.subscription_status === 'active').length,
      churned: allUsers.filter(u => u.subscription_status === 'canceled' || u.subscription_status === 'cancelled').length,
      paused: allUsers.filter(u => u.subscription_status === 'paused').length,
    }

    // Overall retention rate: % who made any payment
    const usersWithPayment = new Set(allPayments.map(p => p.user_id)).size
    const retentionRate = totalUsers > 0 ? Math.round((usersWithPayment / totalUsers) * 1000) / 10 : 0
    const churnRate = Math.round((100 - retentionRate) * 10) / 10

    const retentionData = {
      cohorts,
      ltvAnalysis: {
        averageLTV: avgLTV,
        ltvByTier: {
          basic: tierCounts.basic > 0 ? Math.round(totalRevenue / Math.max(tierCounts.basic, 1)) / 100 : 0,
          premium: avgLTV * 1.5,
          enterprise: avgLTV * 2.5,
        },
        churnImpact: Math.round(avgLTV * statusCounts.churned * 100) / 100,
        potentialLTV: Math.round(avgLTV * totalUsers * 1.2 * 100) / 100,
        mlmBonus: 0,
      },
      segmentAnalysis: {
        byTier: tierCounts,
        byStatus: statusCounts,
        byReferrals: { none: totalUsers, low: 0, medium: 0, high: 0 },
      },
      summary: {
        totalUsers,
        activeUsers,
        avgLTV,
        retentionRate,
        churnRate,
      },
    }

    return NextResponse.json({ success: true, data: retentionData })
  } catch (err: any) {
    console.error('Cohorts route error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}