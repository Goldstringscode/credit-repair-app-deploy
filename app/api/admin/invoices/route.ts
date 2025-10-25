import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const dateRange = searchParams.get('dateRange')

    console.log('Invoices API called with:', { status, search, dateRange })

    // Get subscriptions data to generate invoice history
    const subscriptionsResponse = await databaseService.getSubscriptions()
    
    if (!subscriptionsResponse.success || !subscriptionsResponse.data) {
      throw new Error('Failed to load subscription data')
    }

    const subscriptions = subscriptionsResponse.data.subscriptions

    // Generate invoice history from subscriptions
    const invoices = subscriptions.map((subscription, index) => {
      const invoiceDate = new Date(subscription.createdAt)
      const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from creation
      const isPaid = subscription.status === 'active'
      const isOverdue = subscription.status === 'past_due'
      const isDraft = subscription.status === 'trialing'
      
      const subtotal = subscription.amount
      const tax = subtotal * 0.08 // 8% tax
      const total = subtotal + tax
      
      return {
        id: `inv_${subscription.id}`,
        number: `INV-${String(index + 1).padStart(4, '0')}`,
        customerId: subscription.customerId,
        customerName: subscription.customerName,
        customerEmail: subscription.customerEmail,
        subscriptionId: subscription.id,
        amount: total,
        currency: subscription.currency || 'USD',
        status: isPaid ? 'paid' : isOverdue ? 'overdue' : isDraft ? 'draft' : 'sent',
        description: `${subscription.planName} subscription invoice`,
        createdAt: subscription.createdAt,
        dueDate: dueDate.toISOString().split('T')[0],
        paidAt: isPaid ? subscription.createdAt : undefined,
        paymentMethod: subscription.paymentMethod || 'Visa ****4242',
        lineItems: [
          {
            id: `line_${subscription.id}`,
            description: `${subscription.planName} subscription`,
            quantity: 1,
            unitPrice: subscription.amount,
            total: subscription.amount,
            type: 'subscription' as const
          }
        ],
        subtotal,
        tax,
        total,
        notes: isOverdue ? 'Payment overdue - please contact customer' : undefined,
        pdfUrl: `/invoices/${subscription.id}.pdf`,
        sentAt: isPaid ? subscription.createdAt : undefined,
        reminderSentAt: isOverdue ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
      }
    })

    // Calculate metrics
    const totalInvoices = invoices.length
    const draftInvoices = invoices.filter(i => i.status === 'draft').length
    const sentInvoices = invoices.filter(i => i.status === 'sent').length
    const paidInvoices = invoices.filter(i => i.status === 'paid').length
    const overdueInvoices = invoices.filter(i => i.status === 'overdue').length
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0)
    const pendingRevenue = invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.total, 0)
    const averageInvoiceAmount = totalInvoices > 0 ? invoices.reduce((sum, i) => sum + i.total, 0) / totalInvoices : 0
    const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0

    const metrics = {
      totalInvoices,
      draftInvoices,
      sentInvoices,
      paidInvoices,
      overdueInvoices,
      totalRevenue,
      pendingRevenue,
      averageInvoiceAmount,
      paymentRate
    }

    return NextResponse.json({
      success: true,
      data: {
        invoices,
        metrics,
        total: invoices.length
      }
    })

  } catch (error) {
    console.error('Invoices API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
