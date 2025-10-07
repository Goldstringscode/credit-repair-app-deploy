import Stripe from 'stripe'
import { stripe, stripeConfig } from './config'
import { database } from '../database'
import { subscriptionManager } from '../subscription-manager'

export interface CreatePaymentIntentData {
  amount: number
  currency: string
  customerId?: string
  metadata?: Record<string, string>
  description?: string
  paymentMethodId?: string
}

export interface CreateSubscriptionData {
  customerId: string
  planId: string
  paymentMethodId?: string
  trialPeriodDays?: number
  metadata?: Record<string, string>
}

export class StripePaymentService {
  /**
   * Create a payment intent
   */
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<Stripe.PaymentIntent> {
    try {
      if (!stripe) {
        throw new Error('Stripe not configured')
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency,
        customer: data.customerId,
        metadata: data.metadata || {},
        description: data.description,
        payment_method: data.paymentMethodId,
        confirmation_method: 'manual',
        confirm: false
      })

      console.log('✅ Created payment intent:', paymentIntent.id)
      return paymentIntent

    } catch (error: any) {
      console.error('❌ Failed to create payment intent:', error)
      throw new Error(`Payment intent creation failed: ${error.message}`)
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string): Promise<Stripe.PaymentIntent> {
    try {
      if (!stripe) {
        throw new Error('Stripe not configured')
      }

      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      })

      console.log('✅ Confirmed payment intent:', paymentIntent.id)
      return paymentIntent

    } catch (error: any) {
      console.error('❌ Failed to confirm payment intent:', error)
      throw new Error(`Payment intent confirmation failed: ${error.message}`)
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(userData: {
    email: string
    name?: string
    phone?: string
    address?: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
    metadata?: Record<string, string>
  }): Promise<Stripe.Customer> {
    try {
      if (!stripe) {
        throw new Error('Stripe not configured')
      }

      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
        metadata: userData.metadata || {}
      })

      console.log('✅ Created customer:', customer.id)
      return customer

    } catch (error: any) {
      console.error('❌ Failed to create customer:', error)
      throw new Error(`Customer creation failed: ${error.message}`)
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(data: CreateSubscriptionData): Promise<Stripe.Subscription> {
    try {
      if (!stripe) {
        throw new Error('Stripe not configured')
      }

      // Get plan details from our subscription manager
      const plan = await subscriptionManager.getPlan(data.planId)
      if (!plan) {
        throw new Error('Plan not found')
      }

      // Create Stripe price if it doesn't exist
      const price = await this.getOrCreatePrice(plan)

      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: data.customerId,
        items: [{ price: price.id }],
        metadata: data.metadata || {},
        expand: ['latest_invoice.payment_intent']
      }

      if (data.trialPeriodDays && data.trialPeriodDays > 0) {
        subscriptionData.trial_period_days = data.trialPeriodDays
      }

      if (data.paymentMethodId) {
        subscriptionData.default_payment_method = data.paymentMethodId
      }

      const subscription = await stripe.subscriptions.create(subscriptionData)

      console.log('✅ Created subscription:', subscription.id)
      return subscription

    } catch (error: any) {
      console.error('❌ Failed to create subscription:', error)
      throw new Error(`Subscription creation failed: ${error.message}`)
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string, 
    updates: {
      planId?: string
      paymentMethodId?: string
      cancelAtPeriodEnd?: boolean
    }
  ): Promise<Stripe.Subscription> {
    try {
      if (!stripe) {
        throw new Error('Stripe not configured')
      }

      const updateData: Stripe.SubscriptionUpdateParams = {}

      if (updates.planId) {
        const plan = await subscriptionManager.getPlan(updates.planId)
        if (!plan) {
          throw new Error('Plan not found')
        }
        const price = await this.getOrCreatePrice(plan)
        updateData.items = [{ price: price.id }]
        updateData.proration_behavior = 'create_prorations'
      }

      if (updates.paymentMethodId) {
        updateData.default_payment_method = updates.paymentMethodId
      }

      if (updates.cancelAtPeriodEnd !== undefined) {
        updateData.cancel_at_period_end = updates.cancelAtPeriodEnd
      }

      const subscription = await stripe.subscriptions.update(subscriptionId, updateData)

      console.log('✅ Updated subscription:', subscription.id)
      return subscription

    } catch (error: any) {
      console.error('❌ Failed to update subscription:', error)
      throw new Error(`Subscription update failed: ${error.message}`)
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediately = false): Promise<Stripe.Subscription> {
    try {
      if (!stripe) {
        throw new Error('Stripe not configured')
      }

      const subscription = immediately 
        ? await stripe.subscriptions.cancel(subscriptionId)
        : await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })

      console.log('✅ Canceled subscription:', subscription.id)
      return subscription

    } catch (error: any) {
      console.error('❌ Failed to cancel subscription:', error)
      throw new Error(`Subscription cancellation failed: ${error.message}`)
    }
  }

  /**
   * Get or create Stripe price for a plan
   */
  private async getOrCreatePrice(plan: any): Promise<Stripe.Price> {
    try {
      if (!stripe) {
        throw new Error('Stripe not configured')
      }

      // Check if price already exists
      const existingPrices = await stripe.prices.list({
        product: plan.id,
        active: true,
        limit: 1
      })

      if (existingPrices.data.length > 0) {
        return existingPrices.data[0]
      }

      // Create new price
      const price = await stripe.prices.create({
        product: plan.id,
        unit_amount: plan.amount,
        currency: plan.currency,
        recurring: {
          interval: plan.interval,
          interval_count: plan.intervalCount
        },
        metadata: {
          planId: plan.id
        }
      })

      console.log('✅ Created price:', price.id)
      return price

    } catch (error: any) {
      console.error('❌ Failed to create price:', error)
      throw new Error(`Price creation failed: ${error.message}`)
    }
  }

  /**
   * Create payment method
   */
  async createPaymentMethod(cardData: {
    number: string
    exp_month: number
    exp_year: number
    cvc: string
    billing_details?: {
      name?: string
      email?: string
      address?: Stripe.AddressParam
    }
  }): Promise<Stripe.PaymentMethod> {
    try {
      if (!stripe) {
        throw new Error('Stripe not configured')
      }

      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardData.number,
          exp_month: cardData.exp_month,
          exp_year: cardData.exp_year,
          cvc: cardData.cvc
        },
        billing_details: cardData.billing_details
      })

      console.log('✅ Created payment method:', paymentMethod.id)
      return paymentMethod

    } catch (error: any) {
      console.error('❌ Failed to create payment method:', error)
      throw new Error(`Payment method creation failed: ${error.message}`)
    }
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
    try {
      if (!stripe) {
        throw new Error('Stripe not configured')
      }

      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      })

      console.log('✅ Attached payment method:', paymentMethod.id)
      return paymentMethod

    } catch (error: any) {
      console.error('❌ Failed to attach payment method:', error)
      throw new Error(`Payment method attachment failed: ${error.message}`)
    }
  }

  /**
   * Detach payment method from customer
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      if (!stripe) {
        throw new Error('Stripe not configured')
      }

      const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId)

      console.log('✅ Detached payment method:', paymentMethod.id)
      return paymentMethod

    } catch (error: any) {
      console.error('❌ Failed to detach payment method:', error)
      throw new Error(`Payment method detachment failed: ${error.message}`)
    }
  }

  /**
   * Get customer's payment methods
   */
  async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      if (!stripe) {
        throw new Error('Stripe not configured')
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      })

      return paymentMethods.data

    } catch (error: any) {
      console.error('❌ Failed to get payment methods:', error)
      throw new Error(`Failed to get payment methods: ${error.message}`)
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<Stripe.Customer> {
    try {
      if (!stripe) {
        throw new Error('Stripe not configured')
      }

      const customer = await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      })

      console.log('✅ Set default payment method for customer:', customerId)
      return customer

    } catch (error: any) {
      console.error('❌ Failed to set default payment method:', error)
      throw new Error(`Failed to set default payment method: ${error.message}`)
    }
  }
}

// Export singleton instance
export const stripePaymentService = new StripePaymentService()