export interface CreditReportData {
  id: string
  fileName: string
  uploadDate: string
  bureau: string
  creditScores: {
    experian?: number
    equifax?: number
    transunion?: number
  }
  accounts: Array<{
    id: string
    creditor: string
    accountType: string
    balance: number
    creditLimit: number
    paymentStatus: string
    accountNumber: string
    openDate: string
    lastActivity: string
  }>
  negativeItems: Array<{
    id: string
    type: string
    creditor: string
    amount: number
    dateReported: string
    status: string
    description: string
  }>
  creditUtilization: number
  totalAccounts: number
  totalDebt: number
  averageAccountAge: number
  confidence: number
}

export interface DashboardStats {
  creditScore: number | null
  experian_score: number | null
  equifax_score: number | null
  transunion_score: number | null
  totalAccounts: number
  negativeItems: number
  credit_utilization: number | null
  totalDebt: number
  averageAccountAge: number
  hasData: boolean
  lastUpdated: string | null
}

export class ClientCreditDataService {
  static getLatestReport(): CreditReportData | null {
    try {
      const data = localStorage.getItem("latestCreditReport")
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("Error reading latest credit report:", error)
      return null
    }
  }

  static getAllReports(): CreditReportData[] {
    try {
      const data = localStorage.getItem("creditReports")
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error reading credit reports:", error)
      return []
    }
  }

  static getDashboardStats(): DashboardStats {
    const latestReport = this.getLatestReport()

    if (!latestReport) {
      return {
        creditScore: null,
        experian_score: null,
        equifax_score: null,
        transunion_score: null,
        totalAccounts: 0,
        negativeItems: 0,
        credit_utilization: null,
        totalDebt: 0,
        averageAccountAge: 0,
        hasData: false,
        lastUpdated: null,
      }
    }

    const primaryScore =
      latestReport.creditScores.experian ||
      latestReport.creditScores.equifax ||
      latestReport.creditScores.transunion ||
      null

    return {
      creditScore: primaryScore,
      experian_score: latestReport.creditScores.experian || null,
      equifax_score: latestReport.creditScores.equifax || null,
      transunion_score: latestReport.creditScores.transunion || null,
      totalAccounts: latestReport.totalAccounts,
      negativeItems: latestReport.negativeItems.length,
      credit_utilization: latestReport.creditUtilization,
      totalDebt: latestReport.totalDebt,
      averageAccountAge: latestReport.averageAccountAge,
      hasData: true,
      lastUpdated: latestReport.uploadDate,
    }
  }

  static getAnalyticsData() {
    const reports = this.getAllReports()
    const latestReport = this.getLatestReport()

    if (!latestReport) {
      return {
        scoreHistory: [],
        accountBreakdown: [],
        utilizationTrend: [],
        negativeItemsBreakdown: [],
      }
    }

    // Generate score history from available reports
    const scoreHistory = reports.map((report, index) => ({
      date: report.uploadDate.split("T")[0],
      score: Object.values(report.creditScores)[0] || 0,
    }))

    // Account breakdown by type
    const accountTypes = latestReport.accounts.reduce(
      (acc, account) => {
        acc[account.accountType] = (acc[account.accountType] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const accountBreakdown = Object.entries(accountTypes).map(([type, count]) => ({
      type,
      count,
      percentage: (count / latestReport.totalAccounts) * 100,
    }))

    // Utilization trend (mock data based on current utilization)
    const utilizationTrend = Array.from({ length: 6 }, (_, i) => ({
      month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short" }),
      utilization: Math.max(0, latestReport.creditUtilization + (Math.random() - 0.5) * 20),
    }))

    // Negative items breakdown
    const negativeTypes = latestReport.negativeItems.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const negativeItemsBreakdown = Object.entries(negativeTypes).map(([type, count]) => ({
      type,
      count,
      impact: count * 50, // Mock impact score
    }))

    return {
      scoreHistory,
      accountBreakdown,
      utilizationTrend,
      negativeItemsBreakdown,
    }
  }
}
