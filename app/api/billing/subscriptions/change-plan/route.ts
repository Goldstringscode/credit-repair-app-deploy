import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'
import { getPlan, getPlanPriceCents, getStripePriceId } from '@/lib/subscription'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

const changePlanSchema = z.object({
  subscriptionId: z.string().min(1),
  planId: z.string().min(1),
  paymentMethodId: z.string().min(1).optional(),
})

/**
 * POST /api/billing/subscriptions/change-plan
 *
 * Upgrades charge immediately: proration_behavior "always_invoice" creates
 * and pays an invoice for the prorated difference right away, rather than
 * just adding a line item to the next regular invoice. If the customer
 * chose a specific card in the modal (not their existing default),
 * paymentMethodId sets it as the subscription's default payment method
 * before charging, so that's the card the immediate invoice is billed to.
 *
 * Downgrades do NOT change anything immediately — the customer already
 * paid for the current, higher-tier period, so they keep that access
 * until it actually ends. A Stripe Subscription Schedule is created with
 * two phases: the current plan running through the existing period end,
 * then the new (lower) plan starting right after. Stripe applies the
 * transition on its own at the right time — no immediate proration, no
 * early loss of access. The new phase's metadata carries planId so the
 * existing webhook (customer.subscription.updated) picks up the tier
 * change correctly when the transition actually happens.
 */
export const POST = withRateLimit(
  withValidation({ body: changePlanSchema })(
    async (request: NextRequest, validatedData: any) => {
      try {
        const authUser = getAuthenticatedUser(request)
        if (!authUser) {
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { subscriptionId, planId, paymentMethodId } = validatedData.body

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

        // Defense in depth: a chosen payment method must actually belong
        // to this customer.
        if (paymentMethodId) {
          const pm = await stripe.paymentMethods.retrieve(paymentMethodId)
          if (pm.customer !== userRow.stripe_customer_id) {
            return NextResponse.json(
              { success: false, error: 'Payment method does not belong to the authenticated user' },
              { status: 403 }
            )
          }
        }

        const currentPlanId = subscription.metadata?.planId
        const currentPriceCents = getPlanPriceCents(currentPlanId)
        const newPriceCents = getPlanPriceCents(planId)
        const isUpgrade = newPriceCents > currentPriceCents

        if (isUpgrade) {
          if (paymentMethodId) {
            await stripe.customers.update(userRow.stripe_customer_id, {
              invoice_settings: { default_payment_method: paymentMethodId },
            })
          }

          const updated = await stripe.subscriptions.update(subscriptionId, {
            items: [{ id: currentItem.id, price: stripePriceId }],
            proration_behavior: 'always_invoice',
            default_payment_method: paymentMethodId || undefined,
            metadata: { ...subscription.metadata, planId },
          })

          const { error: tierError } = await supabase
            .from('users')
            .update({ subscription_tier: planId, subscription_status: 'active' })
            .eq('id', authUser.userId)

          if (tierError) {
            console.error('Failed to update user subscription tier after upgrade:', tierError)
          }

          return NextResponse.json({
            success: true,
            immediate: true,
            subscription: { id: updated.id, planId, status: updated.status },
          })
        }

        // Downgrade: schedule the change instead of applying it now.
        const periodEnd = (subscription as any).current_period_end ?? currentItem.current_period_end

        const schedule = await stripe.subscriptionSchedules.create({
          from_subscription: subscriptionId,
        })

        const currentPhase = schedule.phases[0]

        await stripe.subscriptionSchedules.update(schedule.id, {
          phases: [
            {
              items: currentPhase.items.map(item => ({
                price: typeof item.price === 'string' ? item.price : item.price.id,
                quantity: item.quantity,
              })),
              start_date: currentPhase.start_date,
              end_date: periodEnd,
              metadata: subscription.metadata,
            },
            {
              items: [{ price: stripePriceId }],
              metadata: { ...subscription.metadata, planId },
            },
          ],
          end_behavior: 'release',
        })

        return NextResponse.json({
          success: true,
          immediate: false,
          effectiveDate: new Date(periodEnd * 1000).toISOString(),
          subscription: { id: subscriptionId, planId, status: subscription.status },
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
