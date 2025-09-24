import { NextRequest, NextResponse } from 'next/server'
import { stripeSubscriptionService } from '@/lib/stripe/subscriptions'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

// Validation schema for subscription creation
const createSubscriptionSchema = z.object({
  customerId: z.string().min(1),
  priceId: z.string().min(1),
  paymentMethodId: z.string().optional(),
  trialPeriodDays: z.number().min(0).max(365).optional(),
  metadata: z.record(z.string()).optional()
})

export const POST = withRateLimit(
  withValidation(
    async (request: NextRequest) => {
      try {
        const body = await request.json()
        const validatedData = createSubscriptionSchema.parse(body)

        console.log('📋 Creating subscription:', validatedData.customerId)

        const subscription = await stripeSubscriptionService.createSubscription({
          customerId: validatedData.customerId,
          priceId: validatedData.priceId,
          paymentMethodId: validatedData.paymentMethodId,
          trialPeriodDays: validatedData.trialPeriodDays,
          metadata: validatedData.metadata
        })

        return NextResponse.json({
          success: true,
          subscription: {
            id: subscription.id,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            trial_start: subscription.trial_start,
            trial_end: subscription.trial_end,
            customer: subscription.customer,
            items: subscription.items.data
          }
        })

      } catch (error: any) {
        console.error('❌ Subscription creation failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to create subscription',
          message: error.message
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

      if (!customerId) {
        // Return available plans
        const plans = stripeSubscriptionService.getPlans()
        return NextResponse.json({
          success: true,
          plans: plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            currency: plan.currency,
            interval: plan.interval,
            features: plan.features
          }))
        })
      }

      // Get customer's subscriptions
      const subscriptions = await stripeSubscriptionService.getCustomerSubscriptions(customerId)

      return NextResponse.json({
        success: true,
        subscriptions: subscriptions.map(sub => ({
          id: sub.id,
          status: sub.status,
          current_period_start: sub.current_period_start,
          current_period_end: sub.current_period_end,
          trial_start: sub.trial_start,
          trial_end: sub.trial_end,
          items: sub.items.data
        }))
      })

    } catch (error: any) {
      console.error('❌ Failed to get subscriptions:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to get subscriptions',
        message: error.message
      }, { status: 500 })
    }
  }
)
