import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limiter'

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      // Return available pricing plans
      const plans = [
        {
          id: 'basic',
          name: 'Basic Plan',
          description: 'Perfect for individuals getting started with credit repair',
          amount: 2999, // $29.99 in cents
          interval: 'month',
          intervalCount: 1,
          features: [
            'Credit report analysis',
            'Dispute letter generation',
            'Basic credit monitoring',
            'Email support'
          ],
          popular: false
        },
        {
          id: 'premium',
          name: 'Premium Plan',
          description: 'Advanced features for serious credit repair',
          amount: 5999, // $59.99 in cents
          interval: 'month',
          intervalCount: 1,
          features: [
            'Everything in Basic',
            'Advanced dispute strategies',
            'Priority support',
            'Credit score tracking',
            'Custom dispute letters',
            'Phone support'
          ],
          popular: true
        },
        {
          id: 'enterprise',
          name: 'Enterprise Plan',
          description: 'Complete credit repair solution for businesses',
          amount: 9999, // $99.99 in cents
          interval: 'month',
          intervalCount: 1,
          features: [
            'Everything in Premium',
            'White-label solution',
            'API access',
            'Dedicated account manager',
            'Custom integrations',
            '24/7 support'
          ],
          popular: false
        }
      ]

      return NextResponse.json({
        success: true,
        plans: plans
      })
    } catch (error) {
      console.error('Failed to fetch plans:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch plans' },
        { status: 500 }
      )
    }
  })
)