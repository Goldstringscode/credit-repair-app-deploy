import { NextRequest, NextResponse } from 'next/server'
import { stripePaymentService } from '@/lib/stripe/payments'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

// Validation schema for payment intent confirmation
const confirmPaymentIntentSchema = z.object({
  paymentIntentId: z.string().min(1),
  paymentMethodId: z.string().optional()
})

export const POST = withRateLimit(
  withValidation({
    body: confirmPaymentIntentSchema
  })(
    async (request: NextRequest, validatedData: any) => {
      try {
        console.log('💳 Confirming payment intent:', validatedData.body.paymentIntentId)

        const paymentIntent = await stripePaymentService.confirmPaymentIntent(
          validatedData.body.paymentIntentId,
          validatedData.body.paymentMethodId
        )

        return NextResponse.json({
          success: true,
          paymentIntent: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            charges: (paymentIntent as any).charges?.data
          }
        })

      } catch (error: any) {
        console.error('❌ Payment intent confirmation failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to confirm payment intent',
          message: error.message
        }, { status: 500 })
      }
    }
  )
)
