import { auditLogger } from './audit-logger'
import { dunningEmailTemplates } from './dunning-email-templates'

export interface DunningEvent {
  id: string
  subscriptionId: string
  customerId: string
  attemptNumber: number
  eventType: 'payment_failed' | 'payment_retry' | 'payment_succeeded' | 'subscription_canceled'
  amount: number
  currency: string
  failureReason?: string
  nextRetryAt?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface DunningRule {
  id: string
  name: string
  description: string
  isActive: boolean
  maxAttempts: number
  retryIntervals: number[] // Days between retries
  actions: DunningAction[]
  conditions: DunningCondition[]
}

export interface DunningAction {
  type: 'email_notification' | 'sms_notification' | 'webhook' | 'suspend_subscription' | 'cancel_subscription'
  config: Record<string, any>
  delayDays?: number
}

export interface DunningCondition {
  field: 'failure_reason' | 'amount' | 'customer_type' | 'subscription_age'
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
  value: any
}

export interface DunningCampaign {
  id: string
  name: string
  description: string
  ruleId: string
  isActive: boolean
  startDate: string
  endDate?: string
  statistics: {
    totalEvents: number
    successfulPayments: number
    failedPayments: number
    canceledSubscriptions: number
    successRate: number
  }
}

export class DunningManager {
  private events: Map<string, DunningEvent> = new Map()
  private rules: Map<string, DunningRule> = new Map()
  private campaigns: Map<string, DunningCampaign> = new Map()

  constructor() {
    this.initializeDefaultRules()
  }

  /**
   * Initialize default dunning rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: DunningRule[] = [
      {
        id: 'standard_dunning',
        name: 'Standard Dunning Process',
        description: 'Standard 3-attempt dunning process with email notifications',
        isActive: true,
        maxAttempts: 3,
        retryIntervals: [1, 3, 7], // 1 day, 3 days, 7 days
        actions: [
          {
            type: 'email_notification',
            config: {
              template: 'payment_failed_1',
              subject: 'Payment Failed - Action Required'
            },
            delayDays: 0
          },
          {
            type: 'email_notification',
            config: {
              template: 'payment_failed_2',
              subject: 'Payment Failed - Final Notice'
            },
            delayDays: 3
          },
          {
            type: 'email_notification',
            config: {
              template: 'payment_failed_3',
              subject: 'Subscription Suspended - Payment Required'
            },
            delayDays: 7
          },
          {
            type: 'suspend_subscription',
            config: {},
            delayDays: 10
          }
        ],
        conditions: []
      },
      {
        id: 'aggressive_dunning',
        name: 'Aggressive Dunning Process',
        description: 'Faster dunning process for high-value customers',
        isActive: true,
        maxAttempts: 2,
        retryIntervals: [1, 2],
        actions: [
          {
            type: 'email_notification',
            config: {
              template: 'payment_failed_urgent',
              subject: 'URGENT: Payment Failed - Immediate Action Required'
            },
            delayDays: 0
          },
          {
            type: 'sms_notification',
            config: {
              template: 'payment_failed_sms',
              message: 'Your subscription payment failed. Please update your payment method immediately.'
            },
            delayDays: 1
          },
          {
            type: 'cancel_subscription',
            config: {},
            delayDays: 3
          }
        ],
        conditions: [
          {
            field: 'amount',
            operator: 'greater_than',
            value: 5000 // $50.00 in cents
          }
        ]
      }
    ]

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule)
    })
  }

  /**
   * Process a payment failure
   */
  async processPaymentFailure(
    subscriptionId: string,
    customerId: string,
    amount: number,
    currency: string,
    failureReason: string,
    metadata: Record<string, any> = {}
  ): Promise<DunningEvent> {
    try {
      // Find applicable dunning rule
      const rule = this.findApplicableRule(amount, failureReason, metadata)
      if (!rule) {
        throw new Error('No applicable dunning rule found')
      }

      // Get existing events for this subscription
      const existingEvents = Array.from(this.events.values())
        .filter(event => event.subscriptionId === subscriptionId)
        .sort((a, b) => b.attemptNumber - a.attemptNumber)

      const attemptNumber = existingEvents.length > 0 ? existingEvents[0].attemptNumber + 1 : 1

      // Check if we've exceeded max attempts
      if (attemptNumber > rule.maxAttempts) {
        // Create final event and cancel subscription
        const finalEvent = await this.createDunningEvent({
          subscriptionId,
          customerId,
          amount,
          currency,
          attemptNumber,
          eventType: 'subscription_canceled',
          failureReason,
          status: 'completed',
          metadata: { ...metadata, reason: 'max_attempts_exceeded' }
        })

        await this.executeActions(rule, finalEvent, attemptNumber)
        return finalEvent
      }

      // Create dunning event
      const event = await this.createDunningEvent({
        subscriptionId,
        customerId,
        amount,
        currency,
        attemptNumber,
        eventType: 'payment_failed',
        failureReason,
        status: 'pending',
        metadata
      })

      // Schedule next retry
      const retryInterval = rule.retryIntervals[attemptNumber - 1] || rule.retryIntervals[rule.retryIntervals.length - 1]
      const nextRetryAt = new Date(Date.now() + retryInterval * 24 * 60 * 60 * 1000)
      
      event.nextRetryAt = nextRetryAt.toISOString()
      this.events.set(event.id, event)

      // Execute actions for this attempt
      await this.executeActions(rule, event, attemptNumber)

      // Log dunning event
      try {
        auditLogger.log({
          userId: customerId,
          ipAddress: 'system',
          userAgent: 'system',
          action: 'dunning_event_created',
          resource: 'dunning',
          method: 'POST',
          endpoint: '/api/dunning/events',
          statusCode: 200,
          severity: 'medium',
          category: 'billing',
          metadata: {
            eventId: event.id,
            subscriptionId: subscriptionId,
            attemptNumber: attemptNumber,
            ruleId: rule.id
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

      console.log(`🔔 Created dunning event ${event.id} for subscription ${subscriptionId} (attempt ${attemptNumber})`)
      return event

    } catch (error: any) {
      console.error('❌ Dunning event creation failed:', error)
      throw new Error(`Dunning event creation failed: ${error.message}`)
    }
  }

  /**
   * Process a successful payment
   */
  async processPaymentSuccess(
    subscriptionId: string,
    customerId: string,
    amount: number,
    currency: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Create success event
      const event = await this.createDunningEvent({
        subscriptionId,
        customerId,
        amount,
        currency,
        attemptNumber: 0,
        eventType: 'payment_succeeded',
        status: 'completed',
        metadata
      })

      // Cancel any pending dunning events for this subscription
      const pendingEvents = Array.from(this.events.values())
        .filter(event => 
          event.subscriptionId === subscriptionId && 
          event.status === 'pending'
        )

      for (const pendingEvent of pendingEvents) {
        pendingEvent.status = 'completed'
        pendingEvent.updatedAt = new Date().toISOString()
        this.events.set(pendingEvent.id, pendingEvent)
      }

      console.log(`✅ Payment succeeded for subscription ${subscriptionId}, canceled ${pendingEvents.length} pending dunning events`)

    } catch (error: any) {
      console.error('❌ Payment success processing failed:', error)
      throw new Error(`Payment success processing failed: ${error.message}`)
    }
  }

  /**
   * Create dunning event
   */
  private async createDunningEvent(data: {
    subscriptionId: string
    customerId: string
    amount: number
    currency: string
    attemptNumber: number
    eventType: DunningEvent['eventType']
    failureReason?: string
    status: DunningEvent['status']
    metadata: Record<string, any>
  }): Promise<DunningEvent> {
    const now = new Date()
    const event: DunningEvent = {
      id: `dunning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subscriptionId: data.subscriptionId,
      customerId: data.customerId,
      attemptNumber: data.attemptNumber,
      eventType: data.eventType,
      amount: data.amount,
      currency: data.currency,
      failureReason: data.failureReason,
      status: data.status,
      metadata: data.metadata,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }

    this.events.set(event.id, event)
    return event
  }

  /**
   * Find applicable dunning rule
   */
  private findApplicableRule(
    amount: number,
    failureReason: string,
    metadata: Record<string, any>
  ): DunningRule | null {
    const rules = Array.from(this.rules.values()).filter(rule => rule.isActive)

    for (const rule of rules) {
      if (this.evaluateConditions(rule.conditions, { amount, failureReason, metadata })) {
        return rule
      }
    }

    return rules[0] || null // Return first active rule as default
  }

  /**
   * Evaluate dunning conditions
   */
  private evaluateConditions(
    conditions: DunningCondition[],
    context: Record<string, any>
  ): boolean {
    if (conditions.length === 0) return true

    return conditions.every(condition => {
      const fieldValue = context[condition.field]
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value
        case 'not_equals':
          return fieldValue !== condition.value
        case 'greater_than':
          return fieldValue > condition.value
        case 'less_than':
          return fieldValue < condition.value
        case 'contains':
          return String(fieldValue).includes(String(condition.value))
        default:
          return false
      }
    })
  }

  /**
   * Execute dunning actions
   */
  private async executeActions(
    rule: DunningRule,
    event: DunningEvent,
    attemptNumber: number
  ): Promise<void> {
    const applicableActions = rule.actions.filter(action => {
      if (action.delayDays === undefined) return true
      return action.delayDays <= attemptNumber
    })

    for (const action of applicableActions) {
      try {
        await this.executeAction(action, event)
      } catch (error) {
        console.error(`❌ Failed to execute action ${action.type}:`, error)
      }
    }
  }

  /**
   * Execute individual dunning action
   */
  private async executeAction(action: DunningAction, event: DunningEvent): Promise<void> {
    switch (action.type) {
      case 'email_notification':
        await this.sendEmailNotification(event, action.config)
        break
      case 'sms_notification':
        await this.sendSMSNotification(event, action.config)
        break
      case 'webhook':
        await this.sendWebhook(event, action.config)
        break
      case 'suspend_subscription':
        await this.suspendSubscription(event.subscriptionId)
        break
      case 'cancel_subscription':
        await this.cancelSubscription(event.subscriptionId)
        break
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(event: DunningEvent, config: any): Promise<void> {
    console.log(`📧 Sending email notification for event ${event.id}`)
    // In a real implementation, this would integrate with an email service
    // For now, we'll just log the action
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(event: DunningEvent, config: any): Promise<void> {
    console.log(`📱 Sending SMS notification for event ${event.id}`)
    // In a real implementation, this would integrate with an SMS service
  }

  /**
   * Send webhook
   */
  private async sendWebhook(event: DunningEvent, config: any): Promise<void> {
    console.log(`🔗 Sending webhook for event ${event.id}`)
    // In a real implementation, this would send HTTP requests to configured webhooks
  }


  /**
   * Cancel subscription
   */

  /**
   * Get all dunning events
   */
  async getAllEvents(): Promise<DunningEvent[]> {
    return Array.from(this.events.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  /**
   * Get dunning events for subscription
   */
  async getSubscriptionEvents(subscriptionId: string): Promise<DunningEvent[]> {
    return Array.from(this.events.values())
      .filter(event => event.subscriptionId === subscriptionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  /**
   * Get a specific dunning event by ID
   */
  async getEvent(eventId: string): Promise<DunningEvent | null> {
    return this.events.get(eventId) || null
  }

  /**
   * Get dunning analytics
   */
  async getDunningAnalytics(): Promise<{
    totalEvents: number
    activeEvents: number
    successfulRecoveries: number
    failedRecoveries: number
    recoveryRate: number
    averageAttemptsToRecovery: number
  }> {
    const events = Array.from(this.events.values())
    const activeEvents = events.filter(event => event.status === 'pending')
    const successEvents = events.filter(event => event.eventType === 'payment_succeeded')
    const failedEvents = events.filter(event => event.eventType === 'subscription_canceled')
    
    const recoveryRate = events.length > 0 ? (successEvents.length / events.length) * 100 : 0
    
    const recoveryEvents = events.filter(event => event.eventType === 'payment_succeeded')
    const averageAttemptsToRecovery = recoveryEvents.length > 0 
      ? recoveryEvents.reduce((sum, event) => sum + event.attemptNumber, 0) / recoveryEvents.length
      : 0

    return {
      totalEvents: events.length,
      activeEvents: activeEvents.length,
      successfulRecoveries: successEvents.length,
      failedRecoveries: failedEvents.length,
      recoveryRate,
      averageAttemptsToRecovery
    }
  }

  /**
   * Get dunning statistics
   */
  async getDunningStatistics(): Promise<{
    totalEvents: number
    activeEvents: number
    successfulRecoveries: number
    failedRecoveries: number
    recoveryRate: number
    averageAttemptsToRecovery: number
  }> {
    return this.getDunningAnalytics()
  }

  /**
   * Send dunning email
   */
  async sendDunningEmail(
    customerEmail: string,
    templateId: string,
    variables: Record<string, string>
  ): Promise<boolean> {
    try {
      console.log(`📧 Sending dunning email: ${templateId} to ${customerEmail}`)
      
      // Render email template
      const emailContent = dunningEmailTemplates.renderTemplate(templateId, variables)
      if (!emailContent) {
        throw new Error(`Email template not found: ${templateId}`)
      }

      // In a real implementation, this would send via email service
      // For now, we'll simulate sending
      console.log('📧 Email would be sent:', {
        to: customerEmail,
        subject: emailContent.subject,
        templateId
      })

      // Log email sending
      try {
        auditLogger.log({
          userId: customerEmail,
          ipAddress: 'system',
          userAgent: 'system',
          action: 'dunning_email_sent',
          resource: 'email',
          method: 'POST',
          endpoint: '/api/dunning/email',
          statusCode: 200,
          severity: 'medium',
          category: 'dunning',
          metadata: {
            templateId,
            customerEmail,
            subject: emailContent.subject
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

      return true

    } catch (error: any) {
      console.error('❌ Dunning email sending failed:', error)
      return false
    }
  }

  /**
   * Retry failed payment
   */
  async retryPayment(subscriptionId: string, paymentMethodId: string): Promise<boolean> {
    try {
      console.log(`💳 Retrying payment for subscription: ${subscriptionId}`)
      
      // Import Stripe payment service
      const { stripePaymentService } = await import('./stripe/payments')
      
      // Get subscription details
      const { subscriptionManager } = await import('./subscription-manager')
      const subscription = subscriptionManager.getSubscription(subscriptionId)
      if (!subscription) {
        throw new Error('Subscription not found')
      }

      // Get plan details
      const plan = subscriptionManager.getPlan(subscription.planId)
      if (!plan) {
        throw new Error('Plan not found')
      }

      // Create payment intent
      const paymentIntent = await stripePaymentService.createPaymentIntent({
        amount: plan.amount * subscription.quantity,
        currency: plan.currency,
        customerId: subscription.customerId,
        paymentMethodId: paymentMethodId,
        metadata: {
          subscriptionId,
          dunningRetry: 'true'
        },
        description: `Retry payment for ${plan.name} subscription`
      })

      // Confirm payment intent
      const confirmedPayment = await stripePaymentService.confirmPaymentIntent(
        paymentIntent.id,
        paymentMethodId
      )

      if (confirmedPayment.status === 'succeeded') {
        // Create success event
        const successEvent: DunningEvent = {
          id: `dunning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          subscriptionId,
          customerId: subscription.customerId,
          attemptNumber: 0, // This is a retry, not a new attempt
          eventType: 'payment_succeeded',
          amount: plan.amount * subscription.quantity,
          currency: plan.currency,
          status: 'completed',
          metadata: {
            paymentIntentId: confirmedPayment.id,
            retryAttempt: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        this.events.set(successEvent.id, successEvent)
        
        console.log(`✅ Payment retry successful: ${subscriptionId}`)
        return true
      } else {
        throw new Error(`Payment retry failed: ${confirmedPayment.status}`)
      }

    } catch (error: any) {
      console.error('❌ Payment retry failed:', error)
      return false
    }
  }

  /**
   * Suspend subscription due to payment failure
   */
  async suspendSubscription(subscriptionId: string, reason: string = 'Payment failure'): Promise<boolean> {
    try {
      console.log(`⏸️ Suspending subscription: ${subscriptionId}`)
      
      const { subscriptionManager } = await import('./subscription-manager')
      const subscription = subscriptionManager.getSubscription(subscriptionId)
      if (!subscription) {
        throw new Error('Subscription not found')
      }

      // Pause subscription
      await subscriptionManager.pauseSubscription(subscriptionId, {
        reason: reason
      })

      console.log(`✅ Subscription suspended: ${subscriptionId}`)
      return true

    } catch (error: any) {
      console.error('❌ Subscription suspension failed:', error)
      return false
    }
  }

  /**
   * Cancel subscription due to persistent payment failure
   */
  async cancelSubscription(subscriptionId: string, reason: string = 'Persistent payment failure'): Promise<boolean> {
    try {
      console.log(`❌ Canceling subscription: ${subscriptionId}`)
      
      const { subscriptionManager } = await import('./subscription-manager')
      const subscription = subscriptionManager.getSubscription(subscriptionId)
      if (!subscription) {
        throw new Error('Subscription not found')
      }

      // Cancel subscription
      await subscriptionManager.cancelSubscription(subscriptionId, {
        immediate: true
      })

      console.log(`✅ Subscription canceled: ${subscriptionId}`)
      return true

    } catch (error: any) {
      console.error('❌ Subscription cancellation failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const dunningManager = new DunningManager()



