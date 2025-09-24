import { NextRequest, NextResponse } from 'next/server'
import { dunningManager } from '@/lib/dunning-manager'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

const retryPaymentSchema = z.object({
  paymentMethodId: z.string().min(1)
})

export const POST = withRateLimit(
  withValidation(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      try {
        const eventId = params.id
        const body = await request.json()
        const validatedData = retryPaymentSchema.parse(body)

        console.log('💳 Retrying payment for dunning event:', eventId)

        // Get the dunning event
        const event = dunningManager.getEvent(eventId)
        if (!event) {
          return NextResponse.json({
            success: false,
            error: 'Dunning event not found'
          }, { status: 404 })
        }

        // Retry payment
        const success = await dunningManager.retryPayment(
          event.subscriptionId,
          validatedData.paymentMethodId
        )

        if (success) {
          return NextResponse.json({
            success: true,
            message: 'Payment retry initiated successfully'
          })
        } else {
          return NextResponse.json({
            success: false,
            error: 'Payment retry failed'
          }, { status: 500 })
        }

      } catch (error: any) {
        console.error('❌ Payment retry failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Payment retry failed',
          message: error.message
        }, { status: 500 })
      }
    },
    retryPaymentSchema
  )
)


