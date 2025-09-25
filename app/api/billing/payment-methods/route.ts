import { NextRequest, NextResponse } from 'next/server'
import { stripePaymentService } from '@/lib/stripe/payments'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

// Validation schemas
const createPaymentMethodSchema = z.object({
  customerId: z.string().min(1),
  type: z.literal('card'),
  card: z.object({
    number: z.string().min(13).max(19),
    exp_month: z.number().min(1).max(12),
    exp_year: z.number().min(new Date().getFullYear()),
    cvc: z.string().min(3).max(4)
  }),
  billing_details: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    address: z.object({
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postal_code: z.string().min(1),
      country: z.string().length(2)
    }).optional()
  })
})

const attachPaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(1),
  customerId: z.string().min(1),
  setAsDefault: z.boolean().optional()
})

export const POST = withRateLimit(
  withValidation({
    body: createPaymentMethodSchema
  })(
    async (request: NextRequest, validatedData?: any) => {
      try {
        console.log('💳 Creating payment method for customer:', validatedData.customerId)

        // Create payment method
        const paymentMethod = await stripePaymentService.createPaymentMethod({
          type: validatedData.type,
          card: validatedData.card,
          billing_details: validatedData.billing_details
        })

        // Attach to customer
        const attachedMethod = await stripePaymentService.attachPaymentMethod(
          paymentMethod.id,
          validatedData.customerId
        )

        return NextResponse.json({
          success: true,
          paymentMethod: {
            id: attachedMethod.id,
            type: attachedMethod.type,
            card: {
              brand: attachedMethod.card?.brand,
              last4: attachedMethod.card?.last4,
              expMonth: attachedMethod.card?.exp_month,
              expYear: attachedMethod.card?.exp_year
            },
            billing_details: attachedMethod.billing_details,
            created: attachedMethod.created
          }
        })

      } catch (error: any) {
        console.error('❌ Payment method creation failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to create payment method',
          message: error.message
        }, { status: 500 })
      }
    }
  )
)

export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const customerId = searchParams.get('customerId')

      if (!customerId) {
        return NextResponse.json({
          success: false,
          error: 'Customer ID is required'
        }, { status: 400 })
      }

      console.log('💳 Fetching payment methods for customer:', customerId)

      const paymentMethods = await stripePaymentService.getCustomerPaymentMethods(customerId)

      return NextResponse.json({
        success: true,
        paymentMethods: paymentMethods.map(method => ({
          id: method.id,
          type: method.type,
          card: method.card ? {
            brand: method.card.brand,
            last4: method.card.last4,
            expMonth: method.card.exp_month,
            expYear: method.card.exp_year
          } : null,
          billing_details: method.billing_details,
          created: method.created
        }))
      })

    } catch (error: any) {
      console.error('❌ Failed to fetch payment methods:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch payment methods',
        message: error.message
      }, { status: 500 })
    }
  }
)

export const PUT = withRateLimit(
  withValidation({
    body: attachPaymentMethodSchema
  })(
    async (request: NextRequest, validatedData?: any) => {
      try {
        console.log('💳 Attaching payment method to customer:', validatedData.customerId)

        const paymentMethod = await stripePaymentService.attachPaymentMethod(
          validatedData.paymentMethodId,
          validatedData.customerId
        )

        // TODO: Set as default if requested
        // This would require additional Stripe API calls

        return NextResponse.json({
          success: true,
          paymentMethod: {
            id: paymentMethod.id,
            type: paymentMethod.type,
            card: paymentMethod.card ? {
              brand: paymentMethod.card.brand,
              last4: paymentMethod.card.last4,
              expMonth: paymentMethod.card.exp_month,
              expYear: paymentMethod.card.exp_year
            } : null,
            billing_details: paymentMethod.billing_details,
            created: paymentMethod.created
          }
        })

      } catch (error: any) {
        console.error('❌ Payment method attachment failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to attach payment method',
          message: error.message
        }, { status: 500 })
      }
    }
  )
)


