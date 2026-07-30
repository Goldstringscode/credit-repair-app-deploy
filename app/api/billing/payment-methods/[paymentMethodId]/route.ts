import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'
import { withRateLimit } from '@/lib/rate-limiter'

async function getCustomerId(authUserId: string) {
  const supabase = getSupabaseClient()
  const { data: userRow } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', authUserId)
    .maybeSingle()
  return userRow?.stripe_customer_id ?? null
}

async function verifyOwnership(paymentMethodId: string, customerId: string) {
  const stripe = getStripeClient()
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId)
  return pm.customer === customerId
}

/**
 * DELETE /api/billing/payment-methods/[paymentMethodId]
 * Removes a saved card. Stripe rejects detaching a card that's currently
 * the default payment method on an active subscription with a clear error,
 * which is surfaced back to the client as-is.
 */
export const DELETE = withRateLimit(
  async (request: NextRequest, context: { params: { paymentMethodId: string } }) => {
    try {
      const authUser = getAuthenticatedUser(request)
      if (!authUser) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      const { paymentMethodId } = context.params
      const customerId = await getCustomerId(authUser.userId)
      if (!customerId) {
        return NextResponse.json({ success: false, error: 'No billing account found' }, { status: 404 })
      }

      if (!(await verifyOwnership(paymentMethodId, customerId))) {
        return NextResponse.json(
          { success: false, error: 'Payment method does not belong to the authenticated user' },
          { status: 403 }
        )
      }

      const stripe = getStripeClient()
      await stripe.paymentMethods.detach(paymentMethodId)

      return NextResponse.json({ success: true })
    } catch (error: any) {
      console.error('❌ Failed to remove payment method:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to remove payment method', message: error.message },
        { status: 500 }
      )
    }
  }
)

/**
 * PATCH /api/billing/payment-methods/[paymentMethodId]
 * Sets this card as the default used for future subscription invoices.
 */
export const PATCH = withRateLimit(
  async (request: NextRequest, context: { params: { paymentMethodId: string } }) => {
    try {
      const authUser = getAuthenticatedUser(request)
      if (!authUser) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      const { paymentMethodId } = context.params
      const customerId = await getCustomerId(authUser.userId)
      if (!customerId) {
        return NextResponse.json({ success: false, error: 'No billing account found' }, { status: 404 })
      }

      if (!(await verifyOwnership(paymentMethodId, customerId))) {
        return NextResponse.json(
          { success: false, error: 'Payment method does not belong to the authenticated user' },
          { status: 403 }
        )
      }

      const stripe = getStripeClient()
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      })

      return NextResponse.json({ success: true })
    } catch (error: any) {
      console.error('❌ Failed to set default payment method:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to set default payment method', message: error.message },
        { status: 500 }
      )
    }
  }
)
