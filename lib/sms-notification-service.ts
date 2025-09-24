import { smsService, SMSTemplate } from './sms-service'

export interface SMSNotificationTrigger {
  id: string
  name: string
  event: string
  templateId: string
  conditions: Record<string, any>
  isActive: boolean
  createdAt: string
  lastTriggered?: string
  triggerCount: number
}

export interface SMSNotificationLog {
  id: string
  triggerId: string
  recipient: string
  templateId: string
  message: string
  status: 'sent' | 'failed' | 'pending'
  sentAt: string
  error?: string
  cost?: number
}

export class SMSNotificationService {
  private static instance: SMSNotificationService
  private triggers: SMSNotificationTrigger[] = []
  private logs: SMSNotificationLog[] = []

  constructor() {
    this.initializeDefaultTriggers()
  }

  static getInstance(): SMSNotificationService {
    if (!SMSNotificationService.instance) {
      SMSNotificationService.instance = new SMSNotificationService()
    }
    return SMSNotificationService.instance
  }

  /**
   * Initialize default notification triggers
   */
  private initializeDefaultTriggers(): void {
    this.triggers = [
      // Credit Repair Triggers
      {
        id: 'credit-score-improvement',
        name: 'Credit Score Improvement',
        event: 'credit_score_updated',
        templateId: 'credit-score-update',
        conditions: { scoreIncrease: { $gt: 0 } },
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },
      {
        id: 'dispute-letter-generated',
        name: 'Dispute Letter Generated',
        event: 'dispute_letter_created',
        templateId: 'dispute-letter-ready',
        conditions: {},
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },
      {
        id: 'payment-success',
        name: 'Payment Success',
        event: 'payment_completed',
        templateId: 'payment-confirmation',
        conditions: {},
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },
      {
        id: 'welcome-new-user',
        name: 'Welcome New User',
        event: 'user_registered',
        templateId: 'welcome-credit-repair',
        conditions: {},
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },
      {
        id: 'reminder-upload-reports',
        name: 'Upload Reports Reminder',
        event: 'scheduled_reminder',
        templateId: 'reminder-upload-reports',
        conditions: { reminderType: 'upload_reports' },
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },

      // MLM System Triggers
      {
        id: 'mlm-commission-earned',
        name: 'MLM Commission Earned',
        event: 'commission_calculated',
        templateId: 'mlm-commission-earned',
        conditions: { amount: { $gt: 0 } },
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },
      {
        id: 'mlm-new-downline',
        name: 'New Downline Member',
        event: 'downline_member_added',
        templateId: 'mlm-new-downline',
        conditions: {},
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },
      {
        id: 'mlm-rank-achievement',
        name: 'MLM Rank Achievement',
        event: 'rank_updated',
        templateId: 'mlm-rank-achievement',
        conditions: { rankChanged: true },
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },
      {
        id: 'mlm-bonus-earned',
        name: 'MLM Bonus Earned',
        event: 'bonus_calculated',
        templateId: 'mlm-bonus-earned',
        conditions: { amount: { $gt: 0 } },
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },
      {
        id: 'mlm-welcome',
        name: 'MLM Welcome',
        event: 'mlm_user_registered',
        templateId: 'mlm-welcome',
        conditions: {},
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },

      // System Triggers
      {
        id: 'security-alert',
        name: 'Security Alert',
        event: 'security_breach_detected',
        templateId: 'security-alert',
        conditions: {},
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },
      {
        id: 'password-reset',
        name: 'Password Reset',
        event: 'password_reset_requested',
        templateId: 'password-reset',
        conditions: {},
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },
      {
        id: 'system-maintenance',
        name: 'System Maintenance',
        event: 'maintenance_scheduled',
        templateId: 'system-maintenance',
        conditions: {},
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },

      // Support Triggers
      {
        id: 'support-ticket-created',
        name: 'Support Ticket Created',
        event: 'support_ticket_created',
        templateId: 'support-ticket-created',
        conditions: {},
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },
      {
        id: 'support-ticket-resolved',
        name: 'Support Ticket Resolved',
        event: 'support_ticket_resolved',
        templateId: 'support-ticket-resolved',
        conditions: {},
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },

      // Marketing Triggers
      {
        id: 'promotional-offer',
        name: 'Promotional Offer',
        event: 'promotional_campaign',
        templateId: 'promotional-offer',
        conditions: {},
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      },
      {
        id: 'feature-announcement',
        name: 'Feature Announcement',
        event: 'feature_released',
        templateId: 'feature-announcement',
        conditions: {},
        isActive: true,
        createdAt: '2024-01-01',
        triggerCount: 0
      }
    ]
  }

  /**
   * Process an event and trigger SMS notifications
   */
  async processEvent(event: string, data: any): Promise<void> {
    console.log(`📱 Processing SMS event: ${event}`)
    
    const activeTriggers = this.triggers.filter(trigger => 
      trigger.event === event && 
      trigger.isActive &&
      this.evaluateConditions(trigger.conditions, data)
    )

    for (const trigger of activeTriggers) {
      try {
        await this.executeTrigger(trigger, data)
        trigger.lastTriggered = new Date().toISOString()
        trigger.triggerCount++
      } catch (error) {
        console.error(`❌ Failed to execute trigger ${trigger.id}:`, error)
      }
    }
  }

  /**
   * Execute a specific trigger
   */
  private async executeTrigger(trigger: SMSNotificationTrigger, data: any): Promise<void> {
    console.log(`📱 Executing trigger: ${trigger.name}`)
    
    // Get recipient phone number
    const phoneNumber = this.extractPhoneNumber(data)
    if (!phoneNumber) {
      console.warn(`⚠️ No phone number found for trigger ${trigger.id}`)
      return
    }

    // Prepare template variables
    const variables = this.prepareTemplateVariables(data, trigger.templateId)

    // Send SMS
    const result = await smsService.sendTemplateSMS(
      phoneNumber,
      trigger.templateId,
      variables
    )

    // Log the notification
    const log: SMSNotificationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      triggerId: trigger.id,
      recipient: phoneNumber,
      templateId: trigger.templateId,
      message: variables.message || 'SMS sent',
      status: result.success ? 'sent' : 'failed',
      sentAt: new Date().toISOString(),
      error: result.error,
      cost: result.cost
    }

    this.logs.push(log)
    console.log(`📱 SMS notification logged: ${log.id}`)
  }

  /**
   * Extract phone number from event data
   */
  private extractPhoneNumber(data: any): string | null {
    // Try different possible phone number fields
    const phoneFields = ['phoneNumber', 'phone', 'mobile', 'cellPhone', 'contactNumber']
    
    for (const field of phoneFields) {
      if (data[field] && typeof data[field] === 'string') {
        return smsService.formatPhoneNumber(data[field])
      }
    }

    // Check if user object has phone number
    if (data.user && data.user.phoneNumber) {
      return smsService.formatPhoneNumber(data.user.phoneNumber)
    }

    return null
  }

  /**
   * Prepare template variables from event data
   */
  private prepareTemplateVariables(data: any, templateId: string): Record<string, string> {
    const variables: Record<string, string> = {}

    // Common variables
    if (data.userName || (data.user && data.user.name)) {
      variables.userName = data.userName || data.user.name
    }
    if (data.userEmail || (data.user && data.user.email)) {
      variables.userEmail = data.userEmail || data.user.email
    }
    if (data.dashboardUrl) {
      variables.dashboardUrl = data.dashboardUrl
    }

    // Template-specific variables
    switch (templateId) {
      case 'credit-score-update':
        variables.previousScore = data.previousScore?.toString() || '0'
        variables.newScore = data.newScore?.toString() || '0'
        variables.scoreIncrease = data.scoreIncrease?.toString() || '0'
        break

      case 'dispute-letter-ready':
        variables.accountName = data.accountName || 'your account'
        break

      case 'payment-confirmation':
        variables.amount = data.amount?.toString() || '0'
        variables.planName = data.planName || 'your plan'
        variables.nextBillingDate = data.nextBillingDate || 'N/A'
        break

      case 'mlm-commission-earned':
        variables.amount = data.amount?.toString() || '0'
        variables.totalEarnings = data.totalEarnings?.toString() || '0'
        break

      case 'mlm-new-downline':
        variables.newMemberName = data.newMemberName || 'a new member'
        break

      case 'mlm-rank-achievement':
        variables.newRank = data.newRank || 'a new rank'
        break

      case 'mlm-bonus-earned':
        variables.bonusAmount = data.bonusAmount?.toString() || '0'
        variables.bonusType = data.bonusType || 'performance'
        break

      case 'password-reset':
        variables.resetCode = data.resetCode || 'N/A'
        break

      case 'support-ticket-created':
      case 'support-ticket-resolved':
        variables.ticketId = data.ticketId || 'N/A'
        break

      case 'promotional-offer':
        variables.discount = data.discount?.toString() || '0'
        variables.promoCode = data.promoCode || 'N/A'
        variables.expiryDate = data.expiryDate || 'N/A'
        break

      case 'feature-announcement':
        variables.featureName = data.featureName || 'a new feature'
        break

      case 'system-maintenance':
        variables.date = data.date || 'TBD'
        variables.startTime = data.startTime || 'TBD'
        variables.endTime = data.endTime || 'TBD'
        break
    }

    return variables
  }

  /**
   * Evaluate trigger conditions
   */
  private evaluateConditions(conditions: Record<string, any>, data: any): boolean {
    for (const [key, condition] of Object.entries(conditions)) {
      if (typeof condition === 'object' && condition !== null) {
        // Handle comparison operators
        for (const [operator, value] of Object.entries(condition)) {
          const dataValue = this.getNestedValue(data, key)
          
          switch (operator) {
            case '$gt':
              if (!(dataValue > value)) return false
              break
            case '$gte':
              if (!(dataValue >= value)) return false
              break
            case '$lt':
              if (!(dataValue < value)) return false
              break
            case '$lte':
              if (!(dataValue <= value)) return false
              break
            case '$eq':
              if (dataValue !== value) return false
              break
            case '$ne':
              if (dataValue === value) return false
              break
            case '$in':
              if (!Array.isArray(value) || !value.includes(dataValue)) return false
              break
            case '$nin':
              if (Array.isArray(value) && value.includes(dataValue)) return false
              break
          }
        }
      } else {
        // Simple equality check
        const dataValue = this.getNestedValue(data, key)
        if (dataValue !== condition) return false
      }
    }
    
    return true
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Get all triggers
   */
  getTriggers(): SMSNotificationTrigger[] {
    return this.triggers
  }

  /**
   * Get triggers by event
   */
  getTriggersByEvent(event: string): SMSNotificationTrigger[] {
    return this.triggers.filter(trigger => trigger.event === event)
  }

  /**
   * Get notification logs
   */
  getLogs(limit: number = 100): SMSNotificationLog[] {
    return this.logs
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(0, limit)
  }

  /**
   * Get logs by trigger ID
   */
  getLogsByTrigger(triggerId: string): SMSNotificationLog[] {
    return this.logs.filter(log => log.triggerId === triggerId)
  }

  /**
   * Get notification statistics
   */
  getStats(): any {
    const totalSent = this.logs.filter(log => log.status === 'sent').length
    const totalFailed = this.logs.filter(log => log.status === 'failed').length
    const totalCost = this.logs.reduce((sum, log) => sum + (log.cost || 0), 0)

    return {
      totalSent,
      totalFailed,
      totalCost,
      successRate: totalSent + totalFailed > 0 ? (totalSent / (totalSent + totalFailed)) * 100 : 0,
      triggersCount: this.triggers.length,
      activeTriggersCount: this.triggers.filter(t => t.isActive).length
    }
  }

  /**
   * Create a new trigger
   */
  createTrigger(trigger: Omit<SMSNotificationTrigger, 'id' | 'createdAt' | 'triggerCount'>): SMSNotificationTrigger {
    const newTrigger: SMSNotificationTrigger = {
      ...trigger,
      id: `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      triggerCount: 0
    }

    this.triggers.push(newTrigger)
    return newTrigger
  }

  /**
   * Update a trigger
   */
  updateTrigger(id: string, updates: Partial<SMSNotificationTrigger>): SMSNotificationTrigger | null {
    const index = this.triggers.findIndex(trigger => trigger.id === id)
    if (index === -1) return null

    this.triggers[index] = { ...this.triggers[index], ...updates }
    return this.triggers[index]
  }

  /**
   * Delete a trigger
   */
  deleteTrigger(id: string): boolean {
    const index = this.triggers.findIndex(trigger => trigger.id === id)
    if (index === -1) return false

    this.triggers.splice(index, 1)
    return true
  }
}

// Export singleton instance
export const smsNotificationService = SMSNotificationService.getInstance()
