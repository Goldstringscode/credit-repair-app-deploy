import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getNeonClient() {
  if (!process.env.NEON_DATABASE_URL) {
    throw new Error('NEON_DATABASE_URL environment variable is required')
  }
  return neon(process.env.NEON_DATABASE_URL)
}

export async function GET() {
  try {
    const sql = getNeonClient()
    // Fetch credit reports
    const reports = await sql`
      SELECT id, bureau, credit_score, report_date, file_name, ai_analysis
      FROM credit_reports 
      ORDER BY report_date DESC
    `

    // Fetch credit accounts
    const accounts = await sql`
      SELECT ca.*, cr.bureau
      FROM credit_accounts ca
      JOIN credit_reports cr ON ca.credit_report_id = cr.id
      ORDER BY ca.account_name
    `

    // Fetch credit inquiries
    const inquiries = await sql`
      SELECT ci.*, cr.bureau
      FROM credit_inquiries ci
      JOIN credit_reports cr ON ci.credit_report_id = cr.id
      ORDER BY ci.inquiry_date DESC
    `

    return NextResponse.json({
      reports,
      accounts,
      inquiries,
    })
  } catch (error) {
    console.error("Error fetching credit details:", error)
    return NextResponse.json({ error: "Failed to fetch credit details" }, { status: 500 })
  }
}
