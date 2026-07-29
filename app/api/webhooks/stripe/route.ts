import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

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

/**
 * Single source of truth for keeping a user's permissions in sync with the
 * real state of their Stripe subscription. Called from every subscription
 * lifecycle event below, so renewals, plan changes, failed payments, and
 * cancellations all converge on the same logic instead of each handler
 * updating (or forgetting to update) users.subscription_tier differently.
 *
 * planId is read from subscription.metadata.planId, which is set when the
 * subscription is created (see app/api/billing/subscriptions/route.ts) —
 * not from price.metadata, since subscriptions are created with an inline
 * price_data object that has no persistent Price record to attach metadata
 * to.
 */
async function syncUserAccessFromSubscription(supabase: SupabaseClient, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const planId = subscription.metadata?.planId

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (userError || !user) {
    console.error("No user found for Stripe customer:", customerId)
    return null
  }

  const updates: Record<string, any> = { updated_at: new Date().toISOString() }

  if (subscription.status === "active" || subscription.status === "trialing") {
    updates.subscription_status = "active"
    if (planId) updates.subscription_tier = planId
  } else if (subscription.status === "past_due" || subscription.status === "unpaid") {
    // Grace period: reflect the real status but leave the tier intact so
    // access isn't immediately cut off on a single failed charge. Full
    // dunning/lockout behavior, if wanted, would need the paywall checks
    // themselves to also look at subscription_status, not just tier.
    updates.subscription_status = subscription.status
  } else {
    // canceled, incomplete_expired, or any other terminal state — no longer
    // a paying customer, so permissions must actually be revoked here.
    updates.subscription_status = subscription.status === "canceled" ? "canceled" : "inactive"
    updates.subscription_tier = "free"
  }

  const { error: updateError } = await supabase.from("users").update(updates).eq("id", user.id)
  if (updateError) {
    console.error("Failed to sync user subscription tier:", updateError)
  }

  return user.id as string
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const userId = paymentIntent.metadata.userId
    const planType = paymentIntent.metadata.planType

    if (!userId || !planType) {
      // Not every PaymentIntent is a subscription payment (e.g. certified
      // mail postage never sets this metadata) — this is expected to no-op
      // for those, not an error condition.
      return
    }

    const supabase = getSupabaseClient()
    await supabase.from("payments").insert({
      user_id: userId,
      stripe_payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: "succeeded",
      plan_type: planType,
    })

    await supabase
      .from("users")
      .update({
        subscription_status: "active",
        subscription_tier: planType,
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
    if (!userId) return

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
    const supabase = getSupabaseClient()
    const customerId = subscription.customer as string
    const planId = subscription.metadata?.planId ?? null

    const userId = await syncUserAccessFromSubscription(supabase, subscription)
    if (!userId) return

    // Mirror row for billing history/admin views. onConflict guards against
    // this ever double-inserting if /api/billing/subscriptions already
    // created it synchronously during checkout and this event arrives after.
    const { error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          customer_id: customerId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          plan_id: planId,
          status: subscription.status,
          current_period_start: (subscription as any).current_period_start
            ? new Date((subscription as any).current_period_start * 1000).toISOString()
            : null,
          current_period_end: (subscription as any).current_period_end
            ? new Date((subscription as any).current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: subscription.cancel_at_period_end,
        },
        { onConflict: "stripe_subscription_id" }
      )

    if (error) {
      console.error("Failed to upsert subscription record:", error)
    }

    console.log(`Subscription created for user ${userId}`)
  } catch (error) {
    console.error("Error handling subscription creation:", error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const supabase = getSupabaseClient()

    // This is the event Stripe sends for plan changes and renewals made
    // through the Billing Portal — previously this handler only touched the
    // subscriptions mirror table and never called through to users, so a
    // customer who changed plans (or whose subscription lapsed) kept
    // whatever tier they had at signup indefinitely.
    await syncUserAccessFromSubscription(supabase, subscription)

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        plan_id: subscription.metadata?.planId ?? undefined,
        current_period_start: (subscription as any).current_period_start
          ? new Date((subscription as any).current_period_start * 1000).toISOString()
          : null,
        current_period_end: (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000).toISOString()
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id)

    if (error) {
      console.error("Failed to update subscription record:", error)
    }

    console.log(`Subscription updated: ${subscription.id}`)
  } catch (error) {
    console.error("Error handling subscription update:", error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const supabase = getSupabaseClient()

    // The critical fix: previously this only set subscription_status to
    // "canceled" and left subscription_tier untouched, so a cancelled
    // customer kept their paid tier's permissions indefinitely.
    // syncUserAccessFromSubscription resets tier to "free" for a canceled
    // status.
    const userId = await syncUserAccessFromSubscription(supabase, subscription)
    if (!userId) return

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", subscription.id)

    if (error) {
      console.error("Failed to update subscription record:", error)
    }

    console.log(`Subscription canceled for user ${userId}`)
  } catch (error) {
    console.error("Error handling subscription deletion:", error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId =
      typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id
    if (!subscriptionId) return

    // A renewal charge succeeding (including after a prior past_due retry)
    // should bring the account back to fully active — re-fetch the
    // subscription rather than trust the invoice alone, since it reflects
    // Stripe's authoritative current state.
    const stripe = getStripeClient()
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const supabase = getSupabaseClient()
    await syncUserAccessFromSubscription(supabase, subscription)

    console.log(`Invoice payment succeeded: ${invoice.id}`)
  } catch (error) {
    console.error("Error handling invoice payment success:", error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId =
      typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id
    if (!subscriptionId) return

    const stripe = getStripeClient()
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const supabase = getSupabaseClient()
    // Records the past_due status; see syncUserAccessFromSubscription for
    // why tier isn't immediately revoked on a single failed charge.
    await syncUserAccessFromSubscription(supabase, subscription)

    console.log(`Invoice payment failed: ${invoice.id}`)
  } catch (error) {
    console.error("Error handling invoice payment failure:", error)
  }
}
