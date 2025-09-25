import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { database } from '@/lib/database-config'
import { withRateLimit } from '@/lib/rate-limiter'
import { pdfGenerator } from '@/lib/pdf-generator'

export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const body = await request.json()
      const { format = 'pdf', filters = {} } = body

      // Get filtered payments
      const payments = await database.getPayments(user.id, filters)

      if (format === 'pdf') {
        // Generate PDF content using the PDF generator
        const pdfContent = await pdfGenerator.generatePaymentHistory(payments, user)
        
        return new NextResponse(pdfContent.buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="payment-history-${new Date().toISOString().split('T')[0]}.pdf"`
          }
        })
      } else {
        // Generate text content
        const textContent = generateTextContent(payments, user)
        
        return new NextResponse(textContent, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="payment-history-${new Date().toISOString().split('T')[0]}.txt"`
          }
        })
      }

    } catch (error: any) {
      console.error('❌ Failed to export payments:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to export payments',
        message: error.message
      }, { status: 500 })
    }
  }),
  'general'
)


function generateTextContent(payments: any[], user: any): string {
  return `
Payment History Export
Generated: ${new Date().toLocaleDateString()}
User: ${user.email}

${payments.map(payment => `
Transaction ID: ${payment.transactionId}
Date: ${new Date(payment.createdAt).toLocaleDateString()}
Description: ${payment.description}
Amount: $${(payment.amount / 100).toFixed(2)}
Status: ${payment.status}
Type: ${payment.type}
Method: ${payment.method}
`).join('\n')}

Total Transactions: ${payments.length}
Total Amount: $${(payments.reduce((sum, p) => sum + p.amount, 0) / 100).toFixed(2)}
  `.trim()
}