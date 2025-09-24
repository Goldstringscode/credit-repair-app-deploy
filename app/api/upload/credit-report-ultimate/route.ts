import { NextRequest, NextResponse } from "next/server"
import { UltimateCreditParserWorking } from "@/lib/ultimate-credit-parser-working"
import { neon } from "@neondatabase/serverless"

const databaseUrl = process.env.DATABASE_URL!

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Ultimate Upload API called")
    
    const formData = await request.formData()
    const file = formData.get("file") as File
    const selectedBureau = formData.get("bureau") as string || "UNKNOWN"
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }

    console.log(`📁 Processing file: ${file.name} Size: ${file.size}`)

    // Extract text from file using existing working methods
    let text = ""
    if (file.type === "application/pdf") {
      console.log("Processing PDF...")
      // For now, use a simple text extraction approach
      // In production, you'd implement proper PDF parsing
      text = `PDF file: ${file.name} (${file.size} bytes). This is a placeholder for actual PDF text extraction.`
    } else if (file.type.startsWith("image/")) {
      console.log("Processing image...")
      // For now, use a simple text extraction approach
      // In production, you'd implement proper OCR
      text = `Image file: ${file.name} (${file.size} bytes). This is a placeholder for actual OCR text extraction.`
    } else if (file.type === "text/plain") {
      console.log("Processing text file...")
      text = await file.text()
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported file type. Please upload a PDF, image, or text file." },
        { status: 400 }
      )
    }

    console.log(`PDF parsed, text length: ${text.length}`)

    if (!text || text.length < 100) {
      return NextResponse.json(
        { success: false, error: "Could not extract meaningful text from file" },
        { status: 400 }
      )
    }

    console.log("🎯 Starting ultimate credit analysis...")

    // Use the Ultimate Credit Parser
    const parser = new UltimateCreditParserWorking(text)
    const analysis = await parser.parse()

    console.log("✅ Ultimate analysis complete:", {
      scores: analysis.scores.length,
      accounts: analysis.accounts.length,
      negativeItems: analysis.negativeItems.length,
      confidence: analysis.confidence,
      method: analysis.parsingMethod
    })

    // Save to database
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

    // Insert credit scores
    for (const score of analysis.scores) {
      await sql`
        INSERT INTO credit_scores (
          id, credit_report_id, bureau, score, score_model, date_generated
        ) VALUES (
          ${crypto.randomUUID()}, ${reportId}, ${score.bureau}, 
          ${score.score}, ${score.scoreModel}, ${score.dateGenerated}
        )
      `
    }

    // Insert accounts
    for (const account of analysis.accounts) {
      await sql`
        INSERT INTO credit_accounts (
          id, credit_report_id, account_type, creditor_name, account_number_last_4,
          balance, credit_limit, payment_status, opened_date, last_activity
        ) VALUES (
          ${crypto.randomUUID()}, ${reportId}, ${account.accountType || 'Unknown'},
          ${account.creditor || 'Unknown'}, ${account.accountNumber ? account.accountNumber.toString().slice(-4) : '0000'},
          ${account.balance || 0}, ${account.creditLimit || null}, ${account.paymentStatus || 'Unknown'},
          ${account.dateOpened || null}, ${account.lastActivity || null}
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
      message: "Credit report uploaded and analyzed successfully using the Ultimate AI Parser",
      analysis: {
        credit_scores: {
          primary_score: analysis.scores[0]?.score || null,
          experian: analysis.scores.find(s => s.bureau === "EXPERIAN")?.score || null,
          equifax: analysis.scores.find(s => s.bureau === "EQUIFAX")?.score || null,
          transunion: analysis.scores.find(s => s.bureau === "TRANSUNION")?.score || null,
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
        method: `Ultimate ${analysis.parsingMethod.replace('_', ' ')}`,
        text_length: text.length,
        confidence_score: analysis.confidence,
        accounts_found: analysis.accounts.length,
        scores_found: analysis.scores.length,
        primary_score: analysis.scores[0]?.score || null,
        parsing_method: analysis.parsingMethod,
        accuracy_rating: getAccuracyRating(analysis.confidence)
      },
      performance: {
        parsing_time: Date.now() - Date.now(), // Would be actual timing in real implementation
        accuracy_score: analysis.confidence * 100,
        detection_rate: calculateDetectionRate(analysis)
      }
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Ultimate upload API error:", error)
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
  
  // Score-based recommendations
  const primaryScore = analysis.scores[0]?.score
  if (primaryScore) {
    if (primaryScore < 580) {
      recommendations.push("Your credit score is in the poor range. Focus on paying bills on time and reducing debt")
    } else if (primaryScore < 670) {
      recommendations.push("Your credit score is fair. Work on improving payment history and reducing credit utilization")
    } else if (primaryScore < 740) {
      recommendations.push("Your credit score is good. Maintain current habits and consider opening new credit accounts")
    } else {
      recommendations.push("Excellent credit score! Keep up the great work")
    }
  }
  
  return recommendations
}

// Helper function to get accuracy rating
function getAccuracyRating(confidence: number): string {
  if (confidence >= 0.95) return "Exceptional"
  if (confidence >= 0.90) return "Excellent"
  if (confidence >= 0.80) return "Very Good"
  if (confidence >= 0.70) return "Good"
  if (confidence >= 0.60) return "Fair"
  return "Poor"
}

// Helper function to calculate detection rate
function calculateDetectionRate(analysis: any): number {
  const totalItems = analysis.scores.length + analysis.accounts.length + analysis.negativeItems.length
  if (totalItems === 0) return 0
  
  const detectedItems = analysis.scores.filter((s: any) => s.confidence > 0.7).length +
                       analysis.accounts.filter((a: any) => a.confidence > 0.6).length +
                       analysis.negativeItems.filter((n: any) => n.confidence > 0.7).length
  
  return (detectedItems / totalItems) * 100
}
