import { neon } from "@neondatabase/serverless"

export interface CreditReportAnalysis {
  creditScore: number
  totalAccounts: number
  openAccounts: number
  negativeItems: number
  latePayments: number
  collections: number
  inquiries: number
  utilizationRate: number
  averageAccountAge: number
  disputeHistory: DisputeHistory[]
}

export interface DisputeHistory {
  id: string
  type: string
  status: string
  result: string
  dateSubmitted: string
  dateResolved: string
}

export interface DisputeStrategy {
  id: string
  name: string
  description: string
  targetItems: string[]
  legalBasis: string[]
  evidenceRequired: string[]
  successProbability: number
  expectedTimeline: string
  difficulty: "Easy" | "Medium" | "Hard"
  cost: number
  followUpActions: string[]
  riskLevel: "Low" | "Medium" | "High"
}

export interface DisputeRecommendation {
  priority: number
  strategy: DisputeStrategy
  reasoning: string
  expectedImpact: string
  estimatedSuccessRate: number
  recommendedOrder: number
}

export class AdvancedDisputeStrategyEngine {
  private sql: any

  constructor() {
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
    if (databaseUrl) {
      this.sql = neon(databaseUrl)
    }
  }

  async analyzeCreditReport(userId: string): Promise<CreditReportAnalysis> {
    try {
      if (!this.sql) {
        return this.getMockAnalysis()
      }

      // Get latest credit report
      const reportResult = await this.sql`
        SELECT * FROM credit_reports 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT 1
      `

      if (reportResult.length === 0) {
        return this.getMockAnalysis()
      }

      const report = reportResult[0]
      const analysis = report.ai_analysis || {}

      // Get accounts
      const accountsResult = await this.sql`
        SELECT * FROM credit_accounts 
        WHERE credit_report_id = ${report.id}
      `

      // Get negative items
      const negativeItemsResult = await this.sql`
        SELECT * FROM negative_items 
        WHERE credit_report_id = ${report.id}
      `

      // Get dispute history
      const disputesResult = await this.sql`
        SELECT * FROM disputes 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `

      return {
        creditScore: report.credit_score || 650,
        totalAccounts: accountsResult.length,
        openAccounts: accountsResult.filter((acc: any) => acc.status === "open").length,
        negativeItems: negativeItemsResult.length,
        latePayments: negativeItemsResult.filter((item: any) => 
          item.item_type?.toLowerCase().includes("late") || 
          item.item_type?.toLowerCase().includes("payment")
        ).length,
        collections: negativeItemsResult.filter((item: any) => 
          item.item_type?.toLowerCase().includes("collection") ||
          item.item_type?.toLowerCase().includes("charge-off")
        ).length,
        inquiries: 0, // Would need inquiries table
        utilizationRate: this.calculateUtilizationRate(accountsResult),
        averageAccountAge: this.calculateAverageAccountAge(accountsResult),
        disputeHistory: disputesResult.map((d: any) => ({
          id: d.id,
          type: d.dispute_type,
          status: d.status,
          result: d.resolution_notes || "Pending",
          dateSubmitted: d.submitted_date || d.created_at,
          dateResolved: d.expected_resolution_date || "Pending"
        }))
      }
    } catch (error) {
      console.error("Error analyzing credit report:", error)
      return this.getMockAnalysis()
    }
  }

  async generateDisputeStrategy(
    analysis: CreditReportAnalysis,
    targetItems: string[],
    userPreferences?: any
  ): Promise<DisputeRecommendation[]> {
    const strategies = this.getAvailableStrategies()
    const recommendations: DisputeRecommendation[] = []

    // Analyze each target item and recommend strategies
    for (const item of targetItems) {
      const itemStrategies = this.analyzeItemForStrategies(item, analysis, strategies)
      recommendations.push(...itemStrategies)
    }

    // Sort by priority and success probability
    recommendations.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      return b.estimatedSuccessRate - a.estimatedSuccessRate
    })

    // Assign recommended order
    recommendations.forEach((rec, index) => {
      rec.recommendedOrder = index + 1
    })

    return recommendations
  }

  private analyzeItemForStrategies(
    item: string,
    analysis: CreditReportAnalysis,
    strategies: DisputeStrategy[]
  ): DisputeRecommendation[] {
    const recommendations: DisputeRecommendation[] = []

    // Match item type to appropriate strategies
    if (item.toLowerCase().includes("late payment")) {
      const latePaymentStrategies = strategies.filter(s => 
        s.targetItems.some(t => t.toLowerCase().includes("late"))
      )
      
      latePaymentStrategies.forEach(strategy => {
        const successRate = this.calculateSuccessRate(strategy, analysis)
        recommendations.push({
          priority: this.calculatePriority(strategy, analysis),
          strategy,
          reasoning: this.generateReasoning(strategy, analysis),
          expectedImpact: this.calculateExpectedImpact(strategy, analysis),
          estimatedSuccessRate: successRate,
          recommendedOrder: 0
        })
      })
    }

    if (item.toLowerCase().includes("collection") || item.toLowerCase().includes("charge-off")) {
      const collectionStrategies = strategies.filter(s => 
        s.targetItems.some(t => t.toLowerCase().includes("collection"))
      )
      
      collectionStrategies.forEach(strategy => {
        const successRate = this.calculateSuccessRate(strategy, analysis)
        recommendations.push({
          priority: this.calculatePriority(strategy, analysis),
          strategy,
          reasoning: this.generateReasoning(strategy, analysis),
          expectedImpact: this.calculateExpectedImpact(strategy, analysis),
          estimatedSuccessRate: successRate,
          recommendedOrder: 0
        })
      })
    }

    if (item.toLowerCase().includes("inquiry")) {
      const inquiryStrategies = strategies.filter(s => 
        s.targetItems.some(t => t.toLowerCase().includes("inquiry"))
      )
      
      inquiryStrategies.forEach(strategy => {
        const successRate = this.calculateSuccessRate(strategy, analysis)
        recommendations.push({
          priority: this.calculatePriority(strategy, analysis),
          strategy,
          reasoning: this.generateReasoning(strategy, analysis),
          expectedImpact: this.calculateExpectedImpact(strategy, analysis),
          estimatedSuccessRate: successRate,
          recommendedOrder: 0
        })
      })
    }

    return recommendations
  }

  private calculateSuccessRate(strategy: DisputeStrategy, analysis: CreditReportAnalysis): number {
    let baseRate = strategy.successProbability

    // Adjust based on credit score
    if (analysis.creditScore > 700) baseRate += 0.1
    else if (analysis.creditScore < 600) baseRate -= 0.1

    // Adjust based on dispute history
    const successfulDisputes = analysis.disputeHistory.filter(d => d.result === "resolved").length
    if (successfulDisputes > 0) baseRate += 0.05

    // Adjust based on item type
    if (strategy.difficulty === "Easy") baseRate += 0.1
    else if (strategy.difficulty === "Hard") baseRate -= 0.1

    return Math.max(0.1, Math.min(0.95, baseRate))
  }

  private calculatePriority(strategy: DisputeStrategy, analysis: CreditReportAnalysis): number {
    let priority = 1

    // Higher priority for high-impact items
    if (strategy.expectedTimeline.includes("15-30")) priority += 3
    else if (strategy.expectedTimeline.includes("30-45")) priority += 2

    // Higher priority for high success probability
    if (strategy.successProbability > 0.8) priority += 2
    else if (strategy.successProbability > 0.6) priority += 1

    // Higher priority for easy disputes
    if (strategy.difficulty === "Easy") priority += 2
    else if (strategy.difficulty === "Medium") priority += 1

    return priority
  }

  private generateReasoning(strategy: DisputeStrategy, analysis: CreditReportAnalysis): string {
    const reasons: string[] = []

    if (strategy.successProbability > 0.8) {
      reasons.push("High success probability based on similar cases")
    }

    if (analysis.creditScore > 700) {
      reasons.push("Good credit history supports dispute credibility")
    }

    if (strategy.difficulty === "Easy") {
      reasons.push("Simple dispute process with clear legal basis")
    }

    if (strategy.expectedTimeline.includes("15-30")) {
      reasons.push("Quick resolution expected")
    }

    return reasons.join(". ") + "."
  }

  private calculateExpectedImpact(strategy: DisputeStrategy, analysis: CreditReportAnalysis): string {
    if (strategy.successProbability > 0.8) {
      return "High - Significant credit score improvement expected"
    } else if (strategy.successProbability > 0.6) {
      return "Medium - Moderate credit score improvement likely"
    } else {
      return "Low - Limited impact expected, but worth attempting"
    }
  }

  private getAvailableStrategies(): DisputeStrategy[] {
    return [
      {
        id: "late_payment_verification",
        name: "Late Payment Verification Dispute",
        description: "Dispute late payments by requesting verification of payment history",
        targetItems: ["late payment", "payment history", "30-day late", "60-day late", "90-day late"],
        legalBasis: [
          "FCRA Section 1681i(a)(1) - Right to dispute inaccurate information",
          "FCRA Section 1681s-2 - Furnisher accuracy obligations"
        ],
        evidenceRequired: [
          "Bank statements showing payments",
          "Payment confirmation emails",
          "Account statements"
        ],
        successProbability: 0.75,
        expectedTimeline: "30-45 days",
        difficulty: "Medium",
        cost: 0,
        followUpActions: [
          "Send certified mail with return receipt",
          "Follow up after 30 days",
          "File CFPB complaint if no response"
        ],
        riskLevel: "Low"
      },
      {
        id: "identity_theft_dispute",
        name: "Identity Theft Dispute",
        description: "Dispute accounts opened without authorization due to identity theft",
        targetItems: ["unauthorized account", "identity theft", "fraudulent account"],
        legalBasis: [
          "FCRA Section 1681c-2 - Identity theft prevention",
          "FTC Identity Theft Report requirements"
        ],
        evidenceRequired: [
          "FTC Identity Theft Report",
          "Police report",
          "Affidavit of fraud"
        ],
        successProbability: 0.95,
        expectedTimeline: "15-30 days",
        difficulty: "Easy",
        cost: 0,
        followUpActions: [
          "Include FTC report and police report",
          "Request fraud alert placement",
          "Monitor for additional fraudulent accounts"
        ],
        riskLevel: "Low"
      },
      {
        id: "balance_verification",
        name: "Balance Verification Dispute",
        description: "Dispute incorrect account balances by requesting verification",
        targetItems: ["incorrect balance", "wrong amount", "outdated balance"],
        legalBasis: [
          "FCRA Section 1681s-2 - Furnisher accuracy obligations"
        ],
        evidenceRequired: [
          "Current account statement",
          "Payment receipts",
          "Account agreement"
        ],
        successProbability: 0.80,
        expectedTimeline: "30-45 days",
        difficulty: "Easy",
        cost: 0,
        followUpActions: [
          "Provide current account documentation",
          "Request immediate correction",
          "Follow up for verification"
        ],
        riskLevel: "Low"
      },
      {
        id: "inquiry_dispute",
        name: "Unauthorized Inquiry Dispute",
        description: "Dispute hard inquiries that were not authorized",
        targetItems: ["hard inquiry", "credit inquiry", "unauthorized inquiry"],
        legalBasis: [
          "FCRA Section 1681b - Permissible purpose requirements"
        ],
        evidenceRequired: [
          "Credit report showing inquiry",
          "Proof no application was submitted",
          "Correspondence with creditor"
        ],
        successProbability: 0.85,
        expectedTimeline: "15-30 days",
        difficulty: "Easy",
        cost: 0,
        followUpActions: [
          "Send dispute to credit bureau",
          "Contact creditor directly",
          "Request inquiry removal"
        ],
        riskLevel: "Low"
      },
      {
        id: "collection_validation",
        name: "Collection Account Validation",
        description: "Request validation of collection accounts and dispute if invalid",
        targetItems: ["collection account", "charge-off", "debt collection"],
        legalBasis: [
          "FDCPA Section 809 - Debt validation requirements",
          "FCRA Section 1681i(a)(1) - Right to dispute"
        ],
        evidenceRequired: [
          "Collection notice",
          "Original creditor information",
          "Payment history"
        ],
        successProbability: 0.60,
        expectedTimeline: "30-60 days",
        difficulty: "Hard",
        cost: 0,
        followUpActions: [
          "Send validation request",
          "Dispute with credit bureaus",
          "File CFPB complaint if needed"
        ],
        riskLevel: "Medium"
      }
    ]
  }

  private calculateUtilizationRate(accounts: any[]): number {
    if (accounts.length === 0) return 0
    
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
    const totalLimit = accounts.reduce((sum, acc) => sum + (acc.credit_limit || 0), 0)
    
    return totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0
  }

  private calculateAverageAccountAge(accounts: any[]): number {
    if (accounts.length === 0) return 0
    
    const totalAge = accounts.reduce((sum, acc) => {
      if (acc.date_opened) {
        const opened = new Date(acc.date_opened)
        const now = new Date()
        return sum + ((now.getTime() - opened.getTime()) / (1000 * 60 * 60 * 24 * 365))
      }
      return sum
    }, 0)
    
    return totalAge / accounts.length
  }

  private getMockAnalysis(): CreditReportAnalysis {
    return {
      creditScore: 650,
      totalAccounts: 8,
      openAccounts: 6,
      negativeItems: 3,
      latePayments: 2,
      collections: 1,
      inquiries: 5,
      utilizationRate: 45,
      averageAccountAge: 4.2,
      disputeHistory: [
        {
          id: "1",
          type: "late_payment",
          status: "resolved",
          result: "Item removed",
          dateSubmitted: "2024-01-15",
          dateResolved: "2024-02-15"
        }
      ]
    }
  }
}

export const advancedDisputeStrategyEngine = new AdvancedDisputeStrategyEngine()
