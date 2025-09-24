import { Payment, PaymentCard, Subscription } from './types'

export interface PaymentProvider {
  // Card operations
  createPaymentMethod(cardData: {
    number: string
    expMonth: number
    expYear: number
    cvc: string
    name: string
    zipCode: string
  }): Promise<{ id: string; last4: string; brand: string }>
  
  updatePaymentMethod(paymentMethodId: string, updates: Partial<PaymentCard>): Promise<PaymentCard>
  deletePaymentMethod(paymentMethodId: string): Promise<boolean>
  
  // Payment operations
  createPayment(paymentData: {
    amount: number
    currency: string
    paymentMethodId: string
    description: string
    metadata?: Record<string, any>
  }): Promise<{ id: string; status: string; transactionId: string }>
  
  // Subscription operations
  createSubscription(subscriptionData: {
    customerId: string
    planId: string
    paymentMethodId: string
    trialPeriodDays?: number
  }): Promise<Subscription>
  
  updateSubscription(subscriptionId: string, updates: {
    planId?: string
    paymentMethodId?: string
    prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice'
  }): Promise<Subscription>
  
  cancelSubscription(subscriptionId: string, options: {
    cancelAtPeriodEnd?: boolean
    immediate?: boolean
  }): Promise<Subscription>
  
  // Proration calculations
  calculateProration(subscriptionId: string, newPlanId: string): Promise<{
    prorationAmount: number
    creditAmount: number
    newAmount: number
    effectiveDate: string
  }>
}

// Stripe implementation
class StripePaymentProvider implements PaymentProvider {
  private stripe: any
  
  constructor() {
    // In production, you would initialize Stripe with your secret key
    // this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    
    // For now, we'll use a mock implementation
    this.stripe = {
      paymentMethods: {
        create: async (data: any) => ({
          id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          card: {
            last4: data.card.number.slice(-4),
            brand: this.getCardBrand(data.card.number)
          }
        }),
        update: async (id: string, data: any) => ({ id, ...data }),
        detach: async (id: string) => ({ id, deleted: true })
      },
      paymentIntents: {
        create: async (data: any) => ({
          id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'succeeded',
          client_secret: `pi_${Date.now()}_secret`
        })
      },
      subscriptions: {
        create: async (data: any) => ({
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          cancel_at_period_end: false
        }),
        update: async (id: string, data: any) => ({
          id,
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          cancel_at_period_end: false,
          ...data
        }),
        cancel: async (id: string, data: any) => ({
          id,
          status: data.immediate ? 'canceled' : 'active',
          cancel_at_period_end: data.cancelAtPeriodEnd || false
        })
      }
    }
  }
  
  private getCardBrand(number: string): string {
    const num = number.replace(/\s/g, '')
    if (num.startsWith('4')) return 'Visa'
    if (num.startsWith('5')) return 'Mastercard'
    if (num.startsWith('3')) return 'American Express'
    return 'Card'
  }
  
  async createPaymentMethod(cardData: {
    number: string
    expMonth: number
    expYear: number
    cvc: string
    name: string
    zipCode: string
  }): Promise<{ id: string; last4: string; brand: string }> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardData.number,
          exp_month: cardData.expMonth,
          exp_year: cardData.expYear,
          cvc: cardData.cvc
        },
        billing_details: {
          name: cardData.name,
          address: {
            postal_code: cardData.zipCode
          }
        }
      })
      
      return {
        id: paymentMethod.id,
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand
      }
    } catch (error) {
      console.error('Stripe payment method creation failed:', error)
      throw new Error('Failed to create payment method')
    }
  }
  
  async updatePaymentMethod(paymentMethodId: string, updates: Partial<PaymentCard>): Promise<PaymentCard> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.update(paymentMethodId, updates)
      return paymentMethod
    } catch (error) {
      console.error('Stripe payment method update failed:', error)
      throw new Error('Failed to update payment method')
    }
  }
  
  async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      await this.stripe.paymentMethods.detach(paymentMethodId)
      return true
    } catch (error) {
      console.error('Stripe payment method deletion failed:', error)
      throw new Error('Failed to delete payment method')
    }
  }
  
  async createPayment(paymentData: {
    amount: number
    currency: string
    paymentMethodId: string
    description: string
    metadata?: Record<string, any>
  }): Promise<{ id: string; status: string; transactionId: string }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_method: paymentData.paymentMethodId,
        description: paymentData.description,
        metadata: paymentData.metadata,
        confirm: true
      })
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        transactionId: paymentIntent.id
      }
    } catch (error) {
      console.error('Stripe payment creation failed:', error)
      throw new Error('Failed to create payment')
    }
  }
  
  async createSubscription(subscriptionData: {
    customerId: string
    planId: string
    paymentMethodId: string
    trialPeriodDays?: number
  }): Promise<Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: subscriptionData.customerId,
        items: [{ plan: subscriptionData.planId }],
        default_payment_method: subscriptionData.paymentMethodId,
        trial_period_days: subscriptionData.trialPeriodDays
      })
      
      return {
        id: subscription.id,
        customerId: subscription.customer,
        planId: subscriptionData.planId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        quantity: 1,
        metadata: subscription.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Stripe subscription creation failed:', error)
      throw new Error('Failed to create subscription')
    }
  }
  
  async updateSubscription(subscriptionId: string, updates: {
    planId?: string
    paymentMethodId?: string
    prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice'
  }): Promise<Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: updates.planId ? [{ plan: updates.planId }] : undefined,
        default_payment_method: updates.paymentMethodId,
        proration_behavior: updates.prorationBehavior
      })
      
      return {
        id: subscription.id,
        customerId: subscription.customer,
        planId: updates.planId || subscription.items.data[0].plan.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        quantity: 1,
        metadata: subscription.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Stripe subscription update failed:', error)
      throw new Error('Failed to update subscription')
    }
  }
  
  async cancelSubscription(subscriptionId: string, options: {
    cancelAtPeriodEnd?: boolean
    immediate?: boolean
  }): Promise<Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId, {
        cancel_at_period_end: options.cancelAtPeriodEnd,
        prorate: !options.immediate
      })
      
      return {
        id: subscription.id,
        customerId: subscription.customer,
        planId: subscription.items.data[0].plan.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        quantity: 1,
        metadata: subscription.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Stripe subscription cancellation failed:', error)
      throw new Error('Failed to cancel subscription')
    }
  }
  
  async calculateProration(subscriptionId: string, newPlanId: string): Promise<{
    prorationAmount: number
    creditAmount: number
    newAmount: number
    effectiveDate: string
  }> {
    // In production, you would use Stripe's proration calculation
    // For now, we'll return a mock calculation
    return {
      prorationAmount: 1000, // $10.00 in cents
      creditAmount: 500, // $5.00 in cents
      newAmount: 5000, // $50.00 in cents
      effectiveDate: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const paymentService = new StripePaymentProvider()

// In production, you would also support other providers:
// export const paymentService = new PayPalPaymentProvider()
// export const paymentService = new SquarePaymentProvider()
// etc.
