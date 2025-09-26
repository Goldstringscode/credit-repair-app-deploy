import { NextRequest, NextResponse } from 'next/server'
// import { invoiceGenerator } from '@/lib/invoice-generator'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

// Validation schema for invoice creation
const createInvoiceSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    address: z.object({
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(1)
    })
  }),
  company: z.object({
    name: z.string().min(1),
    address: z.object({
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(1)
    }),
    phone: z.string().min(1),
    email: z.string().email(),
    website: z.string().url()
  }),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    total: z.number().min(0)
  })).min(1),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
  currency: z.string().length(3).default('usd'),
  notes: z.string().optional(),
  paymentTerms: z.string().min(1)
})

export const POST = withRateLimit(
  withValidation({
    body: createInvoiceSchema
  })(
    async (request: NextRequest, validatedData?: any) => {
      try {
        console.log('📄 Creating invoice for:', validatedData.customer.email)

        // const invoice = await invoiceGenerator.createInvoice({
        const invoice = { 
          id: 'mock-invoice', 
          ...validatedData,
          status: 'draft'
        } // Mock response

        return NextResponse.json({
          success: true,
          invoice: {
            id: invoice.id,
            number: invoice.number,
            date: invoice.date,
            dueDate: invoice.dueDate,
            status: invoice.status,
            total: invoice.total,
            currency: invoice.currency,
            customer: invoice.customer
          }
        })

      } catch (error: any) {
        console.error('❌ Invoice creation failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to create invoice',
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
      const customerEmail = searchParams.get('customerEmail')
      const limit = parseInt(searchParams.get('limit') || '10')
      const offset = parseInt(searchParams.get('offset') || '0')

      if (!customerEmail) {
        return NextResponse.json({
          success: false,
          error: 'Customer email is required'
        }, { status: 400 })
      }

      console.log('📄 Fetching invoices for:', customerEmail)

      // const invoices = await invoiceGenerator.listInvoices(customerEmail, limit, offset)
      const invoices = { invoices: [], total: 0 } // Mock response

      return NextResponse.json({
        success: true,
        invoices: invoices.map(invoice => ({
          id: invoice.id,
          number: invoice.number,
          date: invoice.date,
          dueDate: invoice.dueDate,
          status: invoice.status,
          total: invoice.total,
          currency: invoice.currency
        }))
      })

    } catch (error: any) {
      console.error('❌ Failed to fetch invoices:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch invoices',
        message: error.message
      }, { status: 500 })
    }
  }
)




