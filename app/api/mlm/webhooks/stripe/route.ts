import { type NextRequest, NextResponse } from "next/server"
import { getStripeClient } from "@/lib/stripe-client"
import { getSupabaseClient } from "@/lib/supabase-client"

function getWebhookSecret() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required')
  }
  return process.env.STRIPE_WEBHOOK_SECRET
}

export async function POST(request: NextRequest) {
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

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handleMLMPaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break
      case "payment_intent.payment_failed":
        await handleMLMPaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      case "invoice.payment_succeeded":
        await handleMLMInvoicePaymentSuccess(event.data.object as Stripe.Invoice)
        break
      case "invoice.payment_failed":
        await handleMLMInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      case "customer.subscription.created":
        await handleMLMSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      case "customer.subscription.updated":
        await handleMLMSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case "customer.subscription.deleted":
        await handleMLMSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing MLM webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleMLMPaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { userId, planType, userType } = paymentIntent.metadata

  if (userType !== 'mlm') return

  console.log(`MLM Payment succeeded for user ${userId}, plan: ${planType}`)

  // Update MLM user status
  const supabase = getSupabaseClient()
  await supabase
    .from("mlm_users")
    .update({ 
      status: 'active',
      last_activity: new Date().toISOString()
    })
    .eq("user_id", userId)

  // Create payment record
  await supabase
    .from("mlm_payments")
    .insert({
      user_id: userId,
      stripe_payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'completed',
      plan_type: planType,
      payment_date: new Date().toISOString(),
    })
}

async function handleMLMPaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { userId, planType, userType } = paymentIntent.metadata

  if (userType !== 'mlm') return

  console.log(`MLM Payment failed for user ${userId}, plan: ${planType}`)

  // Update MLM user status
  const supabase = getSupabaseClient()
  await supabase
    .from("mlm_users")
    .update({ 
      status: 'inactive',
      last_activity: new Date().toISOString()
    })
    .eq("user_id", userId)

  // Create payment record
  await supabase
    .from("mlm_payments")
    .insert({
      user_id: userId,
      stripe_payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'failed',
      plan_type: planType,
      payment_date: new Date().toISOString(),
    })
}

async function handleMLMInvoicePaymentSuccess(invoice: Stripe.Invoice) {
  const subscription = (invoice as any).subscription as string
  const metadata = invoice.metadata as any
  const { userId, planType, userType } = metadata || {}

  if (userType !== 'mlm') return

  console.log(`MLM Invoice payment succeeded for user ${userId}`)

  // Update MLM user status
  const supabase = getSupabaseClient()
  await supabase
    .from("mlm_users")
    .update({ 
      status: 'active',
      last_activity: new Date().toISOString()
    })
    .eq("subscription_id", subscription)

  // Create payment record
  await supabase
    .from("mlm_payments")
    .insert({
      user_id: userId,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'completed',
      plan_type: planType,
      payment_date: new Date().toISOString(),
    })
}

async function handleMLMInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = (invoice as any).subscription as string
  const metadata = invoice.metadata as any
  const { userId, planType, userType } = metadata || {}

  if (userType !== 'mlm') return

  console.log(`MLM Invoice payment failed for user ${userId}`)

  // Update MLM user status
  const supabase = getSupabaseClient()
  await supabase
    .from("mlm_users")
    .update({ 
      status: 'inactive',
      last_activity: new Date().toISOString()
    })
    .eq("subscription_id", subscription)

  // Create payment record
  await supabase
    .from("mlm_payments")
    .insert({
      user_id: userId,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      plan_type: planType,
      payment_date: new Date().toISOString(),
    })
}

async function handleMLMSubscriptionCreated(subscription: Stripe.Subscription) {
  const { userId, planType, userType } = subscription.metadata

  if (userType !== 'mlm') return

  console.log(`MLM Subscription created for user ${userId}`)

  // Update MLM user with subscription details
  const supabase = getSupabaseClient()
  await supabase
    .from("mlm_users")
    .update({
      subscription_id: subscription.id,
      subscription_status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    })
    .eq("user_id", userId)
}

async function handleMLMSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { userId, planType, userType } = subscription.metadata

  if (userType !== 'mlm') return

  console.log(`MLM Subscription updated for user ${userId}`)

  // Update MLM user subscription status
  const supabase = getSupabaseClient()
  await supabase
    .from("mlm_users")
    .update({
      subscription_status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq("subscription_id", subscription.id)
}

async function handleMLMSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { userId, planType, userType } = subscription.metadata

  if (userType !== 'mlm') return

  console.log(`MLM Subscription deleted for user ${userId}`)

  // Update MLM user status
  const supabase = getSupabaseClient()
  await supabase
    .from("mlm_users")
    .update({
      status: 'inactive',
      subscription_status: 'cancelled',
      last_activity: new Date().toISOString(),
    })
    .eq("subscription_id", subscription.id)
}