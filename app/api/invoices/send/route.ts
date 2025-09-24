import { NextRequest, NextResponse } from 'next/server'
import { invoiceGenerator } from '@/lib/invoice-generator'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

// Validation schema for sending invoice
const sendInvoiceSchema = z.object({
  invoiceId: z.string().min(1),
  recipientEmail: z.string().email().optional()
})

export const POST = withRateLimit(
  withValidation(
    async (request: NextRequest) => {
      try {
        const body = await request.json()
        const validatedData = sendInvoiceSchema.parse(body)

        console.log('📧 Sending invoice:', validatedData.invoiceId)

        // In a real implementation, you would fetch the invoice from the database
        // For now, we'll create a mock invoice
        const mockInvoice = {
          id: validatedData.invoiceId,
          number: 'INV-202401-0001',
          date: '2024-01-15',
          dueDate: '2024-02-14',
          status: 'sent' as const,
          customer: {
            name: 'John Doe',
            email: validatedData.recipientEmail || 'john@example.com',
            address: {
              line1: '123 Main St',
              line2: '',
              city: 'Anytown',
              state: 'CA',
              postalCode: '12345',
              country: 'US'
            }
          },
          company: {
            name: 'Credit Repair Pro',
            address: {
              line1: '456 Business Ave',
              line2: 'Suite 100',
              city: 'Business City',
              state: 'CA',
              postalCode: '90210',
              country: 'US'
          },
            phone: '(555) 123-4567',
            email: 'billing@creditrepairpro.com',
            website: 'https://creditrepairpro.com'
          },
          items: [
            {
              description: 'Premium Plan - Monthly Subscription',
              quantity: 1,
              unitPrice: 59.99,
              total: 59.99
            }
          ],
          subtotal: 59.99,
          tax: 4.80,
          total: 64.79,
          currency: 'usd',
          notes: 'Thank you for your business!',
          paymentTerms: 'Net 30'
        }

        await invoiceGenerator.sendInvoice(mockInvoice, validatedData.recipientEmail)

        return NextResponse.json({
          success: true,
          message: 'Invoice sent successfully',
          invoiceId: validatedData.invoiceId
        })

      } catch (error: any) {
        console.error('❌ Invoice sending failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to send invoice',
          message: error.message
        }, { status: 500 })
      }
    },
    sendInvoiceSchema
  )
)




