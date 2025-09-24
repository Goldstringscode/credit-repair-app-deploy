import Stripe from 'stripe'
import { stripe, stripeConfig } from './config'
import { auditLogger } from '../audit-logger'

export interface WebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
}

export class StripeWebhookService {
  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret)
    } catch (error: any) {
      console.error('❌ Webhook signature verification failed:', error)
      throw new Error(`Webhook signature verification failed: ${error.message}`)
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    console.log('🔔 Processing webhook event:', event.type)

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
          break

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
          break

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription)
          break

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
          break

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
          break

        case 'customer.created':
          await this.handleCustomerCreated(event.data.object as Stripe.Customer)
          break

        case 'customer.updated':
          await this.handleCustomerUpdated(event.data.object as Stripe.Customer)
          break

        case 'customer.deleted':
          await this.handleCustomerDeleted(event.data.object as Stripe.Customer)
          break

        default:
          console.log('🔔 Unhandled webhook event type:', event.type)
      }

      // Log webhook processing
      try {
        auditLogger.log({
          userId: event.data.object?.customer || 'system',
          ipAddress: 'webhook',
          userAgent: 'stripe-webhook',
          action: `webhook_${event.type}`,
          resource: 'webhook',
          method: 'POST',
          endpoint: '/api/stripe/webhooks',
          statusCode: 200,
          severity: 'medium',
          category: 'webhook',
          metadata: {
            eventId: event.id,
            eventType: event.type,
            objectId: event.data.object?.id
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

    } catch (error: any) {
      console.error('❌ Webhook event processing failed:', error)
      
      // Log webhook error
      try {
        auditLogger.log({
          userId: event.data.object?.customer || 'system',
          ipAddress: 'webhook',
          userAgent: 'stripe-webhook',
          action: `webhook_${event.type}_error`,
          resource: 'webhook',
          method: 'POST',
          endpoint: '/api/stripe/webhooks',
          statusCode: 500,
          severity: 'high',
          category: 'webhook',
          metadata: {
            eventId: event.id,
            eventType: event.type,
            error: error.message
          }
        })
      } catch (auditError) {
        console.log('Audit logging failed (non-critical):', auditError)
      }

      throw error
    }
  }

  /**
   * Handle payment intent succeeded
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('✅ Payment succeeded:', paymentIntent.id)
    
    // Update user's payment status in your database
    // Send confirmation email
    // Update subscription status if applicable
    
    // Example: Update user's payment status
    // await updateUserPaymentStatus(paymentIntent.metadata.userId, 'paid')
  }

  /**
   * Handle payment intent failed
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('❌ Payment failed:', paymentIntent.id)
    
    // Update user's payment status in your database
    // Send failure notification email
    // Handle retry logic
    
    // Example: Update user's payment status
    // await updateUserPaymentStatus(paymentIntent.metadata.userId, 'failed')
  }

  /**
   * Handle subscription created
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    console.log('📋 Subscription created:', subscription.id)
    
    // Update user's subscription status in your database
    // Send welcome email
    // Grant access to premium features
    
    // Example: Update user's subscription status
    // await updateUserSubscriptionStatus(subscription.customer, 'active', subscription.id)
  }

  /**
   * Handle subscription updated
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    console.log('📋 Subscription updated:', subscription.id)
    
    // Update user's subscription status in your database
    // Handle plan changes
    // Update feature access
    
    // Example: Update user's subscription status
    // await updateUserSubscriptionStatus(subscription.customer, subscription.status, subscription.id)
  }

  /**
   * Handle subscription deleted
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    console.log('📋 Subscription deleted:', subscription.id)
    
    // Update user's subscription status in your database
    // Revoke access to premium features
    // Send cancellation confirmation email
    
    // Example: Update user's subscription status
    // await updateUserSubscriptionStatus(subscription.customer, 'cancelled', subscription.id)
  }

  /**
   * Handle invoice payment succeeded
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    console.log('✅ Invoice payment succeeded:', invoice.id)
    
    // Update user's billing status
    // Send receipt email
    // Extend subscription period
    
    // Example: Update user's billing status
    // await updateUserBillingStatus(invoice.customer, 'paid', invoice.id)
  }

  /**
   * Handle invoice payment failed
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log('❌ Invoice payment failed:', invoice.id)
    
    // Update user's billing status
    // Send payment failure notification
    // Handle dunning management
    
    // Example: Update user's billing status
    // await updateUserBillingStatus(invoice.customer, 'failed', invoice.id)
  }

  /**
   * Handle customer created
   */
  private async handleCustomerCreated(customer: Stripe.Customer): Promise<void> {
    console.log('👤 Customer created:', customer.id)
    
    // Update user's Stripe customer ID in your database
    // Send welcome email
    
    // Example: Update user's Stripe customer ID
    // await updateUserStripeCustomerId(customer.metadata.userId, customer.id)
  }

  /**
   * Handle customer updated
   */
  private async handleCustomerUpdated(customer: Stripe.Customer): Promise<void> {
    console.log('👤 Customer updated:', customer.id)
    
    // Update user's information in your database
    // Sync customer data
    
    // Example: Update user's information
    // await updateUserFromStripeCustomer(customer)
  }

  /**
   * Handle customer deleted
   */
  private async handleCustomerDeleted(customer: Stripe.Customer): Promise<void> {
    console.log('👤 Customer deleted:', customer.id)
    
    // Update user's status in your database
    // Handle data retention policies
    
    // Example: Update user's status
    // await updateUserStatus(customer.metadata.userId, 'deleted')
  }
}

// Export singleton instance
export const stripeWebhookService = new StripeWebhookService()
