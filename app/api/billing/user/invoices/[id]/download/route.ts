import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limiter'

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, { params }: { params: { id: string } }, user) => {
    try {
      const invoiceId = params.id
      
      // Generate a sample PDF invoice
      const invoiceData = {
        id: invoiceId,
        invoiceNumber: `INV-2024-${invoiceId.split('_')[1]}`,
        date: '2024-03-15',
        dueDate: '2024-04-15',
        amount: 2999,
        status: 'pending',
        description: 'Basic Plan - March 2024',
        customer: {
          name: user.name,
          email: user.email
        }
      }

      // For demo purposes, return a simple text response
      // In production, you would generate an actual PDF
      const invoiceText = `
INVOICE
=======

Invoice Number: ${invoiceData.invoiceNumber}
Date: ${invoiceData.date}
Due Date: ${invoiceData.dueDate}

Bill To:
${invoiceData.customer.name}
${invoiceData.customer.email}

Description: ${invoiceData.description}
Amount: $${(invoiceData.amount / 100).toFixed(2)}

Status: ${invoiceData.status.toUpperCase()}

Thank you for your business!
      `.trim()

      return new NextResponse(invoiceText, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="invoice-${invoiceData.invoiceNumber}.txt"`
        }
      })
    } catch (error) {
      console.error('Failed to download invoice:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to download invoice' },
        { status: 500 }
      )
    }
  })
)
