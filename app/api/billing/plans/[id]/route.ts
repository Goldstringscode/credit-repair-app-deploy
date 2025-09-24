import { NextRequest, NextResponse } from 'next/server'
import { pricingPlanManager } from '@/lib/pricing-plan-manager'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

// Validation schemas
const updatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  interval: z.enum(['day', 'week', 'month', 'year']).optional(),
  intervalCount: z.number().min(1).optional(),
  trialPeriodDays: z.number().min(0).optional(),
  features: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  sortOrder: z.number().min(0).optional(),
  metadata: z.record(z.any()).optional()
})

export const GET = withRateLimit(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const planId = params.id
      console.log('📊 Fetching pricing plan:', planId)

      const plan = pricingPlanManager.getPlan(planId)
      if (!plan) {
        return NextResponse.json({
          success: false,
          error: 'Plan not found'
        }, { status: 404 })
      }

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

    } catch (error: any) {
      console.error('❌ Failed to fetch plan:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch plan',
        message: error.message
      }, { status: 500 })
    }
  }
)

export const PATCH = withRateLimit(
  withValidation(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      try {
        const planId = params.id
        const body = await request.json()
        const validatedData = updatePlanSchema.parse(body)

        console.log('📊 Updating pricing plan:', planId)

        const plan = await pricingPlanManager.updatePlan(planId, validatedData)

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

      } catch (error: any) {
        console.error('❌ Plan update failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Plan update failed',
          message: error.message
        }, { status: 500 })
      }
    },
    updatePlanSchema
  )
)

export const DELETE = withRateLimit(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const planId = params.id
      console.log('📊 Deleting pricing plan:', planId)

      const success = await pricingPlanManager.deletePlan(planId)

      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Plan deleted successfully'
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Plan deletion failed'
        }, { status: 500 })
      }

    } catch (error: any) {
      console.error('❌ Plan deletion failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Plan deletion failed',
        message: error.message
      }, { status: 500 })
    }
  }
)


