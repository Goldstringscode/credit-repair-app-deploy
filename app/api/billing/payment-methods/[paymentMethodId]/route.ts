import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'

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
 *
 * Exported directly (not wrapped in withRateLimit, unlike this app's other
 * routes) — this project's Next.js build failed on every deployment from
 * the point this file was first added. withRateLimit's wrapper returns a
 * function typed (request: NextRequest, context?: any) => Promise<...>,
 * and Next 14's build-time route type-checking expects a dynamic route's
 * exported handler to match { params: { paymentMethodId: string } }
 * exactly — the wrapped, loosely-typed signature didn't satisfy that
 * check. Every other route in this app using withRateLimit has no dynamic
 * segment, so this is the first place the conflict could occur.
 */
export async function DELETE(request: NextRequest, { params }: { params: { paymentMethodId: string } }) {
  try {
    const authUser = getAuthenticatedUser(request)
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { paymentMethodId } = params
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

/**
 * PATCH /api/billing/payment-methods/[paymentMethodId]
 * Sets this card as the default used for future subscription invoices.
 */
export async function PATCH(request: NextRequest, { params }: { params: { paymentMethodId: string } }) {
  try {
    const authUser = getAuthenticatedUser(request)
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { paymentMethodId } = params
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
