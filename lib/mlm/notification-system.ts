import { mlmDatabaseService } from './database-service'
import { MLMNotification } from '@/lib/mlm-system'

export interface NotificationTemplate {
  id: string
  type: string
  title: string
  message: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  data?: any
}

export interface NotificationPreferences {
  userId: string
  email: boolean
  push: boolean
  sms: boolean
  inApp: boolean
  types: {
    commission_earned: boolean
    rank_advancement: boolean
    team_activity: boolean
    payout_processed: boolean
    training_completed: boolean
    goal_achieved: boolean
    system_announcement: boolean
  }
}

export class MLMNotificationSystem {
  private db = mlmDatabaseService
  private templates: Map<string, NotificationTemplate> = new Map()

  constructor() {
    this.initializeTemplates()
  }

  // Initialize notification templates
  private initializeTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: 'commission_earned',
        type: 'commission_earned',
        title: 'Commission Earned!',
        message: 'You earned ${amount} from ${type} commission.',
        priority: 'normal',
        data: { amount: 0, type: '' }
      },
      {
        id: 'rank_advancement',
        type: 'rank_advancement',
        title: 'Rank Advancement!',
        message: 'Congratulations! You have advanced to ${newRank}.',
        priority: 'high',
        data: { newRank: '', oldRank: '' }
      },
      {
        id: 'team_member_joined',
        type: 'team_activity',
        title: 'New Team Member!',
        message: '${memberName} has joined your team.',
        priority: 'normal',
        data: { memberName: '' }
      },
      {
        id: 'payout_processed',
        type: 'payout_processed',
        title: 'Payout Processed',
        message: 'Your payout of ${amount} has been processed successfully.',
        priority: 'normal',
        data: { amount: 0 }
      },
      {
        id: 'training_completed',
        type: 'training_completed',
        title: 'Training Completed!',
        message: 'You have completed ${moduleTitle}. Great job!',
        priority: 'normal',
        data: { moduleTitle: '' }
      },
      {
        id: 'goal_achieved',
        type: 'goal_achieved',
        title: 'Goal Achieved!',
        message: 'Congratulations! You have achieved your ${goalType} goal.',
        priority: 'high',
        data: { goalType: '' }
      },
      {
        id: 'system_announcement',
        type: 'system_announcement',
        title: 'System Announcement',
        message: '${announcement}',
        priority: 'urgent',
        data: { announcement: '' }
      }
    ]

    templates.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  // Send notification to user
  async sendNotification(
    userId: string,
    type: string,
    data: any = {},
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<MLMNotification> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId)
      
      // Check if user wants this type of notification
      if (!this.shouldSendNotification(preferences, type)) {
        console.log(`📧 Notification skipped for user ${userId}, type ${type} disabled`)
        return null as any
      }

      // Get template
      const template = this.templates.get(type)
      if (!template) {
        throw new Error(`Notification template not found: ${type}`)
      }

      // Process message with data
      const processedMessage = this.processMessage(template.message, { ...template.data, ...data })
      const processedTitle = this.processMessage(template.title, { ...template.data, ...data })

      // Create notification record
      const notification = await this.db.createNotification({
        userId,
        type,
        title: processedTitle,
        message: processedMessage,
        data: { ...template.data, ...data },
        priority: priority || template.priority
      })

      // Send via different channels based on preferences
      await this.sendViaChannels(userId, notification, preferences)

      console.log(`📧 Notification sent to user ${userId}: ${type}`)
      return notification
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  }

  // Send notification via multiple channels
  private async sendViaChannels(
    userId: string,
    notification: MLMNotification,
    preferences: NotificationPreferences
  ): Promise<void> {
    const promises = []

    if (preferences.inApp) {
      promises.push(this.sendInAppNotification(notification))
    }

    if (preferences.email) {
      promises.push(this.sendEmailNotification(userId, notification))
    }

    if (preferences.push) {
      promises.push(this.sendPushNotification(userId, notification))
    }

    if (preferences.sms) {
      promises.push(this.sendSMSNotification(userId, notification))
    }

    await Promise.allSettled(promises)
  }

  // Send in-app notification
  private async sendInAppNotification(notification: MLMNotification): Promise<void> {
    // In-app notifications are already stored in the database
    // This could trigger real-time updates via WebSocket
    console.log(`📱 In-app notification: ${notification.title}`)
  }

  // Send email notification
  private async sendEmailNotification(userId: string, notification: MLMNotification): Promise<void> {
    try {
      // In a real implementation, this would integrate with an email service
      console.log(`📧 Email notification to ${userId}: ${notification.title}`)
      
      // Example integration with email service
      // await emailService.send({
      //   to: user.email,
      //   subject: notification.title,
      //   html: this.formatEmailNotification(notification)
      // })
    } catch (error) {
      console.error('Error sending email notification:', error)
    }
  }

  // Send push notification
  private async sendPushNotification(userId: string, notification: MLMNotification): Promise<void> {
    try {
      // In a real implementation, this would integrate with push notification service
      console.log(`🔔 Push notification to ${userId}: ${notification.title}`)
      
      // Example integration with push service
      // await pushService.send({
      //   userId,
      //   title: notification.title,
      //   body: notification.message,
      //   data: notification.data
      // })
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }

  // Send SMS notification
  private async sendSMSNotification(userId: string, notification: MLMNotification): Promise<void> {
    try {
      // In a real implementation, this would integrate with SMS service
      console.log(`📱 SMS notification to ${userId}: ${notification.title}`)
      
      // Example integration with SMS service
      // await smsService.send({
      //   to: user.phone,
      //   message: `${notification.title}: ${notification.message}`
      // })
    } catch (error) {
      console.error('Error sending SMS notification:', error)
    }
  }

  // Get user notification preferences
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      // In a real implementation, this would fetch from database
      // For now, return default preferences
      return {
        userId,
        email: true,
        push: true,
        sms: false,
        inApp: true,
        types: {
          commission_earned: true,
          rank_advancement: true,
          team_activity: true,
          payout_processed: true,
          training_completed: true,
          goal_achieved: true,
          system_announcement: true
        }
      }
    } catch (error) {
      console.error('Error getting user preferences:', error)
      // Return default preferences on error
      return {
        userId,
        email: true,
        push: true,
        sms: false,
        inApp: true,
        types: {
          commission_earned: true,
          rank_advancement: true,
          team_activity: true,
          payout_processed: true,
          training_completed: true,
          goal_achieved: true,
          system_announcement: true
        }
      }
    }
  }

  // Update user notification preferences
  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      // In a real implementation, this would save to database
      console.log(`📧 Updated notification preferences for user ${userId}`)
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw error
    }
  }

  // Check if notification should be sent
  private shouldSendNotification(preferences: NotificationPreferences, type: string): boolean {
    const typeKey = type as keyof typeof preferences.types
    return preferences.types[typeKey] ?? true
  }

  // Process message with data
  private processMessage(message: string, data: any): string {
    return message.replace(/\${(\w+)}/g, (match, key) => {
      return data[key]?.toString() || match
    })
  }

  // Get user notifications
  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<MLMNotification[]> {
    try {
      return await this.db.getNotifications(userId, unreadOnly)
    } catch (error) {
      console.error('Error getting user notifications:', error)
      return []
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      // In a real implementation, this would update the database
      console.log(`📧 Marked notification ${notificationId} as read`)
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId: string): Promise<void> {
    try {
      // In a real implementation, this would update the database
      console.log(`📧 Marked all notifications as read for user ${userId}`)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  // Send bulk notifications
  async sendBulkNotifications(
    userIds: string[],
    type: string,
    data: any = {},
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<void> {
    try {
      const promises = userIds.map(userId => 
        this.sendNotification(userId, type, data, priority)
      )
      
      await Promise.allSettled(promises)
      console.log(`📧 Bulk notifications sent to ${userIds.length} users`)
    } catch (error) {
      console.error('Error sending bulk notifications:', error)
      throw error
    }
  }

  // Send system announcement
  async sendSystemAnnouncement(
    message: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'urgent',
    targetUsers?: string[]
  ): Promise<void> {
    try {
      const data = { announcement: message }
      
      if (targetUsers) {
        await this.sendBulkNotifications(targetUsers, 'system_announcement', data, priority)
      } else {
        // Send to all users (would need to get all user IDs)
        console.log(`📢 System announcement: ${message}`)
      }
    } catch (error) {
      console.error('Error sending system announcement:', error)
      throw error
    }
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<any> {
    try {
      const notifications = await this.db.getNotifications(userId)
      const unreadCount = notifications.filter(n => !n.isRead).length
      const totalCount = notifications.length
      
      const byType = notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        total: totalCount,
        unread: unreadCount,
        read: totalCount - unreadCount,
        byType
      }
    } catch (error) {
      console.error('Error getting notification stats:', error)
      return { total: 0, unread: 0, read: 0, byType: {} }
    }
  }

  // Format email notification
  private formatEmailNotification(notification: MLMNotification): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${notification.title}</h2>
        <p style="color: #666; font-size: 16px;">${notification.message}</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
          <p style="margin: 0; font-size: 14px; color: #888;">
            This is an automated notification from your MLM system.
          </p>
        </div>
      </div>
    `
  }
}

// Export singleton instance
export const mlmNotificationSystem = new MLMNotificationSystem()
