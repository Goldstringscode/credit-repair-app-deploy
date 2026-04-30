import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const RANK_COMMISSION_RATES: Record<string, number> = {
  associate: 0.30, consultant: 0.35, manager: 0.40,
  director: 0.45, executive: 0.50, presidential: 0.55,
}
const UNILEVEL_LEVEL_RATES = [0.10, 0.08, 0.06, 0.05, 0.04, 0.03, 0.02]
const MAX_UNILEVEL_DEPTH = UNILEVEL_LEVEL_RATES.length

async function isEventAlreadyProcessed(stripeEventId: string): Promise<boolean> {
  const { data } = await supabase
    .from('mlm_processed_webhook_events')
    .select('id').eq('stripe_event_id', stripeEventId).maybeSingle()
  return data !== null
}

async function markEventProcessed(stripeEventId: string, eventType: string, meta: object) {
  await getSupabase().from('mlm_processed_webhook_events').insert({
    stripe_event_id: stripeEventId, event_type: eventType,
    processed_at: new Date().toISOString(), meta,
  })
}

async function processCommissions(stripeEventId: string, userId: string, amountCents: number, commissionType: string) {
  const amountDollars = amountCents / 100
  const { data: mlmUser } = await supabase
    .from('mlm_users').select('id, sponsor_id, rank, subscription_status, created_at')
    .eq('user_id', userId).maybeSingle()
  if (!mlmUser) return

  const visited = new Set<string>()
  let currentSponsorId: string | null = mlmUser.sponsor_id
  let depth = 0

  while (currentSponsorId && depth < MAX_UNILEVEL_DEPTH) {
    if (visited.has(currentSponsorId)) {
      console.error(`[MLM] Cycle detected at sponsor ${currentSponsorId}`)
      await getSupabase().from('mlm_audit_log').insert({
        event_type: 'cycle_detected', user_id: userId,
        sponsor_id: currentSponsorId, stripe_event_id: stripeEventId,
        detected_at: new Date().toISOString(),
      })
      break
    }
    visited.add(currentSponsorId)

    const { data: sponsor } = await supabase
      .from('mlm_users').select('id, user_id, rank, subscription_status, sponsor_id')
      .eq('id', currentSponsorId).maybeSingle()

    if (!sponsor || sponsor.subscription_status !== 'active') {
      currentSponsorId = sponsor?.sponsor_id ?? null
      depth++
      continue
    }

    const rankRate = RANK_COMMISSION_RATES[sponsor.rank] ?? 0.30
    const levelRate = depth === 0 ? 1.0 : UNILEVEL_LEVEL_RATES[depth] ?? 0
    const baseRate = depth === 0 ? rankRate : rankRate * levelRate
    let bonusRate = 0
    if (commissionType === 'fast_start' && depth === 0) {
      const { data: jr } = await getSupabase().from('mlm_users').select('created_at').eq('id', mlmUser.id).maybeSingle()
      if (jr && (Date.now() - new Date(jr.created_at).getTime()) / 86400000 <= 30) bonusRate = 0.10
    }

    const commissionAmount = parseFloat((amountDollars * (baseRate + bonusRate)).toFixed(2))

    await getSupabase().from('mlm_commissions').insert({
      recipient_user_id: sponsor.user_id, recipient_mlm_id: sponsor.id,
      source_user_id: userId, stripe_event_id: stripeEventId,
      commission_type: depth === 0 ? commissionType : 'unilevel',
      level_depth: depth, sale_amount: amountDollars,
      rank_rate: rankRate, level_rate: levelRate, bonus_rate: bonusRate,
      commission_amount: commissionAmount, status: 'pending',
      payable_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    })

    await getSupabase().rpc('increment_mlm_pending_earnings', { p_mlm_user_id: sponsor.id, p_amount: commissionAmount })
    currentSponsorId = sponsor.sponsor_id
    depth++
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // IDEMPOTENCY GATE — skip duplicate events
  if (await isEventAlreadyProcessed(event.id)) {
    return NextResponse.json({ received: true, skipped: true })
  }

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const { data: mlmUser } = await getSupabase().from('mlm_users')
          .select('user_id, created_at').eq('stripe_customer_id', invoice.customer as string).maybeSingle()
        if (mlmUser) {
          const days = (Date.now() - new Date(mlmUser.created_at).getTime()) / 86400000
          await processCommissions(event.id, mlmUser.user_id, invoice.amount_paid, days <= 30 ? 'fast_start' : 'direct_referral')
        }
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const { data: mlmUser } = await getSupabase().from('mlm_users')
          .select('user_id').eq('stripe_customer_id', invoice.customer as string).maybeSingle()
        if (mlmUser) {
          await getSupabase().from('mlm_commissions')
            .update({ status: 'voided', voided_at: new Date().toISOString() })
            .eq('source_user_id', mlmUser.user_id).eq('status', 'pending')
            .gte('created_at', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())
        }
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await getSupabase().from('mlm_users').update({ subscription_status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', sub.customer as string)
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await getSupabase().from('mlm_users').update({ subscription_status: sub.status, stripe_subscription_id: sub.id, updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', sub.customer as string)
        break
      }
    }

    await markEventProcessed(event.id, event.type, { customer: (event.data.object as any).customer ?? null })
    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('[MLM Webhook] Error:', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}