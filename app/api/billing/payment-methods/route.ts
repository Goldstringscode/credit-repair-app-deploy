import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

async function getCustomerId(authUserId: string) {
  const supabase = getSupabaseClient()
  const { data: userRow } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', authUserId)
    .maybeSingle()
  return userRow?.stripe_customer_id ?? null
}

/**
 * GET /api/billing/payment-methods
 * Lists the authenticated user's saved cards, marking which one is the
 * default used for subscription invoices.
 */
export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const authUser = getAuthenticatedUser(request)
      if (!authUser) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      const customerId = await getCustomerId(authUser.userId)
      if (!customerId) {
        return NextResponse.json({ success: true, paymentMethods: [], defaultPaymentMethodId: null })
      }

      const stripe = getStripeClient()
      const [methods, customer] = await Promise.all([
        stripe.paymentMethods.list({ customer: customerId, type: 'card' }),
        stripe.customers.retrieve(customerId),
      ])

      const defaultPaymentMethodId =
        !('deleted' in customer && customer.deleted) &&
        typeof customer.invoice_settings?.default_payment_method === 'string'
          ? customer.invoice_settings.default_payment_method
          : null

      return NextResponse.json({
        success: true,
        paymentMethods: methods.data.map(pm => ({
          id: pm.id,
          brand: pm.card?.brand ?? 'card',
          last4: pm.card?.last4 ?? '',
          expMonth: pm.card?.exp_month ?? null,
          expYear: pm.card?.exp_year ?? null,
          isDefault: pm.id === defaultPaymentMethodId,
        })),
        defaultPaymentMethodId,
      })
    } catch (error: any) {
      console.error('❌ Failed to list payment methods:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payment methods', message: error.message },
        { status: 500 }
      )
    }
  }
)

const addPaymentMethodSchema = z.object({
  setupIntentId: z.string().min(1),
  makeDefault: z.boolean().optional().default(false),
})

/**
 * POST /api/billing/payment-methods
 *
 * Registers a card that was just saved via a SetupIntent (see
 * /api/stripe/setup-intent, the same endpoint the checkout flow uses —
 * confirming a SetupIntent with a customer already attaches the resulting
 * payment method to that customer automatically). Optionally sets it as
 * the default for future invoices.
 */
export const POST = withRateLimit(
  withValidation({ body: addPaymentMethodSchema })(
    async (request: NextRequest, validatedData: any) => {
      try {
        const authUser = getAuthenticatedUser(request)
        if (!authUser) {
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { setupIntentId, makeDefault } = validatedData.body

        const customerId = await getCustomerId(authUser.userId)
        if (!customerId) {
          return NextResponse.json({ success: false, error: 'No billing account found' }, { status: 404 })
        }

        const stripe = getStripeClient()

        const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)
        if (setupIntent.customer !== customerId) {
          return NextResponse.json(
            { success: false, error: 'Setup does not match customer' },
            { status: 403 }
          )
        }
        if (setupIntent.status !== 'succeeded') {
          return NextResponse.json(
            { success: false, error: 'Card setup not completed: ' + setupIntent.status },
            { status: 402 }
          )
        }

        const paymentMethodId =
          typeof setupIntent.payment_method === 'string'
            ? setupIntent.payment_method
            : setupIntent.payment_method?.id

        if (!paymentMethodId) {
          return NextResponse.json({ success: false, error: 'No payment method on this setup' }, { status: 400 })
        }

        if (makeDefault) {
          await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
          })
        }

        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)

        return NextResponse.json({
          success: true,
          paymentMethod: {
            id: paymentMethod.id,
            brand: paymentMethod.card?.brand ?? 'card',
            last4: paymentMethod.card?.last4 ?? '',
            expMonth: paymentMethod.card?.exp_month ?? null,
            expYear: paymentMethod.card?.exp_year ?? null,
            isDefault: makeDefault,
          },
        })
      } catch (error: any) {
        console.error('❌ Failed to add payment method:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to add payment method', message: error.message },
          { status: 500 }
        )
      }
    }
  )
)
