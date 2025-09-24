import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limiter'

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const range = searchParams.get('range') || '12months'

      // Generate sample analytics data
      const analytics = {
        totalSpent: 8997, // $89.97
        monthlySpent: 2999, // $29.99
        averageMonthlySpent: 2999,
        totalInvoices: 12,
        paidInvoices: 10,
        pendingInvoices: 1,
        overdueInvoices: 1,
        paymentMethods: 2,
        subscriptionLength: 12, // months
        savings: 599, // $5.99
        spendingTrend: 'stable',
        monthlyBreakdown: [
          { month: 'Jan 2024', amount: 2999, invoices: 1 },
          { month: 'Feb 2024', amount: 2999, invoices: 1 },
          { month: 'Mar 2024', amount: 2999, invoices: 1 },
          { month: 'Apr 2024', amount: 2999, invoices: 1 },
          { month: 'May 2024', amount: 2999, invoices: 1 },
          { month: 'Jun 2024', amount: 2999, invoices: 1 },
          { month: 'Jul 2024', amount: 2999, invoices: 1 },
          { month: 'Aug 2024', amount: 2999, invoices: 1 },
          { month: 'Sep 2024', amount: 2999, invoices: 1 },
          { month: 'Oct 2024', amount: 2999, invoices: 1 },
          { month: 'Nov 2024', amount: 2999, invoices: 1 },
          { month: 'Dec 2024', amount: 2999, invoices: 1 }
        ],
        categoryBreakdown: [
          { category: 'Subscription', amount: 8997, percentage: 100 },
          { category: 'Late Fees', amount: 0, percentage: 0 },
          { category: 'Taxes', amount: 0, percentage: 0 }
        ]
      }

      return NextResponse.json({
        success: true,
        analytics: analytics
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch analytics' },
        { status: 500 }
      )
    }
  })
)
