import { createServerClient } from "./supabase"

export interface CreditReport {
  id: string
  user_id: string
  file_name: string
  file_size?: number
  file_type?: string
  upload_date: string
  processing_status: "pending" | "processing" | "completed" | "failed"
  bureau?: "experian" | "equifax" | "transunion"
  report_date?: string
  credit_score?: number
  raw_text?: string
  processed_data?: any
  created_at: string
  updated_at: string
}

export interface CreditAccount {
  id: string
  credit_report_id: string
  user_id: string
  account_name?: string
  account_number?: string
  account_type?: string
  creditor_name?: string
  account_status?: string
  balance?: number
  credit_limit?: number
  payment_status?: string
  date_opened?: string
  date_closed?: string
  last_payment_date?: string
  monthly_payment?: number
}

export interface NegativeItem {
  id: string
  credit_report_id: string
  user_id: string
  item_type?: string
  creditor_name?: string
  account_number?: string
  amount?: number
  date_reported?: string
  status?: string
  description?: string
  dispute_status?: "not_disputed" | "in_progress" | "resolved"
}

export class CreditReportService {
  private client = createServerClient()

  async createCreditReport(data: Partial<CreditReport>): Promise<CreditReport> {
    const { data: report, error } = await this.client.from("credit_reports").insert(data).select().single()

    if (error) throw error
    return report
  }

  async getCreditReports(userId: string): Promise<CreditReport[]> {
    const { data, error } = await this.client
      .from("credit_reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async getCreditReport(id: string): Promise<CreditReport | null> {
    const { data, error } = await this.client.from("credit_reports").select("*").eq("id", id).single()

    if (error) return null
    return data
  }

  async updateCreditReport(id: string, updates: Partial<CreditReport>): Promise<CreditReport> {
    const { data, error } = await this.client.from("credit_reports").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  async createCreditAccount(data: Partial<CreditAccount>): Promise<CreditAccount> {
    const { data: account, error } = await this.client.from("credit_accounts").insert(data).select().single()

    if (error) throw error
    return account
  }

  async getCreditAccounts(reportId: string): Promise<CreditAccount[]> {
    const { data, error } = await this.client.from("credit_accounts").select("*").eq("credit_report_id", reportId)

    if (error) throw error
    return data || []
  }

  async createNegativeItem(data: Partial<NegativeItem>): Promise<NegativeItem> {
    const { data: item, error } = await this.client.from("negative_items").insert(data).select().single()

    if (error) throw error
    return item
  }

  async getNegativeItems(reportId: string): Promise<NegativeItem[]> {
    const { data, error } = await this.client.from("negative_items").select("*").eq("credit_report_id", reportId)

    if (error) throw error
    return data || []
  }

  async updateNegativeItem(id: string, updates: Partial<NegativeItem>): Promise<NegativeItem> {
    const { data, error } = await this.client.from("negative_items").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  async deleteCreditReport(id: string): Promise<void> {
    const { error } = await this.client.from("credit_reports").delete().eq("id", id)

    if (error) throw error
  }
}

export const creditReportService = new CreditReportService()
