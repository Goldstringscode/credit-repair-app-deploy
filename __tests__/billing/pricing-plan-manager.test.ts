import { describe, it, expect, beforeEach, vi } from 'vitest'
import { pricingPlanManager, PricingPlan, PromotionalPricing } from '@/lib/pricing-plan-manager'

// Mock the audit logger
vi.mock('@/lib/audit-logger', () => ({
  auditLogger: {
    log: vi.fn()
  }
}))

describe('PricingPlanManager', () => {
  beforeEach(() => {
    // Clear all data before each test
    pricingPlanManager['plans'].clear()
    pricingPlanManager['promotionalPricing'].clear()
    pricingPlanManager['abTests'].clear()
    
    // Initialize with test plans
    const testPlans: PricingPlan[] = [
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
        isPopular: false,
        sortOrder: 1,
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
        isPopular: true,
        sortOrder: 2,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    testPlans.forEach(plan => {
      pricingPlanManager['plans'].set(plan.id, plan)
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
        isPopular: false,
        sortOrder: 3,
        metadata: {}
      }

      const plan = await pricingPlanManager.createPlan(planData)

      expect(plan).toBeDefined()
      expect(plan.name).toBe(planData.name)
      expect(plan.amount).toBe(planData.amount)
      expect(pricingPlanManager['plans'].has(plan.id)).toBe(true)
    })

    it('should get all plans', () => {
      const plans = pricingPlanManager.getAllPlans()
      expect(plans).toHaveLength(2)
      expect(plans[0].name).toBe('Basic Plan')
      expect(plans[1].name).toBe('Premium Plan')
    })

    it('should get active plans only', () => {
      const activePlans = pricingPlanManager.getActivePlans()
      expect(activePlans).toHaveLength(2)
      expect(activePlans.every(plan => plan.isActive)).toBe(true)
    })

    it('should get plan by ID', () => {
      const plan = pricingPlanManager.getPlan('basic')
      expect(plan).toBeDefined()
      expect(plan?.name).toBe('Basic Plan')
    })

    it('should return null for non-existent plan', () => {
      const plan = pricingPlanManager.getPlan('non-existent')
      expect(plan).toBeNull()
    })

    it('should update plan', async () => {
      const updates = {
        name: 'Updated Basic Plan',
        amount: 3499
      }

      const updatedPlan = await pricingPlanManager.updatePlan('basic', updates)

      expect(updatedPlan.name).toBe(updates.name)
      expect(updatedPlan.amount).toBe(updates.amount)
      expect(updatedPlan.updatedAt).not.toBe(updatedPlan.createdAt)
    })

    it('should delete plan', async () => {
      const success = await pricingPlanManager.deletePlan('basic')
      expect(success).toBe(true)
      expect(pricingPlanManager.getPlan('basic')).toBeNull()
    })

    it('should throw error when updating non-existent plan', async () => {
      await expect(
        pricingPlanManager.updatePlan('non-existent', { name: 'Test' })
      ).rejects.toThrow('Plan non-existent not found')
    })

    it('should throw error when deleting non-existent plan', async () => {
      await expect(
        pricingPlanManager.deletePlan('non-existent')
      ).rejects.toThrow('Plan non-existent not found')
    })
  })

  describe('Promotional Pricing', () => {
    it('should create promotional pricing', async () => {
      const promoData = {
        planId: 'basic',
        name: '50% Off Sale',
        description: 'Limited time offer',
        discountType: 'percentage' as const,
        discountValue: 50,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        maxUses: 100,
        conditions: [
          {
            field: 'customer_type' as const,
            operator: 'equals' as const,
            value: 'new'
          }
        ],
        metadata: {}
      }

      const promo = await pricingPlanManager.createPromotionalPricing(promoData)

      expect(promo).toBeDefined()
      expect(promo.planId).toBe(promoData.planId)
      expect(promo.discountType).toBe(promoData.discountType)
      expect(promo.discountValue).toBe(promoData.discountValue)
      expect(promo.usedCount).toBe(0)
    })

    it('should get promotional pricing for plan', async () => {
      const promo = await pricingPlanManager.createPromotionalPricing({
        planId: 'basic',
        name: 'Test Promotion',
        description: 'Test description',
        discountType: 'percentage',
        discountValue: 25,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        metadata: {}
      })

      const promos = pricingPlanManager.getPromotionalPricing('basic')
      expect(promos).toHaveLength(1)
      expect(promos[0].id).toBe(promo.id)
    })

    it('should filter out inactive promotions', async () => {
      await pricingPlanManager.createPromotionalPricing({
        planId: 'basic',
        name: 'Active Promotion',
        description: 'Active description',
        discountType: 'percentage',
        discountValue: 25,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        metadata: {}
      })

      await pricingPlanManager.createPromotionalPricing({
        planId: 'basic',
        name: 'Inactive Promotion',
        description: 'Inactive description',
        discountType: 'percentage',
        discountValue: 25,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: false,
        metadata: {}
      })

      const promos = pricingPlanManager.getPromotionalPricing('basic')
      expect(promos).toHaveLength(1)
      expect(promos[0].name).toBe('Active Promotion')
    })
  })

  describe('Price Calculation', () => {
    it('should calculate effective price without promotion', () => {
      const pricing = pricingPlanManager.calculateEffectivePrice('basic')
      
      expect(pricing.originalPrice).toBe(2999)
      expect(pricing.discountAmount).toBe(0)
      expect(pricing.finalPrice).toBe(2999)
      expect(pricing.promotionalId).toBeUndefined()
    })

    it('should calculate effective price with promotion', async () => {
      await pricingPlanManager.createPromotionalPricing({
        planId: 'basic',
        name: '50% Off',
        description: 'Half price sale',
        discountType: 'percentage',
        discountValue: 50,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        metadata: {}
      })

      const pricing = pricingPlanManager.calculateEffectivePrice('basic')
      
      expect(pricing.originalPrice).toBe(2999)
      expect(pricing.discountAmount).toBe(1499.5) // 50% of 2999
      expect(pricing.finalPrice).toBe(1499.5)
      expect(pricing.promotionalId).toBeDefined()
    })

    it('should calculate effective price with fixed amount discount', async () => {
      await pricingPlanManager.createPromotionalPricing({
        planId: 'basic',
        name: '$10 Off',
        description: 'Fixed amount discount',
        discountType: 'fixed_amount',
        discountValue: 10, // $10 in dollars
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        metadata: {}
      })

      const pricing = pricingPlanManager.calculateEffectivePrice('basic')
      
      expect(pricing.originalPrice).toBe(2999)
      expect(pricing.discountAmount).toBe(1000) // $10 in cents
      expect(pricing.finalPrice).toBe(1999)
    })

    it('should apply best promotion when multiple exist', async () => {
      // Create two promotions - one with 25% off, one with 50% off
      await pricingPlanManager.createPromotionalPricing({
        planId: 'basic',
        name: '25% Off',
        description: 'Quarter off',
        discountType: 'percentage',
        discountValue: 25,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        metadata: {}
      })

      await pricingPlanManager.createPromotionalPricing({
        planId: 'basic',
        name: '50% Off',
        description: 'Half off',
        discountType: 'percentage',
        discountValue: 50,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        metadata: {}
      })

      const pricing = pricingPlanManager.calculateEffectivePrice('basic')
      
      // Should apply the 50% discount (better deal)
      expect(pricing.discountAmount).toBe(1499.5) // 50% of 2999
      expect(pricing.finalPrice).toBe(1499.5)
    })

    it('should evaluate promotional conditions', async () => {
      await pricingPlanManager.createPromotionalPricing({
        planId: 'basic',
        name: 'New Customer Discount',
        description: 'For new customers only',
        discountType: 'percentage',
        discountValue: 30,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        conditions: [
          {
            field: 'customer_type',
            operator: 'equals',
            value: 'new'
          }
        ],
        metadata: {}
      })

      // Test with matching condition
      const pricingWithMatch = pricingPlanManager.calculateEffectivePrice('basic', {
        customer_type: 'new'
      })
      expect(pricingWithMatch.discountAmount).toBeGreaterThan(0)

      // Test without matching condition
      const pricingWithoutMatch = pricingPlanManager.calculateEffectivePrice('basic', {
        customer_type: 'existing'
      })
      expect(pricingWithoutMatch.discountAmount).toBe(0)
    })
  })

  describe('A/B Testing', () => {
    it('should create A/B test', async () => {
      const testData = {
        name: 'Pricing Test',
        description: 'Test different pricing',
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        variants: [
          {
            id: 'variant_1',
            name: 'Control',
            planId: 'basic',
            trafficPercentage: 50,
            isControl: true
          },
          {
            id: 'variant_2',
            name: 'Test',
            planId: 'premium',
            trafficPercentage: 50,
            isControl: false
          }
        ],
        trafficAllocation: 100,
        successMetric: 'conversion_rate' as const
      }

      const abTest = await pricingPlanManager.createABTest(testData)

      expect(abTest).toBeDefined()
      expect(abTest.name).toBe(testData.name)
      expect(abTest.variants).toHaveLength(2)
      expect(abTest.results.totalVisitors).toBe(0)
    })

    it('should get active A/B tests', async () => {
      await pricingPlanManager.createABTest({
        name: 'Active Test',
        description: 'Active test description',
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        variants: [],
        trafficAllocation: 100,
        successMetric: 'conversion_rate'
      })

      await pricingPlanManager.createABTest({
        name: 'Inactive Test',
        description: 'Inactive test description',
        isActive: false,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        variants: [],
        trafficAllocation: 100,
        successMetric: 'conversion_rate'
      })

      const activeTests = pricingPlanManager.getActiveABTests()
      expect(activeTests).toHaveLength(1)
      expect(activeTests[0].name).toBe('Active Test')
    })

    it('should assign user to A/B test variant', async () => {
      const abTest = await pricingPlanManager.createABTest({
        name: 'Pricing Test',
        description: 'Test different pricing',
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        variants: [
          {
            id: 'variant_1',
            name: 'Control',
            planId: 'basic',
            trafficPercentage: 50,
            isControl: true
          },
          {
            id: 'variant_2',
            name: 'Test',
            planId: 'premium',
            trafficPercentage: 50,
            isControl: false
          }
        ],
        trafficAllocation: 100,
        successMetric: 'conversion_rate'
      })

      const variant = pricingPlanManager.assignABTestVariant(abTest.id, 'user_123')
      expect(variant).toBeDefined()
      expect(['variant_1', 'variant_2']).toContain(variant?.id)
    })

    it('should return null for inactive A/B test', async () => {
      const abTest = await pricingPlanManager.createABTest({
        name: 'Inactive Test',
        description: 'Inactive test description',
        isActive: false,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        variants: [],
        trafficAllocation: 100,
        successMetric: 'conversion_rate'
      })

      const variant = pricingPlanManager.assignABTestVariant(abTest.id, 'user_123')
      expect(variant).toBeNull()
    })
  })

  describe('Statistics', () => {
    it('should calculate pricing statistics', async () => {
      // Create some promotional pricing
      await pricingPlanManager.createPromotionalPricing({
        planId: 'basic',
        name: 'Test Promotion',
        description: 'Test description',
        discountType: 'percentage',
        discountValue: 25,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        metadata: {}
      })

      // Create an A/B test
      await pricingPlanManager.createABTest({
        name: 'Test AB Test',
        description: 'Test description',
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        variants: [],
        trafficAllocation: 100,
        successMetric: 'conversion_rate'
      })

      const stats = pricingPlanManager.getPricingStatistics()

      expect(stats.totalPlans).toBe(2)
      expect(stats.activePlans).toBe(2)
      expect(stats.totalPromotions).toBe(1)
      expect(stats.activePromotions).toBe(1)
      expect(stats.totalABTests).toBe(1)
      expect(stats.activeABTests).toBe(1)
    })
  })
})


