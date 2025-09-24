import { describe, it, expect, beforeEach, vi } from 'vitest'
import { subscriptionManager, Subscription, Plan } from '@/lib/subscription-manager'

// Mock the audit logger
vi.mock('@/lib/audit-logger', () => ({
  auditLogger: {
    log: vi.fn()
  }
}))

describe('SubscriptionManager', () => {
  beforeEach(() => {
    // Clear all subscriptions and plans before each test
    subscriptionManager['subscriptions'].clear()
    subscriptionManager['plans'].clear()
    
    // Initialize with test plans
    const testPlans: Plan[] = [
      {
        id: 'basic',
        name: 'Basic Plan',
        description: 'Basic features',
        amount: 2999,
        currency: 'usd',
        interval: 'month',
        intervalCount: 1,
        trialPeriodDays: 7,
        features: ['Feature 1', 'Feature 2'],
        isActive: true,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        description: 'Premium features',
        amount: 5999,
        currency: 'usd',
        interval: 'month',
        intervalCount: 1,
        trialPeriodDays: 14,
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        isActive: true,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    testPlans.forEach(plan => {
      subscriptionManager['plans'].set(plan.id, plan)
    })
  })

  describe('Plan Management', () => {
    it('should create a new plan', async () => {
      const planData = {
        name: 'Test Plan',
        description: 'Test description',
        amount: 1999,
        currency: 'usd',
        interval: 'month' as const,
        intervalCount: 1,
        trialPeriodDays: 7,
        features: ['Test feature'],
        isActive: true,
        metadata: {}
      }

      const plan = await subscriptionManager.createPlan(planData)

      expect(plan).toBeDefined()
      expect(plan.name).toBe(planData.name)
      expect(plan.amount).toBe(planData.amount)
      expect(subscriptionManager['plans'].has(plan.id)).toBe(true)
    })

    it('should get all plans', () => {
      const plans = subscriptionManager.getPlans()
      expect(plans).toHaveLength(2)
      expect(plans[0].name).toBe('Basic Plan')
      expect(plans[1].name).toBe('Premium Plan')
    })

    it('should get plan by ID', () => {
      const plan = subscriptionManager.getPlan('basic')
      expect(plan).toBeDefined()
      expect(plan?.name).toBe('Basic Plan')
    })

    it('should return null for non-existent plan', () => {
      const plan = subscriptionManager.getPlan('non-existent')
      expect(plan).toBeNull()
    })
  })

  describe('Subscription Management', () => {
    it('should create a new subscription', async () => {
      const subscriptionData = {
        customerId: 'customer_123',
        planId: 'basic',
        status: 'active' as const,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        quantity: 1,
        metadata: {}
      }

      const subscription = await subscriptionManager.createSubscription(
        subscriptionData.customerId,
        subscriptionData.planId,
        {
          trialPeriodDays: 7,
          quantity: subscriptionData.quantity,
          metadata: subscriptionData.metadata
        }
      )

      expect(subscription).toBeDefined()
      expect(subscription.customerId).toBe(subscriptionData.customerId)
      expect(subscription.planId).toBe(subscriptionData.planId)
      expect(subscription.status).toBe('active')
      expect(subscriptionManager['subscriptions'].has(subscription.id)).toBe(true)
    })

    it('should get subscription by ID', async () => {
      const subscription = await subscriptionManager.createSubscription(
        'customer_123',
        'basic',
        { trialPeriodDays: 7 }
      )

      const retrieved = subscriptionManager.getSubscription(subscription.id)
      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(subscription.id)
    })

    it('should update subscription plan', async () => {
      const subscription = await subscriptionManager.createSubscription(
        'customer_123',
        'basic',
        { trialPeriodDays: 7 }
      )

      const result = await subscriptionManager.updateSubscriptionPlan(
        subscription.id,
        'premium',
        { prorationBehavior: 'create_prorations' }
      )

      expect(result.subscription.planId).toBe('premium')
      expect(result.proration).toBeDefined()
    })

    it('should pause subscription', async () => {
      const subscription = await subscriptionManager.createSubscription(
        'customer_123',
        'basic',
        { trialPeriodDays: 7 }
      )

      const paused = await subscriptionManager.pauseSubscription(subscription.id, {
        reason: 'User requested'
      })

      expect(paused.status).toBe('inactive')
      expect(paused.metadata.pausedAt).toBeDefined()
      expect(paused.metadata.pauseReason).toBe('User requested')
    })

    it('should resume subscription', async () => {
      const subscription = await subscriptionManager.createSubscription(
        'customer_123',
        'basic',
        { trialPeriodDays: 7 }
      )

      // First pause it
      await subscriptionManager.pauseSubscription(subscription.id)
      
      // Then resume it
      const resumed = await subscriptionManager.resumeSubscription(subscription.id)

      expect(resumed.status).toBe('active')
      expect(resumed.metadata.resumedAt).toBeDefined()
      expect(resumed.metadata.pausedAt).toBeUndefined()
    })

    it('should cancel subscription', async () => {
      const subscription = await subscriptionManager.createSubscription(
        'customer_123',
        'basic',
        { trialPeriodDays: 7 }
      )

      const canceled = await subscriptionManager.cancelSubscription(subscription.id, {
        cancelAtPeriodEnd: true
      })

      expect(canceled.cancelAtPeriodEnd).toBe(true)
      expect(canceled.canceledAt).toBeDefined()
    })

    it('should get customer subscriptions', async () => {
      await subscriptionManager.createSubscription('customer_123', 'basic')
      await subscriptionManager.createSubscription('customer_123', 'premium')
      await subscriptionManager.createSubscription('customer_456', 'basic')

      const customerSubscriptions = subscriptionManager.getCustomerSubscriptions('customer_123')
      expect(customerSubscriptions).toHaveLength(2)
    })
  })

  describe('Proration Calculation', () => {
    it('should calculate proration correctly', async () => {
      const subscription = await subscriptionManager.createSubscription(
        'customer_123',
        'basic',
        { trialPeriodDays: 7 }
      )

      const result = await subscriptionManager.updateSubscriptionPlan(
        subscription.id,
        'premium',
        { prorationBehavior: 'create_prorations' }
      )

      expect(result.proration).toBeDefined()
      expect(result.proration?.prorationAmount).toBeGreaterThan(0)
      expect(result.proration?.calculation.oldPlan.name).toBe('Basic Plan')
      expect(result.proration?.calculation.newPlan.name).toBe('Premium Plan')
    })
  })

  describe('Error Handling', () => {
    it('should throw error when creating subscription with non-existent plan', async () => {
      await expect(
        subscriptionManager.createSubscription('customer_123', 'non-existent')
      ).rejects.toThrow('Plan not found')
    })

    it('should throw error when updating non-existent subscription', async () => {
      await expect(
        subscriptionManager.updateSubscriptionPlan('non-existent', 'premium')
      ).rejects.toThrow('Subscription not found')
    })

    it('should throw error when pausing non-active subscription', async () => {
      const subscription = await subscriptionManager.createSubscription(
        'customer_123',
        'basic',
        { trialPeriodDays: 7 }
      )

      // Cancel the subscription first
      await subscriptionManager.cancelSubscription(subscription.id, { immediate: true })

      await expect(
        subscriptionManager.pauseSubscription(subscription.id)
      ).rejects.toThrow('Only active subscriptions can be paused')
    })

    it('should throw error when resuming non-paused subscription', async () => {
      const subscription = await subscriptionManager.createSubscription(
        'customer_123',
        'basic',
        { trialPeriodDays: 7 }
      )

      await expect(
        subscriptionManager.resumeSubscription(subscription.id)
      ).rejects.toThrow('Only paused subscriptions can be resumed')
    })
  })

  describe('Statistics', () => {
    it('should calculate subscription statistics correctly', async () => {
      // Create test subscriptions
      await subscriptionManager.createSubscription('customer_1', 'basic')
      await subscriptionManager.createSubscription('customer_2', 'premium')
      await subscriptionManager.createSubscription('customer_3', 'basic')
      
      // Cancel one subscription
      const subscriptions = subscriptionManager.getAllSubscriptions()
      await subscriptionManager.cancelSubscription(subscriptions[0].id, { immediate: true })

      const stats = subscriptionManager.getSubscriptionStatistics()

      expect(stats.totalSubscriptions).toBe(3)
      expect(stats.activeSubscriptions).toBe(2)
      expect(stats.canceledSubscriptions).toBe(1)
      expect(stats.monthlyRecurringRevenue).toBeGreaterThan(0)
    })
  })
})


