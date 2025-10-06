import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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

    const { planType, mlmCode, sponsorId } = await request.json()

    if (!planType || !MLM_PLAN_PRICES[planType as keyof typeof MLM_PLAN_PRICES]) {
      return NextResponse.json({ error: "Invalid MLM plan type" }, { status: 400 })
    }

    // Get user details
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is already in MLM system
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

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: customerId,
      metadata: {
        userId: user.id,
        planType,
        userEmail: user.email,
        userType: 'mlm',
        mlmCode: mlmCode || null,
        sponsorId: sponsorId || null,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount,
      planType,
    })
  } catch (error) {
    console.error("MLM Payment intent creation error:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
