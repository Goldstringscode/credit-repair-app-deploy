import { NextRequest, NextResponse } from 'next/server'
import { subscriptionManager } from '@/lib/subscription-manager'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

// Validation schemas
const updateSubscriptionSchema = z.object({
  planId: z.string().min(1),
  prorationBehavior: z.enum(['create_prorations', 'none', 'always_invoice']).optional(),
  quantity: z.number().min(1).optional()
})

const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().optional(),
  immediate: z.boolean().optional()
})

const pauseSubscriptionSchema = z.object({
  pauseUntil: z.string().optional(),
  reason: z.string().optional()
})

export const GET = withRateLimit(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const params = await context.params
      const subscriptionId = params.id
      console.log('📝 Fetching subscription:', subscriptionId)
      console.log('📝 Params:', params)

      const subscription = await subscriptionManager.getSubscription(subscriptionId)
      
      if (!subscription) {
        return NextResponse.json({
          success: false,
          error: 'Subscription not found'
        }, { status: 404 })
      }

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
          canceledAt: subscription.canceledAt,
          trialStart: subscription.trialStart,
          trialEnd: subscription.trialEnd,
          quantity: subscription.quantity,
          metadata: subscription.metadata,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt
        }
      })

    } catch (error: any) {
      console.error('❌ Failed to fetch subscription:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch subscription',
        message: error.message
      }, { status: 500 })
    }
  },
  'test'
)

export const PATCH = withRateLimit(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const params = await context.params
      const subscriptionId = params.id
      const body = await request.json()
      
      // Validate the request body
      const validatedData = updateSubscriptionSchema.parse(body)

      console.log('📝 Updating subscription:', subscriptionId)
      console.log('📝 Validated data:', validatedData)

      const result = await subscriptionManager.updateSubscriptionPlan(
        subscriptionId,
        validatedData.planId,
        {
          prorationBehavior: validatedData.prorationBehavior,
          quantity: validatedData.quantity
        }
      )

      console.log('📝 Update result:', result)

      return NextResponse.json({
        success: true,
        subscription: {
          id: result.subscription.id,
          customerId: result.subscription.customerId,
          planId: result.subscription.planId,
          status: result.subscription.status,
          currentPeriodStart: result.subscription.currentPeriodStart,
          currentPeriodEnd: result.subscription.currentPeriodEnd,
          cancelAtPeriodEnd: result.subscription.cancelAtPeriodEnd,
          quantity: result.subscription.quantity,
          metadata: result.subscription.metadata,
          updatedAt: result.subscription.updatedAt
        },
        proration: result.proration ? {
          prorationAmount: result.proration.prorationAmount,
          creditAmount: result.proration.creditAmount,
          newAmount: result.proration.newAmount,
          effectiveDate: result.proration.effectiveDate,
          calculation: {
            oldPlan: result.proration.calculation.oldPlan.name,
            newPlan: result.proration.calculation.newPlan.name,
            daysRemaining: result.proration.calculation.daysRemaining,
            totalDays: result.proration.calculation.totalDays,
            dailyRate: result.proration.calculation.dailyRate
          }
        } : null
      })

    } catch (error: any) {
      console.error('❌ Subscription update failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update subscription',
        message: error.message
      }, { status: 500 })
    }
  },
  'test'
)

export const DELETE = async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const params = await context.params
      const subscriptionId = params.id
      console.log('📝 DELETE endpoint reached, subscriptionId:', subscriptionId)
      
      // Workaround for Next.js App Router DELETE with body issue
      // Use query parameters instead of body for DELETE requests
      const url = new URL(request.url)
      const cancelAtPeriodEnd = url.searchParams.get('cancelAtPeriodEnd') === 'true'
      const immediate = url.searchParams.get('immediate') === 'true'
      
      console.log('📝 Query params - cancelAtPeriodEnd:', cancelAtPeriodEnd, 'immediate:', immediate)
      
      // Simple validation - use query params or defaults
      const validatedData = {
        cancelAtPeriodEnd: cancelAtPeriodEnd ?? true,
        immediate: immediate ?? false
      }
      console.log('📝 Using validated data:', validatedData)

      console.log('📝 Canceling subscription:', subscriptionId)

      const subscription = await subscriptionManager.cancelSubscription(
        subscriptionId,
        {
          cancelAtPeriodEnd: validatedData.cancelAtPeriodEnd,
          immediate: validatedData.immediate
        }
      )

      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          customerId: subscription.customerId,
          planId: subscription.planId,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          canceledAt: subscription.canceledAt,
          updatedAt: subscription.updatedAt
        }
      })

    } catch (error: any) {
      console.error('❌ Subscription cancellation failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to cancel subscription',
        message: error.message
      }, { status: 500 })
    }
  }

// Note: PAUSE and RESUME functionality should be implemented as separate API routes
// or handled through the PATCH endpoint with appropriate action parameters


