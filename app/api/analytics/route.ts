import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser(request)
    if (!isAuthenticated || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6months'

    // Get credit reports ordered by date for score trend
    const { data: reports } = await db().from('credit_reports')
      .select('id, created_at, ai_analysis, experian_score, equifax_score, transunion_score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(24)

    // Get disputes for tracking
    const { data: disputes } = await db().from('disputes')
      .select('id, status, created_at, resolved_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    // Build score trend chart data from reports
    const scoreTrend = (reports||[]).map((r:any) => {
      const analysis = r.ai_analysis || {}
      const score = r.experian_score || analysis.credit_score || analysis.experian_score || null
      return {
        date: r.created_at?.substring(0, 10),
        month: new Date(r.created_at).toLocaleString('default', { month: 'short', year: '2-digit' }),
        score: score ? Number(score) : null,
        experian: r.experian_score ? Number(r.experian_score) : null,
        equifax: r.equifax_score ? Number(r.equifax_score) : null,
        transunion: r.transunion_score ? Number(r.transunion_score) : null,
      }
    }).filter(r => r.score !== null)

    // Dispute outcome stats
    const disputeStats = {
      total: disputes?.length || 0,
      pending: (disputes||[]).filter((d:any) => d.status === 'pending').length,
      successful: (disputes||[]).filter((d:any) => d.status === 'resolved' || d.status === 'won').length,
      failed: (disputes||[]).filter((d:any) => d.status === 'lost' || d.status === 'failed').length,
      successRate: disputes?.length
        ? Math.round(((disputes.filter((d:any) => d.status === 'resolved' || d.status === 'won').length) / disputes.length) * 100)
        : 0,
    }

    // Score improvement over time
    const scoreImprovement = scoreTrend.length >= 2
      ? (scoreTrend[scoreTrend.length-1].score || 0) - (scoreTrend[0].score || 0)
      : 0

    // Monthly dispute activity for chart
    const monthlyDisputes = (disputes||[]).reduce((acc:any, d:any) => {
      const month = new Date(d.created_at).toLocaleString('default', { month: 'short', year: '2-digit' })
      if(!acc[month]) acc[month] = { month, filed: 0, resolved: 0 }
      acc[month].filed++
      if(d.status === 'resolved' || d.status === 'won') acc[month].resolved++
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      scoreTrend,
      scoreImprovement,
      disputeStats,
      monthlyDisputes: Object.values(monthlyDisputes),
      totalReports: reports?.length || 0,
      lastUpdated: reports?.[reports.length-1]?.created_at || null,
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 })
  }
}