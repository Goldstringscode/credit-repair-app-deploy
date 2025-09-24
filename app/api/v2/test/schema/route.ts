import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const databaseUrl = process.env.NEON_NEON_NEON_NEON_DATABASE_URL
    if (!databaseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Database URL not configured",
        },
        { status: 500 },
      )
    }

    const sql = neon(databaseUrl)

    // Test if all required tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('credit_reports', 'credit_accounts', 'credit_negative_items', 'credit_inquiries')
    `

    const requiredTables = ["credit_reports", "credit_accounts", "credit_negative_items", "credit_inquiries"]
    const existingTables = tables.map((t: any) => t.table_name)
    const missingTables = requiredTables.filter((table) => !existingTables.includes(table))

    if (missingTables.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing tables: ${missingTables.join(", ")}`,
        existing_tables: existingTables,
        missing_tables: missingTables,
      })
    }

    // Test if required columns exist in credit_reports table
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'credit_reports' 
      AND table_schema = 'public'
    `

    const requiredColumns = [
      "id",
      "user_id",
      "bureau",
      "credit_score",
      "experian_score",
      "equifax_score",
      "transunion_score",
      "ai_analysis",
      "confidence_score",
    ]

    const existingColumns = columns.map((c: any) => c.column_name)
    const missingColumns = requiredColumns.filter((col) => !existingColumns.includes(col))

    return NextResponse.json({
      success: true,
      message: "Database schema validation passed",
      tables: existingTables,
      columns: existingColumns,
      missing_columns: missingColumns,
      schema_complete: missingColumns.length === 0,
    })
  } catch (error) {
    console.error("Schema test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
