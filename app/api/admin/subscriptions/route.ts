import { type NextRequest, NextResponse } from "next/server"
import { subscriptionDatabaseService, type Subscription } from "@/lib/subscription-database-service"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const plan = searchParams.get('plan')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const filters = {
      status: status || undefined,
      plan: plan || undefined,
      search: search || undefined,
      page,
      limit
    }

    const result = await subscriptionDatabaseService.getSubscriptions(filters)

    // Calculate status counts from the analytics
    const statusCounts = {
      all: result.analytics.totalSubscriptions,
      active: result.analytics.activeSubscriptions,
      trialing: result.analytics.trialingSubscriptions,
      past_due: result.analytics.pastDueSubscriptions,
      cancelled: result.analytics.cancelledSubscriptions,
      paused: result.analytics.pausedSubscriptions,
      grace_period: result.analytics.gracePeriodSubscriptions,
      incomplete: 0 // Not tracked in current analytics
    }

    return NextResponse.json({
      success: true,
      data: {
        subscriptions: result.subscriptions,
        total: result.total,
        page,
        limit,
        statusCounts,
        metrics: {
          monthlyRecurringRevenue: result.analytics.monthlyRecurringRevenue,
          activeSubscriptions: result.analytics.activeSubscriptions,
          averageRevenuePerUser: result.analytics.averageRevenuePerUser
        }
      }
    })

  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch subscriptions",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, subscriptionId, data, subscriptionData } = body

    // Handle subscription creation
    if (action === 'create' && subscriptionData) {
      const newSubscription = await subscriptionDatabaseService.createSubscription(subscriptionData)
      
      return NextResponse.json({
        success: true,
        data: {
          subscription: newSubscription,
          message: "Subscription created successfully"
        }
      })
    }

    // Handle subscription updates (pause, resume, cancel, update)
    if (!action || !subscriptionId) {
      return NextResponse.json(
        { success: false, error: "Action and subscriptionId are required" },
        { status: 400 }
      )
    }

    let updatedSubscription: Subscription

    switch (action) {
      case 'cancel':
        updatedSubscription = await subscriptionDatabaseService.updateSubscription(subscriptionId, {
          cancelAtPeriodEnd: true,
          status: 'cancelled',
          notes: data?.reason || 'Cancelled by admin'
        })
        break

      case 'pause':
        updatedSubscription = await subscriptionDatabaseService.updateSubscription(subscriptionId, {
          status: 'paused',
          notes: data?.reason || 'Paused by admin'
        })
        break

      case 'resume':
        updatedSubscription = await subscriptionDatabaseService.updateSubscription(subscriptionId, {
          status: 'active',
          notes: data?.reason || 'Resumed by admin'
        })
        break

      case 'update':
        updatedSubscription = await subscriptionDatabaseService.updateSubscription(subscriptionId, {
          ...data,
          notes: data?.notes || undefined
        })
        break

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: {
        subscription: updatedSubscription,
        message: `Subscription ${action} successful`
      }
    })

  } catch (error) {
    console.error('Error processing subscription action:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to process subscription action",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Subscription ID is required" },
        { status: 400 }
      )
    }

    const updatedSubscription = await subscriptionDatabaseService.updateSubscription(id, updateData)

    return NextResponse.json({
      success: true,
      data: {
        subscription: updatedSubscription,
        message: "Subscription updated successfully"
      }
    })

  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update subscription",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Subscription ID is required" },
        { status: 400 }
      )
    }

    await subscriptionDatabaseService.deleteSubscription(id)

    return NextResponse.json({
      success: true,
      message: "Subscription deleted successfully"
    })

  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete subscription",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}