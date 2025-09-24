import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import pdfParse from "pdf-parse"
import crypto from "crypto"

// Pattern-based credit analysis without AI
class PatternBasedAnalyzer {
  analyze(text: string, fileName: string, selectedBureau: string) {
    const lowerText = text.toLowerCase()
    
    // Detect bureau
    let bureau = selectedBureau
    if (bureau === "unknown" || !bureau) {
      if (lowerText.includes("experian")) bureau = "experian"
      else if (lowerText.includes("equifax")) bureau = "equifax"
      else if (lowerText.includes("transunion")) bureau = "transunion"
      else bureau = "unknown"
    }

    // Extract credit scores using regex patterns
    const scores = this.extractCreditScores(text)
    
    // Extract accounts using pattern matching
    const accounts = this.extractAccounts(text)
    
    // Extract negative items
    const negativeItems = this.extractNegativeItems(text)
    
    // Calculate summary
    const summary = this.calculateSummary(accounts, negativeItems)
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(summary, negativeItems)
    
    // Calculate confidence based on data found
    const confidence = this.calculateConfidence(scores, accounts, negativeItems)
    
    return {
      bureau_detected: bureau,
      credit_scores: {
        primary_score: scores[0]?.score || null,
        experian: scores.find(s => s.bureau === "experian")?.score || null,
        equifax: scores.find(s => s.bureau === "equifax")?.score || null,
        transunion: scores.find(s => s.bureau === "transunion")?.score || null,
      },
      accounts,
      negative_items: negativeItems,
      summary,
      recommendations,
      data_completeness: {
        confidence_score: confidence,
        scores_found: scores.length,
        accounts_found: accounts.length,
        negative_items_found: negativeItems.length,
      }
    }
  }

  private extractCreditScores(text: string) {
    const scores: Array<{bureau: string, score: number}> = []
    
    // Common credit score patterns
    const patterns = [
      { pattern: /(?:credit score|fico score|score)\s*:?\s*(\d{3})/gi, bureau: "unknown" },
      { pattern: /(\d{3})\s*(?:credit score|fico|score)/gi, bureau: "unknown" },
      { pattern: /experian.*?(\d{3})/gi, bureau: "experian" },
      { pattern: /equifax.*?(\d{3})/gi, bureau: "equifax" },
      { pattern: /transunion.*?(\d{3})/gi, bureau: "transunion" },
    ]
    
    for (const { pattern, bureau } of patterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        const score = parseInt(match[1])
        if (score >= 300 && score <= 850) {
          const detectedBureau = bureau === "unknown" ? this.detectBureauFromContext(text, match[0]) : bureau
          scores.push({ bureau: detectedBureau, score })
        }
      }
    }
    
    return scores
  }

  private detectBureauFromContext(text: string, matchText: string) {
    const context = text.substring(Math.max(0, text.indexOf(matchText) - 100), text.indexOf(matchText) + 100)
    if (context.toLowerCase().includes("experian")) return "experian"
    if (context.toLowerCase().includes("equifax")) return "equifax"
    if (context.toLowerCase().includes("transunion")) return "transunion"
    return "unknown"
  }

  private extractAccounts(text: string) {
    const accounts: Array<{
      account_type: string
      creditor_name: string
      account_number_last_4: string
      account_status: string
      balance: number | null
      credit_limit: number | null
      payment_history: string | null
      opened_date: string | null
      last_activity: string | null
      monthly_payment: number | null
    }> = []
    
    const lines = text.split('\n')
    const creditorPatterns = [
      /(chase|bank of america|wells fargo|citi|capital one|discover|american express|amex|visa|mastercard)/gi,
      /(synchrony|barclays|usaa|navy federal|penfed|ally|td bank|pnc)/gi
    ]
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.length < 10) continue
      
      // Look for creditor names
      for (const pattern of creditorPatterns) {
        const creditorMatch = line.match(pattern)
        if (creditorMatch) {
          const creditorName = creditorMatch[0]
          
          // Look for account details in this line and nearby lines
          const contextLines = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(" ")
          
          // Extract balance
          const balanceMatch = contextLines.match(/\$?([\d,]+\.?\d*)/g)
          const balance = balanceMatch ? parseFloat(balanceMatch[0].replace(/[$,]/g, "")) : null
          
          // Extract account number
          const accountMatch = contextLines.match(/(\d{4})/g)
          const accountNumber = accountMatch ? accountMatch[accountMatch.length - 1] : "****"
          
          // Determine account type
          const accountType = this.determineAccountType(contextLines)
          
          // Determine status
          const status = this.determineAccountStatus(contextLines)
          
          if (balance !== null && balance > 0) {
            accounts.push({
              account_type: accountType,
              creditor_name: creditorName,
              account_number_last_4: accountNumber,
              account_status: status,
              balance,
              credit_limit: null,
              payment_history: null,
              opened_date: null,
              last_activity: null,
              monthly_payment: null
            })
          }
        }
      }
    }
    
    return accounts.slice(0, 20) // Limit to 20 accounts
  }

  private determineAccountType(text: string): string {
    const lowerText = text.toLowerCase()
    if (lowerText.includes("mortgage")) return "mortgage"
    if (lowerText.includes("auto") || lowerText.includes("car")) return "auto_loan"
    if (lowerText.includes("student")) return "student_loan"
    if (lowerText.includes("personal")) return "personal_loan"
    return "credit_card"
  }

  private determineAccountStatus(text: string): string {
    const lowerText = text.toLowerCase()
    if (lowerText.includes("current") || lowerText.includes("ok")) return "current"
    if (lowerText.includes("late") || lowerText.includes("30") || lowerText.includes("60") || lowerText.includes("90")) return "late"
    if (lowerText.includes("charge") || lowerText.includes("collection")) return "charged_off"
    return "current"
  }

  private extractNegativeItems(text: string) {
    const negativeItems: Array<{
      item_type: string
      creditor_name: string
      account_number_last_4: string
      status: string
      balance: number | null
      original_amount: number | null
      date_opened: string | null
      date_of_first_delinquency: string | null
      date_reported: string | null
      estimated_removal_date: string | null
      dispute_status: string
      notes: string | null
    }> = []
    
    const negativePatterns = [
      { type: "late_payment", pattern: /late\s+payment|30\s+days|60\s+days|90\s+days/gi },
      { type: "collection", pattern: /collection|collections/gi },
      { type: "charge_off", pattern: /charge\s*off|charged\s*off/gi },
      { type: "bankruptcy", pattern: /bankruptcy|chapter\s*7|chapter\s*13/gi },
      { type: "foreclosure", pattern: /foreclosure/gi },
      { type: "repossession", pattern: /repossession|repo/gi },
      { type: "judgment", pattern: /judgment|judgement/gi },
      { type: "tax_lien", pattern: /tax\s+lien/gi }
    ]
    
    const lines = text.split('\n')
    
    for (const line of lines) {
      for (const negPattern of negativePatterns) {
        if (negPattern.pattern.test(line)) {
          // Extract creditor name
          const creditorMatch = line.match(/(\w+(?:\s+\w+)*)/g)
          const creditorName = creditorMatch ? creditorMatch[0] : "Unknown Creditor"
          
          // Extract amount if present
          const amountMatch = line.match(/\$?([\d,]+\.?\d*)/g)
          const amount = amountMatch ? parseFloat(amountMatch[0].replace(/[$,]/g, "")) : null
          
          negativeItems.push({
            item_type: negPattern.type,
            creditor_name: creditorName,
            account_number_last_4: "****",
            status: "unresolved",
            balance: amount,
            original_amount: amount,
            date_opened: null,
            date_of_first_delinquency: null,
            date_reported: null,
            estimated_removal_date: null,
            dispute_status: "Not Disputed",
            notes: line.trim()
          })
        }
      }
    }
    
    return negativeItems.slice(0, 10) // Limit to 10 negative items
  }

  private calculateSummary(accounts: any[], negativeItems: any[]) {
    const totalAccounts = accounts.length
    const openAccounts = accounts.filter(acc => acc.account_status === "current").length
    const totalDebt = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
    const totalCreditLimit = accounts.reduce((sum, acc) => sum + (acc.credit_limit || 0), 0)
    const utilizationRate = totalCreditLimit > 0 ? (totalDebt / totalCreditLimit) * 100 : 0
    const negativeItemsCount = negativeItems.length
    
    return {
      total_accounts: totalAccounts,
      open_accounts: openAccounts,
      total_debt: totalDebt,
      total_credit_limit: totalCreditLimit,
      credit_utilization: utilizationRate,
      negative_items_count: negativeItemsCount
    }
  }

  private generateRecommendations(summary: any, negativeItems: any[]) {
    const recommendations = []
    
    // Utilization recommendations
    if (summary.credit_utilization > 30) {
      recommendations.push("Reduce your credit utilization below 30% to improve your credit score")
    }
    
    // Negative items recommendations
    if (negativeItems.length > 0) {
      recommendations.push(`Consider disputing ${negativeItems.length} negative items on your report`)
    }
    
    // Payment recommendations
    if (summary.open_accounts < summary.total_accounts) {
      recommendations.push("Bring all accounts current to improve your payment history")
    }
    
    // Credit mix recommendations
    if (summary.total_accounts < 3) {
      recommendations.push("Consider diversifying your credit mix with different types of accounts")
    }
    
    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push("Continue making on-time payments to maintain good credit health")
      recommendations.push("Monitor your credit report regularly for any changes or errors")
    }
    
    return recommendations
  }

  private calculateConfidence(scores: any[], accounts: any[], negativeItems: any[]) {
    let confidence = 0
    let factors = 0
    
    // Score confidence
    if (scores.length > 0) {
      confidence += 0.3
      factors++
    }
    
    // Account confidence
    if (accounts.length > 0) {
      confidence += 0.4
      factors++
    }
    
    // Negative items confidence
    confidence += 0.2
    factors++
    
    // Summary confidence
    if (accounts.length > 0) {
      confidence += 0.1
      factors++
    }
    
    return factors > 0 ? Math.round((confidence / factors) * 100) / 100 : 0.5
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Fallback Upload API called")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const selectedBureau = (formData.get("bureau") as string) || "unknown"

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File too large (max 10MB)" }, { status: 400 })
    }

    const allowedTypes = ["application/pdf", "text/plain"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only PDF and TXT files are allowed." },
        { status: 400 },
      )
    }

    // Extract text from file
    let text = ""
    try {
      if (file.type === "application/pdf") {
        const buffer = await file.arrayBuffer()
        const pdfData = await pdfParse(Buffer.from(buffer))
        text = pdfData.text
      } else {
        text = await file.text()
      }
    } catch (parseError) {
      console.error("File parsing error:", parseError)
      return NextResponse.json({ success: false, error: "Failed to parse file content" }, { status: 400 })
    }

    if (!text || text.length < 100) {
      return NextResponse.json({ success: false, error: "File content too short or empty" }, { status: 400 })
    }

    // Analyze with pattern-based analyzer
    console.log("Starting pattern-based analysis...")
    const analyzer = new PatternBasedAnalyzer()
    const analysis = analyzer.analyze(text, file.name, selectedBureau)

    console.log("Analysis complete:", {
      scores: analysis.credit_scores,
      accounts: analysis.accounts.length,
      negativeItems: analysis.negative_items.length,
      confidence: analysis.data_completeness.confidence_score,
    })

    // Save to database
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
    if (!databaseUrl) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      )
    }

    const sql = neon(databaseUrl)
    const reportId = crypto.randomUUID()

    // Insert credit report record
    await sql`
      INSERT INTO credit_reports (
        id, user_id, bureau, report_date, file_name, file_size, file_type,
        credit_score, ai_analysis, processing_status, raw_text, confidence_score
      ) VALUES (
        ${reportId}, 'user-123', ${analysis.bureau_detected}, 
        CURRENT_DATE, ${file.name}, ${file.size}, ${file.type},
        ${analysis.credit_scores.primary_score}, ${JSON.stringify(analysis)}, 
        'completed', ${text.substring(0, 5000)}, ${analysis.data_completeness.confidence_score}
      )
    `

    // Insert accounts
    for (const account of analysis.accounts) {
      await sql`
        INSERT INTO credit_accounts (
          id, credit_report_id, account_type, creditor_name, account_number_last_4,
          balance, credit_limit, payment_status, opened_date
        ) VALUES (
          ${crypto.randomUUID()}, ${reportId}, ${account.account_type},
          ${account.creditor_name}, ${account.account_number_last_4},
          ${account.balance}, ${account.credit_limit}, ${account.account_status},
          ${account.opened_date}
        )
      `
    }

    // Insert negative items
    for (const item of analysis.negative_items) {
      await sql`
        INSERT INTO credit_negative_items (
          id, credit_report_id, item_type, creditor_name, account_number_last_4,
          status, balance, original_amount, date_reported, notes
        ) VALUES (
          ${crypto.randomUUID()}, ${reportId}, ${item.item_type},
          ${item.creditor_name}, ${item.account_number_last_4},
          ${item.status}, ${item.balance}, ${item.original_amount},
          ${item.date_reported}, ${item.notes}
        )
      `
    }

    // Prepare response data
    const responseData = {
      success: true,
      reportId,
      message: "Credit report uploaded and analyzed successfully using pattern-based analysis",
      analysis: {
        credit_scores: analysis.credit_scores,
        accounts: analysis.accounts.map(acc => ({
          creditor_name: acc.creditor_name,
          account_number_last_4: acc.account_number_last_4,
          balance: acc.balance,
          account_type: acc.account_type,
        })),
        summary: {
          total_accounts: analysis.summary.total_accounts,
          total_debt: analysis.summary.total_debt,
          credit_utilization: analysis.summary.credit_utilization,
        },
        recommendations: analysis.recommendations,
      },
      stats: {
        method: "Pattern-Based Analysis",
        text_length: text.length,
        confidence_score: analysis.data_completeness.confidence_score,
        accounts_found: analysis.accounts.length,
        scores_found: Object.values(analysis.credit_scores).filter(score => score !== null).length,
        primary_score: analysis.credit_scores.primary_score,
      },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Fallback upload API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
