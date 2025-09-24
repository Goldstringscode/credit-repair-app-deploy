// Email scheduling and automation system
import { sendCreditRepairTemplateEmail } from './email-service'

export interface ScheduledEmail {
  id: string
  templateId: string
  recipientEmail: string
  recipientName: string
  variables: Record<string, any>
  scheduledFor: Date
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  createdAt: Date
  sentAt?: Date
  errorMessage?: string
  retryCount: number
  maxRetries: number
}

export interface EmailAutomation {
  id: string
  name: string
  description: string
  trigger: 'user_signup' | 'payment_success' | 'credit_score_improvement' | 'dispute_letter_ready' | 'onboarding_step' | 'custom'
  triggerConditions: Record<string, any>
  templateId: string
  delayMinutes: number
  isActive: boolean
  createdAt: Date
  lastTriggered?: Date
  triggerCount: number
}

class EmailScheduler {
  private scheduledEmails: Map<string, ScheduledEmail> = new Map()
  private automations: Map<string, EmailAutomation> = new Map()
  private intervalId: NodeJS.Timeout | null = null

  constructor() {
    this.startScheduler()
    this.initializeDefaultAutomations()
  }

  private startScheduler() {
    // Check for scheduled emails every minute
    this.intervalId = setInterval(() => {
      this.processScheduledEmails()
    }, 60000) // 1 minute

    console.log('📅 Email scheduler started')
  }

  private async processScheduledEmails() {
    const now = new Date()
    const pendingEmails = Array.from(this.scheduledEmails.values())
      .filter(email => 
        email.status === 'pending' && 
        email.scheduledFor <= now
      )

    for (const email of pendingEmails) {
      try {
        await this.sendScheduledEmail(email)
      } catch (error) {
        console.error(`❌ Failed to send scheduled email ${email.id}:`, error)
        this.handleEmailFailure(email, error)
      }
    }
  }

  private async sendScheduledEmail(email: ScheduledEmail) {
    console.log(`📧 Sending scheduled email: ${email.id}`)
    
    try {
      const result = await sendCreditRepairTemplateEmail({
        to: email.recipientEmail,
        subject: `Scheduled: ${email.templateId}`,
        htmlContent: this.generateEmailContent(email.templateId, email.variables),
        textContent: this.generateTextContent(email.templateId, email.variables)
      })

      // Update email status
      email.status = 'sent'
      email.sentAt = new Date()
      this.scheduledEmails.set(email.id, email)

      console.log(`✅ Scheduled email sent successfully: ${email.id}`)
    } catch (error) {
      throw error
    }
  }

  private handleEmailFailure(email: ScheduledEmail, error: any) {
    email.retryCount++
    email.errorMessage = error.message

    if (email.retryCount >= email.maxRetries) {
      email.status = 'failed'
      console.error(`❌ Email ${email.id} failed after ${email.maxRetries} retries`)
    } else {
      // Reschedule for retry in 5 minutes
      email.scheduledFor = new Date(Date.now() + 5 * 60 * 1000)
      console.log(`🔄 Retrying email ${email.id} in 5 minutes (attempt ${email.retryCount + 1})`)
    }

    this.scheduledEmails.set(email.id, email)
  }

  private generateEmailContent(templateId: string, variables: Record<string, any>): string {
    // Simple template content generation
    const templates: Record<string, string> = {
      'welcome-new-user': `
        <!DOCTYPE html>
        <html>
        <head><title>Welcome to CreditAI Pro</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
            <h1>🎉 Welcome to CreditAI Pro!</h1>
            <p>Hello ${variables.userName || 'Valued Customer'},</p>
            <p>Thank you for joining us! Your credit repair journey starts now.</p>
            <a href="${variables.dashboardUrl || '#'}" style="background: white; color: #667eea; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Access Dashboard</a>
          </div>
        </body>
        </html>
      `,
      'payment-success': `
        <!DOCTYPE html>
        <html>
        <head><title>Payment Confirmation</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
            <h1>💳 Payment Confirmed!</h1>
            <p>Hello ${variables.userName || 'Valued Customer'},</p>
            <p>Your payment of $${variables.amount || '0.00'} has been processed successfully.</p>
            <p>Thank you for your continued trust in CreditAI Pro!</p>
          </div>
        </body>
        </html>
      `,
      'credit-score-improvement': `
        <!DOCTYPE html>
        <html>
        <head><title>Credit Score Improvement</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
            <h1>📈 Congratulations!</h1>
            <p>Hello ${variables.userName || 'Valued Customer'},</p>
            <p>Your credit score has improved by ${variables.scoreIncrease || '0'} points!</p>
            <p>New Score: ${variables.newScore || 'N/A'}</p>
            <p>Keep up the great work!</p>
          </div>
        </body>
        </html>
      `
    }

    return templates[templateId] || `
      <!DOCTYPE html>
      <html>
      <head><title>CreditAI Pro Notification</title></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1>CreditAI Pro Notification</h1>
          <p>Hello ${variables.userName || 'Valued Customer'},</p>
          <p>This is an automated email from CreditAI Pro.</p>
        </div>
      </body>
      </html>
    `
  }

  private generateTextContent(templateId: string, variables: Record<string, any>): string {
    const templates: Record<string, string> = {
      'welcome-new-user': `Welcome to CreditAI Pro!\n\nHello ${variables.userName || 'Valued Customer'},\n\nThank you for joining us! Your credit repair journey starts now.\n\nAccess your dashboard: ${variables.dashboardUrl || '#'}`,
      'payment-success': `Payment Confirmation\n\nHello ${variables.userName || 'Valued Customer'},\n\nYour payment of $${variables.amount || '0.00'} has been processed successfully.\n\nThank you for your continued trust in CreditAI Pro!`,
      'credit-score-improvement': `Congratulations!\n\nHello ${variables.userName || 'Valued Customer'},\n\nYour credit score has improved by ${variables.scoreIncrease || '0'} points!\n\nNew Score: ${variables.newScore || 'N/A'}\n\nKeep up the great work!`
    }

    return templates[templateId] || `CreditAI Pro Notification\n\nHello ${variables.userName || 'Valued Customer'},\n\nThis is an automated email from CreditAI Pro.`
  }

  private initializeDefaultAutomations() {
    const defaultAutomations: EmailAutomation[] = [
      {
        id: 'welcome-automation',
        name: 'Welcome New User',
        description: 'Send welcome email to new users',
        trigger: 'user_signup',
        triggerConditions: {},
        templateId: 'welcome-new-user',
        delayMinutes: 0,
        isActive: true,
        createdAt: new Date(),
        triggerCount: 0
      },
      {
        id: 'payment-confirmation',
        name: 'Payment Confirmation',
        description: 'Send payment confirmation email',
        trigger: 'payment_success',
        triggerConditions: {},
        templateId: 'payment-success',
        delayMinutes: 0,
        isActive: true,
        createdAt: new Date(),
        triggerCount: 0
      },
      {
        id: 'credit-score-celebration',
        name: 'Credit Score Improvement',
        description: 'Celebrate credit score improvements',
        trigger: 'credit_score_improvement',
        triggerConditions: { minImprovement: 10 },
        templateId: 'credit-score-improvement',
        delayMinutes: 0,
        isActive: true,
        createdAt: new Date(),
        triggerCount: 0
      },
      {
        id: 'onboarding-reminder',
        name: 'Onboarding Reminder',
        description: 'Remind users to complete onboarding',
        trigger: 'onboarding_step',
        triggerConditions: { step: 1, delayDays: 3 },
        templateId: 'onboarding-step-1',
        delayMinutes: 4320, // 3 days
        isActive: true,
        createdAt: new Date(),
        triggerCount: 0
      }
    ]

    defaultAutomations.forEach(automation => {
      this.automations.set(automation.id, automation)
    })

    console.log(`📋 Initialized ${defaultAutomations.length} email automations`)
  }

  // Public methods
  public scheduleEmail(email: Omit<ScheduledEmail, 'id' | 'createdAt' | 'status' | 'retryCount'>): string {
    const id = `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const scheduledEmail: ScheduledEmail = {
      ...email,
      id,
      createdAt: new Date(),
      status: 'pending',
      retryCount: 0
    }

    this.scheduledEmails.set(id, scheduledEmail)
    console.log(`📅 Email scheduled: ${id} for ${email.scheduledFor}`)
    return id
  }

  public triggerAutomation(automationId: string, recipientEmail: string, recipientName: string, variables: Record<string, any> = {}) {
    const automation = this.automations.get(automationId)
    if (!automation || !automation.isActive) {
      console.log(`⚠️ Automation ${automationId} not found or inactive`)
      return null
    }

    const scheduledFor = new Date(Date.now() + automation.delayMinutes * 60 * 1000)
    
    const emailId = this.scheduleEmail({
      templateId: automation.templateId,
      recipientEmail,
      recipientName,
      variables,
      scheduledFor,
      maxRetries: 3
    })

    // Update automation stats
    automation.lastTriggered = new Date()
    automation.triggerCount++
    this.automations.set(automationId, automation)

    console.log(`🎯 Automation triggered: ${automationId} -> ${emailId}`)
    return emailId
  }

  public getScheduledEmails(): ScheduledEmail[] {
    return Array.from(this.scheduledEmails.values())
  }

  public getAutomations(): EmailAutomation[] {
    return Array.from(this.automations.values())
  }

  public cancelEmail(emailId: string): boolean {
    const email = this.scheduledEmails.get(emailId)
    if (email && email.status === 'pending') {
      email.status = 'cancelled'
      this.scheduledEmails.set(emailId, email)
      console.log(`❌ Email cancelled: ${emailId}`)
      return true
    }
    return false
  }

  public getEmailStatus(emailId: string): ScheduledEmail | null {
    return this.scheduledEmails.get(emailId) || null
  }

  public destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    console.log('📅 Email scheduler stopped')
  }
}

// Singleton instance
export const emailScheduler = new EmailScheduler()

// API functions
export const scheduleEmail = (email: Omit<ScheduledEmail, 'id' | 'createdAt' | 'status' | 'retryCount'>) => {
  return emailScheduler.scheduleEmail(email)
}

export const triggerAutomation = (automationId: string, recipientEmail: string, recipientName: string, variables: Record<string, any> = {}) => {
  return emailScheduler.triggerAutomation(automationId, recipientEmail, recipientName, variables)
}

export const getScheduledEmails = () => {
  return emailScheduler.getScheduledEmails()
}

export const getAutomations = () => {
  return emailScheduler.getAutomations()
}

export const cancelEmail = (emailId: string) => {
  return emailScheduler.cancelEmail(emailId)
}

export const getEmailStatus = (emailId: string) => {
  return emailScheduler.getEmailStatus(emailId)
}
