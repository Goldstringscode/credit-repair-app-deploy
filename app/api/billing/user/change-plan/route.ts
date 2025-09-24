import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { subscriptionManager } from '@/lib/subscription-manager'
import { withRateLimit } from '@/lib/rate-limiter'

export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const body = await request.json()
      const { subscriptionId, newPlanId, changeType, prorationBehavior } = body

      if (!subscriptionId || !newPlanId || !changeType) {
        return NextResponse.json({
          success: false,
          error: 'Subscription ID, new plan ID, and change type are required'
        }, { status: 400 })
      }

      // Verify subscription belongs to user
      const subscription = await subscriptionManager.getSubscription(subscriptionId)
      if (!subscription || subscription.customerId !== user.id) {
        return NextResponse.json({
          success: false,
          error: 'Subscription not found or access denied'
        }, { status: 404 })
      }

      // Get current and new plan details
      const currentPlan = await subscriptionManager.getPlan(subscription.planId)
      const newPlan = await subscriptionManager.getPlan(newPlanId)

      if (!currentPlan || !newPlan) {
        return NextResponse.json({
          success: false,
          error: 'Plan not found'
        }, { status: 404 })
      }

      // Check if it's the same plan
      if (subscription.planId === newPlanId) {
        return NextResponse.json({
          success: false,
          error: 'You are already on this plan'
        }, { status: 400 })
      }

      // Update subscription plan
      const result = await subscriptionManager.updateSubscriptionPlan(
        subscriptionId,
        newPlanId,
        {
          prorationBehavior: prorationBehavior || 'create_prorations',
          quantity: subscription.quantity
        }
      )

      return NextResponse.json({
        success: true,
        subscription: {
          id: result.subscription.id,
          planId: result.subscription.planId,
          status: result.subscription.status,
          currentPeriodStart: result.subscription.currentPeriodStart,
          currentPeriodEnd: result.subscription.currentPeriodEnd,
          cancelAtPeriodEnd: result.subscription.cancelAtPeriodEnd,
          updatedAt: result.subscription.updatedAt
        },
        proration: result.proration ? {
          prorationAmount: result.proration.prorationAmount,
          creditAmount: result.proration.creditAmount,
          newAmount: result.proration.newAmount,
          effectiveDate: result.proration.effectiveDate
        } : null,
        message: 'Plan updated successfully'
      })

    } catch (error: any) {
      console.error('❌ Failed to change plan:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to change plan',
        message: error.message
      }, { status: 500 })
    }
  }),
  'general'
)