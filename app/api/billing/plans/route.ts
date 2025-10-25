import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database-service'

export async function GET(request: NextRequest) {
  try {
    console.log('Plans API called')

    // Get subscriptions data to generate plan metrics
    const subscriptionsResponse = await databaseService.getSubscriptions()
    
    if (!subscriptionsResponse.success || !subscriptionsResponse.data) {
      throw new Error('Failed to load subscription data')
    }

    const subscriptions = subscriptionsResponse.data.subscriptions

    // Generate plans from subscription data
    const planMap = new Map()
    subscriptions.forEach(subscription => {
      const planName = subscription.planName
      if (!planMap.has(planName)) {
        planMap.set(planName, {
          id: `plan_${planName.toLowerCase().replace(/\s+/g, '_')}`,
          name: planName,
          description: `${planName} subscription plan`,
          price: subscription.amount,
          currency: subscription.currency || 'USD',
          billingCycle: subscription.billingCycle || 'monthly',
          features: [
            'Credit monitoring',
            'Dispute assistance',
            'Credit education',
            '24/7 support'
          ],
          isActive: true,
          isPopular: planName.toLowerCase().includes('premium'),
          maxUsers: planName.toLowerCase().includes('enterprise') ? 1000 : 100,
          createdAt: subscription.createdAt,
          updatedAt: subscription.createdAt,
          subscriptionCount: 0,
          revenue: 0
        })
      }
      
      const plan = planMap.get(planName)
      plan.subscriptionCount += 1
      plan.revenue += subscription.amount
    })

    const plans = Array.from(planMap.values())

    // Generate promotions
    const promotions = [
      {
        id: 'promo_1',
        name: 'New Year Special',
        description: '20% off for new customers',
        discountType: 'percentage',
        discountValue: 20,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        isActive: true,
        applicablePlans: plans.map(p => p.id),
        maxUses: 100,
        usedCount: 25
      },
      {
        id: 'promo_2',
        name: 'Student Discount',
        description: '50% off for students',
        discountType: 'percentage',
        discountValue: 50,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        applicablePlans: plans.slice(0, 2).map(p => p.id),
        maxUses: 50,
        usedCount: 12
      }
    ]

    // Generate A/B tests
    const abTests = [
      {
        id: 'test_1',
        name: 'Pricing Page Layout',
        description: 'Testing different pricing page layouts',
        status: 'running',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        variants: [
          {
            id: 'variant_a',
            name: 'Original Layout',
            trafficPercentage: 50,
            conversionRate: 12.5
          },
          {
            id: 'variant_b',
            name: 'New Layout',
            trafficPercentage: 50,
            conversionRate: 15.2
          }
        ],
        winner: null,
        confidence: 85.3
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        plans,
        promotions,
        abTests
      }
    })

  } catch (error) {
    console.error('Plans API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Creating new plan:', body)

    // In a real app, this would save to the database
    const newPlan = {
      id: `plan_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscriptionCount: 0,
      revenue: 0
    }

    return NextResponse.json({
      success: true,
      data: newPlan
    })

  } catch (error) {
    console.error('Create plan error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}