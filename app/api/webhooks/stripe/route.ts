import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function getWebhookSecret() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required')
  }
  return process.env.STRIPE_WEBHOOK_SECRET
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      const stripe = getStripeClient()
      const webhookSecret = getWebhookSecret()
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const userId = paymentIntent.metadata.userId
    const planType = paymentIntent.metadata.planType

    if (!userId || !planType) {
      console.error("Missing metadata in payment intent:", paymentIntent.id)
      return
    }

    // Record payment in database
    const supabase = getSupabaseClient()
    await supabase.from("payments").insert({
      user_id: userId,
      stripe_payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      status: "succeeded",
      plan_type: planType,
    })

    // Update user subscription status
    await supabase
      .from("users")
      .update({
        subscription_status: "active",
        subscription_plan: planType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    console.log(`Payment succeeded for user ${userId}, plan: ${planType}`)
  } catch (error) {
    console.error("Error handling payment success:", error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const userId = paymentIntent.metadata.userId

    if (!userId) {
      console.error("Missing userId in payment intent metadata:", paymentIntent.id)
      return
    }

    // Record failed payment
    const supabase = getSupabaseClient()
    await supabase.from("payments").insert({
      user_id: userId,
      stripe_payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: "failed",
      plan_type: paymentIntent.metadata.planType,
    })

    console.log(`Payment failed for user ${userId}`)
  } catch (error) {
    console.error("Error handling payment failure:", error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    // Get user by Stripe customer ID
    const supabase = getSupabaseClient()
    const { data: user } = await supabase.from("users").select("id").eq("stripe_customer_id", customerId).single()

    if (!user) {
      console.error("User not found for customer:", customerId)
      return
    }

    // Create subscription record
    await supabase.from("subscriptions").insert({
      user_id: user.id,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      plan_type: subscription.items.data[0]?.price?.metadata?.planType || "basic",
      current_period_start: (subscription as any).current_period_start ? new Date((subscription as any).current_period_start * 1000).toISOString() : null,
      current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
    })

    console.log(`Subscription created for user ${user.id}`)
  } catch (error) {
    console.error("Error handling subscription creation:", error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Update subscription record
    const supabase = getSupabaseClient()
    await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_start: (subscription as any).current_period_start ? new Date((subscription as any).current_period_start * 1000).toISOString() : null,
        current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id)

    console.log(`Subscription updated: ${subscription.id}`)
  } catch (error) {
    console.error("Error handling subscription update:", error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    // Get user by Stripe customer ID
    const supabase = getSupabaseClient()
    const { data: user } = await supabase.from("users").select("id").eq("stripe_customer_id", customerId).single()

    if (!user) {
      console.error("User not found for customer:", customerId)
      return
    }

    // Update subscription status
    await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id)

    // Update user subscription status
    await supabase
      .from("users")
      .update({
        subscription_status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    console.log(`Subscription canceled for user ${user.id}`)
  } catch (error) {
    console.error("Error handling subscription deletion:", error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice payment succeeded: ${invoice.id}`)
    // Handle successful recurring payment
    // You might want to extend subscription, send confirmation email, etc.
  } catch (error) {
    console.error("Error handling invoice payment success:", error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice payment failed: ${invoice.id}`)
    // Handle failed recurring payment
    // You might want to send dunning emails, suspend account, etc.
  } catch (error) {
    console.error("Error handling invoice payment failure:", error)
  }
}
