import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'
import { withRateLimit } from '@/lib/rate-limiter'

/**
 * GET /api/billing/invoices
 * Lists the authenticated user's past invoices, most recent first, with
 * links to the hosted invoice page and PDF that Stripe generates for each.
 */
export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const authUser = getAuthenticatedUser(request)
      if (!authUser) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      const supabase = getSupabaseClient()
      const { data: userRow } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', authUser.userId)
        .maybeSingle()

      if (!userRow?.stripe_customer_id) {
        return NextResponse.json({ success: true, invoices: [] })
      }

      const stripe = getStripeClient()
      const invoices = await stripe.invoices.list({
        customer: userRow.stripe_customer_id,
        limit: 20,
      })

      return NextResponse.json({
        success: true,
        invoices: invoices.data.map(inv => ({
          id: inv.id,
          number: inv.number,
          status: inv.status,
          amountPaid: inv.amount_paid / 100,
          currency: inv.currency,
          created: new Date(inv.created * 1000).toISOString(),
          hostedInvoiceUrl: inv.hosted_invoice_url,
          invoicePdf: inv.invoice_pdf,
        })),
      })
    } catch (error: any) {
      console.error('❌ Failed to fetch invoices:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch invoices', message: error.message },
        { status: 500 }
      )
    }
  }
)
