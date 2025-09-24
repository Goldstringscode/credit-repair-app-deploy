import { NextRequest, NextResponse } from 'next/server'
import { subscriptionManager } from '@/lib/subscription-manager'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

// Validation schemas
const createSubscriptionSchema = z.object({
  action: z.string().optional(),
  customerId: z.string().min(1),
  planId: z.string().min(1),
  trialPeriodDays: z.number().min(0).optional(),
  quantity: z.number().min(1).optional(),
  metadata: z.record(z.any()).optional()
})

const updateSubscriptionSchema = z.object({
  planId: z.string().min(1),
  prorationBehavior: z.enum(['create_prorations', 'none', 'always_invoice']).optional(),
  quantity: z.number().min(1).optional()
})

const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().optional(),
  immediate: z.boolean().optional()
})

export const POST = withRateLimit(
  withValidation({
    body: createSubscriptionSchema
  })(
    async (request: NextRequest, validatedData?: any) => {
      try {
        const parsedData = validatedData?.body

        console.log('📝 Creating subscription for customer:', parsedData.customerId)

        const subscription = await subscriptionManager.createSubscription(
          parsedData.customerId,
          parsedData.planId,
          {
            trialPeriodDays: parsedData.trialPeriodDays,
            quantity: parsedData.quantity,
            metadata: parsedData.metadata
          }
        )

        return NextResponse.json({
          success: true,
          subscription: {
            id: subscription.id,
            customerId: subscription.customerId,
            planId: subscription.planId,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            trialStart: subscription.trialStart,
            trialEnd: subscription.trialEnd,
            quantity: subscription.quantity,
            metadata: subscription.metadata,
            createdAt: subscription.createdAt
          }
        })

      } catch (error: any) {
        console.error('❌ Subscription creation failed:', error)
        console.error('Error stack:', error.stack)
        return NextResponse.json({
          success: false,
          error: 'Failed to create subscription',
          message: error.message,
          details: error.stack
        }, { status: 500 })
      }
    },
    createSubscriptionSchema
  )
)

export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const customerId = searchParams.get('customerId')
      const planId = searchParams.get('planId')

      if (customerId) {
        console.log('📝 Fetching subscriptions for customer:', customerId)
        const subscriptions = await subscriptionManager.getCustomerSubscriptions(customerId)
        
        return NextResponse.json({
          success: true,
          subscriptions: subscriptions.map(sub => ({
            id: sub.id,
            customerId: sub.customerId,
            planId: sub.planId,
            status: sub.status,
            currentPeriodStart: sub.currentPeriodStart,
            currentPeriodEnd: sub.currentPeriodEnd,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            trialStart: sub.trialStart,
            trialEnd: sub.trialEnd,
            quantity: sub.quantity,
            metadata: sub.metadata,
            createdAt: sub.createdAt
          }))
        })
      }

      if (planId) {
        console.log('📝 Fetching plan details:', planId)
        const plan = await subscriptionManager.getPlan(planId)
        
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
            isActive: plan.isActive
          }
        })
      }

      // Return all plans if no specific query
      console.log('📝 Fetching all plans')
      const plans = await subscriptionManager.getPlans()
      
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
          isActive: plan.isActive
        }))
      })

    } catch (error: any) {
      console.error('❌ Failed to fetch subscriptions/plans:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch data',
        message: error.message
      }, { status: 500 })
    }
  }
)


