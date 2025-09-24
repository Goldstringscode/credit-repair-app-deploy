import { auditLogger } from './audit-logger'

export interface PricingPlan {
  id: string
  name: string
  description: string
  amount: number
  currency: string
  interval: 'day' | 'week' | 'month' | 'year'
  intervalCount: number
  trialPeriodDays?: number
  features: string[]
  isActive: boolean
  isPopular?: boolean
  sortOrder: number
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface PromotionalPricing {
  id: string
  planId: string
  name: string
  description: string
  discountType: 'percentage' | 'fixed_amount'
  discountValue: number
  startDate: string
  endDate: string
  isActive: boolean
  maxUses?: number
  usedCount: number
  conditions: PromotionalCondition[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface PromotionalCondition {
  field: 'customer_type' | 'subscription_count' | 'signup_date' | 'referral_source'
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
  value: any
}

export interface ABTest {
  id: string
  name: string
  description: string
  isActive: boolean
  startDate: string
  endDate: string
  variants: ABTestVariant[]
  trafficAllocation: number // Percentage of traffic to include in test
  successMetric: 'conversion_rate' | 'revenue' | 'retention' | 'custom'
  customMetric?: string
  results: ABTestResults
  createdAt: string
  updatedAt: string
}

export interface ABTestVariant {
  id: string
  name: string
  planId: string
  trafficPercentage: number
  isControl: boolean
}

export interface ABTestResults {
  totalVisitors: number
  totalConversions: number
  conversionRate: number
  revenue: number
  retentionRate: number
  variantResults: {
    [variantId: string]: {
      visitors: number
      conversions: number
      conversionRate: number
      revenue: number
      retentionRate: number
    }
  }
  statisticalSignificance: number
  confidenceLevel: number
}

export class PricingPlanManager {
  private plans: Map<string, PricingPlan> = new Map()
  private promotionalPricing: Map<string, PromotionalPricing> = new Map()
  private abTests: Map<string, ABTest> = new Map()

  constructor() {
    this.initializeDefaultPlans()
  }

  /**
   * Initialize default pricing plans
   */
  private initializeDefaultPlans(): void {
    const defaultPlans: PricingPlan[] = [
      {
        id: 'basic',
        name: 'Basic Plan',
        description: 'Essential credit repair tools for individuals',
        amount: 2999, // $29.99 in cents
        currency: 'usd',
        interval: 'month',
        intervalCount: 1,
        trialPeriodDays: 7,
        features: [
          'Credit report analysis',
          'Basic dispute letters',
          'Email support',
          'Monthly credit monitoring',
          'Up to 3 credit reports'
        ],
        isActive: true,
        isPopular: false,
        sortOrder: 1,
        metadata: {
          stripePriceId: 'price_basic_monthly',
          category: 'individual'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        description: 'Advanced credit repair features for serious users',
        amount: 5999, // $59.99 in cents
        currency: 'usd',
        interval: 'month',
        intervalCount: 1,
        trialPeriodDays: 14,
        features: [
          'Everything in Basic',
          'Advanced dispute strategies',
          'Priority support',
          'Weekly credit monitoring',
          'Custom dispute letters',
          'Credit score tracking',
          'Up to 10 credit reports',
          'Identity theft protection'
        ],
        isActive: true,
        isPopular: true,
        sortOrder: 2,
        metadata: {
          stripePriceId: 'price_premium_monthly',
          category: 'individual'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'enterprise',
        name: 'Enterprise Plan',
        description: 'Complete credit repair solution for businesses',
        amount: 9999, // $99.99 in cents
        currency: 'usd',
        interval: 'month',
        intervalCount: 1,
        trialPeriodDays: 30,
        features: [
          'Everything in Premium',
          'Unlimited disputes',
          '24/7 phone support',
          'Daily credit monitoring',
          'AI-powered recommendations',
          'White-label options',
          'API access',
          'Custom integrations',
          'Dedicated account manager'
        ],
        isActive: true,
        isPopular: false,
        sortOrder: 3,
        metadata: {
          stripePriceId: 'price_enterprise_monthly',
          category: 'business'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    defaultPlans.forEach(plan => {
      this.plans.set(plan.id, plan)
    })
  }

  /**
   * Get all pricing plans
   */
  getAllPlans(): PricingPlan[] {
    return Array.from(this.plans.values()).sort((a, b) => a.sortOrder - b.sortOrder)
  }

  /**
   * Get active pricing plans
   */
  getActivePlans(): PricingPlan[] {
    return this.getAllPlans().filter(plan => plan.isActive)
  }

  /**
   * Get plan by ID
   */
  getPlan(planId: string): PricingPlan | null {
    return this.plans.get(planId) || null
  }

  /**
   * Create a new pricing plan
   */
  async createPlan(planData: Omit<PricingPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<PricingPlan> {
    try {
      const plan: PricingPlan = {
        ...planData,
        id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      this.plans.set(plan.id, plan)

      // Log plan creation
      try {
        auditLogger.log({
          userId: 'admin',
          ipAddress: 'system',
          userAgent: 'system',
          action: 'pricing_plan_created',
          resource: 'pricing_plan',
          method: 'POST',
          endpoint: '/api/billing/plans',
          statusCode: 200,
          severity: 'medium',
          category: 'billing',
          metadata: {
            planId: plan.id,
            planName: plan.name,
            amount: plan.amount,
            currency: plan.currency
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

      console.log(`✅ Created pricing plan: ${plan.name}`)
      return plan

    } catch (error: any) {
      console.error('❌ Plan creation failed:', error)
      throw new Error(`Plan creation failed: ${error.message}`)
    }
  }

  /**
   * Update a pricing plan
   */
  async updatePlan(planId: string, updates: Partial<PricingPlan>): Promise<PricingPlan> {
    try {
      const existingPlan = this.plans.get(planId)
      if (!existingPlan) {
        throw new Error(`Plan ${planId} not found`)
      }

      const updatedPlan: PricingPlan = {
        ...existingPlan,
        ...updates,
        id: planId, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      }

      this.plans.set(planId, updatedPlan)

      // Log plan update
      try {
        auditLogger.log({
          userId: 'admin',
          ipAddress: 'system',
          userAgent: 'system',
          action: 'pricing_plan_updated',
          resource: 'pricing_plan',
          method: 'PATCH',
          endpoint: '/api/billing/plans',
          statusCode: 200,
          severity: 'medium',
          category: 'billing',
          metadata: {
            planId: planId,
            planName: updatedPlan.name,
            changes: Object.keys(updates)
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

      console.log(`✅ Updated pricing plan: ${updatedPlan.name}`)
      return updatedPlan

    } catch (error: any) {
      console.error('❌ Plan update failed:', error)
      throw new Error(`Plan update failed: ${error.message}`)
    }
  }

  /**
   * Delete a pricing plan
   */
  async deletePlan(planId: string): Promise<boolean> {
    try {
      const plan = this.plans.get(planId)
      if (!plan) {
        throw new Error(`Plan ${planId} not found`)
      }

      this.plans.delete(planId)

      // Log plan deletion
      try {
        auditLogger.log({
          userId: 'admin',
          ipAddress: 'system',
          userAgent: 'system',
          action: 'pricing_plan_deleted',
          resource: 'pricing_plan',
          method: 'DELETE',
          endpoint: '/api/billing/plans',
          statusCode: 200,
          severity: 'high',
          category: 'billing',
          metadata: {
            planId: planId,
            planName: plan.name
          }
        })
      } catch (error) {
        console.log('Audit logging failed (non-critical):', error)
      }

      console.log(`✅ Deleted pricing plan: ${plan.name}`)
      return true

    } catch (error: any) {
      console.error('❌ Plan deletion failed:', error)
      throw new Error(`Plan deletion failed: ${error.message}`)
    }
  }

  /**
   * Create promotional pricing
   */
  async createPromotionalPricing(promotionalData: Omit<PromotionalPricing, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>): Promise<PromotionalPricing> {
    try {
      const promotional: PromotionalPricing = {
        ...promotionalData,
        id: `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        usedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      this.promotionalPricing.set(promotional.id, promotional)

      console.log(`✅ Created promotional pricing: ${promotional.name}`)
      return promotional

    } catch (error: any) {
      console.error('❌ Promotional pricing creation failed:', error)
      throw new Error(`Promotional pricing creation failed: ${error.message}`)
    }
  }

  /**
   * Get promotional pricing for a plan
   */
  getPromotionalPricing(planId: string): PromotionalPricing[] {
    const now = new Date().toISOString()
    return Array.from(this.promotionalPricing.values())
      .filter(promo => 
        promo.planId === planId && 
        promo.isActive &&
        promo.startDate <= now &&
        (promo.endDate >= now || !promo.endDate) &&
        (!promo.maxUses || promo.usedCount < promo.maxUses)
      )
  }

  /**
   * Calculate effective price for a plan
   */
  calculateEffectivePrice(planId: string, customerData?: Record<string, any>): {
    originalPrice: number
    discountAmount: number
    finalPrice: number
    promotionalId?: string
    currency: string
  } {
    const plan = this.getPlan(planId)
    if (!plan) {
      throw new Error(`Plan ${planId} not found`)
    }

    const promotionalPricing = this.getPromotionalPricing(planId)
    let bestPromo: PromotionalPricing | null = null
    let bestDiscount = 0

    // Find the best applicable promotional pricing
    for (const promo of promotionalPricing) {
      if (this.evaluatePromotionalConditions(promo, customerData)) {
        const discount = promo.discountType === 'percentage' 
          ? (plan.amount * promo.discountValue) / 100
          : promo.discountValue * 100 // Convert to cents

        if (discount > bestDiscount) {
          bestDiscount = discount
          bestPromo = promo
        }
      }
    }

    const finalPrice = Math.max(0, plan.amount - bestDiscount)

    return {
      originalPrice: plan.amount,
      discountAmount: bestDiscount,
      finalPrice: finalPrice,
      promotionalId: bestPromo?.id,
      currency: plan.currency
    }
  }

  /**
   * Evaluate promotional conditions
   */
  private evaluatePromotionalConditions(promo: PromotionalPricing, customerData?: Record<string, any>): boolean {
    if (!customerData) return true

    return promo.conditions.every(condition => {
      const value = customerData[condition.field]
      if (value === undefined) return false

      switch (condition.operator) {
        case 'equals':
          return value === condition.value
        case 'not_equals':
          return value !== condition.value
        case 'greater_than':
          return value > condition.value
        case 'less_than':
          return value < condition.value
        case 'contains':
          return String(value).toLowerCase().includes(String(condition.value).toLowerCase())
        default:
          return false
      }
    })
  }

  /**
   * Create A/B test
   */
  async createABTest(testData: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt' | 'results'>): Promise<ABTest> {
    try {
      const abTest: ABTest = {
        ...testData,
        id: `abtest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        results: {
          totalVisitors: 0,
          totalConversions: 0,
          conversionRate: 0,
          revenue: 0,
          retentionRate: 0,
          variantResults: {},
          statisticalSignificance: 0,
          confidenceLevel: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      this.abTests.set(abTest.id, abTest)

      console.log(`✅ Created A/B test: ${abTest.name}`)
      return abTest

    } catch (error: any) {
      console.error('❌ A/B test creation failed:', error)
      throw new Error(`A/B test creation failed: ${error.message}`)
    }
  }

  /**
   * Get active A/B tests
   */
  getActiveABTests(): ABTest[] {
    const now = new Date().toISOString()
    return Array.from(this.abTests.values())
      .filter(test => 
        test.isActive &&
        test.startDate <= now &&
        test.endDate >= now
      )
  }

  /**
   * Assign user to A/B test variant
   */
  assignABTestVariant(testId: string, userId: string): ABTestVariant | null {
    const test = this.abTests.get(testId)
    if (!test || !test.isActive) return null

    // Simple hash-based assignment for consistency
    const hash = this.hashString(userId + testId)
    const random = hash % 100

    let cumulativePercentage = 0
    for (const variant of test.variants) {
      cumulativePercentage += variant.trafficPercentage
      if (random < cumulativePercentage) {
        return variant
      }
    }

    return test.variants[0] // Fallback to first variant
  }

  /**
   * Simple hash function
   */
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Get pricing statistics
   */
  getPricingStatistics(): {
    totalPlans: number
    activePlans: number
    totalPromotions: number
    activePromotions: number
    totalABTests: number
    activeABTests: number
  } {
    const allPlans = Array.from(this.plans.values())
    const allPromotions = Array.from(this.promotionalPricing.values())
    const allABTests = Array.from(this.abTests.values())

    return {
      totalPlans: allPlans.length,
      activePlans: allPlans.filter(plan => plan.isActive).length,
      totalPromotions: allPromotions.length,
      activePromotions: allPromotions.filter(promo => promo.isActive).length,
      totalABTests: allABTests.length,
      activeABTests: allABTests.filter(test => test.isActive).length
    }
  }
}

// Export singleton instance
export const pricingPlanManager = new PricingPlanManager()


