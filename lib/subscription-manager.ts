import { auditLogger } from './audit-logger'
import { stripePaymentService } from './stripe/payments'
import { database } from './database'

export interface Subscription {
  id: string
  customerId: string
  planId: string
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'unpaid' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  canceledAt?: string
  trialStart?: string
  trialEnd?: string
  quantity: number
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Plan {
  id: string
  name: string
  description: string
  amount: number
  currency: string
  interval: 'day' | 'week' | 'month' | 'year'
  intervalCount: number
  trialPeriodDays?: number
  metadata: Record<string, any>
  features: string[]
  isActive: boolean
}

export interface ProrationCalculation {
  prorationAmount: number
  creditAmount: number
  newAmount: number
  effectiveDate: string
  calculation: {
    oldPlan: Plan
    newPlan: Plan
    daysRemaining: number
    totalDays: number
    dailyRate: number
  }
}

export interface BillingCycle {
  id: string
  subscriptionId: string
  startDate: string
  endDate: string
  amount: number
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  invoiceId?: string
  paymentAttempts: number
  lastAttemptAt?: string
  nextAttemptAt?: string
}

export class SubscriptionManager {
  private subscriptions: Map<string, Subscription> = new Map()
  private plans: Map<string, Plan> = new Map()
  private billingCycles: Map<string, BillingCycle> = new Map()

  constructor() {
    this.initializeDefaultPlans()
  }

  /**
   * Initialize default subscription plans
   */
  private initializeDefaultPlans(): void {
    const defaultPlans: Plan[] = [
      {
        id: 'basic',
        name: 'Basic Plan',
        description: 'Essential credit repair features',
        amount: 2999, // $29.99 in cents
        currency: 'usd',
        interval: 'month',
        intervalCount: 1,
        trialPeriodDays: 7,
        metadata: {},
        features: [
          'Credit report analysis',
          'Basic dispute letters',
          'Email support',
          'Monthly credit monitoring'
        ],
        isActive: true
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        description: 'Advanced credit repair with AI assistance',
        amount: 5999, // $59.99 in cents
        currency: 'usd',
        interval: 'month',
        intervalCount: 1,
        trialPeriodDays: 14,
        metadata: {},
        features: [
          'Everything in Basic',
          'Advanced dispute strategies',
          'Priority support',
          'Weekly credit monitoring',
          'Custom dispute letters',
          'Credit score tracking',
          'AI-powered recommendations'
        ],
        isActive: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise Plan',
        description: 'Full-featured solution for businesses',
        amount: 9999, // $99.99 in cents
        currency: 'usd',
        interval: 'month',
        intervalCount: 1,
        trialPeriodDays: 30,
        metadata: {},
        features: [
          'Everything in Premium',
          'Unlimited disputes',
          '24/7 phone support',
          'Daily credit monitoring',
          'White-label options',
          'API access',
          'Custom integrations',
          'Dedicated account manager'
        ],
        isActive: true
      }
    ]

    defaultPlans.forEach(plan => {
      this.plans.set(plan.id, plan)
    })
  }

  /**
   * Create a new subscription
   */
  async createSubscription(
    customerId: string,
    planId: string,
    options: {
      trialPeriodDays?: number
      quantity?: number
      metadata?: Record<string, any>
      prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice'
      paymentMethodId?: string
      useStripe?: boolean
    } = {}
  ): Promise<Subscription> {
    try {
      const plan = this.plans.get(planId)
      if (!plan) {
        throw new Error(`Plan ${planId} not found`)
      }

      if (!plan.isActive) {
        throw new Error(`Plan ${planId} is not active`)
      }

      const now = new Date()
      const trialDays = options.trialPeriodDays || plan.trialPeriodDays || 0

      let subscription: Subscription

      if (options.useStripe && stripePaymentService) {
        // Create Stripe subscription
        try {
          const stripeSubscription = await stripePaymentService.createSubscription({
            customerId,
            planId,
            paymentMethodId: options.paymentMethodId,
            trialPeriodDays: trialDays,
            metadata: options.metadata
          })

          subscription = {
            id: stripeSubscription.id,
            customerId,
            planId,
            status: stripeSubscription.status as any,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : undefined,
            trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000).toISOString() : undefined,
            trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : undefined,
            quantity: stripeSubscription.quantity || 1,
            metadata: stripeSubscription.metadata,
            createdAt: new Date(stripeSubscription.created * 1000).toISOString(),
            updatedAt: new Date(stripeSubscription.created * 1000).toISOString()
          }
        } catch (stripeError) {
          console.warn('Stripe subscription creation failed, falling back to local:', stripeError)
          // Fall back to local subscription creation
          subscription = this.createLocalSubscription(customerId, planId, options, plan, now, trialDays)
        }
      } else {
        // Create local subscription
        subscription = this.createLocalSubscription(customerId, planId, options, plan, now, trialDays)
      }

      this.subscriptions.set(subscription.id, subscription)

      // Create initial billing cycle
      const periodStart = new Date(subscription.currentPeriodStart)
      const periodEnd = new Date(subscription.currentPeriodEnd)
      await this.createBillingCycle(subscription.id, periodStart, periodEnd, plan.amount * subscription.quantity)

      // Log subscription creation
      try {
        auditLogger.log({
          userId: customerId,
          ipAddress: 'system',
          userAgent: 'system',
          action: 'subscription_created',
          resource: 'subscription',
          method: 'POST',
          endpoint: '/api/subscriptions',
          statusCode: 200,
          severity: 'medium',
          category: 'billing',
          metadata: {
            subscriptionId: subscription.id,
            planId: planId,
            status: subscription.status,
            trialDays: trialDays,
            useStripe: options.useStripe || false
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

      console.log(`✅ Created subscription ${subscription.id} for customer ${customerId}`)
      return subscription

    } catch (error: any) {
      console.error('❌ Subscription creation failed:', error)
      throw new Error(`Subscription creation failed: ${error.message}`)
    }
  }

  /**
   * Create local subscription (fallback)
   */
  private createLocalSubscription(
    customerId: string,
    planId: string,
    options: any,
    plan: Plan,
    now: Date,
    trialDays: number
  ): Subscription {
    const trialEnd = trialDays > 0 ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : null
    const periodStart = trialEnd || now
    const periodEnd = this.calculatePeriodEnd(periodStart, plan.interval, plan.intervalCount)

    return {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      planId,
      status: trialDays > 0 ? 'trialing' : 'active',
      currentPeriodStart: periodStart.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      trialStart: trialDays > 0 ? now.toISOString() : undefined,
      trialEnd: trialEnd?.toISOString(),
      quantity: options.quantity || 1,
      metadata: options.metadata || {},
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  }

  /**
   * Update subscription plan with proration
   */
  async updateSubscriptionPlan(
    subscriptionId: string,
    newPlanId: string,
    options: {
      prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice'
      quantity?: number
    } = {}
  ): Promise<{ subscription: Subscription; proration: ProrationCalculation | null }> {
    try {
      const subscription = this.subscriptions.get(subscriptionId)
      if (!subscription) {
        throw new Error(`Subscription ${subscriptionId} not found`)
      }

      const oldPlan = this.plans.get(subscription.planId)
      const newPlan = this.plans.get(newPlanId)
      if (!oldPlan || !newPlan) {
        throw new Error('Plan not found')
      }

      // Calculate proration if requested
      let proration: ProrationCalculation | null = null
      if (options.prorationBehavior === 'create_prorations' || options.prorationBehavior === 'always_invoice') {
        proration = this.calculateProration(subscription, oldPlan, newPlan)
      }

      // Update subscription
      const updatedSubscription: Subscription = {
        ...subscription,
        planId: newPlanId,
        quantity: options.quantity || subscription.quantity,
        updatedAt: new Date().toISOString()
      }

      this.subscriptions.set(subscriptionId, updatedSubscription)

      // Log subscription update
      try {
        auditLogger.log({
          userId: subscription.customerId,
          ipAddress: 'system',
          userAgent: 'system',
          action: 'subscription_updated',
          resource: 'subscription',
          method: 'PATCH',
          endpoint: '/api/subscriptions',
          statusCode: 200,
          severity: 'medium',
          category: 'billing',
          metadata: {
            subscriptionId: subscriptionId,
            oldPlanId: oldPlan.id,
            newPlanId: newPlanId,
            prorationAmount: proration?.prorationAmount || 0
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

      console.log(`✅ Updated subscription ${subscriptionId} to plan ${newPlanId}`)
      return { subscription: updatedSubscription, proration }

    } catch (error: any) {
      console.error('❌ Subscription update failed:', error)
      throw new Error(`Subscription update failed: ${error.message}`)
    }
  }

  /**
   * Calculate proration for plan changes
   */
  private calculateProration(
    subscription: Subscription,
    oldPlan: Plan,
    newPlan: Plan
  ): ProrationCalculation {
    const now = new Date()
    const periodStart = new Date(subscription.currentPeriodStart)
    const periodEnd = new Date(subscription.currentPeriodEnd)
    
    const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    const dailyRate = oldPlan.amount / totalDays
    const creditAmount = Math.round(dailyRate * daysRemaining)
    const newAmount = newPlan.amount
    const prorationAmount = newAmount - creditAmount

    return {
      prorationAmount,
      creditAmount,
      newAmount,
      effectiveDate: now.toISOString(),
      calculation: {
        oldPlan,
        newPlan,
        daysRemaining,
        totalDays,
        dailyRate
      }
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    options: {
      cancelAtPeriodEnd?: boolean
      immediate?: boolean
    } = {}
  ): Promise<Subscription> {
    try {
      const subscription = this.subscriptions.get(subscriptionId)
      if (!subscription) {
        throw new Error(`Subscription ${subscriptionId} not found`)
      }

      const now = new Date()
      const updatedSubscription: Subscription = {
        ...subscription,
        status: options.immediate ? 'canceled' : subscription.status,
        cancelAtPeriodEnd: options.cancelAtPeriodEnd !== false,
        canceledAt: now.toISOString(),
        updatedAt: now.toISOString()
      }

      this.subscriptions.set(subscriptionId, updatedSubscription)

      // Log subscription cancellation
      try {
        auditLogger.log({
          userId: subscription.customerId,
          ipAddress: 'system',
          userAgent: 'system',
          action: 'subscription_canceled',
          resource: 'subscription',
          method: 'DELETE',
          endpoint: '/api/subscriptions',
          statusCode: 200,
          severity: 'medium',
          category: 'billing',
          metadata: {
            subscriptionId: subscriptionId,
            cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
            immediate: options.immediate || false
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

      console.log(`✅ Canceled subscription ${subscriptionId}`)
      return updatedSubscription

    } catch (error: any) {
      console.error('❌ Subscription cancellation failed:', error)
      throw new Error(`Subscription cancellation failed: ${error.message}`)
    }
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(
    subscriptionId: string,
    options: {
      pauseUntil?: string
      reason?: string
    } = {}
  ): Promise<Subscription> {
    try {
      const subscription = this.subscriptions.get(subscriptionId)
      if (!subscription) {
        throw new Error(`Subscription ${subscriptionId} not found`)
      }

      if (subscription.status !== 'active') {
        throw new Error('Only active subscriptions can be paused')
      }

      const now = new Date()
      const updatedSubscription: Subscription = {
        ...subscription,
        status: 'inactive',
        metadata: {
          ...subscription.metadata,
          pausedAt: now.toISOString(),
          pauseReason: options.reason || 'User requested',
          pauseUntil: options.pauseUntil
        },
        updatedAt: now.toISOString()
      }

      this.subscriptions.set(subscriptionId, updatedSubscription)

      // Log subscription pause
      try {
        auditLogger.log({
          userId: subscription.customerId,
          ipAddress: 'system',
          userAgent: 'system',
          action: 'subscription_paused',
          resource: 'subscription',
          method: 'PATCH',
          endpoint: '/api/subscriptions/pause',
          statusCode: 200,
          severity: 'medium',
          category: 'billing',
          metadata: {
            subscriptionId: subscriptionId,
            pauseReason: options.reason,
            pauseUntil: options.pauseUntil
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

      console.log(`✅ Paused subscription ${subscriptionId}`)
      return updatedSubscription

    } catch (error: any) {
      console.error('❌ Subscription pause failed:', error)
      throw new Error(`Subscription pause failed: ${error.message}`)
    }
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const subscription = this.subscriptions.get(subscriptionId)
      if (!subscription) {
        throw new Error(`Subscription ${subscriptionId} not found`)
      }

      if (subscription.status !== 'inactive') {
        throw new Error('Only paused subscriptions can be resumed')
      }

      const now = new Date()
      const updatedSubscription: Subscription = {
        ...subscription,
        status: 'active',
        metadata: {
          ...subscription.metadata,
          resumedAt: now.toISOString(),
          pausedAt: undefined,
          pauseReason: undefined,
          pauseUntil: undefined
        },
        updatedAt: now.toISOString()
      }

      this.subscriptions.set(subscriptionId, updatedSubscription)

      // Log subscription resume
      try {
        auditLogger.log({
          userId: subscription.customerId,
          ipAddress: 'system',
          userAgent: 'system',
          action: 'subscription_resumed',
          resource: 'subscription',
          method: 'PATCH',
          endpoint: '/api/subscriptions/resume',
          statusCode: 200,
          severity: 'medium',
          category: 'billing',
          metadata: {
            subscriptionId: subscriptionId
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

      console.log(`✅ Resumed subscription ${subscriptionId}`)
      return updatedSubscription

    } catch (error: any) {
      console.error('❌ Subscription resume failed:', error)
      throw new Error(`Subscription resume failed: ${error.message}`)
    }
  }

  /**
   * Create billing cycle
   */
  private async createBillingCycle(
    subscriptionId: string,
    startDate: Date,
    endDate: Date,
    amount: number
  ): Promise<BillingCycle> {
    const billingCycle: BillingCycle = {
      id: `cycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subscriptionId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      amount,
      status: 'pending',
      paymentAttempts: 0
    }

    this.billingCycles.set(billingCycle.id, billingCycle)
    return billingCycle
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    console.log('🔍 Getting subscription:', subscriptionId)
    console.log('🔍 Total subscriptions:', this.subscriptions.size)
    console.log('🔍 Subscription keys:', Array.from(this.subscriptions.keys()))
    console.log('🔍 Looking for key:', subscriptionId)
    console.log('🔍 Key exists:', this.subscriptions.has(subscriptionId))
    const subscription = this.subscriptions.get(subscriptionId) || null
    console.log('🔍 Found subscription:', subscription ? 'YES' : 'NO')
    if (subscription) {
      console.log('🔍 Subscription details:', JSON.stringify(subscription, null, 2))
    }
    return subscription
  }

  /**
   * Get subscriptions for customer
   */
  async getCustomerSubscriptions(customerId: string): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.customerId === customerId)
  }

  /**
   * Get all plans
   */
  async getPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values()).filter(plan => plan.isActive)
  }

  /**
   * Get plan by ID
   */
  async getPlan(planId: string): Promise<Plan | null> {
    return this.plans.get(planId) || null
  }

  /**
   * Calculate period end date
   */
  private calculatePeriodEnd(startDate: Date, interval: string, intervalCount: number): Date {
    const endDate = new Date(startDate)
    
    switch (interval) {
      case 'day':
        endDate.setDate(endDate.getDate() + intervalCount)
        break
      case 'week':
        endDate.setDate(endDate.getDate() + (intervalCount * 7))
        break
      case 'month':
        endDate.setMonth(endDate.getMonth() + intervalCount)
        break
      case 'year':
        endDate.setFullYear(endDate.getFullYear() + intervalCount)
        break
    }
    
    return endDate
  }

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(): Promise<{
    totalSubscriptions: number
    activeSubscriptions: number
    trialSubscriptions: number
    canceledSubscriptions: number
    monthlyRecurringRevenue: number
    averageRevenuePerUser: number
    churnRate: number
  }> {
    const subscriptions = Array.from(this.subscriptions.values())
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active')
    const trialSubscriptions = subscriptions.filter(sub => sub.status === 'trialing')
    const canceledSubscriptions = subscriptions.filter(sub => sub.status === 'canceled')
    
    const monthlyRecurringRevenue = activeSubscriptions.reduce((total, sub) => {
      const plan = this.plans.get(sub.planId)
      return total + (plan ? plan.amount * sub.quantity : 0)
    }, 0)

    const averageRevenuePerUser = activeSubscriptions.length > 0 
      ? monthlyRecurringRevenue / activeSubscriptions.length 
      : 0

    const churnRate = subscriptions.length > 0 
      ? canceledSubscriptions.length / subscriptions.length 
      : 0

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      trialSubscriptions: trialSubscriptions.length,
      canceledSubscriptions: canceledSubscriptions.length,
      monthlyRecurringRevenue: monthlyRecurringRevenue / 100, // Convert from cents
      averageRevenuePerUser: averageRevenuePerUser / 100,
      churnRate: churnRate * 100
    }
  }
}

// Export singleton instance
export const subscriptionManager = new SubscriptionManager()



