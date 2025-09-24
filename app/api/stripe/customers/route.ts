import { NextRequest, NextResponse } from 'next/server'
import { stripePaymentService } from '@/lib/stripe/payments'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

// Validation schema for customer creation
const createCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.string().length(2)
  }).optional(),
  metadata: z.record(z.string()).optional()
})

export const POST = withRateLimit(
  withValidation(
    async (request: NextRequest) => {
      try {
        const body = await request.json()
        const validatedData = createCustomerSchema.parse(body)

        console.log('👤 Creating customer:', validatedData.email)

        const customer = await stripePaymentService.createCustomer({
          email: validatedData.email,
          name: validatedData.name,
          phone: validatedData.phone,
          address: validatedData.address,
          metadata: validatedData.metadata
        })

        return NextResponse.json({
          success: true,
          customer: {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            created: customer.created
          }
        })

      } catch (error: any) {
        console.error('❌ Customer creation failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to create customer',
          message: error.message
        }, { status: 500 })
      }
    },
    createCustomerSchema
  )
)
