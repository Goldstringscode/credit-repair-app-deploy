import { createClient } from "@supabase/supabase-js"

const db = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface DashboardStats {
  current_credit_score: number | null
  bureau_scores: { experian: number | null; equifax: number | null; transunion: number | null }
  score_change: number | null
  total_accounts: number
  open_accounts: number
  negative_items: number
  total_debt: number
  credit_utilization: number | null
  recent_inquiries: number
  dispute_success_rate: number
  data_completeness: {
    confidence_score: number | null
    has_personal_info: boolean
    has_accounts: boolean
    has_payment_history: boolean
    has_inquiries: boolean
    has_negative_items: boolean
  }
  email_metrics: { total_sent: number; delivery_rate: number; open_rate: number; response_rate: number }
  disputes: { total: number; pending: number; successful: number; failed: number }
}

class CreditDataService {
  private getDefaultStats(): DashboardStats {
    return {
      current_credit_score: null,
      bureau_scores: { experian: null, equifax: null, transunion: null },
      score_change: null,
      total_accounts: 0,
      open_accounts: 0,
      negative_items: 0,
      total_debt: 0,
      credit_utilization: null,
      recent_inquiries: 0,
      dispute_success_rate: 0,
      data_completeness: {
        confidence_score: null,
        has_personal_info: false,
        has_accounts: false,
        has_payment_history: false,
        has_inquiries: false,
        has_negative_items: false,
      },
      email_metrics: { total_sent: 0, delivery_rate: 0, open_rate: 0, response_rate: 0 },
      disputes: { total: 0, pending: 0, successful: 0, failed: 0 },
    }
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      const supabase = db()

      // Get latest credit report
      const { data: report } = await supabase
        .from('credit_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!report) return this.getDefaultStats()

      const analysis = report.ai_analysis || {}

      // Get accounts for this report
      const { data: accounts } = await supabase
        .from('credit_accounts')
        .select('*')
        .eq('credit_report_id', report.id)

      // Get negative items
      const { data: negativeItems } = await supabase
        .from('negative_items')
        .select('*')
        .eq('credit_report_id', report.id)

      // Get inquiries
      const { data: inquiries } = await supabase
        .from('credit_inquiries')
        .select('*')
        .eq('credit_report_id', report.id)

      // Get previous report for score change
      const { data: prevReport } = await supabase
        .from('credit_reports')
        .select('ai_analysis, experian_score, equifax_score, transunion_score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(1, 1)
        .maybeSingle()

      // Get disputes
      const { data: disputes } = await supabase
        .from('disputes')
        .select('status')
        .eq('user_id', userId)

      const totalDisputes = disputes?.length || 0
      const successfulDisputes = disputes?.filter((d: any) => d.status === 'resolved' || d.status === 'won').length || 0

      const currentScore = report.experian_score || analysis.credit_score || analysis.experian_score || null
      const prevScore = prevReport
        ? (prevReport.experian_score || prevReport.ai_analysis?.credit_score || null)
        : null
      const scoreChange = currentScore && prevScore ? Number(currentScore) - Number(prevScore) : null

      const totalDebt = (accounts || []).reduce((s: number, a: any) => s + (Number(a.balance) || 0), 0)
      const totalLimit = (accounts || []).reduce((s: number, a: any) => s + (Number(a.credit_limit) || 0), 0)
      const utilization = totalLimit > 0 ? Math.round((totalDebt / totalLimit) * 100) : null

      return {
        current_credit_score: currentScore ? Number(currentScore) : null,
        bureau_scores: {
          experian: report.experian_score ? Number(report.experian_score) : (analysis.experian_score ? Number(analysis.experian_score) : null),
          equifax: report.equifax_score ? Number(report.equifax_score) : (analysis.equifax_score ? Number(analysis.equifax_score) : null),
          transunion: report.transunion_score ? Number(report.transunion_score) : (analysis.transunion_score ? Number(analysis.transunion_score) : null),
        },
        score_change: scoreChange,
        total_accounts: accounts?.length || 0,
        open_accounts: (accounts || []).filter((a: any) => a.status === 'open' || a.account_status === 'open').length,
        negative_items: negativeItems?.length || 0,
        total_debt: totalDebt,
        credit_utilization: utilization,
        recent_inquiries: (inquiries || []).filter((i: any) => {
          const date = new Date(i.inquiry_date || i.date || i.created_at)
          return date > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        }).length,
        dispute_success_rate: totalDisputes > 0 ? Math.round((successfulDisputes / totalDisputes) * 100) : 0,
        data_completeness: {
          confidence_score: analysis.confidence_score || null,
          has_personal_info: !!(analysis.personal_info || report.raw_data),
          has_accounts: (accounts?.length || 0) > 0,
          has_payment_history: (accounts || []).some((a: any) => a.payment_history || a.late_payments !== undefined),
          has_inquiries: (inquiries?.length || 0) > 0,
          has_negative_items: (negativeItems?.length || 0) > 0,
        },
        email_metrics: { total_sent: 0, delivery_rate: 0, open_rate: 0, response_rate: 0 },
        disputes: {
          total: totalDisputes,
          pending: disputes?.filter((d: any) => d.status === 'pending').length || 0,
          successful: successfulDisputes,
          failed: disputes?.filter((d: any) => d.status === 'failed' || d.status === 'lost').length || 0,
        },
      }
    } catch (error) {
      console.error('getDashboardStats error:', error)
      return this.getDefaultStats()
    }
  }

  async getAnalyticsData(userId: string) {
    try {
      const supabase = db()
      const { data: reports } = await supabase
        .from('credit_reports')
        .select('id, created_at, experian_score, equifax_score, transunion_score, ai_analysis')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(24)

      return { reports: reports || [], userId }
    } catch (error) {
      console.error('getAnalyticsData error:', error)
      return { reports: [], userId }
    }
  }

  async getMonitoringData(userId: string) {
    try {
      const supabase = db()
      const { data: reports } = await supabase
        .from('credit_reports')
        .select('id, created_at, experian_score, equifax_score, transunion_score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      return { reports: reports || [], userId }
    } catch (error) {
      console.error('getMonitoringData error:', error)
      return { reports: [], userId }
    }
  }
}

export const creditDataService = new CreditDataService()
