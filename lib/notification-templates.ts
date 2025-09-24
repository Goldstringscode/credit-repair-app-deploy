export interface NotificationTemplate {
  id: string
  name: string
  description: string
  category: 'credit' | 'training' | 'system' | 'payment' | 'milestone' | 'alert' | 'dispute' | 'fcra' | 'mail'
  type: 'success' | 'info' | 'warning' | 'error'
  priority: 'low' | 'medium' | 'high'
  title: string
  message: string
  icon?: string
  actions?: Array<{
    label: string
    action: string
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  }>
  variables?: string[]
  sound?: string
  vibration?: boolean
  autoExpire?: number // minutes
}

export interface NotificationTemplateData {
  [key: string]: string | number | boolean
}

class NotificationTemplateService {
  private templates: Map<string, NotificationTemplate> = new Map()

  constructor() {
    this.initializeTemplates()
  }

  private initializeTemplates() {
    const templates: NotificationTemplate[] = [
      // Credit Score Templates
      {
        id: 'credit-score-increase',
        name: 'Credit Score Increase',
        description: 'Notifies when credit score increases',
        category: 'credit',
        type: 'success',
        priority: 'high',
        title: 'Credit Score Improved! 📈',
        message: 'Great news! Your {{bureau}} credit score has increased by {{points}} points to {{newScore}}!',
        icon: '📈',
        actions: [
          { label: 'View Report', action: 'view_credit_report', variant: 'default' },
          { label: 'Share Success', action: 'share_achievement', variant: 'outline' }
        ],
        variables: ['bureau', 'points', 'newScore'],
        sound: 'success',
        vibration: true,
        autoExpire: 60
      },
      {
        id: 'credit-score-decrease',
        name: 'Credit Score Decrease',
        description: 'Notifies when credit score decreases',
        category: 'credit',
        type: 'warning',
        priority: 'high',
        title: 'Credit Score Alert ⚠️',
        message: 'Your {{bureau}} credit score has decreased by {{points}} points to {{newScore}}. Let\'s work on improving it!',
        icon: '⚠️',
        actions: [
          { label: 'View Report', action: 'view_credit_report', variant: 'default' },
          { label: 'Get Help', action: 'view_action_plan', variant: 'outline' }
        ],
        variables: ['bureau', 'points', 'newScore'],
        sound: 'warning',
        vibration: true,
        autoExpire: 120
      },
      {
        id: 'credit-score-update',
        name: 'Credit Score Update',
        description: 'General credit score update notification',
        category: 'credit',
        type: 'info',
        priority: 'medium',
        title: 'Credit Score Updated',
        message: 'Your {{bureau}} credit score is now {{newScore}} ({{change}} from last month)',
        icon: '📊',
        actions: [
          { label: 'View Details', action: 'view_credit_report', variant: 'default' }
        ],
        variables: ['bureau', 'newScore', 'change'],
        sound: 'info',
        autoExpire: 30
      },

      // Dispute Templates
      {
        id: 'dispute-submitted',
        name: 'Dispute Submitted',
        description: 'Notifies when a dispute is submitted',
        category: 'dispute',
        type: 'info',
        priority: 'medium',
        title: 'Dispute Submitted Successfully',
        message: 'Your dispute for {{accountName}} has been submitted to {{bureau}}',
        icon: '📝',
        actions: [
          { label: 'Track Progress', action: 'view_dispute_status', variant: 'default' }
        ],
        variables: ['accountName', 'bureau'],
        sound: 'info',
        autoExpire: 60
      },
      {
        id: 'dispute-response-received',
        name: 'Dispute Response Received',
        description: 'Notifies when a dispute response is received',
        category: 'dispute',
        type: 'success',
        priority: 'high',
        title: 'Dispute Response Received!',
        message: '{{bureau}} has responded to your dispute for {{accountName}}: {{result}}',
        icon: '✅',
        actions: [
          { label: 'View Response', action: 'view_dispute_response', variant: 'default' },
          { label: 'Next Steps', action: 'view_action_plan', variant: 'outline' }
        ],
        variables: ['bureau', 'accountName', 'result'],
        sound: 'success',
        vibration: true,
        autoExpire: 120
      },
      {
        id: 'dispute-failed',
        name: 'Dispute Failed',
        description: 'Notifies when a dispute fails',
        category: 'dispute',
        type: 'warning',
        priority: 'high',
        title: 'Dispute Update',
        message: 'Your dispute for {{accountName}} was not successful. {{reason}}',
        icon: '❌',
        actions: [
          { label: 'View Details', action: 'view_dispute_response', variant: 'default' },
          { label: 'Try Again', action: 'resubmit_dispute', variant: 'outline' }
        ],
        variables: ['accountName', 'reason'],
        sound: 'warning',
        vibration: true,
        autoExpire: 180
      },

      // FCRA Templates
      {
        id: 'fcra-complaint-filed',
        name: 'FCRA Complaint Filed',
        description: 'Notifies when an FCRA complaint is filed',
        category: 'fcra',
        type: 'success',
        priority: 'high',
        title: 'FCRA Complaint Filed Successfully',
        message: 'Your FCRA complaint against {{bureau}} has been filed with the CFPB',
        icon: '⚖️',
        actions: [
          { label: 'Track Status', action: 'view_fcra_status', variant: 'default' },
          { label: 'View Complaint', action: 'view_fcra_complaint', variant: 'outline' }
        ],
        variables: ['bureau'],
        sound: 'success',
        vibration: true,
        autoExpire: 120
      },
      {
        id: 'fcra-response-received',
        name: 'FCRA Response Received',
        description: 'Notifies when an FCRA response is received',
        category: 'fcra',
        type: 'info',
        priority: 'high',
        title: 'FCRA Response Received',
        message: '{{bureau}} has responded to your FCRA complaint',
        icon: '📋',
        actions: [
          { label: 'View Response', action: 'view_fcra_response', variant: 'default' }
        ],
        variables: ['bureau'],
        sound: 'info',
        vibration: true,
        autoExpire: 120
      },

      // Payment Templates
      {
        id: 'payment-processed',
        name: 'Payment Processed',
        description: 'Notifies when a payment is processed',
        category: 'payment',
        type: 'success',
        priority: 'medium',
        title: 'Payment Processed Successfully',
        message: 'Your payment of ${{amount}} for {{service}} has been processed',
        icon: '💳',
        actions: [
          { label: 'View Receipt', action: 'view_receipt', variant: 'default' }
        ],
        variables: ['amount', 'service'],
        sound: 'success',
        autoExpire: 30
      },
      {
        id: 'payment-failed',
        name: 'Payment Failed',
        description: 'Notifies when a payment fails',
        category: 'payment',
        type: 'error',
        priority: 'high',
        title: 'Payment Failed',
        message: 'Your payment of ${{amount}} for {{service}} could not be processed. {{reason}}',
        icon: '❌',
        actions: [
          { label: 'Retry Payment', action: 'retry_payment', variant: 'default' },
          { label: 'Update Card', action: 'update_payment_method', variant: 'outline' }
        ],
        variables: ['amount', 'service', 'reason'],
        sound: 'error',
        vibration: true,
        autoExpire: 180
      },

      // Training Templates
      {
        id: 'lesson-completed',
        name: 'Lesson Completed',
        description: 'Notifies when a lesson is completed',
        category: 'training',
        type: 'success',
        priority: 'medium',
        title: 'Lesson Completed! ✅',
        message: 'Great job! You\'ve completed "{{lessonTitle}}" in {{courseTitle}}',
        icon: '✅',
        actions: [
          { label: 'Next Lesson', action: 'start_next_lesson', variant: 'default' },
          { label: 'View Progress', action: 'view_course_progress', variant: 'outline' }
        ],
        variables: ['lessonTitle', 'courseTitle'],
        sound: 'success',
        vibration: true,
        autoExpire: 30
      },
      {
        id: 'course-completed',
        name: 'Course Completed',
        description: 'Notifies when a course is completed',
        category: 'training',
        type: 'success',
        priority: 'medium',
        title: 'Course Completed! 🎉',
        message: 'Congratulations! You\'ve completed the {{courseName}} course',
        icon: '🎓',
        actions: [
          { label: 'View Certificate', action: 'view_certificate', variant: 'default' },
          { label: 'Next Course', action: 'start_next_course', variant: 'outline' }
        ],
        variables: ['courseName'],
        sound: 'success',
        vibration: true,
        autoExpire: 60
      },
      {
        id: 'quiz-completed',
        name: 'Quiz Completed',
        description: 'Notifies when a quiz is completed',
        category: 'training',
        type: 'info',
        priority: 'low',
        title: 'Quiz Completed',
        message: 'You scored {{score}}% on the {{quizName}} quiz',
        icon: '📝',
        actions: [
          { label: 'View Results', action: 'view_quiz_results', variant: 'default' }
        ],
        variables: ['score', 'quizName'],
        sound: 'info',
        autoExpire: 30
      },
      {
        id: 'milestone-achieved',
        name: 'Milestone Achieved',
        description: 'Notifies when a milestone is achieved',
        category: 'milestone',
        type: 'success',
        priority: 'medium',
        title: 'Milestone Achieved! 🏆',
        message: '{{milestoneTitle}} - {{description}}',
        icon: '🏆',
        actions: [
          { label: 'View Progress', action: 'view_progress', variant: 'default' },
          { label: 'Continue Learning', action: 'continue_learning', variant: 'outline' }
        ],
        variables: ['milestoneTitle', 'description'],
        sound: 'success',
        vibration: true,
        autoExpire: 60
      },
      {
        id: 'achievement-unlocked',
        name: 'Achievement Unlocked',
        description: 'Notifies when an achievement is unlocked',
        category: 'milestone',
        type: 'success',
        priority: 'medium',
        title: 'Achievement Unlocked! 🏆',
        message: 'You\'ve unlocked the {{achievementName}} achievement!',
        icon: '🏆',
        actions: [
          { label: 'View Achievement', action: 'view_achievement', variant: 'default' },
          { label: 'Share', action: 'share_achievement', variant: 'outline' }
        ],
        variables: ['achievementName'],
        sound: 'success',
        vibration: true,
        autoExpire: 60
      },

      // Mail Templates
      {
        id: 'certified-mail-sent',
        name: 'Certified Mail Sent',
        description: 'Notifies when certified mail is sent',
        category: 'mail',
        type: 'info',
        priority: 'medium',
        title: 'Certified Mail Sent',
        message: 'Your certified mail to {{bureau}} has been sent (Tracking: {{trackingNumber}})',
        icon: '📮',
        actions: [
          { label: 'Track Mail', action: 'track_mail', variant: 'default' }
        ],
        variables: ['bureau', 'trackingNumber'],
        sound: 'info',
        autoExpire: 60
      },
      {
        id: 'certified-mail-delivered',
        name: 'Certified Mail Delivered',
        description: 'Notifies when certified mail is delivered',
        category: 'mail',
        type: 'success',
        priority: 'high',
        title: 'Certified Mail Delivered!',
        message: 'Your certified mail to {{bureau}} was delivered and signed for',
        icon: '✅',
        actions: [
          { label: 'View Proof', action: 'view_delivery_proof', variant: 'default' }
        ],
        variables: ['bureau'],
        sound: 'success',
        vibration: true,
        autoExpire: 120
      },

      // System Templates
      {
        id: 'system-maintenance',
        name: 'System Maintenance',
        description: 'Notifies about system maintenance',
        category: 'system',
        type: 'info',
        priority: 'low',
        title: 'Scheduled Maintenance',
        message: 'System maintenance will occur {{maintenanceTime}}',
        icon: '🔧',
        actions: [
          { label: 'View Details', action: 'view_maintenance_details', variant: 'default' }
        ],
        variables: ['maintenanceTime'],
        sound: 'info',
        autoExpire: 30
      },
      {
        id: 'feature-update',
        name: 'Feature Update',
        description: 'Notifies about new features',
        category: 'system',
        type: 'info',
        priority: 'low',
        title: 'New Feature Available!',
        message: 'Check out the new {{featureName}} feature',
        icon: '✨',
        actions: [
          { label: 'Learn More', action: 'view_feature_update', variant: 'default' }
        ],
        variables: ['featureName'],
        sound: 'info',
        autoExpire: 60
      },

      // Alert Templates
      {
        id: 'account-alert',
        name: 'Account Alert',
        description: 'General account alerts',
        category: 'alert',
        type: 'warning',
        priority: 'high',
        title: 'Account Alert',
        message: '{{alertMessage}}',
        icon: '⚠️',
        actions: [
          { label: 'View Details', action: 'view_alert_details', variant: 'default' }
        ],
        variables: ['alertMessage'],
        sound: 'warning',
        vibration: true,
        autoExpire: 120
      },
      {
        id: 'security-alert',
        name: 'Security Alert',
        description: 'Security-related alerts',
        category: 'alert',
        type: 'error',
        priority: 'high',
        title: 'Security Alert',
        message: '{{securityMessage}}',
        icon: '🔒',
        actions: [
          { label: 'Secure Account', action: 'secure_account', variant: 'default' }
        ],
        variables: ['securityMessage'],
        sound: 'error',
        vibration: true,
        autoExpire: 180
      }
    ]

    // Store templates in map
    templates.forEach(template => {
      this.templates.set(template.id, template)
    })

    console.log(`📋 Initialized ${templates.length} notification templates`)
  }

  /**
   * Get all templates
   */
  getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): NotificationTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.category === category)
  }

  /**
   * Get a specific template
   */
  getTemplate(templateId: string): NotificationTemplate | undefined {
    return this.templates.get(templateId)
  }

  /**
   * Generate a notification from a template
   */
  generateNotification(
    templateId: string,
    data: NotificationTemplateData = {},
    userId: string
  ): any {
    const template = this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Replace variables in title and message
    let title = template.title
    let message = template.message

    // Replace variables with data
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      title = title.replace(new RegExp(placeholder, 'g'), String(value))
      message = message.replace(new RegExp(placeholder, 'g'), String(value))
    })

    // Generate notification object
    const notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      type: template.type,
      priority: template.priority,
      timestamp: new Date().toISOString(),
      read: false,
      category: template.category,
      templateId: template.id,
      icon: template.icon,
      sound: template.sound,
      vibration: template.vibration,
      autoExpire: template.autoExpire,
      actions: template.actions,
      data: data
    }

    return notification
  }

  /**
   * Add a new template
   */
  addTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template)
    console.log(`📋 Added new template: ${template.id}`)
  }

  /**
   * Update an existing template
   */
  updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): boolean {
    const template = this.templates.get(templateId)
    if (!template) {
      return false
    }

    const updatedTemplate = { ...template, ...updates }
    this.templates.set(templateId, updatedTemplate)
    console.log(`📋 Updated template: ${templateId}`)
    return true
  }

  /**
   * Remove a template
   */
  removeTemplate(templateId: string): boolean {
    const deleted = this.templates.delete(templateId)
    if (deleted) {
      console.log(`📋 Removed template: ${templateId}`)
    }
    return deleted
  }

  /**
   * Get template statistics
   */
  getStats(): {
    totalTemplates: number
    templatesByCategory: Record<string, number>
    templatesByType: Record<string, number>
    templatesByPriority: Record<string, number>
  } {
    const templates = Array.from(this.templates.values())
    
    const templatesByCategory = templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const templatesByType = templates.reduce((acc, template) => {
      acc[template.type] = (acc[template.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const templatesByPriority = templates.reduce((acc, template) => {
      acc[template.priority] = (acc[template.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalTemplates: templates.length,
      templatesByCategory,
      templatesByType,
      templatesByPriority
    }
  }
}

export { NotificationTemplateService }
export const notificationTemplateService = new NotificationTemplateService()