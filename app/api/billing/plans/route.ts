import { NextRequest, NextResponse } from 'next/server'
import { pricingPlanManager } from '@/lib/pricing-plan-manager'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

// Validation schemas
const createPlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().min(0),
  currency: z.string().length(3),
  interval: z.enum(['day', 'week', 'month', 'year']),
  intervalCount: z.number().min(1),
  trialPeriodDays: z.number().min(0).optional(),
  features: z.array(z.string()).min(1),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  sortOrder: z.number().min(0).default(0),
  metadata: z.record(z.any()).optional()
})

const createPromotionSchema = z.object({
  planId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  discountType: z.enum(['percentage', 'fixed_amount']),
  discountValue: z.number().min(0),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean().default(true),
  maxUses: z.number().min(1).optional(),
  conditions: z.array(z.object({
    field: z.enum(['customer_type', 'subscription_count', 'signup_date', 'referral_source']),
    operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains']),
    value: z.any()
  })).optional(),
  metadata: z.record(z.any()).optional()
})

export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const type = searchParams.get('type')

      if (type === 'plans') {
        console.log('📊 Fetching pricing plans')
        const plans = pricingPlanManager.getAllPlans()
        
        return NextResponse.json({
          success: true,
          plans: plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            amount: plan.amount,
            currency: plan.currency,
            interval: plan.interval,
            intervalCount: plan.intervalCount,
            trialPeriodDays: plan.trialPeriodDays,
            features: plan.features,
            isActive: plan.isActive,
            isPopular: plan.isPopular,
            sortOrder: plan.sortOrder,
            metadata: plan.metadata,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt
          }))
        })
      }

      if (type === 'promotions') {
        console.log('📊 Fetching promotional pricing')
        const promotions = Array.from(pricingPlanManager['promotionalPricing'].values())
        
        return NextResponse.json({
          success: true,
          promotions: promotions.map(promo => ({
            id: promo.id,
            planId: promo.planId,
            name: promo.name,
            description: promo.description,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            startDate: promo.startDate,
            endDate: promo.endDate,
            isActive: promo.isActive,
            maxUses: promo.maxUses,
            usedCount: promo.usedCount,
            conditions: promo.conditions,
            metadata: promo.metadata,
            createdAt: promo.createdAt,
            updatedAt: promo.updatedAt
          }))
        })
      }

      if (type === 'ab-tests') {
        console.log('📊 Fetching A/B tests')
        const abTests = Array.from(pricingPlanManager['abTests'].values())
        
        return NextResponse.json({
          success: true,
          abTests: abTests.map(test => ({
            id: test.id,
            name: test.name,
            description: test.description,
            isActive: test.isActive,
            startDate: test.startDate,
            endDate: test.endDate,
            variants: test.variants,
            trafficAllocation: test.trafficAllocation,
            successMetric: test.successMetric,
            customMetric: test.customMetric,
            results: test.results,
            createdAt: test.createdAt,
            updatedAt: test.updatedAt
          }))
        })
      }

      if (type === 'statistics') {
        console.log('📊 Fetching pricing statistics')
        const statistics = pricingPlanManager.getPricingStatistics()
        
        return NextResponse.json({
          success: true,
          statistics
        })
      }

      // Return all data by default
      console.log('📊 Fetching all pricing data')
      const plans = pricingPlanManager.getAllPlans()
      const promotions = Array.from(pricingPlanManager['promotionalPricing'].values())
      const abTests = Array.from(pricingPlanManager['abTests'].values())
      const statistics = pricingPlanManager.getPricingStatistics()
      
      return NextResponse.json({
        success: true,
        plans: plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          amount: plan.amount,
          currency: plan.currency,
          interval: plan.interval,
          intervalCount: plan.intervalCount,
          trialPeriodDays: plan.trialPeriodDays,
          features: plan.features,
          isActive: plan.isActive,
          isPopular: plan.isPopular,
          sortOrder: plan.sortOrder,
          metadata: plan.metadata,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt
        })),
        promotions: promotions.map(promo => ({
          id: promo.id,
          planId: promo.planId,
          name: promo.name,
          description: promo.description,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          startDate: promo.startDate,
          endDate: promo.endDate,
          isActive: promo.isActive,
          maxUses: promo.maxUses,
          usedCount: promo.usedCount,
          conditions: promo.conditions,
          metadata: promo.metadata,
          createdAt: promo.createdAt,
          updatedAt: promo.updatedAt
        })),
        abTests: abTests.map(test => ({
          id: test.id,
          name: test.name,
          description: test.description,
          isActive: test.isActive,
          startDate: test.startDate,
          endDate: test.endDate,
          variants: test.variants,
          trafficAllocation: test.trafficAllocation,
          successMetric: test.successMetric,
          customMetric: test.customMetric,
          results: test.results,
          createdAt: test.createdAt,
          updatedAt: test.updatedAt
        })),
        statistics
      })

    } catch (error: any) {
      console.error('❌ Failed to fetch pricing data:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch pricing data',
        message: error.message
      }, { status: 500 })
    }
  }
)

export const POST = withRateLimit(
  withValidation({
    body: z.union([
      z.object({
        action: z.literal('create_plan'),
        name: z.string().min(1),
        description: z.string().min(1),
        amount: z.number().min(0),
        currency: z.string().length(3),
        interval: z.enum(['day', 'week', 'month', 'year']),
        intervalCount: z.number().min(1),
        trialPeriodDays: z.number().min(0).optional(),
        features: z.array(z.string()).min(1),
        isActive: z.boolean().default(true),
        isPopular: z.boolean().default(false),
        sortOrder: z.number().min(0).default(0),
        metadata: z.record(z.any()).optional()
      }),
      z.object({
        action: z.literal('create_promotion'),
        planId: z.string().min(1),
        name: z.string().min(1),
        description: z.string().min(1),
        discountType: z.enum(['percentage', 'fixed_amount']),
        discountValue: z.number().min(0),
        startDate: z.string(),
        endDate: z.string(),
        isActive: z.boolean().default(true),
        maxUses: z.number().min(1).optional(),
        conditions: z.array(z.object({
          field: z.enum(['customer_type', 'subscription_count', 'signup_date', 'referral_source']),
          operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains']),
          value: z.any()
        })).optional(),
        metadata: z.record(z.any()).optional()
      }),
      z.object({
        action: z.literal('calculate_price'),
        planId: z.string().min(1),
        customerData: z.any()
      })
    ])
  })(
    async (request: NextRequest, validatedData?: any) => {
      try {
        const action = validatedData.action

        if (action === 'create_plan') {
          console.log('📊 Creating pricing plan:', validatedData.name)
          const plan = await pricingPlanManager.createPlan(validatedData)

          return NextResponse.json({
            success: true,
            plan: {
              id: plan.id,
              name: plan.name,
              description: plan.description,
              amount: plan.amount,
              currency: plan.currency,
              interval: plan.interval,
              intervalCount: plan.intervalCount,
              trialPeriodDays: plan.trialPeriodDays,
              features: plan.features,
              isActive: plan.isActive,
              isPopular: plan.isPopular,
              sortOrder: plan.sortOrder,
              metadata: plan.metadata,
              createdAt: plan.createdAt,
              updatedAt: plan.updatedAt
            }
          })
        }

        if (action === 'create_promotion') {
          console.log('📊 Creating promotional pricing:', validatedData.name)
          const promotion = await pricingPlanManager.createPromotionalPricing(validatedData)

          return NextResponse.json({
            success: true,
            promotion: {
              id: promotion.id,
              planId: promotion.planId,
              name: promotion.name,
              description: promotion.description,
              discountType: promotion.discountType,
              discountValue: promotion.discountValue,
              startDate: promotion.startDate,
              endDate: promotion.endDate,
              isActive: promotion.isActive,
              maxUses: promotion.maxUses,
              usedCount: promotion.usedCount,
              conditions: promotion.conditions,
              metadata: promotion.metadata,
              createdAt: promotion.createdAt,
              updatedAt: promotion.updatedAt
            }
          })
        }

        if (action === 'calculate_price') {
          console.log('📊 Calculating effective price for plan:', validatedData.planId)
          const pricing = pricingPlanManager.calculateEffectivePrice(validatedData.planId, validatedData.customerData)

          return NextResponse.json({
            success: true,
            pricing
          })
        }

        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })

      } catch (error: any) {
        console.error('❌ Pricing action failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Pricing action failed',
          message: error.message
        }, { status: 500 })
      }
    }
  )
)


