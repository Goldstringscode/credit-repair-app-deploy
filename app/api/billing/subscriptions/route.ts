import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'
import { getPlan, getPlanPriceCents } from '@/lib/subscription'
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
 * POST /api/billing/subscriptions
 *
 * Creates the recurring Stripe subscription after a successful first
 * payment (see components/checkout-form.tsx). The route requires the
 * confirmed PaymentIntent's id in metadata.paymentIntentId, retrieves the
 * payment method that was used, attaches it to the customer as the default
 * for future invoices, and creates a real Stripe Subscription — using an
 * inline recurring price (price_data) built from lib/subscription.ts, the
 * app's single source of truth for plan pricing, so no Stripe Dashboard
 * product/price setup is required.
 *
 * Previously this called subscriptionManager.createSubscription() without
 * `useStripe: true`, which silently fell through to a local-only fake
 * subscription record — meaning a customer could pay once for real via
 * Stripe but never actually be enrolled in recurring billing.
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

        const paymentIntentId = metadata?.paymentIntentId
        if (!paymentIntentId) {
          return NextResponse.json(
            { success: false, error: 'paymentIntentId is required in metadata' },
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

        // Confirm the payment actually succeeded and belongs to this customer.
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
        if (paymentIntent.customer !== customerId) {
          return NextResponse.json({ success: false, error: 'Payment does not match customer' }, { status: 400 })
        }
        if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'processing') {
          return NextResponse.json(
            { success: false, error: 'Payment not completed: ' + paymentIntent.status },
            { status: 402 }
          )
        }

        const paymentMethodId =
          typeof paymentIntent.payment_method === 'string'
            ? paymentIntent.payment_method
            : paymentIntent.payment_method?.id

        if (!paymentMethodId) {
          return NextResponse.json({ success: false, error: 'No payment method on this payment' }, { status: 400 })
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

        const stripeSubscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [
            {
              price_data: {
                currency: 'usd',
                unit_amount: unitAmount,
                recurring: { interval },
                product_data: { name: plan.name },
              },
            },
          ],
          default_payment_method: paymentMethodId,
          metadata: { planId, userId: authUser.userId },
        })

        const record = {
          user_id: authUser.userId,
          customer_id: customerId,
          customer_email: userRow.email,
          plan_id: planId,
          plan_name: plan.name,
          status: stripeSubscription.status,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          amount: unitAmount / 100,
          currency: 'usd',
          next_billing_date: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          stripe_subscription_id: stripeSubscription.id,
          stripe_customer_id: customerId,
          payment_method: 'card',
          billing_cycle: interval,
          metadata: { paymentIntentId },
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
        subscriptions: subs.data.map(sub => ({
          id: sub.id,
          customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
          planId: sub.metadata?.planId ?? null,
          status: sub.status,
          currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          createdAt: new Date(sub.created * 1000).toISOString(),
        })),
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
