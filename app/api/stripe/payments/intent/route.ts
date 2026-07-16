import { NextRequest, NextResponse } from 'next/server'
import { stripePaymentService } from '@/lib/stripe/payments'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { getPlan, getPlanPrice } from '@/lib/subscription'
import { z } from 'zod'

// Validation schema for payment intent creation.
//
// SECURITY: the amount charged is ALWAYS computed server-side from planId
// via lib/subscription.ts, the app's single source of truth for plan
// pricing — never from a client-supplied amount. The previous version of
// this schema accepted an arbitrary client-supplied `amount` (any value
// from $0.01 to $999,999.99) with no server-side check that it matched a
// real plan's price, meaning a request could be tampered with client-side
// to pay $0.01 for any plan. planId is now required and is the only thing
// that determines what gets charged.
const createPaymentIntentSchema = z.object({
  planId: z.string(),
  currency: z.string().length(3).default('usd'),
  customerId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional()
})

export const POST = withRateLimit(
  withValidation({
    body: createPaymentIntentSchema
  })(
    async (request: NextRequest, validatedData: any) => {
      try {
        const { planId, currency, customerId, paymentMethodId, description, metadata } = validatedData.body

        const plan = getPlan(planId)
        if (!plan) {
          return NextResponse.json({
            success: false,
            error: 'Invalid plan'
          }, { status: 400 })
        }

        // Amount comes from the canonical plan price, never from the client.
        const amount = getPlanPrice(planId)

        console.log('💳 Creating payment intent:', { planId, amount, currency })

        const paymentIntent = await stripePaymentService.createPaymentIntent({
          amount,
          currency,
          customerId,
          paymentMethodId,
          description: description || `Subscription - ${plan.name}`,
          metadata: { ...metadata, planId }
        })

        return NextResponse.json({
          success: true,
          paymentIntent: {
            id: paymentIntent.id,
            client_secret: paymentIntent.client_secret,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
          }
        })

      } catch (error: any) {
        console.error('❌ Payment intent creation failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to create payment intent',
          message: error.message
        }, { status: 500 })
      }
    }
  )
)

