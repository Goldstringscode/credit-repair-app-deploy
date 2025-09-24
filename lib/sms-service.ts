import twilio from 'twilio'

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export interface SMSMessage {
  to: string
  body: string
  from?: string
  mediaUrl?: string[]
}

export interface SMSTemplate {
  id: string
  name: string
  body: string
  category: 'credit-repair' | 'mlm' | 'system' | 'marketing' | 'support'
  variables: string[]
  isActive: boolean
  createdAt: string
  lastUsed?: string
  usageCount: number
}

export interface SMSSendResult {
  success: boolean
  messageId?: string
  error?: string
  cost?: number
}

export class SMSService {
  private static instance: SMSService
  private fromNumber: string

  constructor() {
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890'
  }

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService()
    }
    return SMSService.instance
  }

  /**
   * Send a single SMS message
   */
  async sendSMS(message: SMSMessage): Promise<SMSSendResult> {
    try {
      console.log(`📱 Sending SMS to ${message.to}`)
      
      const twilioMessage = await client.messages.create({
        body: message.body,
        from: message.from || this.fromNumber,
        to: message.to,
        mediaUrl: message.mediaUrl
      })

      console.log(`✅ SMS sent successfully: ${twilioMessage.sid}`)
      
      return {
        success: true,
        messageId: twilioMessage.sid,
        cost: parseFloat(twilioMessage.price || '0')
      }
    } catch (error) {
      console.error('❌ Failed to send SMS:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Send SMS to multiple recipients
   */
  async sendBulkSMS(messages: SMSMessage[]): Promise<SMSSendResult[]> {
    console.log(`📱 Sending bulk SMS to ${messages.length} recipients`)
    
    const results = await Promise.allSettled(
      messages.map(message => this.sendSMS(message))
    )

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error(`❌ Failed to send SMS to ${messages[index].to}:`, result.reason)
        return {
          success: false,
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
        }
      }
    })
  }

  /**
   * Send SMS using a template with variable replacement
   */
  async sendTemplateSMS(
    to: string,
    templateId: string,
    variables: Record<string, string> = {}
  ): Promise<SMSSendResult> {
    try {
      const template = await this.getTemplate(templateId)
      if (!template) {
        return {
          success: false,
          error: `Template ${templateId} not found`
        }
      }

      let body = template.body
      
      // Replace template variables
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        body = body.replace(regex, variables[key] || '')
      })

      // Replace common variables with defaults if not provided
      body = body.replace(/{{userName}}/g, variables.userName || 'Valued Customer')
      body = body.replace(/{{companyName}}/g, variables.companyName || 'CreditAI Pro')
      body = body.replace(/{{dashboardUrl}}/g, variables.dashboardUrl || 'https://creditai.com/dashboard')

      return await this.sendSMS({
        to,
        body,
        from: variables.fromNumber
      })
    } catch (error) {
      console.error('❌ Failed to send template SMS:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get SMS template by ID
   */
  async getTemplate(templateId: string): Promise<SMSTemplate | null> {
    // This would typically fetch from a database
    // For now, we'll use the predefined templates
    const templates = await this.getAllTemplates()
    return templates.find(t => t.id === templateId) || null
  }

  /**
   * Get all SMS templates
   */
  async getAllTemplates(): Promise<SMSTemplate[]> {
    return [
      // Credit Repair Templates
      {
        id: 'credit-score-update',
        name: 'Credit Score Update',
        body: '🎉 Great news {{userName}}! Your credit score has improved from {{previousScore}} to {{newScore}} (+{{scoreIncrease}} points). Check your dashboard for details: {{dashboardUrl}}',
        category: 'credit-repair',
        variables: ['userName', 'previousScore', 'newScore', 'scoreIncrease', 'dashboardUrl'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },
      {
        id: 'dispute-letter-ready',
        name: 'Dispute Letter Ready',
        body: '📝 Your dispute letter for {{accountName}} is ready for review. Log in to your dashboard to download and send it: {{dashboardUrl}}',
        category: 'credit-repair',
        variables: ['userName', 'accountName', 'dashboardUrl'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },
      {
        id: 'payment-confirmation',
        name: 'Payment Confirmation',
        body: '💳 Payment of ${{amount}} for {{planName}} confirmed. Thank you {{userName}}! Next billing: {{nextBillingDate}}',
        category: 'credit-repair',
        variables: ['userName', 'amount', 'planName', 'nextBillingDate'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },
      {
        id: 'welcome-credit-repair',
        name: 'Welcome to Credit Repair',
        body: 'Welcome to CreditAI Pro {{userName}}! Your credit repair journey starts now. Complete your profile: {{dashboardUrl}}',
        category: 'credit-repair',
        variables: ['userName', 'dashboardUrl'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },
      {
        id: 'reminder-upload-reports',
        name: 'Upload Reports Reminder',
        body: '📊 Don\'t forget to upload your credit reports {{userName}}! This helps us track your progress: {{dashboardUrl}}',
        category: 'credit-repair',
        variables: ['userName', 'dashboardUrl'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },

      // MLM System Templates
      {
        id: 'mlm-welcome',
        name: 'MLM Welcome',
        body: '🚀 Welcome to our MLM program {{userName}}! Start building your team and earning commissions. Access your dashboard: {{dashboardUrl}}',
        category: 'mlm',
        variables: ['userName', 'dashboardUrl'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },
      {
        id: 'mlm-commission-earned',
        name: 'Commission Earned',
        body: '💰 Congratulations {{userName}}! You earned ${{amount}} in commissions this week. Total earnings: ${{totalEarnings}}',
        category: 'mlm',
        variables: ['userName', 'amount', 'totalEarnings'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },
      {
        id: 'mlm-new-downline',
        name: 'New Downline Member',
        body: '👥 Great news {{userName}}! {{newMemberName}} joined your downline. Your team is growing! Check it out: {{dashboardUrl}}',
        category: 'mlm',
        variables: ['userName', 'newMemberName', 'dashboardUrl'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },
      {
        id: 'mlm-rank-achievement',
        name: 'Rank Achievement',
        body: '🏆 Amazing {{userName}}! You\'ve achieved {{newRank}} rank! This unlocks new benefits and higher commissions.',
        category: 'mlm',
        variables: ['userName', 'newRank'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },
      {
        id: 'mlm-bonus-earned',
        name: 'Bonus Earned',
        body: '🎁 Bonus alert {{userName}}! You earned a ${{bonusAmount}} {{bonusType}} bonus. Keep up the great work!',
        category: 'mlm',
        variables: ['userName', 'bonusAmount', 'bonusType'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },

      // System Templates
      {
        id: 'system-maintenance',
        name: 'System Maintenance',
        body: '🔧 Scheduled maintenance on {{date}} from {{startTime}} to {{endTime}}. Some features may be unavailable.',
        category: 'system',
        variables: ['date', 'startTime', 'endTime'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },
      {
        id: 'security-alert',
        name: 'Security Alert',
        body: '⚠️ Security alert {{userName}}! Unusual activity detected on your account. If this wasn\'t you, contact support immediately.',
        category: 'system',
        variables: ['userName'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },
      {
        id: 'password-reset',
        name: 'Password Reset',
        body: '🔐 Password reset requested for {{userName}}. Use this code: {{resetCode}}. Expires in 10 minutes.',
        category: 'system',
        variables: ['userName', 'resetCode'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },

      // Marketing Templates
      {
        id: 'promotional-offer',
        name: 'Promotional Offer',
        body: '🎯 Special offer {{userName}}! Get {{discount}}% off your next payment. Use code {{promoCode}}. Expires {{expiryDate}}',
        category: 'marketing',
        variables: ['userName', 'discount', 'promoCode', 'expiryDate'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },
      {
        id: 'feature-announcement',
        name: 'Feature Announcement',
        body: '✨ New feature alert {{userName}}! {{featureName}} is now available. Check it out: {{dashboardUrl}}',
        category: 'marketing',
        variables: ['userName', 'featureName', 'dashboardUrl'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },

      // Support Templates
      {
        id: 'support-ticket-created',
        name: 'Support Ticket Created',
        body: '🎫 Support ticket #{{ticketId}} created {{userName}}. We\'ll respond within 24 hours. Track status: {{dashboardUrl}}',
        category: 'support',
        variables: ['userName', 'ticketId', 'dashboardUrl'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      },
      {
        id: 'support-ticket-resolved',
        name: 'Support Ticket Resolved',
        body: '✅ Your support ticket #{{ticketId}} has been resolved {{userName}}. Please rate our service: {{dashboardUrl}}',
        category: 'support',
        variables: ['userName', 'ticketId', 'dashboardUrl'],
        isActive: true,
        createdAt: '2024-01-01',
        usageCount: 0
      }
    ]
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<SMSTemplate[]> {
    const templates = await this.getAllTemplates()
    return templates.filter(t => t.category === category)
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic E.164 format validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    return phoneRegex.test(phoneNumber)
  }

  /**
   * Format phone number to E.164
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '')
    
    // Add +1 if it's a US number without country code
    if (digits.length === 10) {
      return `+1${digits}`
    }
    
    // Add + if it doesn't start with +
    if (!phoneNumber.startsWith('+')) {
      return `+${digits}`
    }
    
    return phoneNumber
  }

  /**
   * Get SMS delivery status
   */
  async getMessageStatus(messageId: string): Promise<any> {
    try {
      const message = await client.messages(messageId).fetch()
      return {
        sid: message.sid,
        status: message.status,
        direction: message.direction,
        from: message.from,
        to: message.to,
        body: message.body,
        dateCreated: message.dateCreated,
        dateUpdated: message.dateUpdated,
        price: message.price,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      }
    } catch (error) {
      console.error('❌ Failed to get message status:', error)
      throw error
    }
  }

  /**
   * Get account usage statistics
   */
  async getUsageStats(): Promise<any> {
    try {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      
      const messages = await client.messages.list({
        dateSentAfter: startOfMonth
      })

      const stats = {
        totalSent: messages.length,
        totalCost: messages.reduce((sum, msg) => sum + parseFloat(msg.price || '0'), 0),
        byStatus: {} as Record<string, number>,
        byDate: {} as Record<string, number>
      }

      messages.forEach(message => {
        // Count by status
        stats.byStatus[message.status] = (stats.byStatus[message.status] || 0) + 1
        
        // Count by date
        const date = message.dateCreated.toISOString().split('T')[0]
        stats.byDate[date] = (stats.byDate[date] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('❌ Failed to get usage stats:', error)
      throw error
    }
  }
}

// Export singleton instance
export const smsService = SMSService.getInstance()
