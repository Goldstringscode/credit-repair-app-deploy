import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'
import { getPlan, getPlanPriceCents, getStripePriceId } from '@/lib/subscription'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createSubscriptionSchema = z.object({
  customerId: z.string().min(1),
  planId: z.string().min(1),
  metadata: z.record(z.any()).optional(),
})

/**
 * Newer Stripe API versions moved current_period_start/current_period_end
 * off the top-level Subscription object onto each subscription item
 * (subscriptions can now have items with independently different billing
 * periods). Reading the old top-level fields directly returns undefined,
 * and calling .toISOString() on `new Date(undefined * 1000)` throws —
 * this was crashing subscription creation with a 500 after the real
 * subscription (and its real first charge) had already gone through on
 * Stripe's side. Falls back to the first item's period if the top-level
 * fields aren't present, and to now/now+30d as a last resort so this can
 * never throw regardless of API version.
 */
function getSubscriptionPeriod(subscription: any): { start: string; end: string } {
  const topStart = subscription.current_period_start
  const topEnd = subscription.current_period_end
  if (typeof topStart === 'number' && typeof topEnd === 'number') {
    return {
      start: new Date(topStart * 1000).toISOString(),
      end: new Date(topEnd * 1000).toISOString(),
    }
  }

  const item = subscription.items?.data?.[0]
  if (item && typeof item.current_period_start === 'number' && typeof item.current_period_end === 'number') {
    return {
      start: new Date(item.current_period_start * 1000).toISOString(),
      end: new Date(item.current_period_end * 1000).toISOString(),
    }
  }

  const now = new Date()
  const fallbackEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  return { start: now.toISOString(), end: fallbackEnd.toISOString() }
}

/**
 * POST /api/billing/subscriptions
 *
 * Creates the recurring Stripe subscription after the card has been saved
 * via a SetupIntent (see components/checkout-form.tsx and
 * /api/stripe/setup-intent). The route requires the confirmed SetupIntent's
 * id in metadata.setupIntentId, retrieves the payment method that was
 * saved, attaches it to the customer as the default for future invoices,
 * and creates a real Stripe Subscription referencing the plan's real,
 * persistent Stripe Price (see lib/subscription.ts).
 *
 * This used to confirm a one-time PaymentIntent for the first payment and
 * then separately create the subscription — but creating a Stripe
 * subscription with a default payment method already attached
 * automatically generates and charges an invoice for the first billing
 * period on its own, so that combination charged the customer twice for
 * the same first payment. Using a SetupIntent (saves the card, charges
 * nothing) means the subscription's own automatic first invoice is the
 * only charge.
 */
export const POST = withRateLimit(
  withValidation({ body: createSubscriptionSchema })(
    async (request: NextRequest, validatedData?: any) => {
      try {
        const authUser = getAuthenticatedUser(request)
        if (!authUser) {
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { customerId, planId, metadata } = validatedData.body

        const plan = getPlan(planId)
        if (!plan) {
          return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 })
        }

        const setupIntentId = metadata?.setupIntentId
        if (!setupIntentId) {
          return NextResponse.json(
            { success: false, error: 'setupIntentId is required in metadata' },
            { status: 400 }
          )
        }

        const supabase = getSupabaseClient()

        // Defense in depth: the customer being subscribed must belong to
        // the authenticated user, never trust the client-supplied id alone.
        const { data: userRow } = await supabase
          .from('users')
          .select('stripe_customer_id, email')
          .eq('id', authUser.userId)
          .maybeSingle()

        if (!userRow?.stripe_customer_id || userRow.stripe_customer_id !== customerId) {
          return NextResponse.json(
            { success: false, error: 'Customer does not belong to the authenticated user' },
            { status: 403 }
          )
        }

        const stripe = getStripeClient()

        // Confirm the card was actually saved and belongs to this customer.
        const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)
        if (setupIntent.customer !== customerId) {
          return NextResponse.json({ success: false, error: 'Setup does not match customer' }, { status: 400 })
        }
        if (setupIntent.status !== 'succeeded') {
          return NextResponse.json(
            { success: false, error: 'Card setup not completed: ' + setupIntent.status },
            { status: 402 }
          )
        }

        const paymentMethodId =
          typeof setupIntent.payment_method === 'string'
            ? setupIntent.payment_method
            : setupIntent.payment_method?.id

        if (!paymentMethodId) {
          return NextResponse.json({ success: false, error: 'No payment method on this setup' }, { status: 400 })
        }

        // Save the card for recurring billing: attach it to the customer and
        // make it the default for future subscription invoices.
        try {
          await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })
        } catch (attachErr: any) {
          // Already attached to this customer is fine; anything else, surface it.
          if (attachErr?.code !== 'resource_already_exists' && attachErr?.raw?.code !== 'resource_already_exists') {
            throw attachErr
          }
        }
        await stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: paymentMethodId },
        })

        const interval = plan.period === 'year' ? 'year' : 'month'
        const unitAmount = getPlanPriceCents(planId)
        const stripePriceId = getStripePriceId(planId)

        if (!stripePriceId) {
          return NextResponse.json(
            { success: false, error: 'This plan is not available for subscription' },
            { status: 400 }
          )
        }

        // This is the only charge for the first billing period — Stripe
        // automatically generates and charges an invoice for it as part of
        // creating the subscription, since default_payment_method is set.
        const stripeSubscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: stripePriceId }],
          default_payment_method: paymentMethodId,
          metadata: { planId, userId: authUser.userId },
        })

        const period = getSubscriptionPeriod(stripeSubscription)

        const record = {
          user_id: authUser.userId,
          customer_id: customerId,
          customer_email: userRow.email,
          plan_id: planId,
          plan_name: plan.name,
          status: stripeSubscription.status,
          current_period_start: period.start,
          current_period_end: period.end,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          amount: unitAmount / 100,
          currency: 'usd',
          next_billing_date: period.end,
          stripe_subscription_id: stripeSubscription.id,
          stripe_customer_id: customerId,
          payment_method: 'card',
          billing_cycle: interval,
          metadata: { setupIntentId },
        }

        const { data: saved, error: saveError } = await supabase
          .from('subscriptions')
          .insert(record)
          .select()
          .single()

        if (saveError) {
          // The real Stripe subscription is already live even if this insert
          // fails — log it but don't fail the request over a mirror-table write.
          console.error('Failed to save subscription record:', saveError)
        }

        // Grant the plan's permissions immediately. Everything that gates
        // access (e.g. the training course paywall) reads users.subscription_tier,
        // so without this a customer who just paid would still be treated as
        // free tier until some future reconciliation. Ongoing renewals/
        // cancellations should also keep this in sync via the Stripe webhook.
        const { error: tierError } = await supabase
          .from('users')
          .update({ subscription_tier: planId, subscription_status: 'active' })
          .eq('id', authUser.userId)

        if (tierError) {
          console.error('Failed to update user subscription tier:', tierError)
        }

        return NextResponse.json({
          success: true,
          subscription: {
            id: stripeSubscription.id,
            customerId,
            planId,
            status: stripeSubscription.status,
            currentPeriodStart: record.current_period_start,
            currentPeriodEnd: record.current_period_end,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            createdAt: new Date(stripeSubscription.created * 1000).toISOString(),
          },
        })
      } catch (error: any) {
        console.error('❌ Subscription creation failed:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to create subscription', message: error.message },
          { status: 500 }
        )
      }
    }
  )
)

/**
 * GET /api/billing/subscriptions
 * Returns the authenticated user's active Stripe subscriptions.
 */
export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const user = getAuthenticatedUser(request)
      if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      const supabase = getSupabaseClient()
      const { data: userRow } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', user.userId)
        .maybeSingle()

      if (!userRow?.stripe_customer_id) {
        return NextResponse.json({ success: true, subscriptions: [] })
      }

      const stripe = getStripeClient()
      const subs = await stripe.subscriptions.list({
        customer: userRow.stripe_customer_id,
        status: 'all',
        limit: 10,
      })

      return NextResponse.json({
        success: true,
        subscriptions: subs.data.map(sub => {
          const period = getSubscriptionPeriod(sub)
          return {
            id: sub.id,
            customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
            planId: sub.metadata?.planId ?? null,
            status: sub.status,
            currentPeriodStart: period.start,
            currentPeriodEnd: period.end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            createdAt: new Date(sub.created * 1000).toISOString(),
          }
        }),
      })
    } catch (error: any) {
      console.error('❌ Failed to fetch subscriptions:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch data', message: error.message },
        { status: 500 }
      )
    }
  }
)
