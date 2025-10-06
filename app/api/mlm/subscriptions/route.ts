import { type NextRequest, NextResponse } from "next/server"
import { mlmStripeService } from "@/lib/mlm/stripe-service"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { requireAuth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limiter"

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const targetUserId = searchParams.get("userId") || user.id

      // Get user's MLM subscription data
      const mlmUser = await mlmDatabaseService.getMLMUser(targetUserId)
      if (!mlmUser) {
        return NextResponse.json({ 
          success: false,
          error: "MLM user not found" 
        }, { status: 404 })
      }

      // Mock subscription data (in real app, this would come from Stripe)
      const subscription = {
        id: `sub_mlm_${targetUserId}`,
        status: 'active',
        tierId: 'professional',
        tierName: 'MLM Professional',
        price: 197,
        billingCycle: 'monthly',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startDate: mlmUser.joinDate,
        features: [
          'Advanced training academy',
          'Custom landing pages',
          'Automated follow-up sequences',
          'Up to 7 levels deep',
          '40% commission rate',
          'Priority support',
          'Team management tools',
          'Advanced analytics'
        ]
      }

      return NextResponse.json({
        success: true,
        data: {
          subscription,
          user: {
            id: mlmUser.userId,
            name: mlmUser.mlmCode || 'Unknown',
            email: '', // Personal info would come from user profile
            joinDate: mlmUser.joinDate,
            status: mlmUser.status
          }
        }
      })
    } catch (error) {
      console.error("Subscription fetch error:", error)
      return NextResponse.json({ 
        success: false,
        error: "Failed to fetch subscription data" 
      }, { status: 500 })
    }
  }),
  'general'
)

export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const body = await request.json()
      const { tierId, billingCycle, paymentMethodId } = body

      if (!tierId || !billingCycle || !paymentMethodId) {
        return NextResponse.json({ 
          success: false,
          error: "Missing required fields: tierId, billingCycle, paymentMethodId" 
        }, { status: 400 })
      }

      // Validate tier ID
      const validTiers = ['starter', 'professional', 'enterprise']
      if (!validTiers.includes(tierId)) {
        return NextResponse.json({ 
          success: false,
          error: "Invalid tier ID" 
        }, { status: 400 })
      }

      // Validate billing cycle
      const validCycles = ['monthly', 'annual']
      if (!validCycles.includes(billingCycle)) {
        return NextResponse.json({ 
          success: false,
          error: "Invalid billing cycle" 
        }, { status: 400 })
      }

      // Create MLM subscription
      const subscription = await mlmStripeService.createMLMSubscription({
        userId: user.id,
        email: user.email,
        name: user.name,
        tierId,
        paymentMethodId,
        billingCycle
      })

      return NextResponse.json({
        success: true,
        message: "MLM subscription created successfully",
        data: {
          subscriptionId: subscription.id,
          status: subscription.status,
          tierId,
          billingCycle,
          nextBillingDate: new Date(subscription.current_period_end * 1000)
        }
      })
    } catch (error) {
      console.error("Subscription creation error:", error)
      return NextResponse.json({ 
        success: false,
        error: "Failed to create subscription",
        details: error.message
      }, { status: 500 })
    }
  }),
  'general'
)

export const PUT = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const body = await request.json()
      const { subscriptionId, updates } = body

      if (!subscriptionId) {
        return NextResponse.json({ 
          success: false,
          error: "Subscription ID is required" 
        }, { status: 400 })
      }

      // Update subscription (mock implementation)
      console.log(`Updating subscription ${subscriptionId} for user ${user.id}:`, updates)

      return NextResponse.json({
        success: true,
        message: "Subscription updated successfully"
      })
    } catch (error) {
      console.error("Subscription update error:", error)
      return NextResponse.json({ 
        success: false,
        error: "Failed to update subscription" 
      }, { status: 500 })
    }
  }),
  'general'
)

export const DELETE = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const subscriptionId = searchParams.get("subscriptionId")

      if (!subscriptionId) {
        return NextResponse.json({ 
          success: false,
          error: "Subscription ID is required" 
        }, { status: 400 })
      }

      // Cancel subscription (mock implementation)
      console.log(`Cancelling subscription ${subscriptionId} for user ${user.id}`)

      return NextResponse.json({
        success: true,
        message: "Subscription cancelled successfully"
      })
    } catch (error) {
      console.error("Subscription cancellation error:", error)
      return NextResponse.json({ 
        success: false,
        error: "Failed to cancel subscription" 
      }, { status: 500 })
    }
  }),
  'general'
)
