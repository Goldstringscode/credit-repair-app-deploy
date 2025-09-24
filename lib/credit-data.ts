import { neon } from "@neondatabase/serverless"

export interface CreditReport {
  id: string
  user_id: string
  bureau: string
  bureau_detected: string
  credit_score: number | null
  report_date: string | null
  file_name: string
  status: string
  confidence_score: number | null
  data_completeness: number | null
  has_personal_info: boolean
  has_accounts: boolean
  has_payment_history: boolean
  has_inquiries: boolean
  has_negative_items: boolean
  ai_analysis: any
  created_at: string
}

export interface CreditAccount {
  id: string
  credit_report_id: string
  account_name: string
  creditor_name: string
  account_type: string
  account_status: string
  balance: number | null
  credit_limit: number | null
  payment_history: string | null
  months_reviewed: number | null
  late_payments_30: number | null
  late_payments_60: number | null
  late_payments_90: number | null
}

export interface NegativeItem {
  id: string
  credit_report_id: string
  item_type: string
  creditor_name: string
  description: string
  amount: number | null
  status: string
  date_reported: string | null
  date_of_first_delinquency: string | null
  account_number_last_4: string | null
}

export interface CreditInquiry {
  id: string
  credit_report_id: string
  creditor_name: string
  inquiry_date: string | null
  inquiry_type: string
  purpose: string | null
}

export interface DashboardStats {
  current_credit_score: number | null
  bureau_scores: {
    experian: number | null
    equifax: number | null
    transunion: number | null
  }
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
    data_completeness: number | null
    has_personal_info: boolean
    has_accounts: boolean
    has_payment_history: boolean
    has_inquiries: boolean
    has_negative_items: boolean
  }
  last_updated: string | null
}

export interface AnalyticsData {
  score_history: Array<{
    date: string
    credit_score: number | null
    bureau: string
  }>
  account_breakdown: Array<{
    type: string
    count: number
    total_balance: number
  }>
  negative_items_by_type: Array<{
    type: string
    count: number
  }>
  monthly_progress: Array<{
    month: string
    score_change: number
    accounts_added: number
    negative_items_removed: number
  }>
  utilization_trend: Array<{
    date: string
    utilization: number
  }>
  data_quality: {
    total_reports: number
    average_confidence: number | null
    bureaus_covered: string[]
  }
}

export interface MonitoringData {
  recent_changes: Array<{
    date: string
    type: string
    description: string
    impact: "positive" | "negative" | "neutral"
  }>
  alerts: Array<{
    type: string
    message: string
    severity: "high" | "medium" | "low"
    date: string
  }>
  score_tracking: {
    current_scores: {
      experian: number | null
      equifax: number | null
      transunion: number | null
    }
    last_updated: string | null
    next_update_estimate: string | null
  }
}

class CreditDataService {
  private sql: any

  private getSql() {
    if (!this.sql) {
      const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
      if (!databaseUrl) {
        throw new Error("Database URL not configured")
      }
      this.sql = neon(databaseUrl)
    }
    return this.sql
  }

  async getDashboardStats(userId = "user-123"): Promise<DashboardStats> {
    try {
      const latestReport = await this.getSql()`
        SELECT * FROM credit_reports 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT 1
      `

      if (latestReport.length === 0) {
        return this.getDefaultStats()
      }

      const report = latestReport[0]
      const analysis = report.ai_analysis || {}

      const accounts = await this.getSql()`
        SELECT * FROM credit_accounts 
        WHERE credit_report_id = ${report.id}
      `

      const negativeItems = await this.getSql()`
        SELECT * FROM negative_items 
        WHERE credit_report_id = ${report.id}
      `

      const recentInquiries = await this.getSql()`
        SELECT * FROM credit_inquiries 
        WHERE credit_report_id = ${report.id}
        AND inquiry_date >= CURRENT_DATE - INTERVAL '2 years'
      `

      const totalDebt = accounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0)
      const totalCredit = accounts.reduce((sum: number, acc: any) => sum + (acc.credit_limit || 0), 0)
      const utilization = totalCredit > 0 ? (totalDebt / totalCredit) * 100 : null

      return {
        current_credit_score: report.credit_score || null,
        bureau_scores: {
          experian: report.credit_score,
          equifax: report.credit_score,
          transunion: report.credit_score,
        },
        score_change: await this.calculateScoreChange(userId, report.credit_score),
        total_accounts: accounts.length,
        open_accounts: accounts.filter((acc: any) => acc.account_status?.toLowerCase() === "open").length,
        negative_items: negativeItems.length,
        total_debt: totalDebt,
        credit_utilization: utilization,
        recent_inquiries: recentInquiries.length,
        dispute_success_rate: 85,
        data_completeness: {
          confidence_score: report.confidence_score,
          data_completeness: report.data_completeness,
          has_personal_info: analysis.personal_info?.name ? true : false,
          has_accounts: accounts.length > 0,
          has_payment_history: accounts.some((acc: any) => acc.payment_history),
          has_inquiries: recentInquiries.length > 0,
          has_negative_items: negativeItems.length > 0,
        },
        last_updated: report.created_at,
      }
    } catch (error) {
      console.error("Error getting dashboard stats:", error)
      return this.getDefaultStats()
    }
  }

  async getAnalyticsData(userId = "user-123"): Promise<AnalyticsData> {
    try {
      const reports = await this.getSql()`
        SELECT 
          credit_score,
          bureau, created_at, confidence_score
        FROM credit_reports 
        WHERE user_id = ${userId} 
        ORDER BY created_at ASC
      `

      const latestReport = await this.getSql()`
        SELECT * FROM credit_reports 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT 1
      `

      if (latestReport.length === 0) {
        return this.getDefaultAnalytics()
      }

      const reportId = latestReport[0].id

      const accounts = await this.getSql()`
        SELECT account_type, balance, credit_limit 
        FROM credit_accounts 
        WHERE credit_report_id = ${reportId}
      `

      const negativeItems = await this.getSql()`
        SELECT item_type 
        FROM negative_items 
        WHERE credit_report_id = ${reportId}
      `

      const scoreHistory = reports.map((report: any) => ({
        date: report.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
        credit_score: report.credit_score,
        bureau: report.bureau || "unknown",
      }))

      const accountBreakdown = this.processAccountBreakdown(accounts)
      const negativeItemsBreakdown = this.processNegativeItemsBreakdown(negativeItems)

      const averageConfidence =
        reports.length > 0
          ? reports.reduce((sum: number, r: any) => sum + (r.confidence_score || 0), 0) / reports.length
          : null

      const bureausCovered = [...new Set(reports.map((r: any) => r.bureau).filter(Boolean))]

      return {
        score_history: scoreHistory,
        account_breakdown: accountBreakdown,
        negative_items_by_type: negativeItemsBreakdown,
        monthly_progress: this.generateMonthlyProgress(scoreHistory),
        utilization_trend: this.generateUtilizationTrend(accounts),
        data_quality: {
          total_reports: reports.length,
          average_confidence: averageConfidence,
          bureaus_covered: bureausCovered,
        },
      }
    } catch (error) {
      console.error("Error getting analytics data:", error)
      return this.getDefaultAnalytics()
    }
  }

  async getMonitoringData(userId = "user-123"): Promise<MonitoringData> {
    try {
      const recentReports = await this.getSql()`
        SELECT 
          credit_score,
          bureau, created_at, confidence_score, status
        FROM credit_reports 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT 5
      `

      const recentChanges = this.generateRecentChanges(recentReports)
      const alerts = this.generateAlerts(recentReports)
      const scoreTracking = this.generateScoreTracking(recentReports)

      return {
        recent_changes: recentChanges,
        alerts: alerts,
        score_tracking: scoreTracking,
      }
    } catch (error) {
      console.error("Error getting monitoring data:", error)
      return this.getDefaultMonitoring()
    }
  }

  private async calculateScoreChange(userId: string, currentScore: number | null): Promise<number | null> {
    if (!currentScore) return null

    try {
      const previousReports = await this.getSql()`
        SELECT credit_score
        FROM credit_reports 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT 2
      `

      if (previousReports.length < 2) return null

      const previousScore = previousReports[1].credit_score

      return previousScore ? currentScore - previousScore : null
    } catch (error) {
      console.error("Error calculating score change:", error)
      return null
    }
  }

  private processAccountBreakdown(accounts: any[]): Array<{ type: string; count: number; total_balance: number }> {
    const breakdown = accounts.reduce((acc, account) => {
      const type = account.account_type || "other"
      if (!acc[type]) {
        acc[type] = { count: 0, total_balance: 0 }
      }
      acc[type].count++
      acc[type].total_balance += account.balance || 0
      return acc
    }, {})

    return Object.entries(breakdown).map(([type, data]: [string, any]) => ({
      type,
      count: data.count,
      total_balance: data.total_balance,
    }))
  }

  private processNegativeItemsBreakdown(items: any[]): Array<{ type: string; count: number }> {
    const breakdown = items.reduce((acc, item) => {
      const type = item.item_type || "other"
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    return Object.entries(breakdown).map(([type, count]) => ({
      type,
      count: count as number,
    }))
  }

  private generateMonthlyProgress(
    scoreHistory: any[],
  ): Array<{ month: string; score_change: number; accounts_added: number; negative_items_removed: number }> {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return months.map((month) => ({
      month,
      score_change: Math.floor(Math.random() * 20) - 10,
      accounts_added: Math.floor(Math.random() * 3),
      negative_items_removed: Math.floor(Math.random() * 2),
    }))
  }

  private generateUtilizationTrend(accounts: any[]): Array<{ date: string; utilization: number }> {
    const dates = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return dates.map((date) => ({
      date,
      utilization: Math.floor(Math.random() * 50) + 10,
    }))
  }

  private generateRecentChanges(
    reports: any[],
  ): Array<{ date: string; type: string; description: string; impact: "positive" | "negative" | "neutral" }> {
    if (reports.length === 0) return []

    const changes = []
    const latestReport = reports[0]

    if (latestReport.credit_score) {
      changes.push({
        date: latestReport.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
        type: "Credit Score Update",
        description: `Credit score updated to ${latestReport.credit_score}`,
        impact: "neutral" as const,
      })
    }

    return changes
  }

  private generateAlerts(
    reports: any[],
  ): Array<{ type: string; message: string; severity: "high" | "medium" | "low"; date: string }> {
    const alerts = []

    if (reports.length > 0) {
      const latestReport = reports[0]

      if (latestReport.confidence_score && latestReport.confidence_score < 0.7) {
        alerts.push({
          type: "Data Quality",
          message: "Low confidence in latest credit report analysis",
          severity: "medium" as const,
          date: latestReport.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
        })
      }
    }

    return alerts
  }

  private generateScoreTracking(reports: any[]): {
    current_scores: { experian: number | null; equifax: number | null; transunion: number | null }
    last_updated: string | null
    next_update_estimate: string | null
  } {
    if (reports.length === 0) {
      return {
        current_scores: { experian: null, equifax: null, transunion: null },
        last_updated: null,
        next_update_estimate: null,
      }
    }

    const latestReport = reports[0]
    const nextUpdate = new Date()
    nextUpdate.setMonth(nextUpdate.getMonth() + 1)

    return {
      current_scores: {
        experian: latestReport.credit_score,
        equifax: latestReport.credit_score,
        transunion: latestReport.credit_score,
      },
      last_updated: latestReport.created_at?.split("T")[0] || null,
      next_update_estimate: nextUpdate.toISOString().split("T")[0],
    }
  }

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
        data_completeness: null,
        has_personal_info: false,
        has_accounts: false,
        has_payment_history: false,
        has_inquiries: false,
        has_negative_items: false,
      },
      last_updated: null,
    }
  }

  private getDefaultAnalytics(): AnalyticsData {
    return {
      score_history: [],
      account_breakdown: [],
      negative_items_by_type: [],
      monthly_progress: [],
      utilization_trend: [],
      data_quality: {
        total_reports: 0,
        average_confidence: null,
        bureaus_covered: [],
      },
    }
  }

  private getDefaultMonitoring(): MonitoringData {
    return {
      recent_changes: [],
      alerts: [],
      score_tracking: {
        current_scores: { experian: null, equifax: null, transunion: null },
        last_updated: null,
        next_update_estimate: null,
      },
    }
  }
}

export const creditDataService = new CreditDataService()
