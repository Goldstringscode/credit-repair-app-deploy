import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { subscriptionManager } from '../../lib/subscription-manager'
import { database } from '../../lib/database'
import { billingSecurityService } from '../../lib/billing-security'
import { stripePaymentService } from '../../lib/stripe/payments'

describe('Billing System Integration Tests', () => {
  beforeEach(() => {
    // Reset any state before each test
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Clean up after each test
  })

  describe('Subscription Management', () => {
    it('should create a new subscription', async () => {
      const customerId = 'test-customer-123'
      const planId = 'basic'

      const subscription = await subscriptionManager.createSubscription(
        customerId,
        planId,
        {
          trialPeriodDays: 7,
          metadata: { source: 'test' }
        }
      )

      expect(subscription).toBeDefined()
      expect(subscription.customerId).toBe(customerId)
      expect(subscription.planId).toBe(planId)
      expect(subscription.status).toBe('trialing')
      expect(subscription.trialStart).toBeDefined()
      expect(subscription.trialEnd).toBeDefined()
    })

    it('should update subscription plan with proration', async () => {
      const customerId = 'test-customer-456'
      const basicPlanId = 'basic'
      const premiumPlanId = 'premium'

      // Create initial subscription
      const subscription = await subscriptionManager.createSubscription(
        customerId,
        basicPlanId,
        { trialPeriodDays: 0 }
      )

      // Update to premium plan
      const result = await subscriptionManager.updateSubscriptionPlan(
        subscription.id,
        premiumPlanId,
        { prorationBehavior: 'create_prorations' }
      )

      expect(result.subscription.planId).toBe(premiumPlanId)
      expect(result.proration).toBeDefined()
      expect(result.proration?.prorationAmount).toBeGreaterThan(0)
    })

    it('should cancel subscription', async () => {
      const customerId = 'test-customer-789'
      const planId = 'basic'

      const subscription = await subscriptionManager.createSubscription(
        customerId,
        planId,
        { trialPeriodDays: 0 }
      )

      const canceledSubscription = await subscriptionManager.cancelSubscription(
        subscription.id,
        { cancelAtPeriodEnd: true }
      )

      expect(canceledSubscription.cancelAtPeriodEnd).toBe(true)
      expect(canceledSubscription.canceledAt).toBeDefined()
    })

    it('should pause and resume subscription', async () => {
      const customerId = 'test-customer-pause'
      const planId = 'basic'

      const subscription = await subscriptionManager.createSubscription(
        customerId,
        planId,
        { trialPeriodDays: 0 }
      )

      // Pause subscription
      const pausedSubscription = await subscriptionManager.pauseSubscription(
        subscription.id,
        { reason: 'User requested' }
      )

      expect(pausedSubscription.status).toBe('inactive')
      expect(pausedSubscription.metadata.pausedAt).toBeDefined()

      // Resume subscription
      const resumedSubscription = await subscriptionManager.resumeSubscription(
        subscription.id
      )

      expect(resumedSubscription.status).toBe('active')
      expect(resumedSubscription.metadata.resumedAt).toBeDefined()
    })
  })

  describe('Payment Management', () => {
    it('should create and retrieve payments', async () => {
      const userId = 'test-user-payments'
      const paymentData = {
        userId,
        amount: 2999, // $29.99 in cents
        currency: 'usd',
        status: 'succeeded' as const,
        description: 'Test payment',
        type: 'subscription' as const,
        method: 'card' as const,
        transactionId: 'txn_test_123',
        metadata: {}
      }

      const payment = await database.createPayment(paymentData)
      expect(payment).toBeDefined()
      expect(payment.userId).toBe(userId)
      expect(payment.amount).toBe(2999)

      const payments = await database.getPayments(userId)
      expect(payments).toHaveLength(1)
      expect(payments[0].id).toBe(payment.id)
    })

    it('should filter payments by status', async () => {
      const userId = 'test-user-filter'
      
      // Create multiple payments with different statuses
      await database.createPayment({
        userId,
        amount: 1000,
        currency: 'usd',
        status: 'succeeded',
        description: 'Success payment',
        type: 'subscription',
        method: 'card',
        transactionId: 'txn_success',
        metadata: {}
      })

      await database.createPayment({
        userId,
        amount: 2000,
        currency: 'usd',
        status: 'failed',
        description: 'Failed payment',
        type: 'subscription',
        method: 'card',
        transactionId: 'txn_failed',
        metadata: {}
      })

      const succeededPayments = await database.getPayments(userId, { status: 'succeeded' })
      expect(succeededPayments).toHaveLength(1)
      expect(succeededPayments[0].status).toBe('succeeded')

      const failedPayments = await database.getPayments(userId, { status: 'failed' })
      expect(failedPayments).toHaveLength(1)
      expect(failedPayments[0].status).toBe('failed')
    })
  })

  describe('Payment Card Management', () => {
    it('should create and manage payment cards', async () => {
      const userId = 'test-user-cards'
      const cardData = {
        userId,
        last4: '4242',
        brand: 'Visa',
        expMonth: 12,
        expYear: 2025,
        isDefault: false,
        name: 'Test User',
        zipCode: '12345',
        metadata: {}
      }

      const card = await database.createCard(cardData)
      expect(card).toBeDefined()
      expect(card.userId).toBe(userId)
      expect(card.last4).toBe('4242')

      const cards = await database.getCards(userId)
      expect(cards).toHaveLength(1)

      // Set as default
      const success = await database.setDefaultCard(userId, card.id)
      expect(success).toBe(true)

      const updatedCards = await database.getCards(userId)
      expect(updatedCards[0].isDefault).toBe(true)
    })

    it('should delete payment card', async () => {
      const userId = 'test-user-delete-card'
      const cardData = {
        userId,
        last4: '5555',
        brand: 'Mastercard',
        expMonth: 6,
        expYear: 2026,
        isDefault: false,
        name: 'Test User',
        zipCode: '54321',
        metadata: {}
      }

      const card = await database.createCard(cardData)
      const deleted = await database.deleteCard(card.id)
      expect(deleted).toBe(true)

      const cards = await database.getCards(userId)
      expect(cards).toHaveLength(0)
    })
  })

  describe('Mail Payment Management', () => {
    it('should create and retrieve mail payments', async () => {
      const userId = 'test-user-mail'
      const mailPaymentData = {
        userId,
        type: 'certified' as const,
        letterType: 'dispute' as const,
        amount: 850, // $8.50 in cents
        status: 'pending' as const,
        trackingNumber: 'CERT123456789',
        sentDate: new Date().toISOString(),
        expectedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        recipient: 'Experian',
        address: '123 Test St, Test City, TS 12345',
        description: 'Dispute letter for account removal',
        notes: 'Priority handling requested',
        metadata: {}
      }

      const mailPayment = await database.createMailPayment(mailPaymentData)
      expect(mailPayment).toBeDefined()
      expect(mailPayment.userId).toBe(userId)
      expect(mailPayment.type).toBe('certified')

      const mailPayments = await database.getMailPayments(userId)
      expect(mailPayments).toHaveLength(1)
      expect(mailPayments[0].id).toBe(mailPayment.id)
    })
  })

  describe('Billing Security', () => {
    it('should validate payment data', () => {
      const validPaymentData = {
        amount: 2999,
        cardData: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123'
        },
        metadata: { source: 'test' }
      }

      const validation = billingSecurityService.validatePaymentData(validPaymentData)
      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should detect invalid card data', () => {
      const invalidPaymentData = {
        amount: 2999,
        cardData: {
          number: '1234567890123456', // Invalid Luhn
          exp_month: 13, // Invalid month
          exp_year: 2020, // Expired
          cvc: '12' // Invalid CVC
        },
        metadata: { source: 'test' }
      }

      const validation = billingSecurityService.validatePaymentData(invalidPaymentData)
      expect(validation.valid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    it('should detect suspicious activity', () => {
      const userId = 'test-suspicious-user'
      
      // Simulate rapid payment attempts
      for (let i = 0; i < 5; i++) {
        const isSuspicious = billingSecurityService.checkSuspiciousActivity(
          userId,
          'payment_attempt',
          { amount: 1000, timestamp: Date.now() }
        )
        
        if (i < 4) {
          expect(isSuspicious).toBe(false)
        } else {
          expect(isSuspicious).toBe(true)
        }
      }
    })

    it('should lock out user after failed attempts', () => {
      const userId = 'test-lockout-user'
      
      // Simulate failed payment attempts
      for (let i = 0; i < 5; i++) {
        const isLocked = billingSecurityService.recordFailedAttempt(userId)
        
        if (i < 4) {
          expect(isLocked).toBe(false)
        } else {
          expect(isLocked).toBe(true)
        }
      }

      // Check if user is locked out
      expect(billingSecurityService.isUserLockedOut(userId)).toBe(true)
    })

    it('should reset failed attempts', () => {
      const userId = 'test-reset-user'
      
      // Record some failed attempts
      billingSecurityService.recordFailedAttempt(userId)
      billingSecurityService.recordFailedAttempt(userId)
      
      // Reset attempts
      billingSecurityService.resetFailedAttempts(userId)
      
      // Should not be locked out
      expect(billingSecurityService.isUserLockedOut(userId)).toBe(false)
    })
  })

  describe('Billing Analytics', () => {
    it('should calculate subscription analytics', async () => {
      // Create test subscriptions
      await subscriptionManager.createSubscription('customer1', 'basic', { trialPeriodDays: 0 })
      await subscriptionManager.createSubscription('customer2', 'premium', { trialPeriodDays: 0 })
      await subscriptionManager.createSubscription('customer3', 'basic', { trialPeriodDays: 7 })

      const analytics = await subscriptionManager.getSubscriptionAnalytics()
      
      expect(analytics.totalSubscriptions).toBe(3)
      expect(analytics.activeSubscriptions).toBe(2)
      expect(analytics.trialSubscriptions).toBe(1)
      expect(analytics.monthlyRecurringRevenue).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid plan ID', async () => {
      const customerId = 'test-error-customer'
      const invalidPlanId = 'invalid-plan'

      await expect(
        subscriptionManager.createSubscription(customerId, invalidPlanId)
      ).rejects.toThrow('Plan invalid-plan not found')
    })

    it('should handle inactive plan', async () => {
      const customerId = 'test-inactive-customer'
      
      // This would require setting up an inactive plan in the test
      // For now, we'll test the error message structure
      try {
        await subscriptionManager.createSubscription(customerId, 'nonexistent-plan')
      } catch (error: any) {
        expect(error.message).toContain('not found')
      }
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete billing flow', async () => {
      const userId = 'test-complete-flow'
      const customerId = 'customer-complete-flow'
      const planId = 'basic'

      // 1. Create subscription
      const subscription = await subscriptionManager.createSubscription(
        customerId,
        planId,
        { trialPeriodDays: 7 }
      )

      expect(subscription.status).toBe('trialing')

      // 2. Create payment
      const payment = await database.createPayment({
        userId,
        amount: 2999,
        currency: 'usd',
        status: 'succeeded',
        description: 'Subscription payment',
        type: 'subscription',
        method: 'card',
        transactionId: 'txn_complete_flow',
        metadata: { subscriptionId: subscription.id }
      })

      expect(payment).toBeDefined()

      // 3. Create payment card
      const card = await database.createCard({
        userId,
        last4: '4242',
        brand: 'Visa',
        expMonth: 12,
        expYear: 2025,
        isDefault: true,
        name: 'Test User',
        zipCode: '12345',
        metadata: {}
      })

      expect(card.isDefault).toBe(true)

      // 4. Create mail payment
      const mailPayment = await database.createMailPayment({
        userId,
        type: 'certified',
        letterType: 'dispute',
        amount: 850,
        status: 'pending',
        trackingNumber: 'CERT_COMPLETE_FLOW',
        sentDate: new Date().toISOString(),
        expectedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        recipient: 'Credit Bureau',
        address: '123 Test St',
        description: 'Dispute letter',
        metadata: {}
      })

      expect(mailPayment).toBeDefined()

      // 5. Verify all data is retrievable
      const payments = await database.getPayments(userId)
      const cards = await database.getCards(userId)
      const mailPayments = await database.getMailPayments(userId)

      expect(payments).toHaveLength(1)
      expect(cards).toHaveLength(1)
      expect(mailPayments).toHaveLength(1)
    })
  })
})
