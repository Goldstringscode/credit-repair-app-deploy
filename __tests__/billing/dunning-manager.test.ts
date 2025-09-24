import { describe, it, expect, beforeEach, vi } from 'vitest'
import { dunningManager, DunningEvent, DunningRule } from '@/lib/dunning-manager'

// Mock the audit logger
vi.mock('@/lib/audit-logger', () => ({
  auditLogger: {
    log: vi.fn()
  }
}))

// Mock the subscription manager
vi.mock('@/lib/subscription-manager', () => ({
  subscriptionManager: {
    getSubscription: vi.fn(),
    getPlan: vi.fn(),
    pauseSubscription: vi.fn(),
    cancelSubscription: vi.fn()
  }
}))

// Mock the Stripe payment service
vi.mock('@/lib/stripe/payments', () => ({
  stripePaymentService: {
    createPaymentIntent: vi.fn(),
    confirmPaymentIntent: vi.fn()
  }
}))

describe('DunningManager', () => {
  beforeEach(() => {
    // Clear all dunning events before each test
    dunningManager['events'].clear()
    dunningManager['rules'].clear()
    dunningManager['campaigns'].clear()
    
    // Initialize with default rules
    dunningManager['initializeDefaultRules']()
  })

  describe('Dunning Event Creation', () => {
    it('should create a dunning event for payment failure', async () => {
      const eventData = {
        subscriptionId: 'sub_123',
        customerId: 'customer_123',
        amount: 2999,
        currency: 'usd',
        attemptNumber: 1,
        eventType: 'payment_failed' as const,
        failureReason: 'insufficient_funds',
        status: 'pending' as const,
        metadata: { source: 'test' }
      }

      const event = await dunningManager.createDunningEvent(eventData)

      expect(event).toBeDefined()
      expect(event.subscriptionId).toBe(eventData.subscriptionId)
      expect(event.customerId).toBe(eventData.customerId)
      expect(event.amount).toBe(eventData.amount)
      expect(event.eventType).toBe(eventData.eventType)
      expect(event.status).toBe(eventData.status)
      expect(dunningManager['events'].has(event.id)).toBe(true)
    })

    it('should process payment failure and create dunning event', async () => {
      const event = await dunningManager.processPaymentFailure(
        'sub_123',
        'customer_123',
        2999,
        'usd',
        'insufficient_funds',
        { source: 'test' }
      )

      expect(event).toBeDefined()
      expect(event.subscriptionId).toBe('sub_123')
      expect(event.eventType).toBe('payment_failed')
      expect(event.attemptNumber).toBe(1)
      expect(event.nextRetryAt).toBeDefined()
    })

    it('should process payment success and cancel pending events', async () => {
      // First create a payment failure event
      await dunningManager.processPaymentFailure(
        'sub_123',
        'customer_123',
        2999,
        'usd',
        'insufficient_funds'
      )

      // Then process payment success
      await dunningManager.processPaymentSuccess(
        'sub_123',
        'customer_123',
        2999,
        'usd',
        { source: 'retry' }
      )

      const events = dunningManager.getAllEvents()
      const successEvent = events.find(e => e.eventType === 'payment_succeeded')
      const pendingEvents = events.filter(e => e.status === 'pending')

      expect(successEvent).toBeDefined()
      expect(pendingEvents).toHaveLength(0)
    })
  })

  describe('Dunning Rules', () => {
    it('should get all dunning rules', () => {
      const rules = dunningManager.getRules()
      expect(rules).toHaveLength(3) // Default rules
      expect(rules[0].name).toBe('Standard Dunning Process')
    })

    it('should get active dunning rules', () => {
      const activeRules = dunningManager.getActiveRules()
      expect(activeRules).toHaveLength(3)
      expect(activeRules.every(rule => rule.isActive)).toBe(true)
    })

    it('should create a new dunning rule', async () => {
      const ruleData = {
        name: 'Custom Dunning Rule',
        description: 'Custom rule for testing',
        isActive: true,
        maxAttempts: 5,
        retryIntervals: [1, 2, 3, 5, 7],
        actions: [
          {
            type: 'email_notification' as const,
            config: { template: 'custom_template' },
            delayDays: 0
          }
        ],
        conditions: [
          {
            field: 'amount' as const,
            operator: 'greater_than' as const,
            value: 1000
          }
        ]
      }

      const rule = await dunningManager.createRule(ruleData)

      expect(rule).toBeDefined()
      expect(rule.name).toBe(ruleData.name)
      expect(rule.maxAttempts).toBe(ruleData.maxAttempts)
      expect(dunningManager['rules'].has(rule.id)).toBe(true)
    })

    it('should get applicable rules for an event', async () => {
      const event: DunningEvent = {
        id: 'event_123',
        subscriptionId: 'sub_123',
        customerId: 'customer_123',
        attemptNumber: 1,
        eventType: 'payment_failed',
        amount: 2999,
        currency: 'usd',
        failureReason: 'insufficient_funds',
        status: 'pending',
        metadata: { amount: 2999 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const applicableRules = dunningManager.getApplicableRules(event)
      expect(applicableRules).toHaveLength(1) // Standard dunning rule should apply
      expect(applicableRules[0].name).toBe('Standard Dunning Process')
    })
  })

  describe('Email Templates', () => {
    it('should send dunning email', async () => {
      const result = await dunningManager.sendDunningEmail(
        'test@example.com',
        'payment_failed_1',
        {
          customerName: 'John Doe',
          planName: 'Basic Plan',
          amount: '$29.99',
          nextRetryDays: '1'
        }
      )

      expect(result).toBe(true)
    })

    it('should return false for non-existent template', async () => {
      const result = await dunningManager.sendDunningEmail(
        'test@example.com',
        'non_existent_template',
        {}
      )

      expect(result).toBe(false)
    })
  })

  describe('Payment Retry', () => {
    it('should retry payment successfully', async () => {
      // Mock the subscription and plan data
      const mockSubscription = {
        id: 'sub_123',
        customerId: 'customer_123',
        planId: 'basic',
        quantity: 1,
        status: 'active'
      }

      const mockPlan = {
        id: 'basic',
        name: 'Basic Plan',
        amount: 2999,
        currency: 'usd'
      }

      const mockPaymentIntent = {
        id: 'pi_123',
        status: 'succeeded'
      }

      // Mock the services
      const { subscriptionManager } = await import('@/lib/subscription-manager')
      const { stripePaymentService } = await import('@/lib/stripe/payments')
      
      vi.mocked(subscriptionManager.getSubscription).mockResolvedValue(mockSubscription as any)
      vi.mocked(subscriptionManager.getPlan).mockResolvedValue(mockPlan as any)
      vi.mocked(stripePaymentService.createPaymentIntent).mockResolvedValue(mockPaymentIntent as any)
      vi.mocked(stripePaymentService.confirmPaymentIntent).mockResolvedValue(mockPaymentIntent as any)

      const result = await dunningManager.retryPayment('sub_123', 'pm_123')

      expect(result).toBe(true)
      expect(stripePaymentService.createPaymentIntent).toHaveBeenCalled()
      expect(stripePaymentService.confirmPaymentIntent).toHaveBeenCalled()
    })

    it('should return false when subscription not found', async () => {
      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.getSubscription).mockResolvedValue(null)

      const result = await dunningManager.retryPayment('sub_123', 'pm_123')

      expect(result).toBe(false)
    })
  })

  describe('Subscription Management', () => {
    it('should suspend subscription', async () => {
      const mockSubscription = {
        id: 'sub_123',
        customerId: 'customer_123',
        planId: 'basic',
        quantity: 1,
        status: 'active'
      }

      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.getSubscription).mockResolvedValue(mockSubscription as any)
      vi.mocked(subscriptionManager.pauseSubscription).mockResolvedValue({} as any)

      const result = await dunningManager.suspendSubscription('sub_123', 'Test reason')

      expect(result).toBe(true)
      expect(subscriptionManager.pauseSubscription).toHaveBeenCalledWith('sub_123', {
        reason: 'Test reason'
      })
    })

    it('should cancel subscription', async () => {
      const mockSubscription = {
        id: 'sub_123',
        customerId: 'customer_123',
        planId: 'basic',
        quantity: 1,
        status: 'active'
      }

      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.getSubscription).mockResolvedValue(mockSubscription as any)
      vi.mocked(subscriptionManager.cancelSubscription).mockResolvedValue({} as any)

      const result = await dunningManager.cancelSubscription('sub_123', 'Test reason')

      expect(result).toBe(true)
      expect(subscriptionManager.cancelSubscription).toHaveBeenCalledWith('sub_123', {
        immediate: true
      })
    })
  })

  describe('Statistics', () => {
    it('should calculate dunning statistics', async () => {
      // Create some test events
      await dunningManager.createDunningEvent({
        subscriptionId: 'sub_1',
        customerId: 'customer_1',
        amount: 2999,
        currency: 'usd',
        attemptNumber: 1,
        eventType: 'payment_failed',
        status: 'pending',
        metadata: {}
      })

      await dunningManager.createDunningEvent({
        subscriptionId: 'sub_2',
        customerId: 'customer_2',
        amount: 5999,
        currency: 'usd',
        attemptNumber: 1,
        eventType: 'payment_succeeded',
        status: 'completed',
        metadata: {}
      })

      const stats = dunningManager.getDunningStatistics()

      expect(stats.totalEvents).toBe(2)
      expect(stats.pendingEvents).toBe(1)
      expect(stats.completedEvents).toBe(1)
      expect(stats.failedEvents).toBe(0)
      expect(stats.successRate).toBe(50)
    })

    it('should calculate dunning analytics', async () => {
      // Create test events
      await dunningManager.createDunningEvent({
        subscriptionId: 'sub_1',
        customerId: 'customer_1',
        amount: 2999,
        currency: 'usd',
        attemptNumber: 1,
        eventType: 'payment_failed',
        status: 'pending',
        metadata: {}
      })

      await dunningManager.createDunningEvent({
        subscriptionId: 'sub_1',
        customerId: 'customer_1',
        amount: 2999,
        currency: 'usd',
        attemptNumber: 2,
        eventType: 'payment_succeeded',
        status: 'completed',
        metadata: {}
      })

      const analytics = dunningManager.getDunningAnalytics()

      expect(analytics.totalEvents).toBe(2)
      expect(analytics.activeEvents).toBe(1)
      expect(analytics.successfulRecoveries).toBe(1)
      expect(analytics.failedRecoveries).toBe(0)
      expect(analytics.recoveryRate).toBe(100)
    })
  })

  describe('Error Handling', () => {
    it('should handle errors in payment retry', async () => {
      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.getSubscription).mockRejectedValue(new Error('Database error'))

      const result = await dunningManager.retryPayment('sub_123', 'pm_123')

      expect(result).toBe(false)
    })

    it('should handle errors in subscription suspension', async () => {
      const { subscriptionManager } = await import('@/lib/subscription-manager')
      vi.mocked(subscriptionManager.getSubscription).mockRejectedValue(new Error('Database error'))

      const result = await dunningManager.suspendSubscription('sub_123')

      expect(result).toBe(false)
    })
  })
})


