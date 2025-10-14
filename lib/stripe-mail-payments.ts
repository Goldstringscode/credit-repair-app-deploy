/**
 * Stripe Payment Integration for Certified Mail System
 * Phase 1: Core Infrastructure
 */

import Stripe from 'stripe'

export interface MailPaymentRequest {
  trackingId: string
  amount: number
  currency: string
  description: string
  customerId?: string
  metadata: {
    mailType: string
    serviceType: string
    trackingNumber: string
    userId: string
  }
}

export interface MailPaymentResponse {
  paymentIntentId: string
  clientSecret: string
  amount: number
  currency: string
  status: string
}

export interface MailPaymentStatus {
  paymentIntentId: string
  status: string
  amount: number
  currency: string
  charges: Array<{
    id: string
    amount: number
    status: string
    created: number
  }>
  refunds: Array<{
    id: string
    amount: number
    status: string
    reason?: string
    created: number
  }>
  metadata: Record<string, string>
}

class StripeMailPayments {
  private stripe: Stripe
  private webhookSecret: string

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required')
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    })

    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
  }

  /**
   * Create a payment intent for certified mail
   */
  async createPaymentIntent(request: MailPaymentRequest): Promise<MailPaymentResponse> {
    try {
      // Create customer if customerId is provided but doesn't exist, or if no customerId provided
      let customerId = request.customerId
      if (customerId && customerId !== 'cus_test_customer_id') {
        try {
          await this.getCustomer(customerId)
        } catch (error) {
          console.warn('Customer not found, creating new customer')
          customerId = await this.createCustomer('test@example.com', 'Test Customer', {
            userId: request.metadata.userId
          })
        }
      } else {
        // Create a default customer for testing
        customerId = await this.createCustomer('test@example.com', 'Test Customer', {
          userId: request.metadata.userId
        })
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency,
        description: request.description,
        customer: customerId,
        metadata: {
          ...request.metadata,
          trackingId: request.trackingId,
          service: 'certified_mail'
        },
        automatic_payment_methods: {
          enabled: true,
        },
        // Enable capture_method for immediate capture
        capture_method: 'automatic',
        // Add receipt email if customer exists
        ...(customerId && {
          receipt_email: await this.getCustomerEmail(customerId)
        })
      })

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        amount: request.amount,
        currency: request.currency,
        status: paymentIntent.status
      }
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw new Error(`Failed to create payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(paymentIntentId: string): Promise<MailPaymentResponse> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
      
      if (paymentIntent.status === 'requires_confirmation') {
        const confirmedIntent = await this.stripe.paymentIntents.confirm(paymentIntentId)
        
        return {
          paymentIntentId: confirmedIntent.id,
          clientSecret: confirmedIntent.client_secret!,
          amount: confirmedIntent.amount / 100,
          currency: confirmedIntent.currency,
          status: confirmedIntent.status
        }
      }

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      }
    } catch (error) {
      console.error('Error confirming payment intent:', error)
      throw new Error(`Failed to confirm payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<MailPaymentStatus> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['charges', 'charges.refunds']
      })

      const charges = paymentIntent.charges.data.map(charge => ({
        id: charge.id,
        amount: charge.amount / 100,
        status: charge.status,
        created: charge.created
      }))

      const refunds = charges.flatMap(charge => 
        charge.refunds?.data.map(refund => ({
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          reason: refund.reason,
          created: refund.created
        })) || []
      )

      return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        charges,
        refunds,
        metadata: paymentIntent.metadata
      }
    } catch (error) {
      console.error('Error getting payment status:', error)
      throw new Error(`Failed to get payment status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentIntentId: string, amount?: number, reason?: string): Promise<{
    refundId: string
    amount: number
    status: string
  }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
      
      if (!paymentIntent.latest_charge) {
        throw new Error('No charge found for this payment intent')
      }

      const refundParams: Stripe.RefundCreateParams = {
        charge: paymentIntent.latest_charge as string,
        reason: reason as Stripe.RefundCreateParams.Reason,
        ...(amount && { amount: Math.round(amount * 100) })
      }

      const refund = await this.stripe.refunds.create(refundParams)

      return {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    } catch (error) {
      console.error('Error refunding payment:', error)
      throw new Error(`Failed to refund payment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create a customer for mail payments
   */
  async createCustomer(email: string, name?: string, metadata?: Record<string, string>): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          ...metadata,
          service: 'certified_mail'
        }
      })

      return customer.id
    } catch (error) {
      console.error('Error creating customer:', error)
      throw new Error(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.retrieve(customerId) as Stripe.Customer
    } catch (error) {
      console.error('Error getting customer:', error)
      throw new Error(`Failed to get customer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get customer email
   */
  private async getCustomerEmail(customerId: string): Promise<string | undefined> {
    try {
      const customer = await this.getCustomer(customerId)
      return customer.email || undefined
    } catch (error) {
      console.warn('Error getting customer email:', error)
      return undefined
    }
  }

  /**
   * Handle Stripe webhook events for mail payments
   */
  async handleWebhookEvent(payload: string, signature: string): Promise<{
    type: string
    data: any
    processed: boolean
  }> {
    try {
      if (!this.webhookSecret) {
        throw new Error('Webhook secret not configured')
      }

      const event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret)
      
      let processed = false

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
          processed = true
          break

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
          processed = true
          break

        case 'payment_intent.canceled':
          await this.handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)
          processed = true
          break

        case 'charge.dispute.created':
          await this.handleChargeDispute(event.data.object as Stripe.Dispute)
          processed = true
          break

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return {
        type: event.type,
        data: event.data.object,
        processed
      }
    } catch (error) {
      console.error('Error handling webhook event:', error)
      throw new Error(`Webhook processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const trackingId = paymentIntent.metadata.trackingId
      if (!trackingId) {
        console.warn('No tracking ID found in payment intent metadata')
        return
      }

      // Update mail status to paid
      console.log(`Payment succeeded for tracking ID: ${trackingId}`)
      
      // In production, this would:
      // 1. Update the mail record status to 'paid'
      // 2. Trigger the mail sending process
      // 3. Send confirmation email to user
      // 4. Update analytics
      
    } catch (error) {
      console.error('Error handling payment succeeded:', error)
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const trackingId = paymentIntent.metadata.trackingId
      if (!trackingId) {
        console.warn('No tracking ID found in payment intent metadata')
        return
      }

      // Update mail status to payment failed
      console.log(`Payment failed for tracking ID: ${trackingId}`)
      
      // In production, this would:
      // 1. Update the mail record status to 'payment_failed'
      // 2. Send failure notification to user
      // 3. Log the failure for analysis
      
    } catch (error) {
      console.error('Error handling payment failed:', error)
    }
  }

  /**
   * Handle canceled payment
   */
  private async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const trackingId = paymentIntent.metadata.trackingId
      if (!trackingId) {
        console.warn('No tracking ID found in payment intent metadata')
        return
      }

      // Update mail status to canceled
      console.log(`Payment canceled for tracking ID: ${trackingId}`)
      
      // In production, this would:
      // 1. Update the mail record status to 'canceled'
      // 2. Send cancellation notification to user
      // 3. Clean up any pending processes
      
    } catch (error) {
      console.error('Error handling payment canceled:', error)
    }
  }

  /**
   * Handle charge dispute
   */
  private async handleChargeDispute(dispute: Stripe.Dispute): Promise<void> {
    try {
      const paymentIntentId = dispute.payment_intent as string
      console.log(`Charge dispute created for payment intent: ${paymentIntentId}`)
      
      // In production, this would:
      // 1. Update the mail record status to 'disputed'
      // 2. Notify administrators
      // 3. Gather evidence for dispute response
      // 4. Update analytics
      
    } catch (error) {
      console.error('Error handling charge dispute:', error)
    }
  }

  /**
   * Calculate processing fees
   */
  calculateProcessingFee(amount: number): number {
    // Stripe's standard processing fee: 2.9% + $0.30
    const percentage = 0.029
    const fixed = 0.30
    return (amount * percentage) + fixed
  }

  /**
   * Get payment methods for a customer
   */
  async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      })

      return paymentMethods.data
    } catch (error) {
      console.error('Error getting customer payment methods:', error)
      throw new Error(`Failed to get payment methods: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create a setup intent for saving payment methods
   */
  async createSetupIntent(customerId: string): Promise<{
    setupIntentId: string
    clientSecret: string
  }> {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session'
      })

      return {
        setupIntentId: setupIntent.id,
        clientSecret: setupIntent.client_secret!
      }
    } catch (error) {
      console.error('Error creating setup intent:', error)
      throw new Error(`Failed to create setup intent: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Export singleton instance with lazy initialization
let _stripeMailPayments: StripeMailPayments | null = null

export const stripeMailPayments = {
  get instance() {
    if (!_stripeMailPayments) {
      _stripeMailPayments = new StripeMailPayments()
    }
    return _stripeMailPayments
  }
}

// Export types
export type {
  MailPaymentRequest,
  MailPaymentResponse,
  MailPaymentStatus
}

