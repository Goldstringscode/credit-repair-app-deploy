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
      // Derived from the actual incoming request rather than
      // NEXT_PUBLIC_APP_URL: that variable is used all over this app for
      // similar purposes, and the repo's own PRODUCTION_ENVIRONMENT_SETUP.md
      // checklist flags it as "Development" — if it's still pointing at a
      // dev URL in production, Stripe still creates the session fine (it
      // doesn't validate the return_url is reachable at creation time), but
      // the hosted portal page's own client-side init can fail trying to
      // work with an unreachable return_url, which is consistent with the
      // client_init_timeout_report / connection reset reported on that
      // page. request.nextUrl.origin always reflects the real host the
      // request actually came in on.
      const returnUrl = `${request.nextUrl.origin}/dashboard/billing`
      const session = await stripe.billingPortal.sessions.create({
        customer: userRow.stripe_customer_id,
        return_url: returnUrl,
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
