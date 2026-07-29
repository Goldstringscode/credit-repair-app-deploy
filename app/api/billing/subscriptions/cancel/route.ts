import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

const cancelSchema = z.object({
  subscriptionId: z.string().min(1),
  atPeriodEnd: z.boolean().optional().default(true),
})

/**
 * POST /api/billing/subscriptions/cancel
 *
 * Cancels the authenticated user's subscription — at the end of the
 * current billing period by default (keeps access until then, standard
 * self-serve cancellation), or immediately if atPeriodEnd is false.
 *
 * Only updates the real Stripe subscription. users.subscription_tier is
 * NOT changed here directly — the Stripe webhook (customer.subscription.
 * updated/deleted) is the single source of truth for that, so a customer
 * who cancels at period end correctly keeps their tier until the period
 * actually ends, and immediate cancellation is picked up the moment
 * Stripe's deletion webhook fires, consistent everywhere else in the app.
 */
export const POST = withRateLimit(
  withValidation({ body: cancelSchema })(
    async (request: NextRequest, validatedData: any) => {
      try {
        const authUser = getAuthenticatedUser(request)
        if (!authUser) {
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { subscriptionId, atPeriodEnd } = validatedData.body

        const supabase = getSupabaseClient()
        const { data: userRow } = await supabase
          .from('users')
          .select('stripe_customer_id')
          .eq('id', authUser.userId)
          .maybeSingle()

        if (!userRow?.stripe_customer_id) {
          return NextResponse.json({ success: false, error: 'No billing account found' }, { status: 404 })
        }

        const stripe = getStripeClient()

        // Defense in depth: the subscription being cancelled must actually
        // belong to this user's Stripe customer.
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        if (subscription.customer !== userRow.stripe_customer_id) {
          return NextResponse.json(
            { success: false, error: 'Subscription does not belong to the authenticated user' },
            { status: 403 }
          )
        }

        const updated = atPeriodEnd
          ? await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
          : await stripe.subscriptions.cancel(subscriptionId)

        return NextResponse.json({
          success: true,
          subscription: {
            id: updated.id,
            status: updated.status,
            cancelAtPeriodEnd: updated.cancel_at_period_end,
          },
        })
      } catch (error: any) {
        console.error('❌ Failed to cancel subscription:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to cancel subscription', message: error.message },
          { status: 500 }
        )
      }
    }
  )
)
