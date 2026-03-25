import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limiter'
import { getSupabaseClient } from '@/lib/supabase-client'
import { getStripeClient } from '@/lib/stripe-client'

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const supabase = getSupabaseClient()
      const customerId = user.customerId || user.id

      // 1. Fetch the active subscription from Supabase
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_customer_id', customerId)
        .in('status', ['active', 'trialing', 'past_due'])
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (subError || !subscription) {
        return NextResponse.json({
          success: true,
          subscription: null,
          plan: null,
          nextBillingDate: null,
          paymentMethod: null,
          message: 'No active subscription found',
        })
      }

      // 2. Fetch plan details from Supabase (if a plans table exists)
      let plan: Record<string, unknown> | null = null
      if (subscription.plan_id) {
        const { data: planData } = await supabase
          .from('plans')
          .select('*')
          .eq('id', subscription.plan_id)
          .single()
        plan = planData ?? null
      }

      // 3. Fetch the default payment method last-4 from Stripe (best-effort)
      let paymentMethodLast4: string | null = null
      const stripeCustomerId = subscription.stripe_customer_id as string | null

      if (stripeCustomerId) {
        try {
          const stripe = getStripeClient()
          const customer = await stripe.customers.retrieve(stripeCustomerId, {
            expand: ['invoice_settings.default_payment_method'],
          })

          if (customer && !('deleted' in customer)) {
            const pm = customer.invoice_settings
              ?.default_payment_method as import('stripe').Stripe.PaymentMethod | null

            if (pm?.card?.last4) {
              paymentMethodLast4 = pm.card.last4
            } else {
              // Fall back to listing the customer's payment methods
              const methods = await stripe.paymentMethods.list({
                customer: stripeCustomerId,
                type: 'card',
                limit: 1,
              })
              paymentMethodLast4 = methods.data[0]?.card?.last4 ?? null
            }
          }
        } catch (stripeError) {
          console.error('Failed to fetch payment method from Stripe (non-critical):', stripeError)
        }
      }

      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          stripeSubscriptionId: subscription.stripe_subscription_id,
          status: subscription.status,
          planId: subscription.plan_id,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialEnd: subscription.trial_end,
          createdAt: subscription.created_at,
          updatedAt: subscription.updated_at,
        },
        plan,
        nextBillingDate: subscription.current_period_end ?? null,
        paymentMethod: paymentMethodLast4 ? { last4: paymentMethodLast4 } : null,
      })
    } catch (error: any) {
      console.error('❌ Failed to fetch billing user info:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch billing info',
          message: error.message,
        },
        { status: 500 }
      )
    }
  }),
  'general'
)
