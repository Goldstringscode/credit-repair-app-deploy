import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyAdminRequest } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// ─── Test functions (call services directly, no HTTP fetch) ───────────────────

async function testShippoConfig() {
  const key = process.env.SHIPPO_API_KEY
  if (!key) return { pass: false, msg: 'SHIPPO_API_KEY not set in Vercel env vars' }
  const isTest = key.startsWith('shippo_test_')
  try {
    const res = await fetch('https://api.goshippo.com/addresses/', {
      method: 'POST',
      headers: { 'Authorization': 'ShippoToken ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', street1: '215 Clayton St', city: 'San Francisco', state: 'CA', zip: '94117', country: 'US', validate: true }),
    })
    const data = await res.json()
    const valid = data.validation_results?.is_valid
    return { pass: res.ok, msg: (isTest ? '[TEST] ' : '[LIVE] ') + 'Shippo connected. Address valid: ' + valid, data: { mode: isTest ? 'test' : 'live', keyPrefix: key.substring(0,16)+'...' } }
  } catch (e: any) {
    return { pass: false, msg: 'Shippo connection error: ' + e.message }
  }
}

async function testShippoRates() {
  const key = process.env.SHIPPO_API_KEY
  if (!key) return { pass: false, msg: 'SHIPPO_API_KEY not set' }
  try {
    const res = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: { 'Authorization': 'ShippoToken ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address_from: { name: 'John Smith', street1: '215 Clayton St', city: 'San Francisco', state: 'CA', zip: '94117', country: 'US' },
        address_to: { name: 'Experian', company: 'Experian Information Solutions', street1: '475 Anton Blvd', city: 'Costa Mesa', state: 'CA', zip: '92626', country: 'US' },
        parcels: [{ length: '9', width: '6', height: '0.25', distance_unit: 'in', weight: '1', mass_unit: 'oz' }],
        async: false,
      }),
    })
    const data = await res.json()
    const rates = data.rates || []
    const uspsRates = rates.filter((r: any) => r.provider === 'USPS')
    return {
      pass: rates.length > 0,
      msg: `${rates.length} rates found (${uspsRates.length} USPS)`,
      data: { totalRates: rates.length, uspsRates: uspsRates.slice(0,4).map((r: any) => ({ service: r.servicelevel?.name, price: '$' + r.amount + ' ' + r.currency, days: r.estimated_days + ' days' })) },
    }
  } catch (e: any) {
    return { pass: false, msg: 'Shippo rates error: ' + e.message }
  }
}

async function testShippoLabel() {
  const key = process.env.SHIPPO_API_KEY
  if (!key) return { pass: false, msg: 'SHIPPO_API_KEY not set' }
  try {
    const shipRes = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: { 'Authorization': 'ShippoToken ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address_from: { name: 'John Smith', street1: '215 Clayton St', city: 'San Francisco', state: 'CA', zip: '94117', country: 'US' },
        address_to: { name: 'Experian', street1: '475 Anton Blvd', city: 'Costa Mesa', state: 'CA', zip: '92626', country: 'US' },
        parcels: [{ length: '9', width: '6', height: '0.25', distance_unit: 'in', weight: '1', mass_unit: 'oz' }],
        async: false,
      }),
    })
    const ship = await shipRes.json()
    const rate = ship.rates?.[0]
    if (!rate) return { pass: false, msg: 'No rates returned — check Shippo key and addresses' }
    const txRes = await fetch('https://api.goshippo.com/transactions/', {
      method: 'POST',
      headers: { 'Authorization': 'ShippoToken ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ rate: rate.object_id, label_file_type: 'PDF', async: false }),
    })
    const tx = await txRes.json()
    const success = tx.status === 'SUCCESS'
    return {
      pass: success,
      msg: success ? '✅ Test label created! Tracking: ' + tx.tracking_number : 'Label failed: ' + (tx.messages?.[0]?.text || tx.status),
      data: success ? { trackingNumber: tx.tracking_number, trackingUrl: tx.tracking_url_provider, labelUrl: tx.label_url, carrier: rate.provider, service: rate.servicelevel?.name, cost: '$' + rate.amount } : { status: tx.status, messages: tx.messages },
    }
  } catch (e: any) {
    return { pass: false, msg: 'Shippo label error: ' + e.message }
  }
}

async function testStripeConfig() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return { pass: false, msg: 'STRIPE_SECRET_KEY not set' }
  const isTest = key.startsWith('sk_test_')
  try {
    const stripe = new Stripe(key)
    // List payment intents as a lightweight connectivity test
    const pis = await stripe.paymentIntents.list({ limit: 1 })
    return {
      pass: true,
      msg: (isTest ? '[TEST MODE] ' : '[LIVE] ') + 'Stripe connected. Found ' + pis.data.length + ' recent payment intent(s)',
      data: { mode: isTest ? 'test' : 'live', keyPrefix: key.substring(0,12) + '...' },
    }
  } catch (e: any) {
    return { pass: false, msg: 'Stripe connection error: ' + e.message }
  }
}

async function testStripePaymentIntent() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return { pass: false, msg: 'STRIPE_SECRET_KEY not set' }
  try {
    const stripe = new Stripe(key)
    const pi = await stripe.paymentIntents.create({
      amount: 799,
      currency: 'usd',
      description: '[TEST] Certified Mail - Experian (certified tier)',
      metadata: { test: 'true', service: 'certified_mail', tier: 'certified', bureauCount: '1' },
      automatic_payment_methods: { enabled: true },
    })
    return {
      pass: true,
      msg: 'Payment intent created: ' + pi.id + ' ($' + (pi.amount/100).toFixed(2) + ' ' + pi.currency.toUpperCase() + ')',
      data: { id: pi.id, amount: '$' + (pi.amount/100).toFixed(2), currency: pi.currency, status: pi.status, clientSecret: pi.client_secret?.substring(0, 20) + '...' },
    }
  } catch (e: any) {
    return { pass: false, msg: 'Stripe payment intent error: ' + e.message }
  }
}

async function testStripeWebhook() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  return {
    pass: !!secret,
    msg: secret ? 'Webhook secret set (' + secret.substring(0,8) + '...)' : 'STRIPE_WEBHOOK_SECRET not set — payment confirmations will fail',
    data: { configured: !!secret },
  }
}

async function testAnthropicConfig() {
  const key = process.env.ANTHROPIC_API_KEY
  return {
    pass: !!key,
    msg: key ? 'ANTHROPIC_API_KEY set (' + key.substring(0, 12) + '...)' : 'ANTHROPIC_API_KEY not set — AI letter generation will use template fallback',
    data: { configured: !!key },
  }
}

async function testEnhanceExplanation() {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) return { pass: false, msg: 'ANTHROPIC_API_KEY not set' }
    const anthropic = new Anthropic({ apiKey: key })
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: 'You are a credit repair specialist. Enhance dispute explanations professionally.',
      messages: [{ role: 'user', content: 'Enhance this: "The late payment is wrong. I paid on time for Capital One account ****1234."' }],
    })
    const text = message.content[0]?.type === 'text' ? message.content[0].text : null
    return {
      pass: !!text,
      msg: text ? 'AI enhancement working (' + text.length + ' chars returned)' : 'No content returned',
      data: text ? { preview: text.substring(0, 150) + '...' } : null,
    }
  } catch (e: any) {
    return { pass: false, msg: 'Anthropic error: ' + e.message }
  }
}

async function testLetterGeneration() {
  try {
    const { aiDisputeLetterGenerator } = await import('@/lib/ai-dispute-letter-generator')
    const letter = await aiDisputeLetterGenerator.generateDisputeLetter(
      { firstName: 'John', lastName: 'Smith', address: '215 Clayton St', city: 'San Francisco', state: 'CA', zip: '94117', email: 'test@example.com', phone: '555-1234' },
      [{ id: 'test1', creditorName: 'Capital One', accountNumber: '****1234', disputeReason: 'Late payment reported incorrectly', amount: '0', status: 'dispute' }],
      'standard',
      'experian',
      { disputeDetails: 'I paid this on time. Bank records confirm payment was made on the due date.', bureauName: 'Experian', bureauAddress: '475 Anton Blvd, Costa Mesa, CA 92626', desiredOutcome: 'Remove late payment' }
    )
    const hasContent = !!(letter?.content)
    const charCount = letter?.content?.length || 0
    const hasFirstPerson = letter?.content?.includes(' I ') || letter?.content?.includes("I've") || false
    return {
      pass: hasContent,
      msg: hasContent ? 'Letter generated: ' + charCount + ' chars. First person: ' + hasFirstPerson : 'Letter generation failed — no content returned',
      data: hasContent ? { chars: charCount, firstPerson: hasFirstPerson, tier: letter?.metadata?.letterTier, preview: letter?.content?.substring(0, 200) + '...' } : null,
    }
  } catch (e: any) {
    return { pass: false, msg: 'Letter generation error: ' + e.message }
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const _auth = await verifyAdminRequest(request)
  if ('error' in _auth) return _auth.error

  const { searchParams } = new URL(request.url)
  const suite = searchParams.get('suite') || 'all'

  const run = async (name: string, fn: () => Promise<any>) => {
    try { return await fn() } catch (e: any) { return { pass: false, msg: name + ' threw: ' + e.message } }
  }

  const results: Record<string, any> = {}

  if (['all','config'].includes(suite)) {
    results.shippo_config    = await run('shippo_config', testShippoConfig)
    results.stripe_config    = await run('stripe_config', testStripeConfig)
    results.stripe_webhook   = await run('stripe_webhook', testStripeWebhook)
    results.anthropic_config = await run('anthropic_config', testAnthropicConfig)
  }
  if (['all','shippo'].includes(suite)) {
    results.shippo_rates = await run('shippo_rates', testShippoRates)
    results.shippo_label = await run('shippo_label', testShippoLabel)
  }
  if (['all','stripe'].includes(suite)) {
    results.stripe_payment_intent = await run('stripe_payment_intent', testStripePaymentIntent)
  }
  if (['all','letters'].includes(suite)) {
    results.enhance_explanation = await run('enhance_explanation', testEnhanceExplanation)
    results.letter_generation   = await run('letter_generation', testLetterGeneration)
  }

  const passed = Object.values(results).filter((r: any) => r.pass).length
  const failed  = Object.values(results).filter((r: any) => !r.pass).length

  return NextResponse.json({
    summary: { total: Object.keys(results).length, passed, failed, allPass: failed === 0 },
    results,
  })
}
