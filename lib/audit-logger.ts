import { User } from './types'

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

export interface AuditLogger {
  log(action: string, resource: string, resourceId: string, details: Record<string, any>, user: User, request?: Request): Promise<void>
  getLogs(userId: string, filters?: AuditLogFilters): Promise<AuditLog[]>
  getLogsByResource(resource: string, resourceId: string): Promise<AuditLog[]>
}

export interface AuditLogFilters {
  action?: string
  resource?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

class MockAuditLogger implements AuditLogger {
  private logs = new Map<string, AuditLog>()
  
  async log(
    action: string, 
    resource: string, 
    resourceId: string, 
    details: Record<string, any>, 
    user: User, 
    request?: Request
  ): Promise<void> {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      action,
      resource,
      resourceId,
      details,
      ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString()
    }
    
    this.logs.set(log.id, log)
    
    // In production, you would also:
    // - Store in database
    // - Send to logging service (e.g., CloudWatch, DataDog)
    // - Write to file system
    // - Send to SIEM system
    
    console.log(`🔍 Audit Log: ${action} on ${resource} (${resourceId}) by ${user.email}`)
  }
  
  async getLogs(userId: string, filters?: AuditLogFilters): Promise<AuditLog[]> {
    let userLogs = Array.from(this.logs.values()).filter(log => log.userId === userId)
    
    if (filters) {
      if (filters.action) {
        userLogs = userLogs.filter(log => log.action === filters.action)
      }
      if (filters.resource) {
        userLogs = userLogs.filter(log => log.resource === filters.resource)
      }
      if (filters.dateFrom) {
        userLogs = userLogs.filter(log => log.timestamp >= filters.dateFrom!)
      }
      if (filters.dateTo) {
        userLogs = userLogs.filter(log => log.timestamp <= filters.dateTo!)
      }
    }
    
    // Sort by timestamp (newest first)
    userLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    // Apply pagination
    if (filters?.limit) {
      const offset = filters.offset || 0
      userLogs = userLogs.slice(offset, offset + filters.limit)
    }
    
    return userLogs
  }
  
  async getLogsByResource(resource: string, resourceId: string): Promise<AuditLog[]> {
    return Array.from(this.logs.values())
      .filter(log => log.resource === resource && log.resourceId === resourceId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
}

// Export singleton instance
export const auditLogger = new MockAuditLogger()

// In production, you would use:
// export const auditLogger = new DatabaseAuditLogger()
// export const auditLogger = new CloudWatchAuditLogger()
// etc.