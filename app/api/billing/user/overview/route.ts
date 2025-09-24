import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'

export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const userId = 'demo-user-123' // In real app, get from session

      // Mock billing statistics
      const stats = {
        totalSpent: 35988, // $359.88 in cents
        nextPayment: 2999, // $29.99 in cents
        paymentMethod: 'card',
        lastPayment: {
          amount: 2999,
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        upcomingPayments: [
          {
            description: 'Monthly Subscription - Basic Plan',
            amount: 2999,
            date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'scheduled'
          }
        ]
      }

      return NextResponse.json({
        success: true,
        stats
      })

    } catch (error: any) {
      console.error('❌ Failed to fetch billing overview:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch billing overview',
        message: error.message
      }, { status: 500 })
    }
  },
  'general'
)
