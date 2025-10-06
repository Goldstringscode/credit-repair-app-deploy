import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

// GET - Get user's subscription details
export async function GET(request: NextRequest) {
  try {
    // Check if Stripe or Supabase is configured
    if (!stripe || !supabase) {
      return NextResponse.json({
        subscription: {
          id: 'demo-subscription',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false,
          planType: 'mlm_starter',
          commissionRate: 0.30,
          rank: 'Bronze',
          mlmStatus: 'active',
          commissionEligible: true
        }
      })
    }

    // Get user from JWT token
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    let userId: string
    try {
      const jwtSecret = process.env.JWT_SECRET || 'demo-secret-key'
      const decoded = jwt.verify(authToken, jwtSecret) as any
      userId = decoded.userId || 'demo-user'
    } catch (error) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    // Get MLM user data
    const { data: mlmUser, error: mlmError } = await supabase
      .from("mlm_users")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (mlmError || !mlmUser) {
      return NextResponse.json({ error: "MLM user not found" }, { status: 404 })
    }

    if (!mlmUser.subscription_id) {
      return NextResponse.json({ error: "No active subscription" }, { status: 404 })
    }

    // Get subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(mlmUser.subscription_id)

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        planType: mlmUser.plan_type,
        commissionRate: mlmUser.commission_rate,
        rank: mlmUser.rank,
        mlmStatus: mlmUser.status,
        commissionEligible: mlmUser.status === 'active'
      }
    })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 })
  }
}

// PUT - Update subscription
export async function PUT(request: NextRequest) {
  try {
    // Check if Stripe or Supabase is configured
    if (!stripe || !supabase) {
      const { action, planType, paymentMethodId } = await request.json()
      
      // Return demo response based on action
      if (action === 'change_plan') {
        return NextResponse.json({
          success: true,
          message: `Plan changed to ${planType} successfully (demo mode)`,
          subscription: {
            id: 'demo-subscription',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
            planType: planType,
            commissionRate: planType === 'mlm_starter' ? 0.30 : planType === 'mlm_professional' ? 0.35 : 0.40,
            rank: 'Bronze',
            mlmStatus: 'active',
            commissionEligible: true
          }
        })
      } else if (action === 'update_payment_method') {
        return NextResponse.json({
          success: true,
          message: `Payment method updated successfully (demo mode)`,
          paymentMethodId: paymentMethodId || 'pm_demo_123'
        })
      } else if (action === 'cancel') {
        return NextResponse.json({
          success: true,
          message: "Subscription cancelled successfully (demo mode)",
          subscription: {
            id: 'demo-subscription',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: true,
            planType: 'mlm_starter',
            commissionRate: 0.30,
            rank: 'Bronze',
            mlmStatus: 'active',
            commissionEligible: true
          }
        })
      } else if (action === 'reactivate') {
        return NextResponse.json({
          success: true,
          message: "Subscription reactivated successfully (demo mode)",
          subscription: {
            id: 'demo-subscription',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
            planType: 'mlm_starter',
            commissionRate: 0.30,
            rank: 'Bronze',
            mlmStatus: 'active',
            commissionEligible: true
          }
        })
      }
    }

    // Get user from JWT token
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    let userId: string
    try {
      const jwtSecret = process.env.JWT_SECRET || 'demo-secret-key'
      const decoded = jwt.verify(authToken, jwtSecret) as any
      userId = decoded.userId || 'demo-user'
    } catch (error) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    const { action, planType, paymentMethodId } = await request.json()

    // Get MLM user data
    const { data: mlmUser, error: mlmError } = await supabase
      .from("mlm_users")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (mlmError || !mlmUser) {
      return NextResponse.json({ error: "MLM user not found" }, { status: 404 })
    }

    if (!mlmUser.subscription_id) {
      return NextResponse.json({ error: "No active subscription" }, { status: 404 })
    }

    const subscription = await stripe.subscriptions.retrieve(mlmUser.subscription_id)

    if (action === 'cancel') {
      // Cancel subscription at period end
      const updatedSubscription = await stripe.subscriptions.update(mlmUser.subscription_id, {
        cancel_at_period_end: true,
      })

      // Update database
      await supabase
        .from("mlm_users")
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)

      return NextResponse.json({
        success: true,
        message: "Subscription will be cancelled at the end of the current period",
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
          cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
          currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000).toISOString()
        }
      })
    }

    if (action === 'reactivate') {
      // Reactivate subscription
      const updatedSubscription = await stripe.subscriptions.update(mlmUser.subscription_id, {
        cancel_at_period_end: false,
      })

      // Update database
      await supabase
        .from("mlm_users")
        .update({
          cancel_at_period_end: false,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)

      return NextResponse.json({
        success: true,
        message: "Subscription has been reactivated",
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
          cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end
        }
      })
    }

    if (action === 'change_plan' && planType) {
      // Change subscription plan
      const { data: newPlan, error: planError } = await supabase
        .from("mlm_plans")
        .select("*")
        .eq("id", planType)
        .single()

      if (planError || !newPlan) {
        return NextResponse.json({ error: "Invalid plan type" }, { status: 400 })
      }

      // Create new price for the plan
      const price = await stripe.prices.create({
        product: newPlan.stripe_product_id || `prod_${planType}`,
        unit_amount: newPlan.price,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
      })

      // Update subscription
      const updatedSubscription = await stripe.subscriptions.update(mlmUser.subscription_id, {
        items: [{
          id: subscription.items.data[0].id,
          price: price.id,
        }],
        proration_behavior: 'create_prorations',
      })

      // Update database
      await supabase
        .from("mlm_users")
        .update({
          plan_type: planType,
          commission_rate: newPlan.commission_rate,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)

      return NextResponse.json({
        success: true,
        message: "Subscription plan updated successfully",
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
          planType: planType,
          commissionRate: newPlan.commission_rate
        }
      })
    }

    if (action === 'update_payment_method' && paymentMethodId) {
      // Update default payment method
      await stripe.subscriptions.update(mlmUser.subscription_id, {
        default_payment_method: paymentMethodId,
      })

      return NextResponse.json({
        success: true,
        message: "Payment method updated successfully"
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating subscription:", error)
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
  }
}

// DELETE - Cancel subscription immediately
export async function DELETE(request: NextRequest) {
  try {
    // Get user from JWT token
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as any
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    // Get MLM user data
    const { data: mlmUser, error: mlmError } = await supabase
      .from("mlm_users")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (mlmError || !mlmUser) {
      return NextResponse.json({ error: "MLM user not found" }, { status: 404 })
    }

    if (!mlmUser.subscription_id) {
      return NextResponse.json({ error: "No active subscription" }, { status: 404 })
    }

    // Cancel subscription immediately
    await stripe.subscriptions.cancel(mlmUser.subscription_id)

    // Update database
    await supabase
      .from("mlm_users")
      .update({
        status: 'inactive',
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled immediately"
    })
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}
