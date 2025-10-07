import { NextRequest, NextResponse } from 'next/server'
import { stripePaymentService } from '@/lib/stripe/payments'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

// Validation schema for payment intent creation
const createPaymentIntentSchema = z.object({
  amount: z.number().min(0.01).max(999999.99),
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
        console.log('💳 Creating payment intent:', validatedData.body)

        const paymentIntent = await stripePaymentService.createPaymentIntent({
          amount: validatedData.body.amount,
          currency: validatedData.body.currency,
          customerId: validatedData.body.customerId,
          paymentMethodId: validatedData.body.paymentMethodId,
          description: validatedData.body.description,
          metadata: validatedData.body.metadata
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
