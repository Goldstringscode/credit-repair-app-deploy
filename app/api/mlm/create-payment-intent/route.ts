import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseClient } from "@/lib/supabase-client"

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY environment variable is required")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
}

// MLM tier pricing in cents (monthly and annual)
const MLM_TIER_PRICES: Record<string, { monthly: number; annual: number }> = {
  starter: { monthly: 9700, annual: 97000 },
  professional: { monthly: 19700, annual: 197000 },
  enterprise: { monthly: 39700, annual: 397000 },
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getCurrentUser(request)
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = authResult.user
    const { tierId, billing } = await request.json()

    const tierPrices = MLM_TIER_PRICES[tierId]
    if (!tierPrices) {
      return NextResponse.json({ error: "Invalid tier ID" }, { status: 400 })
    }

    const amount = billing === "annual" ? tierPrices.annual : tierPrices.monthly

    // Get user details from Supabase (need stripe_customer_id)
    const supabase = getSupabaseClient()
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle()

    if (dbError || !dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const stripe = getStripe()

    // Create or retrieve Stripe customer
    let customerId = dbUser.stripe_customer_id as string | null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: [dbUser.first_name, dbUser.last_name].filter(Boolean).join(" ") || dbUser.email,
        metadata: { userId: dbUser.id },
      })
      customerId = customer.id
      await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", dbUser.id)
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: customerId,
      metadata: {
        userId: dbUser.id,
        tierId,
        billing,
      },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId,
      amount,
    })
  } catch (error) {
    console.error("MLM create-payment-intent error:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}

// MLM tier pricing in cents (monthly and annual)
const MLM_TIER_PRICES: Record<string, { monthly: number; annual: number }> = {
  starter: { monthly: 9700, annual: 97000 },
  professional: { monthly: 19700, annual: 197000 },
  enterprise: { monthly: 39700, annual: 397000 },
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getCurrentUser(request)
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = authResult.user
    const { tierId, billing } = await request.json()

    const tierPrices = MLM_TIER_PRICES[tierId]
    if (!tierPrices) {
      return NextResponse.json({ error: "Invalid tier ID" }, { status: 400 })
    }

    const amount = billing === "annual" ? tierPrices.annual : tierPrices.monthly

    // Get user details from Supabase (need stripe_customer_id)
    const supabase = getSupabaseClient()
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle()

    if (dbError || !dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create or retrieve Stripe customer
    let customerId = dbUser.stripe_customer_id as string | null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: [dbUser.first_name, dbUser.last_name].filter(Boolean).join(" ") || dbUser.email,
        metadata: { userId: dbUser.id },
      })
      customerId = customer.id
      await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", dbUser.id)
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: customerId,
      metadata: {
        userId: dbUser.id,
        tierId,
        billing,
      },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId,
      amount,
    })
  } catch (error) {
    console.error("MLM create-payment-intent error:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
