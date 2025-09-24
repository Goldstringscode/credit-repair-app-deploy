import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// MLM Plan pricing in cents
const MLM_PLAN_PRICES = {
  mlm_starter: 4999, // $49.99
  mlm_professional: 9999, // $99.99
  mlm_enterprise: 19999, // $199.99
}

export async function POST(request: NextRequest) {
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

    const { planType, paymentMethodId, mlmCode, sponsorId } = await request.json()

    if (!planType || !MLM_PLAN_PRICES[planType as keyof typeof MLM_PLAN_PRICES]) {
      return NextResponse.json({ error: "Invalid MLM plan type" }, { status: 400 })
    }

    if (!paymentMethodId) {
      return NextResponse.json({ error: "Payment method required" }, { status: 400 })
    }

    // Get user details
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user already has MLM subscription
    const { data: existingMLMUser } = await supabase
      .from("mlm_users")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (existingMLMUser) {
      return NextResponse.json({ error: "User already has an MLM subscription" }, { status: 400 })
    }

    const amount = MLM_PLAN_PRICES[planType as keyof typeof MLM_PLAN_PRICES]

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        metadata: {
          userId: user.id,
          userType: 'mlm',
        },
      })

      customerId = customer.id

      // Update user with Stripe customer ID
      await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", userId)
    }

    // Create Stripe product and price for MLM plan
    const product = await stripe.products.create({
      name: `MLM ${planType.replace('mlm_', '').charAt(0).toUpperCase() + planType.replace('mlm_', '').slice(1)} Plan`,
      description: `MLM ${planType.replace('mlm_', '')} subscription plan`,
      metadata: {
        planType,
        userType: 'mlm',
      },
    })

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        planType,
        userType: 'mlm',
      },
    })

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: user.id,
        planType,
        userType: 'mlm',
        mlmCode: mlmCode || null,
        sponsorId: sponsorId || null,
      },
    })

    // Create MLM user record
    const mlmUserData = {
      user_id: userId,
      mlm_code: mlmCode || `MLM${Date.now()}`,
      sponsor_id: sponsorId || null,
      rank: 'associate',
      status: 'active',
      subscription_id: subscription.id,
      plan_type: planType,
      commission_rate: getCommissionRate(planType),
      join_date: new Date().toISOString(),
      last_activity: new Date().toISOString(),
    }

    const { data: mlmUser, error: mlmError } = await supabase
      .from("mlm_users")
      .insert(mlmUserData)
      .select()
      .single()

    if (mlmError) {
      console.error("Error creating MLM user:", mlmError)
      return NextResponse.json({ error: "Failed to create MLM user" }, { status: 500 })
    }

    // If sponsor provided, create genealogy relationship
    if (sponsorId) {
      const { error: genealogyError } = await supabase
        .from("mlm_genealogy")
        .insert({
          user_id: userId,
          sponsor_id: sponsorId,
          level: 1,
          is_active: true,
          join_date: new Date().toISOString(),
        })

      if (genealogyError) {
        console.error("Error creating genealogy relationship:", genealogyError)
      }
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      mlmUser,
    })
  } catch (error) {
    console.error("MLM Subscription creation error:", error)
    return NextResponse.json({ error: "Failed to create MLM subscription" }, { status: 500 })
  }
}

function getCommissionRate(planType: string): number {
  switch (planType) {
    case 'mlm_starter':
      return 0.30
    case 'mlm_professional':
      return 0.35
    case 'mlm_enterprise':
      return 0.40
    default:
      return 0.30
  }
}
