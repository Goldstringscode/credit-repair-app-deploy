import Stripe from 'stripe'
import { stripe } from './config'
import { auditLogger } from '../audit-logger'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  stripePriceId: string
  stripeProductId: string
}

export interface CreateSubscriptionData {
  customerId: string
  priceId: string
  paymentMethodId?: string
  trialPeriodDays?: number
  metadata?: Record<string, string>
}

export interface UpdateSubscriptionData {
  subscriptionId: string
  priceId?: string
  quantity?: number
  metadata?: Record<string, string>
}

export class StripeSubscriptionService {
  // Define available subscription plans
  private plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      description: 'Essential credit repair tools',
      price: 29.99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Credit report analysis',
        'Basic dispute letters',
        'Email support',
        'Monthly credit monitoring'
      ],
      stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic_monthly',
      stripeProductId: process.env.STRIPE_BASIC_PRODUCT_ID || 'prod_basic'
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      description: 'Advanced credit repair features',
      price: 59.99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Everything in Basic',
        'Advanced dispute strategies',
        'Priority support',
        'Weekly credit monitoring',
        'Custom dispute letters',
        'Credit score tracking'
      ],
      stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
      stripeProductId: process.env.STRIPE_PREMIUM_PRODUCT_ID || 'prod_premium'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      description: 'Complete credit repair solution',
      price: 99.99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Everything in Premium',
        'Unlimited disputes',
        '24/7 phone support',
        'Daily credit monitoring',
        'AI-powered recommendations',
        'White-label options',
        'API access'
      ],
      stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
      stripeProductId: process.env.STRIPE_ENTERPRISE_PRODUCT_ID || 'prod_enterprise'
    }
  ]

  /**
   * Get all available subscription plans
   */
  getPlans(): SubscriptionPlan[] {
    return this.plans
  }

  /**
   * Get a specific plan by ID
   */
  getPlan(planId: string): SubscriptionPlan | undefined {
    return this.plans.find(plan => plan.id === planId)
  }

  /**
   * Create a subscription
   */
  async createSubscription(data: CreateSubscriptionData): Promise<Stripe.Subscription> {
    try {
      console.log('📋 Creating subscription:', data)
      
      const subscription = await stripe.subscriptions.create({
        customer: data.customerId,
        items: [{
          price: data.priceId
        }],
        default_payment_method: data.paymentMethodId,
        trial_period_days: data.trialPeriodDays,
        metadata: data.metadata || {},
        expand: ['latest_invoice.payment_intent']
      })

      // Log subscription creation
      try {
        auditLogger.log({
          userId: data.customerId,
          ipAddress: 'system',
          userAgent: 'system',
          action: 'subscription_created',
          resource: 'subscription',
          method: 'POST',
          endpoint: '/api/stripe/subscriptions',
          statusCode: 200,
          severity: 'high',
          category: 'subscription',
          metadata: {
            subscriptionId: subscription.id,
            customerId: data.customerId,
            priceId: data.priceId,
            status: subscription.status
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

      return subscription
    } catch (error: any) {
      console.error('❌ Subscription creation failed:', error)
      throw new Error(`Subscription creation failed: ${error.message}`)
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      console.log('📋 Getting subscription:', subscriptionId)
      
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice', 'customer', 'items.data.price']
      })

      return subscription
    } catch (error: any) {
      console.error('❌ Failed to get subscription:', error)
      throw new Error(`Failed to get subscription: ${error.message}`)
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(data: UpdateSubscriptionData): Promise<Stripe.Subscription> {
    try {
      console.log('📋 Updating subscription:', data.subscriptionId)
      
      const updateData: Stripe.SubscriptionUpdateParams = {
        metadata: data.metadata || {}
      }

      if (data.priceId) {
        // Get current subscription to update items
        const currentSubscription = await this.getSubscription(data.subscriptionId)
        const currentItem = currentSubscription.items.data[0]
        
        updateData.items = [{
          id: currentItem.id,
          price: data.priceId,
          quantity: data.quantity || 1
        }]
      }

      const subscription = await stripe.subscriptions.update(
        data.subscriptionId, 
        updateData
      )

      // Log subscription update
      try {
        auditLogger.log({
          userId: subscription.customer as string,
          ipAddress: 'system',
          userAgent: 'system',
          action: 'subscription_updated',
          resource: 'subscription',
          method: 'PUT',
          endpoint: '/api/stripe/subscriptions/update',
          statusCode: 200,
          severity: 'medium',
          category: 'subscription',
          metadata: {
            subscriptionId: subscription.id,
            status: subscription.status
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

      return subscription
    } catch (error: any) {
      console.error('❌ Subscription update failed:', error)
      throw new Error(`Subscription update failed: ${error.message}`)
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string, 
    immediately: boolean = false
  ): Promise<Stripe.Subscription> {
    try {
      console.log('📋 Cancelling subscription:', subscriptionId)
      
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately
      })

      if (immediately) {
        await stripe.subscriptions.cancel(subscriptionId)
      }

      // Log subscription cancellation
      try {
        auditLogger.log({
          userId: subscription.customer as string,
          ipAddress: 'system',
          userAgent: 'system',
          action: 'subscription_cancelled',
          resource: 'subscription',
          method: 'POST',
          endpoint: '/api/stripe/subscriptions/cancel',
          statusCode: 200,
          severity: 'high',
          category: 'subscription',
          metadata: {
            subscriptionId: subscription.id,
            status: subscription.status,
            immediately: immediately
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

      return subscription
    } catch (error: any) {
      console.error('❌ Subscription cancellation failed:', error)
      throw new Error(`Subscription cancellation failed: ${error.message}`)
    }
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      console.log('📋 Resuming subscription:', subscriptionId)
      
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      })

      // Log subscription resumption
      try {
        auditLogger.log({
          userId: subscription.customer as string,
          ipAddress: 'system',
          userAgent: 'system',
          action: 'subscription_resumed',
          resource: 'subscription',
          method: 'POST',
          endpoint: '/api/stripe/subscriptions/resume',
          statusCode: 200,
          severity: 'medium',
          category: 'subscription',
          metadata: {
            subscriptionId: subscription.id,
            status: subscription.status
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

      return subscription
    } catch (error: any) {
      console.error('❌ Subscription resumption failed:', error)
      throw new Error(`Subscription resumption failed: ${error.message}`)
    }
  }

  /**
   * Get customer's subscriptions
   */
  async getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
      console.log('📋 Getting customer subscriptions:', customerId)
      
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        expand: ['data.latest_invoice', 'data.items.data.price']
      })

      return subscriptions.data
    } catch (error: any) {
      console.error('❌ Failed to get customer subscriptions:', error)
      throw new Error(`Failed to get customer subscriptions: ${error.message}`)
    }
  }

  /**
   * Get subscription usage for metered billing
   */
  async getSubscriptionUsage(subscriptionId: string): Promise<any> {
    try {
      console.log('📋 Getting subscription usage:', subscriptionId)
      
      const subscription = await this.getSubscription(subscriptionId)
      const usageRecords = await stripe.subscriptionItems.listUsageRecordSummaries(
        subscription.items.data[0].id
      )

      return {
        subscription,
        usage: usageRecords.data
      }
    } catch (error: any) {
      console.error('❌ Failed to get subscription usage:', error)
      throw new Error(`Failed to get subscription usage: ${error.message}`)
    }
  }
}

// Export singleton instance
export const stripeSubscriptionService = new StripeSubscriptionService()
