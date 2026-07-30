import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

const createSetupIntentSchema = z.object({
  customerId: z.string().min(1).optional(),
})

/**
 * POST /api/stripe/setup-intent
 *
 * Creates a SetupIntent to save a card on the customer without charging
 * anything. Used by the subscription checkout flow instead of a one-time
 * PaymentIntent — creating a real Stripe Subscription right after already
 * automatically generates and charges an invoice for the first billing
 * period, so also confirming a separate PaymentIntent for that same first
 * payment charged the customer twice. A SetupIntent saves the card; the
 * subscription's own automatic first invoice is the only charge.
 *
 * Also used by /dashboard/billing's "add card" flow, which doesn't already
 * have a customerId on hand the way checkout does — customerId is now
 * optional and derived from the authenticated user's stored Stripe customer
 * id when omitted, still verified to match when the caller does supply one.
 */
export const POST = withRateLimit(
  withValidation({ body: createSetupIntentSchema })(
    async (request: NextRequest, validatedData: any) => {
      try {
        const authUser = getAuthenticatedUser(request)
        if (!authUser) {
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { customerId: requestedCustomerId } = validatedData.body

        const supabase = getSupabaseClient()
        const { data: userRow } = await supabase
          .from('users')
          .select('stripe_customer_id')
          .eq('id', authUser.userId)
          .maybeSingle()

        if (!userRow?.stripe_customer_id) {
          return NextResponse.json({ success: false, error: 'No billing account found' }, { status: 404 })
        }

        // Defense in depth: if the caller did supply a customerId (as
        // checkout does), it must match the authenticated user's own.
        if (requestedCustomerId && requestedCustomerId !== userRow.stripe_customer_id) {
          return NextResponse.json(
            { success: false, error: 'Customer does not belong to the authenticated user' },
            { status: 403 }
          )
        }

        const customerId = userRow.stripe_customer_id

        const stripe = getStripeClient()
        const setupIntent = await stripe.setupIntents.create({
          customer: customerId,
          usage: 'off_session',
          metadata: { userId: authUser.userId },
        })

        return NextResponse.json({
          success: true,
          setupIntent: {
            id: setupIntent.id,
            client_secret: setupIntent.client_secret,
            status: setupIntent.status,
          },
        })
      } catch (error: any) {
        console.error('❌ Setup intent creation failed:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to create setup intent', message: error.message },
          { status: 500 }
        )
      }
    }
  )
)
