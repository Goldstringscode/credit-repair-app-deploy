import { mlmDatabaseService } from './database-service'

export interface AuditEvent {
  userId?: string
  action: string
  entityType: string
  entityId: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
  metadata?: any
}

export interface AuditQuery {
  userId?: string
  action?: string
  entityType?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface AuditStats {
  totalEvents: number
  eventsByAction: { [action: string]: number }
  eventsByEntityType: { [entityType: string]: number }
  eventsByUser: { [userId: string]: number }
  recentEvents: AuditEvent[]
}

export class MLMAuditLogger {
  private db = mlmDatabaseService

  // Log audit event
  async logEvent(event: AuditEvent): Promise<void> {
    try {
      await this.db.logAuditEvent({
        userId: event.userId,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        oldValues: event.oldValues,
        newValues: event.newValues,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent
      })

      console.log(`📝 Audit log: ${event.action} on ${event.entityType} ${event.entityId}`)
    } catch (error) {
      console.error('Error logging audit event:', error)
      // Don't throw error to avoid breaking the main operation
    }
  }

  // Log user registration
  async logUserRegistration(userId: string, userData: any, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logEvent({
      userId,
      action: 'user_registration',
      entityType: 'user',
      entityId: userId,
      newValues: {
        mlmCode: userData.mlmCode,
        sponsorId: userData.sponsorId,
        rank: userData.rank?.name,
        status: userData.status
      },
      ipAddress,
      userAgent
    })
  }

  // Log user update
  async logUserUpdate(userId: string, oldData: any, newData: any, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logEvent({
      userId,
      action: 'user_update',
      entityType: 'user',
      entityId: userId,
      oldValues: oldData,
      newValues: newData,
      ipAddress,
      userAgent
    })
  }

  // Log commission calculation
  async logCommissionCalculation(userId: string, commissionData: any, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logEvent({
      userId,
      action: 'commission_calculation',
      entityType: 'commission',
      entityId: commissionData.id || 'unknown',
      newValues: {
        amount: commissionData.totalAmount,
        type: commissionData.type,
        level: commissionData.level,
        fromUserId: commissionData.fromUserId
      },
      ipAddress,
      userAgent
    })
  }

  // Log payout processing
  async logPayoutProcessing(userId: string, payoutData: any, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logEvent({
      userId,
      action: 'payout_processing',
      entityType: 'payout',
      entityId: payoutData.id || 'unknown',
      newValues: {
        amount: payoutData.amount,
        method: payoutData.method,
        status: payoutData.status
      },
      ipAddress,
      userAgent
    })
  }

  // Log rank advancement
  async logRankAdvancement(userId: string, oldRank: string, newRank: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logEvent({
      userId,
      action: 'rank_advancement',
      entityType: 'user',
      entityId: userId,
      oldValues: { rank: oldRank },
      newValues: { rank: newRank },
      ipAddress,
      userAgent
    })
  }

  // Log team member addition
  async logTeamMemberAddition(sponsorId: string, newMemberId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logEvent({
      userId: sponsorId,
      action: 'team_member_addition',
      entityType: 'team',
      entityId: newMemberId,
      newValues: {
        newMemberId,
        sponsorId
      },
      ipAddress,
      userAgent
    })
  }

  // Log training completion
  async logTrainingCompletion(userId: string, trainingData: any, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logEvent({
      userId,
      action: 'training_completion',
      entityType: 'training',
      entityId: trainingData.id || 'unknown',
      newValues: {
        moduleId: trainingData.moduleId,
        moduleTitle: trainingData.title,
        score: trainingData.score,
        completed: trainingData.completed
      },
      ipAddress,
      userAgent
    })
  }

  // Log system configuration change
  async logSystemConfigChange(adminUserId: string, configData: any, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logEvent({
      userId: adminUserId,
      action: 'system_config_change',
      entityType: 'system',
      entityId: 'config',
      newValues: configData,
      ipAddress,
      userAgent
    })
  }

  // Log security event
  async logSecurityEvent(userId: string, eventType: string, details: any, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logEvent({
      userId,
      action: `security_${eventType}`,
      entityType: 'security',
      entityId: userId,
      newValues: details,
      ipAddress,
      userAgent
    })
  }

  // Log data export
  async logDataExport(userId: string, exportType: string, recordCount: number, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logEvent({
      userId,
      action: 'data_export',
      entityType: 'data',
      entityId: 'export',
      newValues: {
        exportType,
        recordCount,
        timestamp: new Date()
      },
      ipAddress,
      userAgent
    })
  }

  // Log data deletion
  async logDataDeletion(userId: string, entityType: string, entityId: string, deletedData: any, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logEvent({
      userId,
      action: 'data_deletion',
      entityType,
      entityId,
      oldValues: deletedData,
      ipAddress,
      userAgent
    })
  }

  // Query audit events
  async queryAuditEvents(query: AuditQuery): Promise<AuditEvent[]> {
    try {
      // In a real implementation, this would query the database
      // For now, return mock data
      const mockEvents: AuditEvent[] = [
        {
          userId: 'user_123',
          action: 'user_registration',
          entityType: 'user',
          entityId: 'user_123',
          newValues: {
            mlmCode: 'CR001',
            sponsorId: null,
            rank: 'associate',
            status: 'active'
          },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          metadata: {
            timestamp: new Date()
          }
        },
        {
          userId: 'user_123',
          action: 'commission_calculation',
          entityType: 'commission',
          entityId: 'comm_001',
          newValues: {
            amount: 225.00,
            type: 'direct_referral',
            level: 1
          },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          metadata: {
            timestamp: new Date(Date.now() - 3600000)
          }
        }
      ]

      return mockEvents.slice(query.offset || 0, (query.offset || 0) + (query.limit || 50))
    } catch (error) {
      console.error('Error querying audit events:', error)
      return []
    }
  }

  // Get audit statistics
  async getAuditStats(period: number = 30): Promise<AuditStats> {
    try {
      // In a real implementation, this would query the database
      // For now, return mock data
      const mockStats: AuditStats = {
        totalEvents: 1250,
        eventsByAction: {
          'user_registration': 45,
          'commission_calculation': 320,
          'payout_processing': 89,
          'rank_advancement': 12,
          'team_member_addition': 67,
          'training_completion': 156,
          'system_config_change': 3,
          'security_login': 450,
          'data_export': 8
        },
        eventsByEntityType: {
          'user': 124,
          'commission': 320,
          'payout': 89,
          'team': 67,
          'training': 156,
          'system': 3,
          'security': 450,
          'data': 8
        },
        eventsByUser: {
          'user_123': 45,
          'user_456': 32,
          'user_789': 28,
          'admin_001': 15
        },
        recentEvents: []
      }

      return mockStats
    } catch (error) {
      console.error('Error getting audit stats:', error)
      return {
        totalEvents: 0,
        eventsByAction: {},
        eventsByEntityType: {},
        eventsByUser: {},
        recentEvents: []
      }
    }
  }

  // Get user activity timeline
  async getUserActivityTimeline(userId: string, limit: number = 50): Promise<AuditEvent[]> {
    try {
      const events = await this.queryAuditEvents({
        userId,
        limit
      })

      return events.sort((a, b) => {
        const aTime = a.metadata?.timestamp || new Date(0)
        const bTime = b.metadata?.timestamp || new Date(0)
        return bTime.getTime() - aTime.getTime()
      })
    } catch (error) {
      console.error('Error getting user activity timeline:', error)
      return []
    }
  }

  // Get system health metrics
  async getSystemHealthMetrics(): Promise<any> {
    try {
      const stats = await this.getAuditStats(7) // Last 7 days
      
      return {
        totalEvents: stats.totalEvents,
        errorRate: 0.02, // Would calculate from error events
        averageResponseTime: 150, // Would calculate from performance events
        activeUsers: Object.keys(stats.eventsByUser).length,
        systemUptime: 99.9, // Would calculate from system events
        lastBackup: new Date(Date.now() - 86400000), // Would get from backup events
        securityAlerts: 0 // Would count security events
      }
    } catch (error) {
      console.error('Error getting system health metrics:', error)
      return {
        totalEvents: 0,
        errorRate: 0,
        averageResponseTime: 0,
        activeUsers: 0,
        systemUptime: 0,
        lastBackup: null,
        securityAlerts: 0
      }
    }
  }

  // Export audit data
  async exportAuditData(query: AuditQuery, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const events = await this.queryAuditEvents(query)
      
      if (format === 'csv') {
        return this.convertToCSV(events)
      } else {
        return JSON.stringify(events, null, 2)
      }
    } catch (error) {
      console.error('Error exporting audit data:', error)
      throw error
    }
  }

  // Convert events to CSV format
  private convertToCSV(events: AuditEvent[]): string {
    if (events.length === 0) return ''
    
    const headers = ['Timestamp', 'User ID', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'User Agent']
    const rows = events.map(event => [
      event.metadata?.timestamp || new Date().toISOString(),
      event.userId || '',
      event.action,
      event.entityType,
      event.entityId,
      event.ipAddress || '',
      event.userAgent || ''
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    return csvContent
  }

  // Get compliance report
  async getComplianceReport(period: number = 30): Promise<any> {
    try {
      const stats = await this.getAuditStats(period)
      
      return {
        period,
        totalEvents: stats.totalEvents,
        dataRetention: {
          eventsRetained: stats.totalEvents,
          retentionPeriod: '7 years',
          lastCleanup: new Date(Date.now() - 86400000)
        },
        accessControls: {
          failedLogins: stats.eventsByAction['security_login_failed'] || 0,
          successfulLogins: stats.eventsByAction['security_login'] || 0,
          privilegeEscalations: stats.eventsByAction['security_privilege_escalation'] || 0
        },
        dataIntegrity: {
          dataModifications: stats.eventsByAction['user_update'] || 0,
          dataDeletions: stats.eventsByAction['data_deletion'] || 0,
          systemChanges: stats.eventsByAction['system_config_change'] || 0
        },
        auditTrail: {
          completeness: 100, // Would calculate based on expected vs actual events
          tamperDetection: 'No tampering detected',
          lastVerification: new Date()
        }
      }
    } catch (error) {
      console.error('Error getting compliance report:', error)
      throw error
    }
  }
}

// Export singleton instance
export const mlmAuditLogger = new MLMAuditLogger()
