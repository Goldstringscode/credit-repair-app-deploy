import { type NextRequest, NextResponse } from "next/server"
import { CreditAnalysisEngine } from "@/lib/credit-analysis-engine"
import { CreditDatabaseService } from "@/lib/credit-database-service"
import pdfParse from "pdf-parse"

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = (formData.get("userId") as string) || "user-123"

    if (!file) {
      console.log("No file provided")
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    console.log("Processing file:", file.name, "Size:", file.size)

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
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
        console.log("Parsing PDF...")
        const buffer = await file.arrayBuffer()
        const pdfData = await pdfParse(Buffer.from(buffer))
        text = pdfData.text
        console.log("PDF parsed, text length:", text.length)
      } else {
        console.log("Reading text file...")
        text = await file.text()
        console.log("Text file read, length:", text.length)
      }
    } catch (parseError) {
      console.error("File parsing error:", parseError)
      return NextResponse.json({ success: false, error: "Failed to parse file content" }, { status: 400 })
    }

    if (!text || text.length < 100) {
      return NextResponse.json({ success: false, error: "File content too short or empty" }, { status: 400 })
    }

    // Analyze credit data
    console.log("Starting credit analysis...")
    const analysisEngine = new CreditAnalysisEngine()
    const analysis = await analysisEngine.analyzeCredit(text)

    console.log("Analysis complete:", {
      scores: analysis.scores.length,
      accounts: analysis.accounts.length,
      negativeItems: analysis.negativeItems.length,
      confidence: analysis.confidence,
    })

    // Save to database
    console.log("Saving to database...")
    const databaseService = new CreditDatabaseService()
    const reportId = await databaseService.saveAnalysis(userId, analysis, file.name)

    console.log("Upload complete, report ID:", reportId)

    // Send credit report upload notification
    try {
      const { notificationService } = await import('@/lib/notification-service')
      await notificationService.notifyCustom(
        "Credit Report Uploaded! 📊",
        `Your credit report "${file.name}" has been successfully uploaded and analyzed. Your credit score is ${analysis.scores[0]?.score || 'N/A'}.`,
        "success",
        "medium",
        [
          {
            label: "View Analysis",
            action: "view_credit_analysis",
            variant: "default"
          },
          {
            label: "View Report",
            action: "view_credit_report",
            variant: "outline"
          }
        ]
      )
      console.log("Credit report upload notification sent successfully")
    } catch (error) {
      console.error("Failed to send credit report upload notification:", error)
    }

    // Prepare response data
    const responseData = {
      success: true,
      reportId,
      message: "Credit report uploaded and analyzed successfully",
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
        recommendations: analysis.recommendations,
      },
      stats: {
        method: "AI-Powered Analysis",
        text_length: text.length,
        confidence_score: analysis.confidence / 100,
        accounts_found: analysis.accounts.length,
        scores_found: analysis.scores.length,
        primary_score: analysis.scores[0]?.score || null,
      },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Upload API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
