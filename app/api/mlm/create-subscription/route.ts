import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const MLM_PLANS: Record<string, { priceId: string; name: string; commissionRate: number }> = {
  mlm_starter: { priceId: process.env.STRIPE_MLM_STARTER_PRICE_ID!, name: 'MLM Starter', commissionRate: 0.30 },
  mlm_professional: { priceId: process.env.STRIPE_MLM_PROFESSIONAL_PRICE_ID!, name: 'MLM Professional', commissionRate: 0.35 },
  mlm_enterprise: { priceId: process.env.STRIPE_MLM_ENTERPRISE_PRICE_ID!, name: 'MLM Enterprise', commissionRate: 0.40 },
}

const SubscriptionSchema = z.object({
  planType: z.enum(['mlm_starter', 'mlm_professional', 'mlm_enterprise']),
  paymentMethodId: z.string().startsWith('pm_'),
  mlmCode: z.string().min(6).max(20).optional(),
  sponsorId: z.string().uuid().optional(),
})

async function validateSponsor(sponsorId: string | undefined, mlmCode: string | undefined, requestingUserId: string) {
  if (!sponsorId && !mlmCode) return { valid: true, sponsorMlmId: null }

  let query = getSupabase().from('mlm_users').select('id, user_id, subscription_status, mlm_code')
  if (sponsorId && mlmCode) query = query.eq('user_id', sponsorId).eq('mlm_code', mlmCode)
  else if (sponsorId) query = query.eq('user_id', sponsorId)
  else query = query.eq('mlm_code', mlmCode)

  const { data: sponsor } = await query.maybeSingle()
  if (!sponsor) return { valid: false, sponsorMlmId: null, error: 'Sponsor not found' }
  if (sponsor.user_id === requestingUserId) return { valid: false, sponsorMlmId: null, error: 'You cannot refer yourself' }
  if (sponsor.subscription_status !== 'active') return { valid: false, sponsorMlmId: null, error: 'Sponsor does not have an active subscription' }
  if (sponsorId && mlmCode && sponsor.mlm_code !== mlmCode) return { valid: false, sponsorMlmId: null, error: 'MLM code does not match sponsor' }

  return { valid: true, sponsorMlmId: sponsor.id }
}

async function wouldCreateCycle(newUserId: string, sponsorMlmId: string | null): Promise<boolean> {
  if (!sponsorMlmId) return false
  const visited = new Set<string>()
  let currentId: string | null = sponsorMlmId
  while (currentId) {
    if (visited.has(currentId) || currentId === newUserId) return true
    visited.add(currentId)
    const { data } = await getSupabase().from('mlm_users').select('sponsor_id').eq('id', currentId).maybeSingle()
    currentId = data?.sponsor_id ?? null
  }
  return false
}

async function generateUniqueMlmCode(): Promise<string> {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  for (let i = 0; i < 10; i++) {
    let code = 'CR'
    for (let j = 0; j < 6; j++) code += chars[Math.floor(Math.random() * chars.length)]
    const { data } = await getSupabase().from('mlm_users').select('id').eq('mlm_code', code).maybeSingle()
    if (!data) return code
  }
  throw new Error('Could not generate unique MLM code')
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user }, error: authError } = await getSupabase().auth.getUser(authHeader.slice(7))
  if (authError || !user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

  const parsed = SubscriptionSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })

  const { planType, paymentMethodId, mlmCode, sponsorId } = parsed.data
  const plan = MLM_PLANS[planType]

  const { data: existing } = await getSupabase().from('mlm_users').select('subscription_status').eq('user_id', user.id).maybeSingle()
  if (existing?.subscription_status === 'active') return NextResponse.json({ error: 'Already have an active MLM subscription' }, { status: 409 })

  // SERVER-SIDE SPONSOR VALIDATION — never trust client-supplied IDs
  const sponsorResult = await validateSponsor(sponsorId, mlmCode, user.id)
  if (!sponsorResult.valid) return NextResponse.json({ error: sponsorResult.error }, { status: 400 })

  if (await wouldCreateCycle(user.id, sponsorResult.sponsorMlmId)) {
    console.error(`[MLM] Cycle guard triggered for ${user.id}`)
    return NextResponse.json({ error: 'Invalid sponsor relationship' }, { status: 400 })
  }

  try {
    let stripeCustomerId: string
    const { data: profile } = await getSupabase().from('mlm_users').select('stripe_customer_id').eq('user_id', user.id).maybeSingle()
    if (profile?.stripe_customer_id) {
      stripeCustomerId = profile.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({ email: user.email, metadata: { supabase_user_id: user.id } })
      stripeCustomerId = customer.id
    }

    await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId })
    await stripe.customers.update(stripeCustomerId, { invoice_settings: { default_payment_method: paymentMethodId } })

    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: plan.priceId }],
      payment_settings: { payment_method_types: ['card'], save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })

    const newMlmCode = await generateUniqueMlmCode()

    await getSupabase().from('mlm_users').upsert({
      user_id: user.id, stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: subscription.id,
      sponsor_id: sponsorResult.sponsorMlmId,
      mlm_code: newMlmCode, plan_type: planType, rank: 'associate',
      subscription_status: subscription.status,
      commission_rate: plan.commissionRate,
      pending_earnings: 0, total_earnings: 0,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (sponsorResult.sponsorMlmId) {
      await getSupabase().from('mlm_genealogy').insert({ user_id: user.id, sponsor_mlm_id: sponsorResult.sponsorMlmId, joined_at: new Date().toISOString() })
    }

    const invoice = subscription.latest_invoice as Stripe.Invoice
    const pi = invoice?.payment_intent as Stripe.PaymentIntent

    return NextResponse.json({ success: true, subscriptionId: subscription.id, status: subscription.status, mlmCode: newMlmCode, clientSecret: pi?.client_secret ?? null })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Subscription creation failed' }, { status: 500 })
  }
}