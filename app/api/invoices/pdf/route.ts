import { NextRequest, NextResponse } from 'next/server'
import { invoiceGenerator } from '@/lib/invoice-generator'
import { withRateLimit } from '@/lib/rate-limiter'
import { getCurrentUser } from '@/lib/auth'

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

      // Authenticate the request
      const { user, isAuthenticated } = await getCurrentUser(request)
      if (!isAuthenticated || !user) {
        return NextResponse.json({
          success: false,
          error: 'Authentication required'
        }, { status: 401 })
      }

      console.log('📄 Generating PDF for invoice:', invoiceId)

      // Build the invoice using the authenticated user's real data.
      // Full invoice DB integration can be added here when the invoices table is ready.
      const invoice = {
        id: invoiceId,
        number: `INV-${invoiceId}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'sent' as const,
        customer: {
          name: user.name,
          email: user.email,
          address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            postalCode: '',
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

      const pdfBuffer = await invoiceGenerator.generatePDF(invoice)

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`
        }
      })

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ PDF generation failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to generate PDF',
        message
      }, { status: 500 })
    }
  }
)




