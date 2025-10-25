import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const dateRange = searchParams.get('dateRange')

    console.log('Payments API called with:', { status, search, dateRange })

    // Get subscriptions data to generate payment history
    const subscriptionsResponse = await databaseService.getSubscriptions()
    
    if (!subscriptionsResponse.success || !subscriptionsResponse.data) {
      throw new Error('Failed to load subscription data')
    }

    const subscriptions = subscriptionsResponse.data.subscriptions

    // Generate payment history from subscriptions
    const payments = subscriptions.map((subscription, index) => {
      const paymentDate = new Date(subscription.createdAt)
      const isActive = subscription.status === 'active'
      const isFailed = subscription.status === 'past_due'
      const isRefunded = subscription.status === 'cancelled'
      
      return {
        id: `pay_${subscription.id}`,
        customerId: subscription.customerId,
        customerName: subscription.customerName,
        customerEmail: subscription.customerEmail,
        subscriptionId: subscription.id,
        amount: subscription.amount,
        currency: subscription.currency || 'USD',
        status: isActive ? 'succeeded' : isFailed ? 'failed' : isRefunded ? 'refunded' : 'pending',
        description: `${subscription.planName} subscription payment`,
        paymentMethod: subscription.paymentMethod || 'Visa ****4242',
        paymentMethodType: 'card' as const,
        createdAt: subscription.createdAt,
        processedAt: isActive ? subscription.createdAt : undefined,
        failureReason: isFailed ? 'Insufficient funds' : undefined,
        refundAmount: isRefunded ? subscription.amount : undefined,
        refundReason: isRefunded ? 'Customer requested cancellation' : undefined,
        invoiceId: `inv_${subscription.id}`,
        transactionId: `txn_${subscription.id}_${index}`,
        gateway: 'Stripe',
        fees: subscription.amount * 0.029 + 0.30, // Stripe fees
        netAmount: subscription.amount - (subscription.amount * 0.029 + 0.30),
        metadata: {
          planName: subscription.planName,
          billingCycle: subscription.billingCycle || 'monthly'
        }
      }
    })

    // Calculate metrics
    const totalPayments = payments.length
    const successfulPayments = payments.filter(p => p.status === 'succeeded').length
    const failedPayments = payments.filter(p => p.status === 'failed').length
    const pendingPayments = payments.filter(p => p.status === 'pending').length
    const refundedPayments = payments.filter(p => p.status === 'refunded').length
    const totalRevenue = payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0)
    const totalFees = payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.fees, 0)
    const netRevenue = totalRevenue - totalFees
    const averagePaymentAmount = totalPayments > 0 ? totalRevenue / totalPayments : 0
    const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0
    const refundRate = totalPayments > 0 ? (refundedPayments / totalPayments) * 100 : 0

    const metrics = {
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      refundedPayments,
      totalRevenue,
      totalFees,
      netRevenue,
      averagePaymentAmount,
      successRate,
      refundRate
    }

    return NextResponse.json({
      success: true,
      data: {
        payments,
        metrics,
        total: payments.length
      }
    })

  } catch (error) {
    console.error('Payments API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
