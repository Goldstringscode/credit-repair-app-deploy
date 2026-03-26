import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'
import { dunningManager } from '@/lib/dunning-manager'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    console.error('❌ Missing stripe-signature header')
    return NextResponse.json({ received: true })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ received: true })
  }

  let event: Stripe.Event
  try {
    event = getStripeClient().webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('🔔 Stripe webhook received:', event.type)

  // Process the event — individual handlers must never throw; errors are logged only
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
      break
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
      break
    case 'customer.subscription.trial_will_end':
      await handleTrialWillEnd(event.data.object as Stripe.Subscription)
      break
    default:
      console.log('ℹ️ Unhandled webhook event type:', event.type)
  }

  // Always acknowledge receipt — never return an error status to Stripe
  return NextResponse.json({ received: true })
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const supabase = getSupabaseClient()
    const customerId = subscription.customer as string
    const planId = subscription.items.data[0]?.price?.metadata?.planType
      || subscription.metadata?.planType
      || 'basic'

    await supabase.from('subscriptions').upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      status: subscription.status,
      plan_id: planId,
      current_period_start: (subscription as any).current_period_start
        ? new Date((subscription as any).current_period_start * 1000).toISOString()
        : null,
      current_period_end: (subscription as any).current_period_end
        ? new Date((subscription as any).current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_subscription_id' })

    console.log(`✅ Subscription created in DB: ${subscription.id}`)
  } catch (error) {
    console.error('❌ handleSubscriptionCreated error:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const supabase = getSupabaseClient()
    const planId = subscription.items.data[0]?.price?.metadata?.planType
      || subscription.metadata?.planType

    const updates: Record<string, unknown> = {
      status: subscription.status,
      current_period_start: (subscription as any).current_period_start
        ? new Date((subscription as any).current_period_start * 1000).toISOString()
        : null,
      current_period_end: (subscription as any).current_period_end
        ? new Date((subscription as any).current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }

    if (planId) {
      updates.plan_id = planId
    }

    await supabase
      .from('subscriptions')
      .update(updates)
      .eq('stripe_subscription_id', subscription.id)

    console.log(`✅ Subscription updated in DB: ${subscription.id} → ${subscription.status}`)
  } catch (error) {
    console.error('❌ handleSubscriptionUpdated error:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const supabase = getSupabaseClient()

    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    console.log(`✅ Subscription marked canceled in DB: ${subscription.id}`)
  } catch (error) {
    console.error('❌ handleSubscriptionDeleted error:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const supabase = getSupabaseClient()

    // Mark the invoice as paid in the database
    await supabase.from('invoices').upsert({
      stripe_invoice_id: invoice.id,
      stripe_customer_id: invoice.customer as string,
      stripe_subscription_id: invoice.subscription as string | null,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      status: 'paid',
      paid_at: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
        : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_invoice_id' })

    // Send a receipt email via the dunning manager's email helper
    try {
      const customerEmail = typeof invoice.customer_email === 'string' ? invoice.customer_email : null
      const customerName = typeof invoice.customer_name === 'string' ? invoice.customer_name : 'Valued Customer'
      if (customerEmail) {
        const templateVars: Record<string, string> = {
          customerName,
          amount: `$${(invoice.amount_paid / 100).toFixed(2)}`,
          invoiceId: invoice.id,
        }
        if (invoice.hosted_invoice_url) {
          templateVars.invoiceUrl = invoice.hosted_invoice_url
        }
        await dunningManager.sendDunningEmail(
          customerEmail,
          'payment_succeeded_receipt',
          templateVars
        )
      }
    } catch (emailError) {
      console.error('❌ Receipt email failed (non-critical):', emailError)
    }

    console.log(`✅ Invoice payment succeeded: ${invoice.id}`)
  } catch (error) {
    console.error('❌ handleInvoicePaymentSucceeded error:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const supabase = getSupabaseClient()
    const customerId = invoice.customer as string
    const subscriptionId = invoice.subscription as string | null

    // Update invoice status in the database
    await supabase.from('invoices').upsert({
      stripe_invoice_id: invoice.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      status: 'payment_failed',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_invoice_id' })

    // Trigger the dunning flow
    if (subscriptionId) {
      const failureReason = invoice.last_finalization_error?.message
        || 'payment_failed'
      await dunningManager.processPaymentFailure(
        subscriptionId,
        customerId,
        invoice.amount_due,
        invoice.currency,
        failureReason,
        { invoiceId: invoice.id, stripeCustomerId: customerId }
      )
    }

    console.log(`✅ Invoice payment failed handled: ${invoice.id}`)
  } catch (error) {
    console.error('❌ handleInvoicePaymentFailed error:', error)
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    console.log(`🔔 Trial ending soon for subscription: ${subscription.id}`)
    // Notify the customer their trial is ending — best-effort only
    const supabase = getSupabaseClient()
    const customerId = subscription.customer as string

    const { data: customerRow } = await supabase
      .from('users')
      .select('email, name')
      .eq('stripe_customer_id', customerId)
      .single()

    if (customerRow?.email) {
      await dunningManager.sendDunningEmail(
        customerRow.email,
        'trial_ending_soon',
        {
          customerName: customerRow.name ?? 'Valued Customer',
          trialEndDate: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toLocaleDateString()
            : 'soon',
        }
      ).catch((e: unknown) => console.error('Trial-ending email failed (non-critical):', e))
    }
  } catch (error) {
    console.error('❌ handleTrialWillEnd error:', error)
  }
}
