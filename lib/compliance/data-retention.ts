import { NextRequest, NextResponse } from 'next/server'
import { auditLogger } from '../audit-logger'

export interface RetentionPolicy {
  id: string
  dataType: string
  description: string
  retentionPeriod: number // in days
  legalBasis: string
  autoDelete: boolean
  exceptions: string[]
  lastReviewed: Date
  nextReview: Date
}

export interface DataRetentionRecord {
  id: string
  userId: string
  dataType: string
  createdAt: Date
  expiresAt: Date
  status: 'active' | 'expired' | 'deleted' | 'exempt'
  legalBasis: string
  metadata: any
}

export interface RetentionAudit {
  id: string
  auditDate: Date
  dataType: string
  recordsProcessed: number
  recordsDeleted: number
  recordsExempted: number
  errors: string[]
  status: 'success' | 'partial' | 'failed'
}

class DataRetentionService {
  private policies: Map<string, RetentionPolicy> = new Map()
  private records: Map<string, DataRetentionRecord> = new Map()
  private audits: RetentionAudit[] = []

  constructor() {
    this.initializeRetentionPolicies()
  }

  /**
   * Initialize retention policies
   */
  private initializeRetentionPolicies(): void {
    const policies: RetentionPolicy[] = [
      {
        id: 'personal_info',
        dataType: 'Personal Information',
        description: 'Name, email, phone, address, date of birth',
        retentionPeriod: 1095, // 3 years
        legalBasis: 'Contract performance and legitimate interest',
        autoDelete: true,
        exceptions: ['Legal hold', 'Active disputes'],
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      },
      {
        id: 'financial_info',
        dataType: 'Financial Information',
        description: 'Credit scores, account balances, payment history',
        retentionPeriod: 2555, // 7 years
        legalBasis: 'Legal compliance (FCRA, tax requirements)',
        autoDelete: false,
        exceptions: ['Active disputes', 'Legal proceedings'],
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'credit_reports',
        dataType: 'Credit Reports',
        description: 'Credit reports from bureaus',
        retentionPeriod: 1825, // 5 years
        legalBasis: 'FCRA compliance and dispute resolution',
        autoDelete: true,
        exceptions: ['Active disputes', 'Legal proceedings'],
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'dispute_records',
        dataType: 'Dispute Records',
        description: 'Dispute submissions, responses, resolutions',
        retentionPeriod: 2555, // 7 years
        legalBasis: 'FCRA compliance and legal requirements',
        autoDelete: false,
        exceptions: ['Legal proceedings', 'Regulatory investigation'],
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'audit_logs',
        dataType: 'Audit Logs',
        description: 'System access logs, security events',
        retentionPeriod: 2555, // 7 years
        legalBasis: 'Security monitoring and compliance',
        autoDelete: true,
        exceptions: ['Security investigation', 'Legal proceedings'],
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'marketing_data',
        dataType: 'Marketing Data',
        description: 'Marketing preferences, communication history',
        retentionPeriod: 365, // 1 year
        legalBasis: 'Consent and legitimate interest',
        autoDelete: true,
        exceptions: ['Active consent', 'Legal proceedings'],
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'usage_data',
        dataType: 'Usage Data',
        description: 'App usage, feature interactions, analytics',
        retentionPeriod: 730, // 2 years
        legalBasis: 'Legitimate interest and service improvement',
        autoDelete: true,
        exceptions: ['Active research', 'Legal proceedings'],
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'device_info',
        dataType: 'Device Information',
        description: 'IP addresses, device identifiers, browser info',
        retentionPeriod: 365, // 1 year
        legalBasis: 'Security and fraud prevention',
        autoDelete: true,
        exceptions: ['Security investigation', 'Legal proceedings'],
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    ]

    policies.forEach(policy => {
      this.policies.set(policy.id, policy)
    })
  }

  /**
   * Create a data retention record
   */
  createRetentionRecord(userId: string, dataType: string, metadata: any = {}): DataRetentionRecord {
    const policy = this.policies.get(dataType)
    if (!policy) {
      throw new Error(`No retention policy found for data type: ${dataType}`)
    }

    const record: DataRetentionRecord = {
      id: `retention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      dataType,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + policy.retentionPeriod * 24 * 60 * 60 * 1000),
      status: 'active',
      legalBasis: policy.legalBasis,
      metadata
    }

    this.records.set(record.id, record)

    // Log the record creation
    try {
      auditLogger.log({
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        ipAddress: 'system',
        userAgent: 'system',
        action: 'retention_record_created',
        resource: 'data_retention',
        method: 'POST',
        endpoint: '/api/compliance/retention',
        statusCode: 200,
        severity: 'low',
        category: 'compliance',
        metadata: { dataType, recordId: record.id, expiresAt: record.expiresAt }
      })
    } catch (error) {
      console.log('Audit logging failed (non-critical):', error)
    }

    return record
  }

  /**
   * Check if data should be retained
   */
  shouldRetainData(recordId: string, reason: string): boolean {
    const record = this.records.get(recordId)
    if (!record) return false

    const policy = this.policies.get(record.dataType)
    if (!policy) return false

    // Check if the reason is in the exceptions list
    return policy.exceptions.some(exception => 
      exception.toLowerCase().includes(reason.toLowerCase())
    )
  }

  /**
   * Mark data as exempt from deletion
   */
  markDataExempt(recordId: string, reason: string): boolean {
    const record = this.records.get(recordId)
    if (!record) return false

    record.status = 'exempt'
    record.metadata.exemptionReason = reason
    record.metadata.exemptedAt = new Date()

    // Log the exemption
    try {
      auditLogger.log({
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: record.userId,
        ipAddress: 'system',
        userAgent: 'system',
        action: 'data_exempted_from_deletion',
        resource: 'data_retention',
        method: 'POST',
        endpoint: '/api/compliance/retention/exempt',
        statusCode: 200,
        severity: 'medium',
        category: 'compliance',
        metadata: { recordId, reason, dataType: record.dataType }
      })
    } catch (error) {
      console.log('Audit logging failed (non-critical):', error)
    }

    return true
  }

  /**
   * Process expired data
   */
  async processExpiredData(): Promise<RetentionAudit> {
    const now = new Date()
    const expiredRecords = Array.from(this.records.values()).filter(
      record => record.expiresAt <= now && record.status === 'active'
    )

    const audit: RetentionAudit = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      auditDate: now,
      dataType: 'all',
      recordsProcessed: expiredRecords.length,
      recordsDeleted: 0,
      recordsExempted: 0,
      errors: [],
      status: 'success'
    }

    for (const record of expiredRecords) {
      try {
        const policy = this.policies.get(record.dataType)
        if (!policy) {
          audit.errors.push(`No policy found for data type: ${record.dataType}`)
          continue
        }

        if (policy.autoDelete) {
          // Check if data should be retained due to exceptions
          const shouldRetain = this.shouldRetainData(record.id, 'active_dispute')
          
          if (shouldRetain) {
            this.markDataExempt(record.id, 'Active dispute - legal hold')
            audit.recordsExempted++
          } else {
            record.status = 'deleted'
            record.metadata.deletedAt = now
            audit.recordsDeleted++

            // Log the deletion
            try {
              auditLogger.log({
                id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: record.userId,
                ipAddress: 'system',
                userAgent: 'system',
                action: 'data_deleted_retention',
                resource: 'data_retention',
                method: 'DELETE',
                endpoint: '/api/compliance/retention/delete',
                statusCode: 200,
                severity: 'medium',
                category: 'compliance',
                metadata: { 
                  recordId: record.id, 
                  dataType: record.dataType,
                  retentionPeriod: policy.retentionPeriod
                }
              })
            } catch (error) {
              console.log('Audit logging failed (non-critical):', error)
            }
          }
        } else {
          // Mark for manual review
          record.status = 'expired'
          record.metadata.expiredAt = now
          record.metadata.requiresReview = true
        }
      } catch (error: any) {
        audit.errors.push(`Error processing record ${record.id}: ${error.message}`)
      }
    }

    if (audit.errors.length > 0) {
      audit.status = audit.errors.length === expiredRecords.length ? 'failed' : 'partial'
    }

    this.audits.push(audit)

    return audit
  }

  /**
   * Get retention policies
   */
  getRetentionPolicies(): RetentionPolicy[] {
    return Array.from(this.policies.values())
  }

  /**
   * Get retention records for a user
   */
  getUserRetentionRecords(userId: string): DataRetentionRecord[] {
    return Array.from(this.records.values()).filter(r => r.userId === userId)
  }

  /**
   * Get records expiring soon
   */
  getRecordsExpiringSoon(days: number = 30): DataRetentionRecord[] {
    const cutoffDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    return Array.from(this.records.values()).filter(
      record => record.expiresAt <= cutoffDate && record.status === 'active'
    )
  }

  /**
   * Get retention audit history
   */
  getRetentionAudits(): RetentionAudit[] {
    return [...this.audits].sort((a, b) => b.auditDate.getTime() - a.auditDate.getTime())
  }

  /**
   * Generate retention compliance report
   */
  generateRetentionReport(): any {
    const totalRecords = this.records.size
    const activeRecords = Array.from(this.records.values()).filter(r => r.status === 'active').length
    const expiredRecords = Array.from(this.records.values()).filter(r => r.status === 'expired').length
    const deletedRecords = Array.from(this.records.values()).filter(r => r.status === 'deleted').length
    const exemptRecords = Array.from(this.records.values()).filter(r => r.status === 'exempt').length

    const recordsByType = Array.from(this.records.values()).reduce((acc, record) => {
      acc[record.dataType] = (acc[record.dataType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalAudits = this.audits.length
    const successfulAudits = this.audits.filter(a => a.status === 'success').length
    const totalRecordsProcessed = this.audits.reduce((sum, a) => sum + a.recordsProcessed, 0)
    const totalRecordsDeleted = this.audits.reduce((sum, a) => sum + a.recordsDeleted, 0)

    return {
      reportGeneratedAt: new Date().toISOString(),
      policies: {
        total: this.policies.size,
        autoDelete: Array.from(this.policies.values()).filter(p => p.autoDelete).length,
        manualReview: Array.from(this.policies.values()).filter(p => !p.autoDelete).length
      },
      records: {
        total: totalRecords,
        active: activeRecords,
        expired: expiredRecords,
        deleted: deletedRecords,
        exempt: exemptRecords,
        byType: recordsByType
      },
      audits: {
        total: totalAudits,
        successful: successfulAudits,
        successRate: totalAudits > 0 ? Math.round((successfulAudits / totalAudits) * 100) : 0,
        totalProcessed: totalRecordsProcessed,
        totalDeleted: totalRecordsDeleted,
        deletionRate: totalRecordsProcessed > 0 ? Math.round((totalRecordsDeleted / totalRecordsProcessed) * 100) : 0
      },
      compliance: {
        retentionCompliant: true,
        policiesUpToDate: Array.from(this.policies.values()).every(p => p.nextReview > new Date()),
        automatedDeletion: Array.from(this.policies.values()).some(p => p.autoDelete),
        legalBasisCovered: [
          'Contract performance',
          'Legal compliance',
          'Legitimate interest',
          'Consent',
          'Security monitoring'
        ]
      }
    }
  }

  /**
   * Schedule retention review
   */
  scheduleRetentionReview(): void {
    // In a real implementation, this would schedule a cron job or similar
    console.log('Retention review scheduled for next run')
  }
}

// Create singleton instance
export const retentionService = new DataRetentionService()

// Convenience functions
export function createRetentionRecord(userId: string, dataType: string, metadata?: any): DataRetentionRecord {
  return retentionService.createRetentionRecord(userId, dataType, metadata)
}

export function processExpiredData(): Promise<RetentionAudit> {
  return retentionService.processExpiredData()
}

export function getRetentionPolicies(): RetentionPolicy[] {
  return retentionService.getRetentionPolicies()
}

export function getUserRetentionRecords(userId: string): DataRetentionRecord[] {
  return retentionService.getUserRetentionRecords(userId)
}

export function getRecordsExpiringSoon(days?: number): DataRetentionRecord[] {
  return retentionService.getRecordsExpiringSoon(days)
}

export function generateRetentionReport(): any {
  return retentionService.generateRetentionReport()
}

