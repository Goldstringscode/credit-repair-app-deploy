import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    // Check if NEON_DATABASE_URL exists
    if (!process.env.NEON_DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: "NEON_DATABASE_URL environment variable not found",
        details: "Please add your Neon database URL to .env.local",
      })
    }

    // Create connection
    const sql = neon(process.env.NEON_DATABASE_URL)

    // Test basic connection
    const result = await sql`SELECT NOW() as current_time, version() as postgres_version`

    // Test if our tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'credit_reports', 'credit_accounts', 'negative_items', 'dispute_letters')
      ORDER BY table_name
    `

    // Test sample data
    const userCount = await sql`SELECT COUNT(*) as count FROM users`
    const reportCount = await sql`SELECT COUNT(*) as count FROM credit_reports`

    return NextResponse.json({
      success: true,
      message: "Neon database connection successful",
      details: {
        connection_time: result[0].current_time,
        postgres_version: result[0].postgres_version.split(" ")[0],
        tables_found: tables.map((t) => t.table_name),
        sample_data: {
          users: userCount[0].count,
          credit_reports: reportCount[0].count,
        },
      },
    })
  } catch (error) {
    console.error("Neon test error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to connect to Neon database",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
