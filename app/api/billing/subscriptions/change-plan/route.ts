import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'
import { getPlan, getStripePriceId } from '@/lib/subscription'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

const changePlanSchema = z.object({
  subscriptionId: z.string().min(1),
  planId: z.string().min(1),
})

/**
 * POST /api/billing/subscriptions/change-plan
 *
 * Switches the authenticated user's subscription to a different plan,
 * referencing the plan's real, persistent Stripe Price (see
 * lib/subscription.ts) rather than building one inline. Stripe prorates
 * the difference automatically and bills or credits it on the next
 * invoice.
 *
 * Updates users.subscription_tier immediately for instant UI feedback —
 * the Stripe webhook (customer.subscription.updated) is still the
 * authoritative source of truth and will reconcile this again shortly
 * after, the same as it does for every other subscription change.
 */
export const POST = withRateLimit(
  withValidation({ body: changePlanSchema })(
    async (request: NextRequest, validatedData: any) => {
      try {
        const authUser = getAuthenticatedUser(request)
        if (!authUser) {
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { subscriptionId, planId } = validatedData.body

        const plan = getPlan(planId)
        const stripePriceId = getStripePriceId(planId)
        if (!plan || !stripePriceId) {
          return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 })
        }

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

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        if (subscription.customer !== userRow.stripe_customer_id) {
          return NextResponse.json(
            { success: false, error: 'Subscription does not belong to the authenticated user' },
            { status: 403 }
          )
        }

        const currentItem = subscription.items.data[0]
        if (!currentItem) {
          return NextResponse.json({ success: false, error: 'Subscription has no items to update' }, { status: 400 })
        }

        if (currentItem.price?.id === stripePriceId) {
          return NextResponse.json({ success: false, error: "You're already on this plan" }, { status: 400 })
        }

        const updated = await stripe.subscriptions.update(subscriptionId, {
          items: [{ id: currentItem.id, price: stripePriceId }],
          proration_behavior: 'create_prorations',
          metadata: { ...subscription.metadata, planId },
        })

        const { error: tierError } = await supabase
          .from('users')
          .update({ subscription_tier: planId })
          .eq('id', authUser.userId)

        if (tierError) {
          console.error('Failed to update user subscription tier after plan change:', tierError)
        }

        return NextResponse.json({
          success: true,
          subscription: {
            id: updated.id,
            planId,
            status: updated.status,
          },
        })
      } catch (error: any) {
        console.error('❌ Failed to change plan:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to change plan', message: error.message },
          { status: 500 }
        )
      }
    }
  )
)
