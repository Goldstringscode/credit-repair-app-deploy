import { createSupabaseClient } from './supabase'

export interface ComplianceRequest {
  id: string
  userId: string
  requestType: string
  framework: string
  status: string
  priority: string
  description: string
  reason: string
  requestedData?: any
  submittedAt: string
  dueDate: string
  completedAt?: string
  processedBy?: string
  responseData?: any
  notes?: string
}

export interface ComplianceMetrics {
  gdpr: {
    requests: number
    completed: number
    pending: number
    complianceRate: number
  }
  fcra: {
    disputes: number
    freeReports: number
    resolved: number
    complianceRate: number
  }
  ccpa: {
    requests: number
    completed: number
    pending: number
    complianceRate: number
  }
  hipaa: {
    requests: number
    completed: number
    breaches: number
    complianceRate: number
  }
  pci: {
    cards: number
    transactions: number
    vulnerabilities: number
    complianceRate: number
  }
  retention: {
    totalRecords: number
    expired: number
    deleted: number
    exempt: number
    complianceRate: number
  }
  audit: {
    totalEvents: number
    criticalEvents: number
    highRiskEvents: number
    complianceRate: number
  }
}

export class ComplianceService {
  private supabase = createSupabaseClient()

  async getComplianceOverview(): Promise<ComplianceMetrics> {
    try {
      const [
        gdprRequests,
        fcraDisputes,
        ccpaRequests,
        hipaaData,
        pciEvents,
        retentionRecords,
        auditLogs
      ] = await Promise.all([
        this.supabase.from('compliance_requests').select('*').eq('framework', 'GDPR'),
        this.supabase.from('fcra_disputes').select('*'),
        this.supabase.from('compliance_requests').select('*').eq('framework', 'CCPA'),
        this.supabase.from('hipaa_health_data').select('*'),
        this.supabase.from('pci_security_events').select('*'),
        this.supabase.from('data_retention_records').select('*'),
        this.supabase.from('compliance_audit_log').select('*').order('timestamp', { ascending: false }).limit(100)
      ])

      return {
        gdpr: this.calculateGDPRMetrics(gdprRequests.data || []),
        fcra: this.calculateFCRAMetrics(fcraDisputes.data || []),
        ccpa: this.calculateCCPAMetrics(ccpaRequests.data || []),
        hipaa: this.calculateHIPAAMetrics(hipaaData.data || []),
        pci: this.calculatePCIMetrics(pciEvents.data || []),
        retention: this.calculateRetentionMetrics(retentionRecords.data || []),
        audit: this.calculateAuditMetrics(auditLogs.data || [])
      }
    } catch (error) {
      console.error('Failed to get compliance overview:', error)
      throw error
    }
  }

  async createGDPRRequest(userId: string, requestType: string, reason: string, requestedData?: any): Promise<ComplianceRequest> {
    try {
      const { data, error } = await this.supabase
        .from('compliance_requests')
        .insert({
          user_id: userId,
          request_type: requestType,
          framework: 'GDPR',
          status: 'pending',
          priority: this.getPriorityForRequestType(requestType),
          description: this.getDescriptionForRequestType(requestType),
          reason: reason,
          requested_data: requestedData,
          due_date: this.calculateDueDate(requestType)
        })
        .select()
        .single()

      if (error) throw error

      // Log the action
      await this.logAuditEvent(userId, `gdpr_${requestType}_requested`, 'GDPR', data.id, { requestType, reason, requestedData })

      // Send notification
      await this.sendNotification({
        type: 'compliance_alert',
        title: `New GDPR ${requestType.replace('_', ' ')} Request`,
        message: `User ${userId} has submitted a ${requestType.replace('_', ' ')} request under GDPR.`,
        priority: this.getPriorityForRequestType(requestType)
      })

      return data
    } catch (error) {
      console.error('Failed to create GDPR request:', error)
      throw error
    }
  }

  async createFCRARequest(userId: string, action: string, data: any): Promise<any> {
    try {
      if (action === 'dispute') {
        const { data: dispute, error } = await this.supabase
          .from('fcra_disputes')
          .insert({
            user_id: userId,
            credit_bureau: data.bureau,
            account_name: data.accountName,
            account_number: data.accountNumber,
            dispute_reason: data.description,
            supporting_documents: data.documents,
            status: 'submitted'
          })
          .select()
          .single()

        if (error) throw error

        await this.logAuditEvent(userId, 'fcra_dispute_submitted', 'FCRA', dispute.id, data)
        return dispute
      } else if (action === 'free_report') {
        const { data: request, error } = await this.supabase
          .from('compliance_requests')
          .insert({
            user_id: userId,
            request_type: 'free_credit_report',
            framework: 'FCRA',
            status: 'pending',
            priority: 'normal',
            description: 'User requests free annual credit report',
            reason: 'Annual free report entitlement under FCRA',
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single()

        if (error) throw error

        await this.logAuditEvent(userId, 'fcra_free_report_requested', 'FCRA', request.id, data)
        return request
      }
    } catch (error) {
      console.error('Failed to create FCRA request:', error)
      throw error
    }
  }

  async createCCPARequest(userId: string, requestType: string, businessPurpose?: string, thirdParties?: string[]): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('ccpa_consumer_requests')
        .insert({
          user_id: userId,
          request_type: requestType,
          verification_status: 'pending',
          business_purpose: businessPurpose,
          third_parties: thirdParties,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      await this.logAuditEvent(userId, `ccpa_${requestType}_requested`, 'CCPA', data.id, { requestType, businessPurpose, thirdParties })
      return data
    } catch (error) {
      console.error('Failed to create CCPA request:', error)
      throw error
    }
  }

  async createHIPAARequest(userId: string, requestType: string, healthData?: any): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('compliance_requests')
        .insert({
          user_id: userId,
          request_type: `hipaa_${requestType}`,
          framework: 'HIPAA',
          status: 'pending',
          priority: this.getPriorityForHIPAARequest(requestType),
          description: this.getDescriptionForHIPAARequest(requestType),
          reason: 'Patient rights request under HIPAA',
          requested_data: healthData,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()

      if (error) throw error

      await this.logAuditEvent(userId, `hipaa_${requestType}_requested`, 'HIPAA', data.id, { requestType, healthData })
      return data
    } catch (error) {
      console.error('Failed to create HIPAA request:', error)
      throw error
    }
  }

  async getComplianceRequests(framework?: string, status?: string, userId?: string): Promise<ComplianceRequest[]> {
    try {
      let query = this.supabase.from('compliance_requests').select('*')
      
      if (framework) query = query.eq('framework', framework)
      if (status) query = query.eq('status', status)
      if (userId) query = query.eq('user_id', userId)
      
      const { data, error } = await query.order('submitted_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get compliance requests:', error)
      throw error
    }
  }

  async updateComplianceRequest(requestId: string, updates: Partial<ComplianceRequest>): Promise<ComplianceRequest> {
    try {
      const { data, error } = await this.supabase
        .from('compliance_requests')
        .update(updates)
        .eq('id', requestId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to update compliance request:', error)
      throw error
    }
  }

  private calculateGDPRMetrics(requests: any[]): any {
    const completed = requests.filter(r => r.status === 'completed').length
    const total = requests.length
    return {
      requests: total,
      completed,
      pending: requests.filter(r => r.status === 'pending').length,
      complianceRate: total > 0 ? Math.round((completed / total) * 100) : 100
    }
  }

  private calculateFCRAMetrics(disputes: any[]): any {
    const resolved = disputes.filter(d => d.status === 'resolved').length
    const total = disputes.length
    return {
      disputes: total,
      freeReports: 0, // This would come from a separate table
      resolved,
      complianceRate: total > 0 ? Math.round((resolved / total) * 100) : 100
    }
  }

  private calculateCCPAMetrics(requests: any[]): any {
    const completed = requests.filter(r => r.status === 'completed').length
    const total = requests.length
    return {
      requests: total,
      completed,
      pending: requests.filter(r => r.status === 'pending').length,
      complianceRate: total > 0 ? Math.round((completed / total) * 100) : 100
    }
  }

  private calculateHIPAAMetrics(healthData: any[]): any {
    const encrypted = healthData.filter(d => d.encrypted).length
    const total = healthData.length
    return {
      requests: total,
      completed: total,
      breaches: 0, // This would be calculated from security events
      complianceRate: total > 0 ? Math.round((encrypted / total) * 100) : 100
    }
  }

  private calculatePCIMetrics(events: any[]): any {
    const resolved = events.filter(e => e.status === 'resolved').length
    const total = events.length
    return {
      cards: 0, // This would come from payment data
      transactions: 0, // This would come from transaction logs
      vulnerabilities: events.filter(e => e.event_type === 'vulnerability_found' && e.status === 'open').length,
      complianceRate: total > 0 ? Math.round((resolved / total) * 100) : 100
    }
  }

  private calculateRetentionMetrics(records: any[]): any {
    const expired = records.filter(r => r.expires_at < new Date()).length
    const deleted = records.filter(r => r.deleted_at !== null).length
    const exempt = records.filter(r => r.exempt_reason !== null).length
    const total = records.length
    const compliant = records.filter(r => {
      const now = new Date()
      const expiresAt = new Date(r.expires_at)
      return r.deleted_at !== null || expiresAt > now
    }).length
    
    return {
      totalRecords: total,
      expired,
      deleted,
      exempt,
      complianceRate: total > 0 ? Math.round((compliant / total) * 100) : 100
    }
  }

  private calculateAuditMetrics(logs: any[]): any {
    const critical = logs.filter(l => l.action.includes('critical')).length
    const highRisk = logs.filter(l => l.action.includes('high_risk')).length
    return {
      totalEvents: logs.length,
      criticalEvents: critical,
      highRiskEvents: highRisk,
      complianceRate: 98 // This would be calculated based on audit results
    }
  }

  private getPriorityForRequestType(requestType: string): string {
    const priorityMap: { [key: string]: string } = {
      'data_export': 'normal',
      'data_deletion': 'high',
      'data_rectification': 'normal',
      'data_portability': 'normal',
      'consent_withdrawal': 'high'
    }
    return priorityMap[requestType] || 'normal'
  }

  private getDescriptionForRequestType(requestType: string): string {
    const descriptionMap: { [key: string]: string } = {
      'data_export': 'User requests export of their personal data',
      'data_deletion': 'User requests deletion of their personal data',
      'data_rectification': 'User requests correction of their personal data',
      'data_portability': 'User requests transfer of their personal data',
      'consent_withdrawal': 'User withdraws consent for data processing'
    }
    return descriptionMap[requestType] || 'GDPR request'
  }

  private getPriorityForHIPAARequest(requestType: string): string {
    const priorityMap: { [key: string]: string } = {
      'access': 'normal',
      'amendment': 'normal',
      'disclosure': 'high',
      'restriction': 'high',
      'accounting': 'normal'
    }
    return priorityMap[requestType] || 'normal'
  }

  private getDescriptionForHIPAARequest(requestType: string): string {
    const descriptionMap: { [key: string]: string } = {
      'access': 'Patient requests access to their health information',
      'amendment': 'Patient requests amendment to their health information',
      'disclosure': 'Patient requests disclosure of health information',
      'restriction': 'Patient requests restriction on use/disclosure of health information',
      'accounting': 'Patient requests accounting of disclosures of health information'
    }
    return descriptionMap[requestType] || 'HIPAA patient rights request'
  }

  private calculateDueDate(requestType: string): string {
    const now = new Date()
    const daysToAdd = requestType === 'data_deletion' ? 30 : 30 // GDPR requires 30 days for most requests
    const dueDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000))
    return dueDate.toISOString()
  }

  private async logAuditEvent(userId: string, action: string, framework: string, requestId?: string, details?: any): Promise<void> {
    try {
      await this.supabase.from('compliance_audit_log').insert({
        user_id: userId,
        action,
        framework,
        request_id: requestId,
        details
      })
    } catch (error) {
      console.error('Failed to log audit event:', error)
    }
  }

  private async sendNotification(notification: any): Promise<void> {
    try {
      await this.supabase.from('compliance_notifications').insert(notification)
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }
}

export const complianceService = new ComplianceService()
