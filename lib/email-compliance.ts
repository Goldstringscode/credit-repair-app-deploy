// GDPR/CAN-SPAM compliance system
export interface ComplianceSettings {
  gdprEnabled: boolean
  canSpamEnabled: boolean
  doubleOptIn: boolean
  unsubscribeRequired: boolean
  physicalAddress: string
  companyName: string
  privacyPolicyUrl: string
  termsOfServiceUrl: string
  dataRetentionDays: number
  consentRequired: boolean
  consentText: string
  lastUpdated: Date
}

export interface UnsubscribeRecord {
  id: string
  email: string
  reason?: string
  timestamp: Date
  source: string
  ipAddress?: string
  userAgent?: string
}

export interface ConsentRecord {
  id: string
  email: string
  consentType: 'marketing' | 'analytics' | 'essential' | 'all'
  granted: boolean
  timestamp: Date
  ipAddress?: string
  userAgent?: string
  consentText: string
  version: string
}

export interface DataSubjectRequest {
  id: string
  email: string
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction'
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  requestedAt: Date
  completedAt?: Date
  responseData?: any
  notes?: string
}

class EmailComplianceService {
  private settings: ComplianceSettings
  private unsubscribeRecords: Map<string, UnsubscribeRecord> = new Map()
  private consentRecords: Map<string, ConsentRecord> = new Map()
  private dataSubjectRequests: Map<string, DataSubjectRequest> = new Map()

  constructor() {
    this.settings = this.getDefaultSettings()
    this.initializeComplianceData()
  }

  private getDefaultSettings(): ComplianceSettings {
    return {
      gdprEnabled: true,
      canSpamEnabled: true,
      doubleOptIn: true,
      unsubscribeRequired: true,
      physicalAddress: '123 Business St, City, State 12345',
      companyName: 'CreditAI Pro',
      privacyPolicyUrl: 'https://creditai.com/privacy',
      termsOfServiceUrl: 'https://creditai.com/terms',
      dataRetentionDays: 2555, // 7 years
      consentRequired: true,
      consentText: 'I agree to receive marketing communications from CreditAI Pro. I can unsubscribe at any time.',
      lastUpdated: new Date()
    }
  }

  private initializeComplianceData() {
    // Initialize with some sample data
    const sampleUnsubscribes: UnsubscribeRecord[] = [
      {
        id: 'unsub_1',
        email: 'old.user@example.com',
        reason: 'Too many emails',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        source: 'email-footer',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      }
    ]

    const sampleConsents: ConsentRecord[] = [
      {
        id: 'consent_1',
        email: 'user@example.com',
        consentType: 'all',
        granted: true,
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0...',
        consentText: this.settings.consentText,
        version: '1.0'
      }
    ]

    sampleUnsubscribes.forEach(record => {
      this.unsubscribeRecords.set(record.id, record)
    })

    sampleConsents.forEach(record => {
      this.consentRecords.set(record.id, record)
    })

    console.log('⚖️ Email compliance service initialized')
  }

  // GDPR Compliance Methods
  public isEmailUnsubscribed(email: string): boolean {
    for (const record of this.unsubscribeRecords.values()) {
      if (record.email.toLowerCase() === email.toLowerCase()) {
        return true
      }
    }
    return false
  }

  public hasValidConsent(email: string, consentType: 'marketing' | 'analytics' | 'essential' | 'all' = 'marketing'): boolean {
    if (!this.settings.consentRequired) {
      return true
    }

    for (const record of this.consentRecords.values()) {
      if (record.email.toLowerCase() === email.toLowerCase() && record.granted) {
        if (consentType === 'essential' || record.consentType === 'all' || record.consentType === consentType) {
          return true
        }
      }
    }
    return false
  }

  public recordUnsubscribe(email: string, reason?: string, source: string = 'email-footer', ipAddress?: string, userAgent?: string): string {
    const id = `unsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const record: UnsubscribeRecord = {
      id,
      email: email.toLowerCase(),
      reason,
      timestamp: new Date(),
      source,
      ipAddress,
      userAgent
    }

    this.unsubscribeRecords.set(id, record)
    console.log(`🚫 Unsubscribe recorded: ${email}`)
    return id
  }

  public recordConsent(email: string, consentType: 'marketing' | 'analytics' | 'essential' | 'all', granted: boolean, ipAddress?: string, userAgent?: string): string {
    const id = `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const record: ConsentRecord = {
      id,
      email: email.toLowerCase(),
      consentType,
      granted,
      timestamp: new Date(),
      ipAddress,
      userAgent,
      consentText: this.settings.consentText,
      version: '1.0'
    }

    this.consentRecords.set(id, record)
    console.log(`✅ Consent recorded: ${email} - ${consentType} - ${granted}`)
    return id
  }

  public createDataSubjectRequest(email: string, requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction'): string {
    const id = `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const request: DataSubjectRequest = {
      id,
      email: email.toLowerCase(),
      requestType,
      status: 'pending',
      requestedAt: new Date(),
      notes: `Data subject request created for ${requestType}`
    }

    this.dataSubjectRequests.set(id, request)
    console.log(`📋 Data subject request created: ${id} - ${requestType}`)
    return id
  }

  public getDataSubjectRequests(): DataSubjectRequest[] {
    return Array.from(this.dataSubjectRequests.values())
  }

  public updateDataSubjectRequest(requestId: string, updates: Partial<DataSubjectRequest>): boolean {
    const request = this.dataSubjectRequests.get(requestId)
    if (!request) {
      return false
    }

    const updatedRequest = {
      ...request,
      ...updates,
      completedAt: updates.status === 'completed' ? new Date() : request.completedAt
    }

    this.dataSubjectRequests.set(requestId, updatedRequest)
    console.log(`📋 Data subject request updated: ${requestId}`)
    return true
  }

  // CAN-SPAM Compliance Methods
  public generateUnsubscribeUrl(email: string, campaignId?: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const params = new URLSearchParams({
      email: email,
      ...(campaignId && { campaign: campaignId })
    })
    return `${baseUrl}/unsubscribe?${params.toString()}`
  }

  public generateComplianceFooter(email: string, campaignId?: string): string {
    const unsubscribeUrl = this.generateUnsubscribeUrl(email, campaignId)
    
    return `
      <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; text-align: center;">
        <p style="margin: 0 0 10px 0;">
          You received this email because you subscribed to CreditAI Pro communications.
        </p>
        <p style="margin: 0 0 10px 0;">
          <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none;">Unsubscribe</a> | 
          <a href="${this.settings.privacyPolicyUrl}" style="color: #667eea; text-decoration: none;">Privacy Policy</a> | 
          <a href="${this.settings.termsOfServiceUrl}" style="color: #667eea; text-decoration: none;">Terms of Service</a>
        </p>
        <p style="margin: 0; font-size: 11px;">
          ${this.settings.companyName}<br>
          ${this.settings.physicalAddress}
        </p>
      </div>
    `
  }

  public validateEmailForSending(email: string, consentType: 'marketing' | 'analytics' | 'essential' | 'all' = 'marketing'): {
    canSend: boolean
    reasons: string[]
  } {
    const reasons: string[] = []

    // Check if email is unsubscribed
    if (this.isEmailUnsubscribed(email)) {
      reasons.push('Email address has unsubscribed')
    }

    // Check consent if required
    if (this.settings.consentRequired && !this.hasValidConsent(email, consentType)) {
      reasons.push('No valid consent for this type of communication')
    }

    // Check if email is valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      reasons.push('Invalid email format')
    }

    return {
      canSend: reasons.length === 0,
      reasons
    }
  }

  // Settings Management
  public getComplianceSettings(): ComplianceSettings {
    return { ...this.settings }
  }

  public updateComplianceSettings(updates: Partial<ComplianceSettings>): void {
    this.settings = {
      ...this.settings,
      ...updates,
      lastUpdated: new Date()
    }
    console.log('⚖️ Compliance settings updated')
  }

  // Reporting
  public getComplianceReport(): {
    totalUnsubscribes: number
    totalConsents: number
    pendingDataSubjectRequests: number
    complianceScore: number
  } {
    const totalUnsubscribes = this.unsubscribeRecords.size
    const totalConsents = this.consentRecords.size
    const pendingDataSubjectRequests = Array.from(this.dataSubjectRequests.values())
      .filter(request => request.status === 'pending').length

    // Calculate compliance score (simplified)
    let complianceScore = 100
    if (!this.settings.gdprEnabled) complianceScore -= 20
    if (!this.settings.canSpamEnabled) complianceScore -= 20
    if (!this.settings.doubleOptIn) complianceScore -= 10
    if (!this.settings.unsubscribeRequired) complianceScore -= 10
    if (!this.settings.consentRequired) complianceScore -= 10
    if (pendingDataSubjectRequests > 0) complianceScore -= Math.min(pendingDataSubjectRequests * 5, 30)

    return {
      totalUnsubscribes,
      totalConsents,
      pendingDataSubjectRequests,
      complianceScore: Math.max(0, complianceScore)
    }
  }

  // Data Retention
  public cleanupExpiredData(): {
    deletedUnsubscribes: number
    deletedConsents: number
    deletedDataSubjectRequests: number
  } {
    const cutoffDate = new Date(Date.now() - this.settings.dataRetentionDays * 24 * 60 * 60 * 1000)
    
    let deletedUnsubscribes = 0
    let deletedConsents = 0
    let deletedDataSubjectRequests = 0

    // Clean up old unsubscribe records
    for (const [id, record] of this.unsubscribeRecords) {
      if (record.timestamp < cutoffDate) {
        this.unsubscribeRecords.delete(id)
        deletedUnsubscribes++
      }
    }

    // Clean up old consent records
    for (const [id, record] of this.consentRecords) {
      if (record.timestamp < cutoffDate) {
        this.consentRecords.delete(id)
        deletedConsents++
      }
    }

    // Clean up completed data subject requests older than 1 year
    const completedCutoffDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    for (const [id, request] of this.dataSubjectRequests) {
      if (request.status === 'completed' && request.completedAt && request.completedAt < completedCutoffDate) {
        this.dataSubjectRequests.delete(id)
        deletedDataSubjectRequests++
      }
    }

    console.log(`🧹 Cleaned up expired compliance data: ${deletedUnsubscribes} unsubscribes, ${deletedConsents} consents, ${deletedDataSubjectRequests} data subject requests`)
    
    return {
      deletedUnsubscribes,
      deletedConsents,
      deletedDataSubjectRequests
    }
  }
}

// Singleton instance
export const emailComplianceService = new EmailComplianceService()

// API functions
export const isEmailUnsubscribed = (email: string) => {
  return emailComplianceService.isEmailUnsubscribed(email)
}

export const hasValidConsent = (email: string, consentType: 'marketing' | 'analytics' | 'essential' | 'all' = 'marketing') => {
  return emailComplianceService.hasValidConsent(email, consentType)
}

export const recordUnsubscribe = (email: string, reason?: string, source: string = 'email-footer', ipAddress?: string, userAgent?: string) => {
  return emailComplianceService.recordUnsubscribe(email, reason, source, ipAddress, userAgent)
}

export const recordConsent = (email: string, consentType: 'marketing' | 'analytics' | 'essential' | 'all', granted: boolean, ipAddress?: string, userAgent?: string) => {
  return emailComplianceService.recordConsent(email, consentType, granted, ipAddress, userAgent)
}

export const createDataSubjectRequest = (email: string, requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction') => {
  return emailComplianceService.createDataSubjectRequest(email, requestType)
}

export const getDataSubjectRequests = () => {
  return emailComplianceService.getDataSubjectRequests()
}

export const updateDataSubjectRequest = (requestId: string, updates: Partial<DataSubjectRequest>) => {
  return emailComplianceService.updateDataSubjectRequest(requestId, updates)
}

export const generateUnsubscribeUrl = (email: string, campaignId?: string) => {
  return emailComplianceService.generateUnsubscribeUrl(email, campaignId)
}

export const generateComplianceFooter = (email: string, campaignId?: string) => {
  return emailComplianceService.generateComplianceFooter(email, campaignId)
}

export const validateEmailForSending = (email: string, consentType: 'marketing' | 'analytics' | 'essential' | 'all' = 'marketing') => {
  return emailComplianceService.validateEmailForSending(email, consentType)
}

export const getComplianceSettings = () => {
  return emailComplianceService.getComplianceSettings()
}

export const updateComplianceSettings = (updates: Partial<ComplianceSettings>) => {
  return emailComplianceService.updateComplianceSettings(updates)
}

export const getComplianceReport = () => {
  return emailComplianceService.getComplianceReport()
}

export const cleanupExpiredData = () => {
  return emailComplianceService.cleanupExpiredData()
}
