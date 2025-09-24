import { neon } from "@neondatabase/serverless"
import type { CreditAnalysis } from "./credit-analysis-engine"

// Use the correct environment variable name
const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("Database URL not configured. Please set NEON_DATABASE_URL or DATABASE_URL")
}

const sql = neon(databaseUrl)

export class CreditDatabaseService {
  async saveAnalysis(userId: string, analysis: CreditAnalysis, fileName: string): Promise<string> {
    try {
      console.log("Saving analysis to database...")

      // Save main report with the correct schema
      const [report] = await sql`
        INSERT INTO credit_reports (
          user_id, 
          file_name,
          file_size,
          file_type,
          bureau,
          report_date,
          credit_score,
          ai_analysis,
          raw_text,
          processing_status,
          confidence_score
        ) VALUES (
          ${userId},
          ${fileName},
          ${0}, -- file_size will be updated later
          ${'application/pdf'}, -- file_type
          ${analysis.bureau},
          ${analysis.reportDate},
          ${analysis.scores[0]?.score || null},
          ${JSON.stringify(analysis)},
          ${''}, -- raw_text will be updated later
          'completed',
          ${analysis.confidence / 100}
        ) RETURNING id
      `

      const reportId = report.id
      console.log("Report saved with ID:", reportId)

      // Save credit scores to the correct table structure
      for (const score of analysis.scores) {
        await sql`
          INSERT INTO credit_scores (
            id, credit_report_id, bureau, score, score_model, date_generated
          ) VALUES (
            ${crypto.randomUUID()}, ${reportId}, ${score.bureau}, 
            ${score.score}, ${score.scoreModel || 'FICO Score 8'}, ${score.dateGenerated}
          )
        `
      }

      // Save accounts
      for (const account of analysis.accounts) {
        await sql`
          INSERT INTO credit_accounts (
            credit_report_id,
            account_type,
            creditor_name,
            account_number_last_4,
            balance,
            credit_limit,
            payment_status,
            opened_date,
            last_activity
          ) VALUES (
            ${reportId},
            ${account.accountType},
            ${account.creditor},
            ${account.accountNumber.slice(-4)},
            ${account.balance},
            ${account.creditLimit || null},
            ${account.paymentStatus},
            ${account.dateOpened || null},
            ${account.lastActivity || null}
          )
        `
      }

      // Save negative items
      for (const item of analysis.negativeItems) {
        await sql`
          INSERT INTO credit_negative_items (
            credit_report_id,
            item_type,
            creditor_name,
            account_number_last_4,
            status,
            balance,
            original_amount,
            date_reported,
            notes
          ) VALUES (
            ${reportId},
            ${item.type},
            ${item.creditor},
            ${item.description.slice(-4)},
            ${item.status},
            ${item.amount || null},
            ${item.amount || null},
            ${item.dateReported || null},
            ${item.disputeRecommendation || null}
          )
        `
      }

      console.log("All data saved successfully")
      return reportId.toString() // Convert to string for consistency
    } catch (error) {
      console.error("Database save error:", error)
      throw new Error("Failed to save analysis to database")
    }
  }

  async getReports(userId: string): Promise<any[]> {
    try {
      const reports = await sql`
        SELECT 
          id,
          file_name,
          created_at,
          confidence_score,
          bureau,
          credit_score,
          processing_status
        FROM credit_reports 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `

      return reports
    } catch (error) {
      console.error("Database fetch error:", error)
      throw new Error("Failed to fetch reports")
    }
  }

  async getReportDetails(reportId: string | number): Promise<any> {
    try {
      const [report] = await sql`
        SELECT * FROM credit_reports WHERE id = ${reportId}
      `

      if (!report) {
        throw new Error("Report not found")
      }

      const accounts = await sql`
        SELECT * FROM credit_accounts WHERE credit_report_id = ${reportId}
      `

      const negativeItems = await sql`
        SELECT * FROM credit_negative_items WHERE credit_report_id = ${reportId}
      `

      return {
        ...report,
        accounts,
        negativeItems
      }
    } catch (error) {
      console.error("Database fetch error:", error)
      throw new Error("Failed to fetch report details")
    }
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      await sql`SELECT 1 as test`
      console.log("✅ Database connection successful")
      return true
    } catch (error) {
      console.error("❌ Database connection failed:", error)
      return false
    }
  }

  // Get database schema info
  async getSchemaInfo(): Promise<any> {
    try {
      const tables = await sql`
        SELECT table_name, column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name IN ('credit_reports', 'credit_accounts', 'credit_negative_items', 'credit_inquiries')
        ORDER BY table_name, ordinal_position
      `
      return tables
    } catch (error) {
      console.error("Schema info fetch error:", error)
      throw new Error("Failed to fetch schema information")
    }
  }
}
