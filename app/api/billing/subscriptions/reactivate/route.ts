import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

const reactivateSchema = z.object({
  subscriptionId: z.string().min(1),
})

/**
 * POST /api/billing/subscriptions/reactivate
 *
 * Undoes a scheduled cancel-at-period-end, so the subscription keeps
 * renewing. Only works for a subscription that's still active and
 * scheduled to cancel — a subscription that has already fully ended
 * (status "canceled") can't be reactivated this way; that requires
 * starting a new subscription through checkout instead.
 */
export const POST = withRateLimit(
  withValidation({ body: reactivateSchema })(
    async (request: NextRequest, validatedData: any) => {
      try {
        const authUser = getAuthenticatedUser(request)
        if (!authUser) {
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { subscriptionId } = validatedData.body

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

        if (subscription.status === 'canceled') {
          return NextResponse.json(
            { success: false, error: 'This subscription has already ended. Subscribe again to continue.' },
            { status: 400 }
          )
        }

        const updated = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false })

        return NextResponse.json({
          success: true,
          subscription: {
            id: updated.id,
            status: updated.status,
            cancelAtPeriodEnd: updated.cancel_at_period_end,
          },
        })
      } catch (error: any) {
        console.error('❌ Failed to reactivate subscription:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to reactivate subscription', message: error.message },
          { status: 500 }
        )
      }
    }
  )
)
