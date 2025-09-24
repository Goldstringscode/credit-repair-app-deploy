// Credit Monitoring Database Service
// Handles all database operations for credit monitoring system

import { database } from '@/lib/database-config'
import { CreditScore, CreditAlert, CreditReport, MonitoringSettings } from './credit-bureau-apis'

export interface CreditScoreRecord {
  id: string
  userId: string
  bureau: 'experian' | 'equifax' | 'transunion'
  score: number
  scoreType: string
  scoreRangeMin: number
  scoreRangeMax: number
  factors: any[]
  requestId: string
  createdAt: string
  updatedAt: string
}

export interface CreditReportRecord {
  id: string
  userId: string
  bureau: 'experian' | 'equifax' | 'transunion'
  reportId: string
  reportType: string
  personalInfo: any
  accounts: any[]
  inquiries: any[]
  publicRecords: any[]
  collections: any[]
  summary: any
  requestId: string
  createdAt: string
  updatedAt: string
}

export interface CreditAlertRecord {
  id: string
  userId: string
  bureau: 'experian' | 'equifax' | 'transunion' | 'all'
  alertType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  alertData: any
  actionRequired: boolean
  actionUrl?: string
  actionTaken: boolean
  actionTakenAt?: string
  readAt?: string
  createdAt: string
  updatedAt: string
}

export interface MonitoringSettingsRecord {
  id: string
  userId: string
  enabled: boolean
  scoreAlertsEnabled: boolean
  scoreAlertsThreshold: number
  scoreAlertsDirection: 'increase' | 'decrease' | 'both'
  newAccountAlerts: boolean
  inquiryAlerts: boolean
  paymentAlerts: boolean
  balanceAlertsEnabled: boolean
  balanceAlertsThreshold: number
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  frequency: 'immediate' | 'daily' | 'weekly'
  createdAt: string
  updatedAt: string
}

export class CreditMonitoringDatabaseService {
  // Credit Scores
  async saveCreditScore(score: CreditScore, userId: string, requestId?: string): Promise<CreditScoreRecord> {
    try {
      const record = await database.query(`
        INSERT INTO credit_scores (
          user_id, bureau, score, score_type, score_range_min, score_range_max, 
          factors, request_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `, [
        userId,
        score.bureau,
        score.score,
        score.scoreType,
        score.range.min,
        score.range.max,
        JSON.stringify(score.factors),
        requestId || `req_${Date.now()}`
      ])

      return this.mapCreditScoreRecord(record.rows[0])
    } catch (error) {
      console.error('Error saving credit score:', error)
      throw new Error('Failed to save credit score')
    }
  }

  async getLatestCreditScores(userId: string): Promise<CreditScoreRecord[]> {
    try {
      const result = await database.query(`
        SELECT DISTINCT ON (bureau) *
        FROM credit_scores
        WHERE user_id = $1
        ORDER BY bureau, created_at DESC
      `, [userId])

      return result.rows.map(row => this.mapCreditScoreRecord(row))
    } catch (error) {
      console.error('Error getting latest credit scores:', error)
      throw new Error('Failed to get latest credit scores')
    }
  }

  async getCreditScoreHistory(userId: string, bureau?: string, limit: number = 30): Promise<CreditScoreRecord[]> {
    try {
      let query = `
        SELECT *
        FROM credit_scores
        WHERE user_id = $1
      `
      const params: any[] = [userId]

      if (bureau) {
        query += ` AND bureau = $2`
        params.push(bureau)
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`
      params.push(limit)

      const result = await database.query(query, params)
      return result.rows.map(row => this.mapCreditScoreRecord(row))
    } catch (error) {
      console.error('Error getting credit score history:', error)
      throw new Error('Failed to get credit score history')
    }
  }

  // Credit Reports
  async saveCreditReport(report: CreditReport, userId: string, requestId?: string): Promise<CreditReportRecord> {
    try {
      const record = await database.query(`
        INSERT INTO credit_reports (
          user_id, bureau, report_id, report_type, personal_info, accounts,
          inquiries, public_records, collections, summary, request_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *
      `, [
        userId,
        report.bureau,
        report.reportId,
        'full',
        JSON.stringify(report.personalInfo),
        JSON.stringify(report.accounts),
        JSON.stringify(report.inquiries),
        JSON.stringify(report.publicRecords),
        JSON.stringify(report.collections),
        JSON.stringify(report.summary),
        requestId || `req_${Date.now()}`
      ])

      return this.mapCreditReportRecord(record.rows[0])
    } catch (error) {
      console.error('Error saving credit report:', error)
      throw new Error('Failed to save credit report')
    }
  }

  async getLatestCreditReports(userId: string): Promise<CreditReportRecord[]> {
    try {
      const result = await database.query(`
        SELECT DISTINCT ON (bureau) *
        FROM credit_reports
        WHERE user_id = $1
        ORDER BY bureau, created_at DESC
      `, [userId])

      return result.rows.map(row => this.mapCreditReportRecord(row))
    } catch (error) {
      console.error('Error getting latest credit reports:', error)
      throw new Error('Failed to get latest credit reports')
    }
  }

  // Credit Alerts
  async saveCreditAlert(alert: CreditAlert, userId: string): Promise<CreditAlertRecord> {
    try {
      const record = await database.query(`
        INSERT INTO credit_alerts (
          user_id, bureau, alert_type, severity, title, description,
          alert_data, action_required, action_url, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *
      `, [
        userId,
        alert.bureau,
        alert.type,
        alert.severity,
        alert.title,
        alert.description,
        JSON.stringify(alert),
        alert.actionRequired,
        alert.actionUrl
      ])

      return this.mapCreditAlertRecord(record.rows[0])
    } catch (error) {
      console.error('Error saving credit alert:', error)
      throw new Error('Failed to save credit alert')
    }
  }

  async getCreditAlerts(userId: string, options: {
    bureau?: string
    severity?: string
    alertType?: string
    actionRequired?: boolean
    limit?: number
    offset?: number
  } = {}): Promise<CreditAlertRecord[]> {
    try {
      let query = `SELECT * FROM credit_alerts WHERE user_id = $1`
      const params: any[] = [userId]
      let paramCount = 1

      if (options.bureau) {
        paramCount++
        query += ` AND bureau = $${paramCount}`
        params.push(options.bureau)
      }

      if (options.severity) {
        paramCount++
        query += ` AND severity = $${paramCount}`
        params.push(options.severity)
      }

      if (options.alertType) {
        paramCount++
        query += ` AND alert_type = $${paramCount}`
        params.push(options.alertType)
      }

      if (options.actionRequired !== undefined) {
        paramCount++
        query += ` AND action_required = $${paramCount}`
        params.push(options.actionRequired)
      }

      query += ` ORDER BY created_at DESC`

      if (options.limit) {
        paramCount++
        query += ` LIMIT $${paramCount}`
        params.push(options.limit)
      }

      if (options.offset) {
        paramCount++
        query += ` OFFSET $${paramCount}`
        params.push(options.offset)
      }

      const result = await database.query(query, params)
      return result.rows.map(row => this.mapCreditAlertRecord(row))
    } catch (error) {
      console.error('Error getting credit alerts:', error)
      throw new Error('Failed to get credit alerts')
    }
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      await database.query(`
        UPDATE credit_alerts
        SET read_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [alertId])
    } catch (error) {
      console.error('Error marking alert as read:', error)
      throw new Error('Failed to mark alert as read')
    }
  }

  async markAlertActionTaken(alertId: string): Promise<void> {
    try {
      await database.query(`
        UPDATE credit_alerts
        SET action_taken = TRUE, action_taken_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [alertId])
    } catch (error) {
      console.error('Error marking alert action taken:', error)
      throw new Error('Failed to mark alert action taken')
    }
  }

  // Monitoring Settings
  async getMonitoringSettings(userId: string): Promise<MonitoringSettingsRecord | null> {
    try {
      const result = await database.query(`
        SELECT * FROM credit_monitoring_settings WHERE user_id = $1
      `, [userId])

      if (result.rows.length === 0) {
        return null
      }

      return this.mapMonitoringSettingsRecord(result.rows[0])
    } catch (error) {
      console.error('Error getting monitoring settings:', error)
      throw new Error('Failed to get monitoring settings')
    }
  }

  async saveMonitoringSettings(settings: MonitoringSettings, userId: string): Promise<MonitoringSettingsRecord> {
    try {
      const result = await database.query(`
        INSERT INTO credit_monitoring_settings (
          user_id, enabled, score_alerts_enabled, score_alerts_threshold, score_alerts_direction,
          new_account_alerts, inquiry_alerts, payment_alerts, balance_alerts_enabled,
          balance_alerts_threshold, email_notifications, sms_notifications, push_notifications,
          frequency, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          enabled = EXCLUDED.enabled,
          score_alerts_enabled = EXCLUDED.score_alerts_enabled,
          score_alerts_threshold = EXCLUDED.score_alerts_threshold,
          score_alerts_direction = EXCLUDED.score_alerts_direction,
          new_account_alerts = EXCLUDED.new_account_alerts,
          inquiry_alerts = EXCLUDED.inquiry_alerts,
          payment_alerts = EXCLUDED.payment_alerts,
          balance_alerts_enabled = EXCLUDED.balance_alerts_enabled,
          balance_alerts_threshold = EXCLUDED.balance_alerts_threshold,
          email_notifications = EXCLUDED.email_notifications,
          sms_notifications = EXCLUDED.sms_notifications,
          push_notifications = EXCLUDED.push_notifications,
          frequency = EXCLUDED.frequency,
          updated_at = NOW()
        RETURNING *
      `, [
        userId,
        settings.enabled,
        settings.scoreAlerts.enabled,
        settings.scoreAlerts.threshold,
        settings.scoreAlerts.direction,
        settings.newAccountAlerts,
        settings.inquiryAlerts,
        settings.paymentAlerts,
        settings.balanceAlerts.enabled,
        settings.balanceAlerts.threshold,
        settings.emailNotifications,
        settings.smsNotifications,
        settings.pushNotifications,
        settings.frequency
      ])

      return this.mapMonitoringSettingsRecord(result.rows[0])
    } catch (error) {
      console.error('Error saving monitoring settings:', error)
      throw new Error('Failed to save monitoring settings')
    }
  }

  // API Logs
  async logApiCall(logData: {
    userId?: string
    bureau: string
    endpoint: string
    requestId: string
    requestData?: any
    responseData?: any
    statusCode?: number
    success: boolean
    errorMessage?: string
    responseTimeMs: number
  }): Promise<void> {
    try {
      await database.query(`
        INSERT INTO credit_bureau_api_logs (
          user_id, bureau, endpoint, request_id, request_data, response_data,
          status_code, success, error_message, response_time_ms, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      `, [
        logData.userId,
        logData.bureau,
        logData.endpoint,
        logData.requestId,
        JSON.stringify(logData.requestData),
        JSON.stringify(logData.responseData),
        logData.statusCode,
        logData.success,
        logData.errorMessage,
        logData.responseTimeMs
      ])
    } catch (error) {
      console.error('Error logging API call:', error)
      // Don't throw error for logging failures
    }
  }

  // Helper methods for mapping database records
  private mapCreditScoreRecord(row: any): CreditScoreRecord {
    return {
      id: row.id,
      userId: row.user_id,
      bureau: row.bureau,
      score: row.score,
      scoreType: row.score_type,
      scoreRangeMin: row.score_range_min,
      scoreRangeMax: row.score_range_max,
      factors: row.factors || [],
      requestId: row.request_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  private mapCreditReportRecord(row: any): CreditReportRecord {
    return {
      id: row.id,
      userId: row.user_id,
      bureau: row.bureau,
      reportId: row.report_id,
      reportType: row.report_type,
      personalInfo: row.personal_info || {},
      accounts: row.accounts || [],
      inquiries: row.inquiries || [],
      publicRecords: row.public_records || [],
      collections: row.collections || [],
      summary: row.summary || {},
      requestId: row.request_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  private mapCreditAlertRecord(row: any): CreditAlertRecord {
    return {
      id: row.id,
      userId: row.user_id,
      bureau: row.bureau,
      alertType: row.alert_type,
      severity: row.severity,
      title: row.title,
      description: row.description,
      alertData: row.alert_data || {},
      actionRequired: row.action_required,
      actionUrl: row.action_url,
      actionTaken: row.action_taken,
      actionTakenAt: row.action_taken_at,
      readAt: row.read_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  private mapMonitoringSettingsRecord(row: any): MonitoringSettingsRecord {
    return {
      id: row.id,
      userId: row.user_id,
      enabled: row.enabled,
      scoreAlertsEnabled: row.score_alerts_enabled,
      scoreAlertsThreshold: row.score_alerts_threshold,
      scoreAlertsDirection: row.score_alerts_direction,
      newAccountAlerts: row.new_account_alerts,
      inquiryAlerts: row.inquiry_alerts,
      paymentAlerts: row.payment_alerts,
      balanceAlertsEnabled: row.balance_alerts_enabled,
      balanceAlertsThreshold: row.balance_alerts_threshold,
      emailNotifications: row.email_notifications,
      smsNotifications: row.sms_notifications,
      pushNotifications: row.push_notifications,
      frequency: row.frequency,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}

// Export singleton instance
export const creditMonitoringDB = new CreditMonitoringDatabaseService()
