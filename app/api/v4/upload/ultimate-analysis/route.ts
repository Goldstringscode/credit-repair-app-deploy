import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { AdvancedCreditParser } from "@/lib/advanced-credit-parser"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  console.log("=== ULTIMATE CREDIT ANALYSIS API V4 ===")

  try {
    // Get database connection
    const databaseUrl =
      process.env.NEON_DATABASE_URL ||
      process.env.DATABASE_URL

    if (!databaseUrl) {
      console.error("❌ No database URL found in environment variables")
      return NextResponse.json(
        {
          success: false,
          error: "Database configuration missing",
          details: "Please check your database environment variables",
        },
        { status: 500 },
      )
    }

    const sql = neon(databaseUrl)

    // Parse form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error("❌ Failed to parse form data:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse form data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 },
      )
    }

    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 },
      )
    }

    // Enhanced file validation
    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "File is empty",
        },
        { status: 400 },
      )
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return NextResponse.json(
        {
          success: false,
          error: "File too large. Maximum size is 50MB.",
        },
        { status: 400 },
      )
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "text/plain", "text/csv"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Please upload a PDF, TXT, or CSV file.",
          allowed_types: allowedTypes,
        },
        { status: 400 },
      )
    }

    console.log(`🚀 Processing file: ${file.name} (${file.size} bytes, ${file.type})`)

    // Initialize ultimate parser
    const parser = new AdvancedCreditParser()

    // Extract text first for fallback
    let extractedText = ""
    try {
      if (file.type === "application/pdf") {
        const buffer = await file.arrayBuffer()
        const pdfParse = (await import("pdf-parse")).default
        const pdfData = await pdfParse(Buffer.from(buffer))
        extractedText = pdfData.text
      } else {
        extractedText = await file.text()
      }
    } catch (extractError) {
      console.error("❌ Text extraction failed:", extractError)
      extractedText = "Text extraction failed"
    }

    // Perform ultimate analysis
    const analysisResult = await parser.analyzeDocument(file)

    if (!analysisResult.success) {
      return NextResponse.json({
        success: false,
        error: "Ultimate analysis failed",
        details: analysisResult.processing_notes,
      })
    }

    const analysis = analysisResult.data
    const reportId = crypto.randomUUID()

    // Save to database with enhanced structure
    try {
      await sql`
        INSERT INTO credit_reports (
          id, user_id, bureau, upload_date, file_name, file_size, file_type,
          credit_score, ai_analysis, status, raw_text
        ) VALUES (
          ${reportId}, 1, ${analysis.report_metadata.bureau.toLowerCase()}, 
          ${analysis.report_metadata.report_date}, ${file.name}, ${file.size}, ${file.type},
          ${analysis.credit_scores[0]?.score || null}, ${JSON.stringify(analysis)}, 
          'completed', ${extractedText.substring(0, 10000)}
        )
      `

      // Save accounts with enhanced data
      for (const account of analysis.accounts) {
        await sql`
          INSERT INTO credit_accounts (
            id, credit_report_id, account_name, account_number_last_4,
            balance, credit_limit, payment_status, date_opened, last_activity,
            account_type, status
          ) VALUES (
            ${crypto.randomUUID()}, ${reportId}, ${account.creditor_name},
            ${account.account_number_last_4}, ${account.balance}, ${account.credit_limit}, 
            ${account.payment_status}, ${account.opened_date}, ${account.last_activity},
            ${account.account_type}, ${account.account_status}
          )
        `
      }

      // Save negative items
      for (const item of analysis.negative_items) {
        await sql`
          INSERT INTO negative_items (
            id, credit_report_id, item_type, creditor_name, account_number,
            amount, date_reported, status, description
          ) VALUES (
            ${crypto.randomUUID()}, ${reportId}, ${item.type}, ${item.creditor_name},
            ${item.account_number_last_4 || null}, ${item.amount}, ${item.date_reported}, 
            ${item.status}, ${item.description || 'Extracted from credit report'}
          )
        `
      }

      // Save inquiries
      for (const inquiry of analysis.inquiries) {
        await sql`
          INSERT INTO credit_inquiries (
            id, credit_report_id, inquiry_type, creditor_name, inquiry_date, purpose
          ) VALUES (
            ${crypto.randomUUID()}, ${reportId}, ${inquiry.inquiry_type.toLowerCase()}, 
            ${inquiry.creditor_name}, ${inquiry.inquiry_date}, ${inquiry.purpose}
          )
        `
      }

      console.log("✅ Ultimate analysis completed and saved to database")
    } catch (dbError) {
      console.error("❌ Database Error:", dbError)
      // Continue without failing - we still have the analysis
    }

    // Return comprehensive response
    return NextResponse.json({
      success: true,
      message: "Ultimate credit report analysis completed",
      report: {
        id: reportId,
        file_name: file.name,
        bureau: analysis.report_metadata.bureau,
        confidence: analysisResult.confidence,
        processing_method: analysis.report_metadata.processing_method || "multi-pass-advanced",
      },
      analysis: {
        credit_scores: analysis.credit_scores,
        accounts_found: analysis.accounts.length,
        negative_items_found: analysis.negative_items.length,
        inquiries_found: analysis.inquiries.length,
        data_quality_score: analysis.report_metadata.data_quality_score,
        sections_identified: analysis.report_metadata.total_sections,
      },
      processing_notes: analysisResult.processing_notes,
      stats: {
        total_scores: analysis.credit_scores.length,
        total_accounts: analysis.accounts.length,
        total_negative_items: analysis.negative_items.length,
        total_inquiries: analysis.inquiries.length,
        confidence_score: analysisResult.confidence,
        extraction_methods_used: [...new Set(analysis.accounts.map((a: any) => a.extraction_method))],
        high_confidence_accounts: analysis.accounts.filter((a: any) => a.confidence > 0.8).length,
      },
      validation_results: analysisResult.validation_results || {},
      raw_sections: Object.keys(analysisResult.raw_sections || {}),
    })
  } catch (error) {
    console.error("❌ Ultimate Analysis Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown server error",
        details: error instanceof Error ? error.stack : "No additional details",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
