export interface ScheduledNotification {
  id: string
  userId: string
  templateId: string
  templateData: Record<string, any>
  scheduledFor: Date
  priority: 'low' | 'medium' | 'high'
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled'
  retryCount: number
  maxRetries: number
  createdAt: Date
  sentAt?: Date
  error?: string
  conditions?: NotificationCondition[]
}

export interface NotificationCondition {
  type: 'time' | 'user_action' | 'system_event' | 'custom'
  value: any
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_equals'
}

export interface NotificationSchedule {
  id: string
  name: string
  description: string
  templateId: string
  templateData: Record<string, any>
  schedule: {
    type: 'immediate' | 'delayed' | 'recurring' | 'conditional'
    delay?: number // minutes
    interval?: number // minutes for recurring
    conditions?: NotificationCondition[]
    timezone?: string
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

class NotificationScheduler {
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map()
  private schedules: Map<string, NotificationSchedule> = new Map()
  private processingInterval: NodeJS.Timeout | null = null
  private isProcessing = false

  constructor() {
    this.startProcessing()
  }

  /**
   * Schedule a notification for immediate delivery
   */
  scheduleImmediate(
    userId: string,
    templateId: string,
    templateData: Record<string, any> = {},
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): string {
    const notification: ScheduledNotification = {
      id: `immediate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      templateId,
      templateData,
      scheduledFor: new Date(),
      priority,
      status: 'scheduled',
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date()
    }

    this.scheduledNotifications.set(notification.id, notification)
    return notification.id
  }

  /**
   * Schedule a notification for delayed delivery
   */
  scheduleDelayed(
    userId: string,
    templateId: string,
    delayMinutes: number,
    templateData: Record<string, any> = {},
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): string {
    const scheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000)
    
    const notification: ScheduledNotification = {
      id: `delayed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      templateId,
      templateData,
      scheduledFor,
      priority,
      status: 'scheduled',
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date()
    }

    this.scheduledNotifications.set(notification.id, notification)
    return notification.id
  }

  /**
   * Schedule a notification for a specific date/time
   */
  scheduleForDate(
    userId: string,
    templateId: string,
    scheduledDate: Date,
    templateData: Record<string, any> = {},
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): string {
    const notification: ScheduledNotification = {
      id: `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      templateId,
      templateData,
      scheduledFor: scheduledDate,
      priority,
      status: 'scheduled',
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date()
    }

    this.scheduledNotifications.set(notification.id, notification)
    return notification.id
  }

  /**
   * Create a recurring notification schedule
   */
  createRecurringSchedule(
    name: string,
    description: string,
    templateId: string,
    intervalMinutes: number,
    templateData: Record<string, any> = {},
    conditions?: NotificationCondition[]
  ): string {
    const schedule: NotificationSchedule = {
      id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      templateId,
      templateData,
      schedule: {
        type: 'recurring',
        interval: intervalMinutes,
        conditions
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.schedules.set(schedule.id, schedule)
    return schedule.id
  }

  /**
   * Create a conditional notification schedule
   */
  createConditionalSchedule(
    name: string,
    description: string,
    templateId: string,
    conditions: NotificationCondition[],
    templateData: Record<string, any> = {}
  ): string {
    const schedule: NotificationSchedule = {
      id: `conditional-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      templateId,
      templateData,
      schedule: {
        type: 'conditional',
        conditions
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.schedules.set(schedule.id, schedule)
    return schedule.id
  }

  /**
   * Cancel a scheduled notification
   */
  cancelNotification(notificationId: string): boolean {
    const notification = this.scheduledNotifications.get(notificationId)
    if (!notification) {
      return false
    }

    notification.status = 'cancelled'
    this.scheduledNotifications.set(notificationId, notification)
    return true
  }

  /**
   * Cancel a schedule
   */
  cancelSchedule(scheduleId: string): boolean {
    const schedule = this.schedules.get(scheduleId)
    if (!schedule) {
      return false
    }

    schedule.isActive = false
    this.schedules.set(scheduleId, schedule)
    return true
  }

  /**
   * Get scheduled notifications for a user
   */
  getUserScheduledNotifications(userId: string): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
  }

  /**
   * Get all active schedules
   */
  getActiveSchedules(): NotificationSchedule[] {
    return Array.from(this.schedules.values())
      .filter(schedule => schedule.isActive)
  }

  /**
   * Process scheduled notifications
   */
  private async processScheduledNotifications(): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true
    const now = new Date()

    try {
      // Process immediate and delayed notifications
      const readyNotifications = Array.from(this.scheduledNotifications.values())
        .filter(notification => 
          notification.status === 'scheduled' && 
          notification.scheduledFor <= now
        )
        .sort((a, b) => {
          // Sort by priority first, then by scheduled time
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          const aPriority = priorityOrder[a.priority]
          const bPriority = priorityOrder[b.priority]
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority
          }
          
          return a.scheduledFor.getTime() - b.scheduledFor.getTime()
        })

      for (const notification of readyNotifications) {
        await this.sendScheduledNotification(notification)
      }

      // Process recurring schedules
      await this.processRecurringSchedules()

    } catch (error) {
      console.error('Error processing scheduled notifications:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Send a scheduled notification
   */
  private async sendScheduledNotification(notification: ScheduledNotification): Promise<void> {
    try {
      // Import notification service dynamically to avoid circular dependencies
      const { notificationTemplateService } = await import('./notification-templates')
      
      // Generate notification from template
      const generatedNotification = notificationTemplateService.generateNotification(
        notification.templateId,
        notification.templateData,
        notification.userId
      )

      // Send notification via API
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...generatedNotification,
          userId: notification.userId
        })
      })

      if (response.ok) {
        notification.status = 'sent'
        notification.sentAt = new Date()
        this.scheduledNotifications.set(notification.id, notification)
        console.log(`✅ Sent scheduled notification: ${notification.id}`)
      } else {
        throw new Error(`Failed to send notification: ${response.statusText}`)
      }

    } catch (error) {
      console.error(`❌ Failed to send scheduled notification ${notification.id}:`, error)
      
      notification.retryCount++
      notification.error = error instanceof Error ? error.message : 'Unknown error'
      
      if (notification.retryCount >= notification.maxRetries) {
        notification.status = 'failed'
        console.error(`🚫 Max retries reached for notification: ${notification.id}`)
      } else {
        // Schedule retry with exponential backoff
        const retryDelay = Math.min(5 * Math.pow(2, notification.retryCount), 60) // Max 60 minutes
        notification.scheduledFor = new Date(Date.now() + retryDelay * 60 * 1000)
        console.log(`🔄 Retrying notification ${notification.id} in ${retryDelay} minutes`)
      }
      
      this.scheduledNotifications.set(notification.id, notification)
    }
  }

  /**
   * Process recurring schedules
   */
  private async processRecurringSchedules(): Promise<void> {
    const activeSchedules = this.getActiveSchedules()
    
    for (const schedule of activeSchedules) {
      if (schedule.schedule.type === 'recurring' && schedule.schedule.interval) {
        // Check if it's time to send the next notification
        const lastSent = this.getLastSentTimeForSchedule(schedule.id)
        const intervalMs = schedule.schedule.interval * 60 * 1000
        const nextSendTime = new Date((lastSent?.getTime() || 0) + intervalMs)
        
        if (nextSendTime <= new Date()) {
          // Check conditions if any
          if (this.evaluateConditions(schedule.schedule.conditions || [])) {
            // Schedule the notification
            this.scheduleImmediate(
              'system', // In a real app, this would be determined by the schedule
              schedule.templateId,
              schedule.templateData,
              'medium'
            )
            
            this.updateLastSentTimeForSchedule(schedule.id, new Date())
          }
        }
      }
    }
  }

  /**
   * Evaluate notification conditions
   */
  private evaluateConditions(conditions: NotificationCondition[]): boolean {
    if (conditions.length === 0) return true

    return conditions.every(condition => {
      switch (condition.type) {
        case 'time':
          const now = new Date()
          const targetTime = new Date(condition.value)
          return this.evaluateOperator(now.getTime(), targetTime.getTime(), condition.operator)
        
        case 'user_action':
          // In a real app, this would check user activity
          return true
        
        case 'system_event':
          // In a real app, this would check system events
          return true
        
        case 'custom':
          // Custom condition evaluation
          return true
        
        default:
          return false
      }
    })
  }

  /**
   * Evaluate operator comparison
   */
  private evaluateOperator(value: any, target: any, operator: string): boolean {
    switch (operator) {
      case 'equals':
        return value === target
      case 'not_equals':
        return value !== target
      case 'greater_than':
        return value > target
      case 'less_than':
        return value < target
      case 'contains':
        return String(value).includes(String(target))
      default:
        return false
    }
  }

  /**
   * Get last sent time for a schedule (mock implementation)
   */
  private getLastSentTimeForSchedule(scheduleId: string): Date | null {
    // In a real app, this would be stored in a database
    return null
  }

  /**
   * Update last sent time for a schedule (mock implementation)
   */
  private updateLastSentTimeForSchedule(scheduleId: string, time: Date): void {
    // In a real app, this would be stored in a database
    console.log(`Updated last sent time for schedule ${scheduleId}: ${time.toISOString()}`)
  }

  /**
   * Start the processing interval
   */
  private startProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
    }

    // Process every 30 seconds
    this.processingInterval = setInterval(() => {
      this.processScheduledNotifications()
    }, 30000)

    console.log('🕐 Notification scheduler started')
  }

  /**
   * Stop the processing interval
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
    console.log('⏹️ Notification scheduler stopped')
  }

  /**
   * Get scheduler statistics
   */
  getStats(): {
    totalScheduled: number
    totalSent: number
    totalFailed: number
    totalCancelled: number
    activeSchedules: number
  } {
    const notifications = Array.from(this.scheduledNotifications.values())
    const schedules = Array.from(this.schedules.values())

    return {
      totalScheduled: notifications.filter(n => n.status === 'scheduled').length,
      totalSent: notifications.filter(n => n.status === 'sent').length,
      totalFailed: notifications.filter(n => n.status === 'failed').length,
      totalCancelled: notifications.filter(n => n.status === 'cancelled').length,
      activeSchedules: schedules.filter(s => s.isActive).length
    }
  }

  /**
   * Clean up old notifications
   */
  cleanupOldNotifications(daysOld: number = 30): void {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
    
    for (const [id, notification] of this.scheduledNotifications.entries()) {
      if (notification.createdAt < cutoffDate && 
          (notification.status === 'sent' || notification.status === 'failed' || notification.status === 'cancelled')) {
        this.scheduledNotifications.delete(id)
      }
    }
    
    console.log(`🧹 Cleaned up notifications older than ${daysOld} days`)
  }
}

export { NotificationScheduler }
export const notificationScheduler = new NotificationScheduler()
