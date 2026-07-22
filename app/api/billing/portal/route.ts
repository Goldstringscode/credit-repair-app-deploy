import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'
import { withRateLimit } from '@/lib/rate-limiter'

/**
 * POST /api/billing/portal
 *
 * Creates a real Stripe Billing Portal session for the authenticated user,
 * so they can change plans, update payment methods, view invoices, and
 * cancel/reactivate — all through Stripe's own PCI-compliant hosted UI.
 *
 * Previously this queried `subscriptions.user_id`, a column that has never
 * existed on that table, so this endpoint could never actually succeed for
 * any user. It now reads the Stripe customer id directly from `users`,
 * which is where /api/stripe/customers now reliably saves it.
 */
export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      const user = getAuthenticatedUser(request)
      if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      const supabase = getSupabaseClient()
      const { data: userRow, error } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', user.userId)
        .maybeSingle()

      if (error || !userRow?.stripe_customer_id) {
        return NextResponse.json(
          { success: false, error: 'No billing account found. Subscribe to a plan first.' },
          { status: 404 }
        )
      }

      const stripe = getStripeClient()
      const session = await stripe.billingPortal.sessions.create({
        customer: userRow.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      })

      return NextResponse.json({ success: true, url: session.url })
    } catch (error: any) {
      console.error('❌ Failed to create billing portal session:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create portal session', message: error.message },
        { status: 500 }
      )
    }
  },
  'general'
)
