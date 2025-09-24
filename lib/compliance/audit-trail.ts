import { NextRequest, NextResponse } from 'next/server'
import { auditLogger } from '../audit-logger'

export interface AuditEvent {
  id: string
  timestamp: Date
  userId: string
  sessionId: string
  action: string
  resource: string
  method: string
  endpoint: string
  statusCode: number
  ipAddress: string
  userAgent: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'compliance' | 'security' | 'system'
  metadata: any
  riskScore: number
  complianceFlags: string[]
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted'
}

export interface AuditQuery {
  userId?: string
  action?: string
  resource?: string
  category?: string
  severity?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface ComplianceReport {
  id: string
  reportType: 'gdpr' | 'fcra' | 'ccpa' | 'hipaa' | 'pci' | 'general'
  generatedAt: Date
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalEvents: number
    criticalEvents: number
    highRiskEvents: number
    complianceViolations: number
    dataAccessEvents: number
    authenticationEvents: number
  }
  findings: ComplianceFinding[]
  recommendations: string[]
  status: 'draft' | 'final' | 'archived'
}

export interface ComplianceFinding {
  id: string
  type: 'violation' | 'risk' | 'recommendation' | 'observation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  affectedUsers: number
  affectedResources: string[]
  remediation: string
  dueDate: Date
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk'
}

class ComprehensiveAuditTrailService {
  private events: Map<string, AuditEvent> = new Map()
  private reports: Map<string, ComplianceReport> = new Map()
  private findings: Map<string, ComplianceFinding> = new Map()

  /**
   * Log a comprehensive audit event
   */
  logEvent(eventData: {
    userId: string
    sessionId: string
    action: string
    resource: string
    method: string
    endpoint: string
    statusCode: number
    ipAddress: string
    userAgent: string
    severity: AuditEvent['severity']
    category: AuditEvent['category']
    metadata?: any
    dataClassification?: AuditEvent['dataClassification']
  }): AuditEvent {
    const riskScore = this.calculateRiskScore(eventData)
    const complianceFlags = this.identifyComplianceFlags(eventData)

    const event: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId: eventData.userId,
      sessionId: eventData.sessionId,
      action: eventData.action,
      resource: eventData.resource,
      method: eventData.method,
      endpoint: eventData.endpoint,
      statusCode: eventData.statusCode,
      ipAddress: eventData.ipAddress,
      userAgent: eventData.userAgent,
      severity: eventData.severity,
      category: eventData.category,
      metadata: eventData.metadata || {},
      riskScore,
      complianceFlags,
      dataClassification: eventData.dataClassification || 'internal'
    }

    this.events.set(event.id, event)

    // Also log to the existing audit logger
    auditLogger.log({
      id: event.id,
      userId: eventData.userId,
      ipAddress: eventData.ipAddress,
      userAgent: eventData.userAgent,
      action: eventData.action,
      resource: eventData.resource,
      method: eventData.method,
      endpoint: eventData.endpoint,
      statusCode: eventData.statusCode,
      severity: eventData.severity,
      category: eventData.category,
      metadata: eventData.metadata
    })

    return event
  }

  /**
   * Calculate risk score for an event
   */
  private calculateRiskScore(eventData: any): number {
    let score = 0

    // Base score by severity
    const severityScores = { low: 1, medium: 3, high: 7, critical: 10 }
    score += severityScores[eventData.severity] || 1

    // Add points for failed operations
    if (eventData.statusCode >= 400) {
      score += 2
    }

    // Add points for sensitive operations
    const sensitiveActions = ['delete', 'export', 'admin', 'payment', 'credit_report']
    if (sensitiveActions.some(action => eventData.action.toLowerCase().includes(action))) {
      score += 3
    }

    // Add points for data access
    if (eventData.category === 'data_access') {
      score += 2
    }

    // Add points for compliance-related events
    if (eventData.category === 'compliance') {
      score += 1
    }

    return Math.min(score, 10) // Cap at 10
  }

  /**
   * Identify compliance flags for an event
   */
  private identifyComplianceFlags(eventData: any): string[] {
    const flags: string[] = []

    // GDPR flags
    if (eventData.action.includes('data_export') || eventData.action.includes('data_deletion')) {
      flags.push('GDPR')
    }

    // FCRA flags
    if (eventData.resource.includes('credit_report') || eventData.action.includes('dispute')) {
      flags.push('FCRA')
    }

    // CCPA flags
    if (eventData.action.includes('opt_out') || eventData.action.includes('data_portability')) {
      flags.push('CCPA')
    }

    // HIPAA flags
    if (eventData.resource.includes('health_data') || eventData.action.includes('phi_access')) {
      flags.push('HIPAA')
    }

    // PCI flags
    if (eventData.resource.includes('payment') || eventData.resource.includes('card_data')) {
      flags.push('PCI')
    }

    // Security flags
    if (eventData.severity === 'critical' || eventData.action.includes('breach')) {
      flags.push('SECURITY')
    }

    return flags
  }

  /**
   * Query audit events
   */
  queryEvents(query: AuditQuery): { events: AuditEvent[]; total: number } {
    let filteredEvents = Array.from(this.events.values())

    // Apply filters
    if (query.userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === query.userId)
    }
    if (query.action) {
      filteredEvents = filteredEvents.filter(e => e.action.includes(query.action))
    }
    if (query.resource) {
      filteredEvents = filteredEvents.filter(e => e.resource.includes(query.resource))
    }
    if (query.category) {
      filteredEvents = filteredEvents.filter(e => e.category === query.category)
    }
    if (query.severity) {
      filteredEvents = filteredEvents.filter(e => e.severity === query.severity)
    }
    if (query.startDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= query.startDate!)
    }
    if (query.endDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= query.endDate!)
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    const total = filteredEvents.length
    const offset = query.offset || 0
    const limit = query.limit || 100

    return {
      events: filteredEvents.slice(offset, offset + limit),
      total
    }
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(reportType: ComplianceReport['reportType'], period: { start: Date; end: Date }): ComplianceReport {
    const events = Array.from(this.events.values()).filter(e => 
      e.timestamp >= period.start && e.timestamp <= period.end
    )

    const summary = {
      totalEvents: events.length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      highRiskEvents: events.filter(e => e.riskScore >= 7).length,
      complianceViolations: events.filter(e => e.complianceFlags.length > 0).length,
      dataAccessEvents: events.filter(e => e.category === 'data_access').length,
      authenticationEvents: events.filter(e => e.category === 'authentication').length
    }

    const findings = this.analyzeComplianceFindings(events)
    const recommendations = this.generateRecommendations(events, findings)

    const report: ComplianceReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reportType,
      generatedAt: new Date(),
      period,
      summary,
      findings,
      recommendations,
      status: 'draft'
    }

    this.reports.set(report.id, report)
    return report
  }

  /**
   * Analyze compliance findings
   */
  private analyzeComplianceFindings(events: AuditEvent[]): ComplianceFinding[] {
    const findings: ComplianceFinding[] = []

    // High-risk events
    const highRiskEvents = events.filter(e => e.riskScore >= 7)
    if (highRiskEvents.length > 0) {
      findings.push({
        id: `finding_${Date.now()}_1`,
        type: 'risk',
        severity: 'high',
        title: 'High-Risk Events Detected',
        description: `${highRiskEvents.length} high-risk events detected during the reporting period`,
        affectedUsers: new Set(highRiskEvents.map(e => e.userId)).size,
        affectedResources: [...new Set(highRiskEvents.map(e => e.resource))],
        remediation: 'Review and investigate high-risk events immediately',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'open'
      })
    }

    // Failed authentication attempts
    const failedAuthEvents = events.filter(e => 
      e.category === 'authentication' && e.statusCode >= 400
    )
    if (failedAuthEvents.length > 10) {
      findings.push({
        id: `finding_${Date.now()}_2`,
        type: 'violation',
        severity: 'medium',
        title: 'Excessive Failed Authentication Attempts',
        description: `${failedAuthEvents.length} failed authentication attempts detected`,
        affectedUsers: new Set(failedAuthEvents.map(e => e.userId)).size,
        affectedResources: ['authentication_system'],
        remediation: 'Implement additional security measures and review access patterns',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        status: 'open'
      })
    }

    // Data access patterns
    const dataAccessEvents = events.filter(e => e.category === 'data_access')
    const uniqueUsers = new Set(dataAccessEvents.map(e => e.userId)).size
    if (dataAccessEvents.length > 1000 && uniqueUsers < 10) {
      findings.push({
        id: `finding_${Date.now()}_3`,
        type: 'observation',
        severity: 'low',
        title: 'Concentrated Data Access Pattern',
        description: 'High volume of data access from limited number of users',
        affectedUsers: uniqueUsers,
        affectedResources: [...new Set(dataAccessEvents.map(e => e.resource))],
        remediation: 'Review data access patterns and implement access controls',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: 'open'
      })
    }

    return findings
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(events: AuditEvent[], findings: ComplianceFinding[]): string[] {
    const recommendations: string[] = []

    // Security recommendations
    const criticalEvents = events.filter(e => e.severity === 'critical')
    if (criticalEvents.length > 0) {
      recommendations.push('Implement real-time monitoring and alerting for critical events')
    }

    // Compliance recommendations
    const complianceEvents = events.filter(e => e.complianceFlags.length > 0)
    if (complianceEvents.length > 0) {
      recommendations.push('Enhance compliance monitoring and reporting capabilities')
    }

    // Data protection recommendations
    const dataEvents = events.filter(e => e.category === 'data_access' || e.category === 'data_modification')
    if (dataEvents.length > 0) {
      recommendations.push('Implement data loss prevention (DLP) measures')
    }

    // Audit recommendations
    if (events.length > 10000) {
      recommendations.push('Consider implementing automated audit log analysis and correlation')
    }

    return recommendations
  }

  /**
   * Get audit statistics
   */
  getAuditStatistics(period?: { start: Date; end: Date }): any {
    const events = period 
      ? Array.from(this.events.values()).filter(e => e.timestamp >= period.start && e.timestamp <= period.end)
      : Array.from(this.events.values())

    const stats = {
      totalEvents: events.length,
      bySeverity: {
        low: events.filter(e => e.severity === 'low').length,
        medium: events.filter(e => e.severity === 'medium').length,
        high: events.filter(e => e.severity === 'high').length,
        critical: events.filter(e => e.severity === 'critical').length
      },
      byCategory: {
        authentication: events.filter(e => e.category === 'authentication').length,
        authorization: events.filter(e => e.category === 'authorization').length,
        data_access: events.filter(e => e.category === 'data_access').length,
        data_modification: events.filter(e => e.category === 'data_modification').length,
        compliance: events.filter(e => e.category === 'compliance').length,
        security: events.filter(e => e.category === 'security').length,
        system: events.filter(e => e.category === 'system').length
      },
      byRiskScore: {
        low: events.filter(e => e.riskScore < 3).length,
        medium: events.filter(e => e.riskScore >= 3 && e.riskScore < 7).length,
        high: events.filter(e => e.riskScore >= 7).length
      },
      topUsers: this.getTopUsers(events),
      topResources: this.getTopResources(events),
      complianceFlags: this.getComplianceFlagStats(events)
    }

    return stats
  }

  /**
   * Get top users by event count
   */
  private getTopUsers(events: AuditEvent[]): any[] {
    const userCounts = events.reduce((acc, event) => {
      acc[event.userId] = (acc[event.userId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  /**
   * Get top resources by event count
   */
  private getTopResources(events: AuditEvent[]): any[] {
    const resourceCounts = events.reduce((acc, event) => {
      acc[event.resource] = (acc[event.resource] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(resourceCounts)
      .map(([resource, count]) => ({ resource, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  /**
   * Get compliance flag statistics
   */
  private getComplianceFlagStats(events: AuditEvent[]): any {
    const flagCounts = events.reduce((acc, event) => {
      event.complianceFlags.forEach(flag => {
        acc[flag] = (acc[flag] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    return flagCounts
  }

  /**
   * Get compliance reports
   */
  getComplianceReports(): ComplianceReport[] {
    return Array.from(this.reports.values()).sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
  }

  /**
   * Export audit data
   */
  exportAuditData(query: AuditQuery, format: 'json' | 'csv' = 'json'): string {
    const { events } = this.queryEvents(query)
    
    if (format === 'csv') {
      const headers = ['id', 'timestamp', 'userId', 'action', 'resource', 'severity', 'riskScore', 'complianceFlags']
      const csvRows = [headers.join(',')]
      
      events.forEach(event => {
        const row = [
          event.id,
          event.timestamp.toISOString(),
          event.userId,
          event.action,
          event.resource,
          event.severity,
          event.riskScore,
          event.complianceFlags.join(';')
        ]
        csvRows.push(row.join(','))
      })
      
      return csvRows.join('\n')
    }
    
    return JSON.stringify(events, null, 2)
  }
}

// Create singleton instance
export const auditTrailService = new ComprehensiveAuditTrailService()

// Convenience functions
export function logAuditEvent(eventData: any): AuditEvent {
  return auditTrailService.logEvent(eventData)
}

export function queryAuditEvents(query: AuditQuery): { events: AuditEvent[]; total: number } {
  return auditTrailService.queryEvents(query)
}

export function generateComplianceReport(reportType: ComplianceReport['reportType'], period: { start: Date; end: Date }): ComplianceReport {
  return auditTrailService.generateComplianceReport(reportType, period)
}

export function getAuditStatistics(period?: { start: Date; end: Date }): any {
  return auditTrailService.getAuditStatistics(period)
}

export function exportAuditData(query: AuditQuery, format?: 'json' | 'csv'): string {
  return auditTrailService.exportAuditData(query, format)
}
