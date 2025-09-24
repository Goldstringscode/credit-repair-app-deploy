import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { database } from '@/lib/database'
import { withRateLimit } from '@/lib/rate-limiter'

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      // Get user's subscriptions
      const subscriptions = await database.getCustomerSubscriptions(user.customerId || user.id)
      
      if (subscriptions.length === 0) {
        return NextResponse.json({
          success: true,
          subscription: null,
          plan: null,
          message: 'No active subscription found'
        })
      }

      // Get the most recent active subscription
      const activeSubscription = subscriptions.find(sub => 
        sub.status === 'active' || sub.status === 'trialing'
      ) || subscriptions[0]

      // Get the plan details
      const plan = await database.getPlan(activeSubscription.planId)

      return NextResponse.json({
        success: true,
        subscription: {
          id: activeSubscription.id,
          customerId: activeSubscription.customerId,
          planId: activeSubscription.planId,
          status: activeSubscription.status,
          currentPeriodStart: activeSubscription.currentPeriodStart,
          currentPeriodEnd: activeSubscription.currentPeriodEnd,
          cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
          canceledAt: activeSubscription.canceledAt,
          trialStart: activeSubscription.trialStart,
          trialEnd: activeSubscription.trialEnd,
          quantity: activeSubscription.quantity,
          metadata: activeSubscription.metadata,
          createdAt: activeSubscription.createdAt,
          updatedAt: activeSubscription.updatedAt
        },
        plan: plan ? {
          id: plan.id,
          name: plan.name,
          amount: plan.amount,
          interval: plan.interval,
          intervalCount: plan.intervalCount,
          features: plan.features
        } : null
      })

    } catch (error: any) {
      console.error('❌ Failed to fetch user subscription:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch subscription',
        message: error.message
      }, { status: 500 })
    }
  }),
  'general'
)
