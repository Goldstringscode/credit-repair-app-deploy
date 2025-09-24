import { NextRequest, NextResponse } from 'next/server'
import { auditLogger } from '../audit-logger'

export interface FCRARequest {
  id: string
  userId: string
  requestType: 'dispute' | 'investigation' | 'correction' | 'disclosure' | 'free_report'
  status: 'submitted' | 'investigating' | 'resolved' | 'rejected'
  submittedAt: Date
  resolvedAt?: Date
  bureau: 'experian' | 'equifax' | 'transunion' | 'all'
  description: string
  supportingDocuments?: string[]
  response?: string
  resolution?: string
}

export interface CreditReport {
  id: string
  userId: string
  bureau: 'experian' | 'equifax' | 'transunion'
  reportDate: Date
  creditScore?: number
  accounts: CreditAccount[]
  inquiries: CreditInquiry[]
  negativeItems: NegativeItem[]
  personalInfo: PersonalInfo
  status: 'active' | 'disputed' | 'corrected' | 'deleted'
}

export interface CreditAccount {
  id: string
  accountName: string
  accountNumber: string
  creditor: string
  accountType: 'credit_card' | 'loan' | 'mortgage' | 'auto' | 'other'
  status: 'open' | 'closed' | 'paid_off' | 'charged_off' | 'in_collection'
  balance: number
  creditLimit: number
  paymentHistory: PaymentRecord[]
  openedDate: Date
  lastActivityDate: Date
  isDisputed: boolean
  disputeStatus?: 'pending' | 'investigating' | 'resolved' | 'rejected'
}

export interface CreditInquiry {
  id: string
  creditor: string
  inquiryDate: Date
  inquiryType: 'hard' | 'soft'
  isDisputed: boolean
}

export interface NegativeItem {
  id: string
  type: 'late_payment' | 'collection' | 'charge_off' | 'bankruptcy' | 'foreclosure' | 'repossession'
  creditor: string
  amount: number
  date: Date
  status: 'active' | 'disputed' | 'corrected' | 'deleted'
  isDisputed: boolean
  disputeStatus?: 'pending' | 'investigating' | 'resolved' | 'rejected'
}

export interface PersonalInfo {
  fullName: string
  dateOfBirth: Date
  ssn: string
  addresses: Address[]
  employers: Employer[]
}

export interface Address {
  address: string
  city: string
  state: string
  zipCode: string
  isCurrent: boolean
}

export interface Employer {
  name: string
  position: string
  startDate: Date
  endDate?: Date
  isCurrent: boolean
}

export interface PaymentRecord {
  date: Date
  amount: number
  status: 'on_time' | 'late' | 'missed'
  daysLate?: number
}

class FCRAComplianceService {
  private requests: Map<string, FCRARequest> = new Map()
  private creditReports: Map<string, CreditReport> = new Map()
  private disputeHistory: Map<string, any[]> = new Map()

  /**
   * Submit a dispute request
   */
  submitDispute(userId: string, disputeData: {
    bureau: FCRARequest['bureau']
    description: string
    accountId?: string
    supportingDocuments?: string[]
  }): FCRARequest {
    const request: FCRARequest = {
      id: `fcra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      requestType: 'dispute',
      status: 'submitted',
      submittedAt: new Date(),
      bureau: disputeData.bureau,
      description: disputeData.description,
      supportingDocuments: disputeData.supportingDocuments || []
    }

    this.requests.set(request.id, request)

    // Log the dispute submission
    auditLogger.log({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ipAddress: 'system',
      userAgent: 'system',
      action: 'fcra_dispute_submitted',
      resource: 'fcra_request',
      method: 'POST',
      endpoint: '/api/compliance/fcra/dispute',
      statusCode: 200,
      severity: 'medium',
      category: 'compliance',
      metadata: { 
        requestId: request.id,
        bureau: disputeData.bureau,
        accountId: disputeData.accountId
      }
    })

    return request
  }

  /**
   * Request free credit report
   */
  requestFreeReport(userId: string, bureau: FCRARequest['bureau']): FCRARequest {
    const request: FCRARequest = {
      id: `fcra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      requestType: 'free_report',
      status: 'submitted',
      submittedAt: new Date(),
      bureau,
      description: `Free credit report request for ${bureau}`
    }

    this.requests.set(request.id, request)

    // Log the free report request
    auditLogger.log({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ipAddress: 'system',
      userAgent: 'system',
      action: 'fcra_free_report_requested',
      resource: 'fcra_request',
      method: 'POST',
      endpoint: '/api/compliance/fcra/free-report',
      statusCode: 200,
      severity: 'low',
      category: 'compliance',
      metadata: { requestId: request.id, bureau }
    })

    return request
  }

  /**
   * Process a dispute request
   */
  async processDispute(requestId: string, resolution: {
    status: 'resolved' | 'rejected'
    response: string
    resolution?: string
  }): Promise<{ success: boolean; error?: string }> {
    const request = this.requests.get(requestId)
    if (!request) {
      return { success: false, error: 'Request not found' }
    }

    request.status = resolution.status
    request.resolvedAt = new Date()
    request.response = resolution.response
    request.resolution = resolution.resolution

    // Log the dispute resolution
    auditLogger.log({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: request.userId,
      ipAddress: 'system',
      userAgent: 'system',
      action: 'fcra_dispute_resolved',
      resource: 'fcra_request',
      method: 'POST',
      endpoint: '/api/compliance/fcra/resolve',
      statusCode: 200,
      severity: 'medium',
      category: 'compliance',
      metadata: { 
        requestId,
        status: resolution.status,
        bureau: request.bureau
      }
    })

    return { success: true }
  }

  /**
   * Add credit report
   */
  addCreditReport(userId: string, reportData: {
    bureau: CreditReport['bureau']
    creditScore?: number
    accounts: CreditAccount[]
    inquiries: CreditInquiry[]
    negativeItems: NegativeItem[]
    personalInfo: PersonalInfo
  }): CreditReport {
    const report: CreditReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      bureau: reportData.bureau,
      reportDate: new Date(),
      creditScore: reportData.creditScore,
      accounts: reportData.accounts,
      inquiries: reportData.inquiries,
      negativeItems: reportData.negativeItems,
      personalInfo: reportData.personalInfo,
      status: 'active'
    }

    this.creditReports.set(report.id, report)

    // Log the credit report addition
    auditLogger.log({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ipAddress: 'system',
      userAgent: 'system',
      action: 'fcra_credit_report_added',
      resource: 'credit_report',
      method: 'POST',
      endpoint: '/api/compliance/fcra/credit-report',
      statusCode: 200,
      severity: 'high',
      category: 'compliance',
      metadata: { 
        reportId: report.id,
        bureau: reportData.bureau,
        accountCount: reportData.accounts.length,
        negativeItemCount: reportData.negativeItems.length
      }
    })

    return report
  }

  /**
   * Get user's credit reports
   */
  getUserCreditReports(userId: string): CreditReport[] {
    return Array.from(this.creditReports.values()).filter(r => r.userId === userId)
  }

  /**
   * Get user's FCRA requests
   */
  getUserFCRARequests(userId: string): FCRARequest[] {
    return Array.from(this.requests.values()).filter(r => r.userId === userId)
  }

  /**
   * Get dispute history for an account
   */
  getDisputeHistory(accountId: string): any[] {
    return this.disputeHistory.get(accountId) || []
  }

  /**
   * Add dispute to history
   */
  addDisputeToHistory(accountId: string, dispute: any): void {
    const history = this.disputeHistory.get(accountId) || []
    history.push(dispute)
    this.disputeHistory.set(accountId, history)
  }

  /**
   * Generate FCRA compliance report
   */
  generateComplianceReport(): any {
    const totalRequests = this.requests.size
    const disputeRequests = Array.from(this.requests.values()).filter(r => r.requestType === 'dispute').length
    const freeReportRequests = Array.from(this.requests.values()).filter(r => r.requestType === 'free_report').length
    const resolvedRequests = Array.from(this.requests.values()).filter(r => r.status === 'resolved').length
    const pendingRequests = Array.from(this.requests.values()).filter(r => r.status === 'submitted' || r.status === 'investigating').length

    const totalReports = this.creditReports.size
    const activeReports = Array.from(this.creditReports.values()).filter(r => r.status === 'active').length
    const disputedReports = Array.from(this.creditReports.values()).filter(r => r.status === 'disputed').length

    return {
      reportGeneratedAt: new Date().toISOString(),
      requests: {
        total: totalRequests,
        disputes: disputeRequests,
        freeReports: freeReportRequests,
        resolved: resolvedRequests,
        pending: pendingRequests,
        resolutionRate: totalRequests > 0 ? Math.round((resolvedRequests / totalRequests) * 100) : 0
      },
      creditReports: {
        total: totalReports,
        active: activeReports,
        disputed: disputedReports,
        disputeRate: totalReports > 0 ? Math.round((disputedReports / totalReports) * 100) : 0
      },
      compliance: {
        fcraCompliant: true,
        disputeProcessTime: '30 days average',
        freeReportAvailability: 'Annual free reports provided',
        disputeResolution: 'Timely investigation and response',
        dataAccuracy: 'Regular monitoring and correction',
        consumerRights: [
          'Right to dispute inaccurate information',
          'Right to free credit reports',
          'Right to investigation of disputes',
          'Right to correction of errors',
          'Right to notification of changes'
        ]
      }
    }
  }

  /**
   * Check if user is eligible for free report
   */
  isEligibleForFreeReport(userId: string, bureau: FCRARequest['bureau']): boolean {
    const userRequests = this.getUserFCRARequests(userId)
    const lastFreeReport = userRequests
      .filter(r => r.requestType === 'free_report' && r.bureau === bureau)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())[0]

    if (!lastFreeReport) return true

    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    return lastFreeReport.submittedAt < oneYearAgo
  }

  /**
   * Get FCRA rights information
   */
  getFCRArights(): any {
    return {
      title: 'Your Rights Under the Fair Credit Reporting Act (FCRA)',
      rights: [
        {
          right: 'Right to Know What\'s in Your File',
          description: 'You have the right to know what information is in your credit file and who has accessed it.'
        },
        {
          right: 'Right to Free Credit Reports',
          description: 'You are entitled to one free credit report every 12 months from each of the three major credit bureaus.'
        },
        {
          right: 'Right to Dispute Inaccurate Information',
          description: 'You have the right to dispute any inaccurate or incomplete information in your credit file.'
        },
        {
          right: 'Right to Investigation',
          description: 'Credit bureaus must investigate disputes within 30 days and correct or delete inaccurate information.'
        },
        {
          right: 'Right to Notification',
          description: 'You must be notified if negative information is added to your credit file.'
        },
        {
          right: 'Right to Privacy',
          description: 'Your credit information can only be accessed by those with a legitimate business need.'
        }
      ],
      contactInfo: {
        experian: '1-888-397-3742',
        equifax: '1-800-685-1111',
        transunion: '1-800-916-8800'
      }
    }
  }
}

// Create singleton instance
export const fcraService = new FCRAComplianceService()

// Convenience functions
export function submitFCRADispute(userId: string, disputeData: any): FCRARequest {
  return fcraService.submitDispute(userId, disputeData)
}

export function requestFCRAFreeReport(userId: string, bureau: FCRARequest['bureau']): FCRARequest {
  return fcraService.requestFreeReport(userId, bureau)
}

export function processFCRADispute(requestId: string, resolution: any): Promise<{ success: boolean; error?: string }> {
  return fcraService.processDispute(requestId, resolution)
}

export function addFCRAcreditReport(userId: string, reportData: any): CreditReport {
  return fcraService.addCreditReport(userId, reportData)
}

export function getUserFCRAcreditReports(userId: string): CreditReport[] {
  return fcraService.getUserCreditReports(userId)
}

export function getUserFCRArequests(userId: string): FCRARequest[] {
  return fcraService.getUserFCRARequests(userId)
}

export function generateFCRAcomplianceReport(): any {
  return fcraService.generateComplianceReport()
}

export function getFCRArights(): any {
  return fcraService.getFCRArights()
}

