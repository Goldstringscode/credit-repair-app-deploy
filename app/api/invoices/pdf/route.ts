import { NextRequest, NextResponse } from 'next/server'
import { invoiceGenerator } from '@/lib/invoice-generator'
import { withRateLimit } from '@/lib/rate-limiter'

export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const invoiceId = searchParams.get('invoiceId')

      if (!invoiceId) {
        return NextResponse.json({
          success: false,
          error: 'Invoice ID is required'
        }, { status: 400 })
      }

      console.log('📄 Generating PDF for invoice:', invoiceId)

      // In a real implementation, you would fetch the invoice from the database
      // For now, we'll create a mock invoice
      const mockInvoice = {
        id: invoiceId,
        number: 'INV-202401-0001',
        date: '2024-01-15',
        dueDate: '2024-02-14',
        status: 'sent' as const,
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
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

      const pdfBuffer = await invoiceGenerator.generatePDF(mockInvoice)

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice-${mockInvoice.number}.pdf"`
        }
      })

    } catch (error: any) {
      console.error('❌ PDF generation failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to generate PDF',
        message: error.message
      }, { status: 500 })
    }
  }
)




