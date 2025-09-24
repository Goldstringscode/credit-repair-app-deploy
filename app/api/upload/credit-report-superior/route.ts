import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { SuperiorCreditParser } from "@/lib/superior-credit-parser"
import pdfParse from "pdf-parse"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Superior Upload API called")

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

    // Use superior parser for maximum accuracy
    console.log("🎯 Starting superior credit analysis...")
    const parser = new SuperiorCreditParser(text)
    const analysis = await parser.parse()

    console.log("✅ Superior analysis complete:", {
      scores: analysis.scores.length,
      accounts: analysis.accounts.length,
      negativeItems: analysis.negativeItems.length,
      confidence: analysis.confidence,
      method: analysis.parsingMethod
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
        ${reportId}, 'user-123', ${selectedBureau}, 
        CURRENT_DATE, ${file.name}, ${file.size}, ${file.type},
        ${analysis.scores[0]?.score || null}, ${JSON.stringify(analysis)}, 
        'completed', ${text.substring(0, 5000)}, ${Math.min(Math.max(analysis.confidence, 0), 1)}
      )
    `

    // Insert accounts with enhanced data
    for (const account of analysis.accounts) {
      await sql`
        INSERT INTO credit_accounts (
          id, credit_report_id, account_type, creditor_name, account_number_last_4,
          balance, credit_limit, payment_status, opened_date
        ) VALUES (
          ${crypto.randomUUID()}, ${reportId}, ${account.accountType || 'Unknown'},
          ${account.creditor || 'Unknown'}, ${account.accountNumber ? account.accountNumber.toString().slice(-4) : '0000'},
          ${account.balance || 0}, ${account.creditLimit || null}, ${account.paymentStatus || 'Unknown'},
          ${account.dateOpened || null}
        )
      `
    }

    // Insert negative items
    for (const item of analysis.negativeItems) {
      await sql`
        INSERT INTO credit_negative_items (
          id, credit_report_id, item_type, creditor_name, account_number_last_4,
          status, balance, original_amount, date_reported, notes
        ) VALUES (
          ${crypto.randomUUID()}, ${reportId}, ${item.type || 'Unknown'},
          ${item.creditor || 'Unknown'}, ${item.description ? item.description.toString().slice(-4) : '0000'},
          ${item.status || 'Unknown'}, ${item.amount || null}, ${item.amount || null},
          ${item.dateReported || null}, ${item.description || 'No description'}
        )
      `
    }

    // Prepare enhanced response data
    const responseData = {
      success: true,
      reportId,
      message: "Credit report uploaded and analyzed successfully using superior parsing technology",
      analysis: {
        credit_scores: {
          primary_score: analysis.scores[0]?.score || null,
          experian: analysis.scores.find(s => s.bureau === "experian")?.score || null,
          equifax: analysis.scores.find(s => s.bureau === "equifax")?.score || null,
          transunion: analysis.scores.find(s => s.bureau === "transunion")?.score || null,
        },
        accounts: analysis.accounts.map(acc => ({
          creditor_name: acc.creditor,
          account_number_last_4: acc.accountNumber.slice(-4),
          balance: acc.balance,
          account_type: acc.accountType,
        })),
        summary: {
          total_accounts: analysis.summary.totalAccounts,
          total_debt: analysis.summary.totalDebt,
          credit_utilization: analysis.summary.utilizationRate,
        },
        recommendations: generateRecommendations(analysis),
      },
      stats: {
        method: `Superior ${analysis.parsingMethod.replace('_', ' ')}`,
        text_length: text.length,
        confidence_score: analysis.confidence,
        accounts_found: analysis.accounts.length,
        scores_found: analysis.scores.length,
        primary_score: analysis.scores[0]?.score || null,
        parsing_method: analysis.parsingMethod,
        validation_results: analysis.validationResults
      },
      validation: {
        total_items: analysis.validationResults.length,
        high_confidence: analysis.validationResults.filter(r => r.confidence > 0.8).length,
        medium_confidence: analysis.validationResults.filter(r => r.confidence > 0.6 && r.confidence <= 0.8).length,
        low_confidence: analysis.validationResults.filter(r => r.confidence <= 0.6).length
      }
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Superior upload API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }

}

// Helper function to generate credit recommendations
function generateRecommendations(analysis: any): string[] {
  const recommendations = []
  
  // Utilization recommendations
  if (analysis.summary.utilizationRate > 30) {
    recommendations.push("Reduce your credit utilization below 30% to improve your credit score")
  }
  
  // Negative items recommendations
  if (analysis.negativeItems.length > 0) {
    recommendations.push(`Consider disputing ${analysis.negativeItems.length} negative items on your report`)
  }
  
  // Payment recommendations
  const lateAccounts = analysis.accounts.filter((acc: any) => acc.paymentStatus !== "current")
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
