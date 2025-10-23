import { type NextRequest, NextResponse } from "next/server"
import { databaseService } from "@/lib/database-service"

// GET - Get all subscriptions with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const plan = searchParams.get('plan') || ''

    const filters = {
      search,
      status,
      plan,
      page,
      limit
    }

    const result = await databaseService.getSubscriptions(filters)
    return NextResponse.json(result)

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

// POST - Create, update, or manage subscriptions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, subscriptionData, subscriptionId, data } = body

    console.log('Subscription API POST request:', { action, subscriptionData, subscriptionId, data })

    switch (action) {
      case 'create':
        if (!subscriptionData) {
          return NextResponse.json(
            { 
              success: false, 
              error: "Subscription data is required for creation" 
            },
            { status: 400 }
          )
        }

        // Generate a unique ID and timestamps
        const newSubscription = {
          ...subscriptionData,
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        console.log('Creating subscription:', newSubscription)

        // For now, we'll just return the subscription as if it was created
        // In a real implementation, this would save to the database
        return NextResponse.json({
          success: true,
          data: {
            subscription: newSubscription,
            message: "Subscription created successfully"
          }
        })

      case 'update':
        if (!subscriptionId || !data) {
          return NextResponse.json(
            { 
              success: false, 
              error: "Subscription ID and update data are required" 
            },
            { status: 400 }
          )
        }

        // In a real implementation, this would update the database
        return NextResponse.json({
          success: true,
          data: {
            subscription: { id: subscriptionId, ...data },
            message: "Subscription updated successfully"
          }
        })

      case 'cancel':
      case 'pause':
      case 'resume':
        if (!subscriptionId) {
          return NextResponse.json(
            { 
              success: false, 
              error: "Subscription ID is required" 
            },
            { status: 400 }
          )
        }

        // In a real implementation, this would update the subscription status
        return NextResponse.json({
          success: true,
          data: {
            subscription: { id: subscriptionId, status: action === 'cancel' ? 'cancelled' : action },
            message: `Subscription ${action}d successfully`
          }
        })

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid action. Supported actions: create, update, cancel, pause, resume" 
          },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error processing subscription request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to process subscription request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}