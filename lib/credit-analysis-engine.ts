export interface CreditScore {
  bureau: string
  score: number
  scoreModel: string
  dateGenerated: string
}

export interface CreditAccount {
  id: string
  creditor: string
  accountNumber: string
  accountType: string
  balance: number
  creditLimit?: number
  paymentStatus: string
  monthsReviewed: number
  dateOpened?: string
  lastActivity?: string
  bureau: string
  confidence: number
}

export interface NegativeItem {
  id: string
  type: string
  creditor: string
  description: string
  amount?: number
  dateReported?: string
  status: string
  bureau: string
  confidence: number
  disputeRecommendation?: string
}

export interface CreditSummary {
  totalAccounts: number
  openAccounts: number
  totalDebt: number
  totalCreditLimit: number
  utilizationRate: number
  negativeItemsCount: number
}

export interface CreditAnalysis {
  id: string
  reportDate: string
  bureau: string
  confidence: number
  scores: CreditScore[]
  accounts: CreditAccount[]
  negativeItems: NegativeItem[]
  summary: CreditSummary
  recommendations: string[]
}

export class CreditAnalysisEngine {
  async analyzeCredit(text: string): Promise<CreditAnalysis> {
    console.log("Starting credit analysis...")

    const analysis: CreditAnalysis = {
      id: `analysis_${Date.now()}`,
      reportDate: new Date().toISOString().split("T")[0],
      bureau: this.detectBureau(text),
      confidence: 0,
      scores: [],
      accounts: [],
      negativeItems: [],
      summary: {
        totalAccounts: 0,
        openAccounts: 0,
        totalDebt: 0,
        totalCreditLimit: 0,
        utilizationRate: 0,
        negativeItemsCount: 0,
      },
      recommendations: [],
    }

    // Extract credit scores
    analysis.scores = this.extractCreditScores(text)
    console.log(`Found ${analysis.scores.length} credit scores`)

    // Extract accounts
    analysis.accounts = this.extractAccounts(text)
    console.log(`Found ${analysis.accounts.length} accounts`)

    // Extract negative items
    analysis.negativeItems = this.extractNegativeItems(text)
    console.log(`Found ${analysis.negativeItems.length} negative items`)

    // Calculate summary
    analysis.summary = this.calculateSummary(analysis.accounts, analysis.negativeItems)

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis)

    // Calculate overall confidence
    analysis.confidence = this.calculateConfidence(analysis)

    console.log("Credit analysis complete")
    return analysis
  }

  private detectBureau(text: string): string {
    const lowerText = text.toLowerCase()
    if (lowerText.includes("experian")) return "experian"
    if (lowerText.includes("equifax")) return "equifax"
    if (lowerText.includes("transunion")) return "transunion"
    return "unknown"
  }

  private extractCreditScores(text: string): CreditScore[] {
    const scores: CreditScore[] = []

    // Common credit score patterns
    const scorePatterns = [
      /(?:credit score|fico score|score)\s*:?\s*(\d{3})/gi,
      /(\d{3})\s*(?:credit score|fico|score)/gi,
      /score\s*of\s*(\d{3})/gi,
      /your\s*score\s*:?\s*(\d{3})/gi,
    ]

    const bureauPatterns = [
      { name: "experian", pattern: /experian.*?(\d{3})/gi },
      { name: "equifax", pattern: /equifax.*?(\d{3})/gi },
      { name: "transunion", pattern: /transunion.*?(\d{3})/gi },
    ]

    // Try bureau-specific patterns first
    for (const bureau of bureauPatterns) {
      const matches = text.matchAll(bureau.pattern)
      for (const match of matches) {
        const score = Number.parseInt(match[1])
        if (score >= 300 && score <= 850) {
          scores.push({
            bureau: bureau.name,
            score,
            scoreModel: "FICO",
            dateGenerated: new Date().toISOString(),
          })
        }
      }
    }

    // If no bureau-specific scores found, try general patterns
    if (scores.length === 0) {
      for (const pattern of scorePatterns) {
        const matches = text.matchAll(pattern)
        for (const match of matches) {
          const score = Number.parseInt(match[1])
          if (score >= 300 && score <= 850) {
            scores.push({
              bureau: this.detectBureau(text),
              score,
              scoreModel: "FICO",
              dateGenerated: new Date().toISOString(),
            })
            break // Only take the first valid score
          }
        }
        if (scores.length > 0) break
      }
    }

    return scores
  }

  private extractAccounts(text: string): CreditAccount[] {
    const accounts: CreditAccount[] = []
    const lines = text.split("\n")

    // Common creditor names to look for
    const creditorPatterns = [
      /(?:chase|bank of america|wells fargo|citi|capital one|discover|american express|amex)/gi,
      /(?:visa|mastercard|credit card|loan|mortgage)/gi,
      /(?:synchrony|barclays|usaa|navy federal|penfed)/gi,
    ]

    // Account patterns
    const accountPatterns = [
      /(\w+(?:\s+\w+)*)\s+.*?(\d{4})\s+.*?\$?([\d,]+\.?\d*)/gi,
      /account\s*#?\s*(\d{4})\s+.*?\$?([\d,]+\.?\d*)/gi,
      /(\w+\s+\w+)\s+ending\s+in\s+(\d{4})\s+.*?\$?([\d,]+\.?\d*)/gi,
    ]

    let accountId = 1
    const processedCreditors = new Set<string>()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.length < 10) continue

      // Look for creditor names
      for (const pattern of creditorPatterns) {
        const creditorMatches = line.matchAll(pattern)
        for (const creditorMatch of creditorMatches) {
          const creditorName = this.cleanCreditorName(creditorMatch[0])

          if (processedCreditors.has(creditorName)) continue
          processedCreditors.add(creditorName)

          // Look for account details in this line and nearby lines
          const contextLines = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(" ")

          const balanceMatch = contextLines.match(/\$?([\d,]+\.?\d*)/g)
          const accountMatch = contextLines.match(/(\d{4})/g)

          if (balanceMatch && accountMatch) {
            const balance = this.parseAmount(balanceMatch[0])
            const accountNumber = accountMatch[accountMatch.length - 1]

            // Look for credit limit
            const limitMatch = contextLines.match(/limit\s*:?\s*\$?([\d,]+\.?\d*)/gi)
            const creditLimit = limitMatch ? this.parseAmount(limitMatch[0]) : undefined

            // Determine account type
            const accountType = this.determineAccountType(contextLines)

            // Determine payment status
            const paymentStatus = this.determinePaymentStatus(contextLines)

            accounts.push({
              id: `account_${accountId++}`,
              creditor: creditorName,
              accountNumber: accountNumber,
              accountType,
              balance,
              creditLimit,
              paymentStatus,
              monthsReviewed: 24,
              dateOpened: new Date().toISOString().split("T")[0],
              lastActivity: new Date().toISOString().split("T")[0],
              bureau: this.detectBureau(text),
              confidence: 0.8,
            })
          }
        }
      }
    }

    // If no accounts found with patterns, try a more general approach
    if (accounts.length === 0) {
      const generalPattern = /(\w+(?:\s+\w+)*)\s+.*?(\d{4})\s+.*?\$?([\d,]+\.?\d*)/gi
      const matches = text.matchAll(generalPattern)

      for (const match of matches) {
        const creditorName = this.cleanCreditorName(match[1])
        const accountNumber = match[2]
        const balance = this.parseAmount(match[3])

        if (balance > 0 && creditorName.length > 2) {
          accounts.push({
            id: `account_${accountId++}`,
            creditor: creditorName,
            accountNumber: accountNumber,
            accountType: "credit_card",
            balance,
            paymentStatus: "current",
            monthsReviewed: 24,
            dateOpened: new Date().toISOString().split("T")[0],
            lastActivity: new Date().toISOString().split("T")[0],
            bureau: this.detectBureau(text),
            confidence: 0.6,
          })
        }
      }
    }

    return accounts.slice(0, 20) // Limit to 20 accounts
  }

  private extractNegativeItems(text: string): NegativeItem[] {
    const negativeItems: NegativeItem[] = []

    const negativePatterns = [
      { type: "late_payment", pattern: /late\s+payment|30\s+days|60\s+days|90\s+days/gi },
      { type: "collection", pattern: /collection|collections/gi },
      { type: "charge_off", pattern: /charge\s*off|charged\s*off/gi },
      { type: "bankruptcy", pattern: /bankruptcy|chapter\s*7|chapter\s*13/gi },
      { type: "foreclosure", pattern: /foreclosure/gi },
      { type: "repossession", pattern: /repossession|repo/gi },
      { type: "judgment", pattern: /judgment|judgement/gi },
      { type: "tax_lien", pattern: /tax\s+lien/gi },
    ]

    let itemId = 1
    const lines = text.split("\n")

    for (const line of lines) {
      for (const negPattern of negativePatterns) {
        if (negPattern.pattern.test(line)) {
          // Extract creditor name from the line
          const creditorMatch = line.match(/(\w+(?:\s+\w+)*)/g)
          const creditorName = creditorMatch ? this.cleanCreditorName(creditorMatch[0]) : "Unknown Creditor"

          // Extract amount if present
          const amountMatch = line.match(/\$?([\d,]+\.?\d*)/g)
          const amount = amountMatch ? this.parseAmount(amountMatch[0]) : undefined

          negativeItems.push({
            id: `negative_${itemId++}`,
            type: negPattern.type,
            creditor: creditorName,
            description: line.trim(),
            amount,
            dateReported: new Date().toISOString().split("T")[0],
            status: "unresolved",
            bureau: this.detectBureau(text),
            confidence: 0.7,
            disputeRecommendation: this.getDisputeRecommendation(negPattern.type),
          })
        }
      }
    }

    return negativeItems.slice(0, 10) // Limit to 10 negative items
  }

  private calculateSummary(accounts: CreditAccount[], negativeItems: NegativeItem[]): CreditSummary {
    const totalAccounts = accounts.length
    const openAccounts = accounts.filter((acc) => acc.paymentStatus === "current").length
    const totalDebt = accounts.reduce((sum, acc) => sum + acc.balance, 0)
    const totalCreditLimit = accounts.reduce((sum, acc) => sum + (acc.creditLimit || 0), 0)
    const utilizationRate = totalCreditLimit > 0 ? (totalDebt / totalCreditLimit) * 100 : 0
    const negativeItemsCount = negativeItems.length

    return {
      totalAccounts,
      openAccounts,
      totalDebt,
      totalCreditLimit,
      utilizationRate,
      negativeItemsCount,
    }
  }

  private generateRecommendations(analysis: CreditAnalysis): string[] {
    const recommendations: string[] = []

    // Utilization recommendations
    if (analysis.summary.utilizationRate > 30) {
      recommendations.push("Reduce your credit utilization below 30% to improve your credit score")
    }

    // Negative items recommendations
    if (analysis.negativeItems.length > 0) {
      recommendations.push(`Consider disputing ${analysis.negativeItems.length} negative items on your report`)
    }

    // Payment recommendations
    const lateAccounts = analysis.accounts.filter((acc) => acc.paymentStatus !== "current")
    if (lateAccounts.length > 0) {
      recommendations.push("Bring all accounts current to improve your payment history")
    }

    // Credit mix recommendations
    if (analysis.accounts.length < 3) {
      recommendations.push("Consider diversifying your credit mix with different types of accounts")
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push("Continue making on-time payments to maintain good credit health")
      recommendations.push("Monitor your credit report regularly for any changes or errors")
    }

    return recommendations
  }

  private calculateConfidence(analysis: CreditAnalysis): number {
    let confidence = 0
    let factors = 0

    // Score confidence
    if (analysis.scores.length > 0) {
      confidence += 0.3
      factors++
    }

    // Account confidence
    if (analysis.accounts.length > 0) {
      confidence += 0.4
      factors++
    }

    // Negative items confidence
    confidence += 0.2
    factors++

    // Summary confidence
    if (analysis.summary.totalAccounts > 0) {
      confidence += 0.1
      factors++
    }

    return Math.round((confidence / factors) * 100)
  }

  private cleanCreditorName(name: string): string {
    return name
      .replace(/[^\w\s]/g, "")
      .trim()
      .replace(/\s+/g, " ")
  }

  private parseAmount(amountStr: string): number {
    return Number.parseFloat(amountStr.replace(/[$,]/g, "")) || 0
  }

  private determineAccountType(text: string): string {
    const lowerText = text.toLowerCase()
    if (lowerText.includes("mortgage")) return "mortgage"
    if (lowerText.includes("auto") || lowerText.includes("car")) return "auto_loan"
    if (lowerText.includes("student")) return "student_loan"
    if (lowerText.includes("personal")) return "personal_loan"
    return "credit_card"
  }

  private determinePaymentStatus(text: string): string {
    const lowerText = text.toLowerCase()
    if (lowerText.includes("current") || lowerText.includes("ok")) return "current"
    if (lowerText.includes("late") || lowerText.includes("30") || lowerText.includes("60") || lowerText.includes("90"))
      return "late"
    if (lowerText.includes("charge") || lowerText.includes("collection")) return "charged_off"
    return "current"
  }

  private getDisputeRecommendation(type: string): string {
    const recommendations: Record<string, string> = {
      late_payment: "Request validation of the late payment dates and amounts",
      collection: "Demand proof of debt ownership and original creditor information",
      charge_off: "Verify the charge-off date and amount with original creditor",
      bankruptcy: "Ensure all bankruptcy information is accurate and up-to-date",
      foreclosure: "Verify foreclosure proceedings and final disposition",
      repossession: "Request documentation of repossession and sale proceeds",
      judgment: "Verify court records and satisfaction of judgment",
      tax_lien: "Confirm lien status with appropriate tax authority",
    }

    return recommendations[type] || "Request validation of this item with supporting documentation"
  }
}
