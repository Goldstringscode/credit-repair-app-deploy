import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'
import { getPlan, getPlanPriceCents, getStripePriceId } from '@/lib/subscription'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

const previewSchema = z.object({
  subscriptionId: z.string().min(1),
  planId: z.string().min(1),
})

/**
 * POST /api/billing/subscriptions/preview-plan-change
 *
 * Computes what a plan change would actually do, before the user confirms:
 * for an upgrade, the prorated amount that would be charged today; for a
 * downgrade, the date the change takes effect. Estimated with simple
 * time-based proration math (same method Stripe uses by default) rather
 * than depending on a specific invoice-preview API surface, since this is
 * only used for display — the real charge, when the user confirms, is
 * computed by Stripe itself at that point and is authoritative regardless
 * of this estimate.
 */
export const POST = withRateLimit(
  withValidation({ body: previewSchema })(
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
          return NextResponse.json({ success: false, error: 'Subscription has no items' }, { status: 400 })
        }

        const currentPlanId = subscription.metadata?.planId
        const currentPriceCents = getPlanPriceCents(currentPlanId)
        const newPriceCents = getPlanPriceCents(planId)
        const isUpgrade = newPriceCents > currentPriceCents

        const periodStart =
          (subscription as any).current_period_start ?? currentItem.current_period_start
        const periodEnd = (subscription as any).current_period_end ?? currentItem.current_period_end
        const effectiveDate = new Date(periodEnd * 1000).toISOString()

        if (!isUpgrade) {
          // Downgrades are scheduled to take effect at period end (see
          // change-plan), so nothing is charged today.
          return NextResponse.json({
            success: true,
            isUpgrade: false,
            amountDueToday: 0,
            effectiveDate,
          })
        }

        const now = Math.floor(Date.now() / 1000)
        const totalPeriodSeconds = Math.max(1, periodEnd - periodStart)
        const remainingSeconds = Math.max(0, periodEnd - now)
        const remainingFraction = remainingSeconds / totalPeriodSeconds

        const oldPlanRemainingCredit = currentPriceCents * remainingFraction
        const newPlanRemainingCost = newPriceCents * remainingFraction
        const amountDueToday = Math.max(0, Math.round(newPlanRemainingCost - oldPlanRemainingCredit))

        return NextResponse.json({
          success: true,
          isUpgrade: true,
          amountDueToday: amountDueToday / 100,
          effectiveDate: new Date().toISOString(),
        })
      } catch (error: any) {
        console.error('❌ Failed to preview plan change:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to preview plan change', message: error.message },
          { status: 500 }
        )
      }
    }
  )
)
