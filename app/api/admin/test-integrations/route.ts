import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''

// ─── Individual test functions ────────────────────────────────────────────────

async function testShippoConfig() {
  const key = process.env.SHIPPO_API_KEY
  if (!key) return { pass: false, msg: 'SHIPPO_API_KEY not set in Vercel' }
  const isTest = key.startsWith('shippo_test_')
  try {
    const res = await fetch('https://api.goshippo.com/addresses/', {
      method: 'POST',
      headers: { 'Authorization': 'ShippoToken ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', street1: '215 Clayton St', city: 'San Francisco', state: 'CA', zip: '94117', country: 'US', validate: true }),
    })
    const data = await res.json()
    const valid = data.validation_results?.is_valid
    return { pass: res.ok, msg: (isTest ? '[TEST MODE] ' : '[LIVE] ') + 'Shippo API connected. Address valid: ' + valid, data: { mode: isTest ? 'test' : 'live', addressValid: valid } }
  } catch (e: any) {
    return { pass: false, msg: 'Shippo API error: ' + e.message }
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
      msg: `Found ${rates.length} rates (${uspsRates.length} USPS)`,
      data: { totalRates: rates.length, uspsRates: uspsRates.map((r: any) => ({ service: r.servicelevel?.name, price: r.amount + ' ' + r.currency, days: r.estimated_days })) }
    }
  } catch (e: any) {
    return { pass: false, msg: 'Shippo rates error: ' + e.message }
  }
}

async function testShippoLabel() {
  const key = process.env.SHIPPO_API_KEY
  if (!key) return { pass: false, msg: 'SHIPPO_API_KEY not set' }
  try {
    // Create a test shipment and purchase cheapest label
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
    if (!rate) return { pass: false, msg: 'No rates returned from Shippo' }

    // Purchase label (in test mode this is free)
    const txRes = await fetch('https://api.goshippo.com/transactions/', {
      method: 'POST',
      headers: { 'Authorization': 'ShippoToken ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ rate: rate.object_id, label_file_type: 'PDF', async: false }),
    })
    const tx = await txRes.json()
    const success = tx.status === 'SUCCESS'
    return {
      pass: success,
      msg: success ? 'Test label created! Tracking: ' + tx.tracking_number : 'Label failed: ' + (tx.messages?.[0]?.text || tx.status),
      data: success ? { trackingNumber: tx.tracking_number, trackingUrl: tx.tracking_url_provider, labelUrl: tx.label_url, carrier: rate.provider, service: rate.servicelevel?.name, amount: rate.amount + ' ' + rate.currency } : tx,
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
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(key)
    const account = await stripe.accounts.retrieve() as any
    return { 
      pass: true, 
      msg: (isTest ? '[TEST MODE] ' : '[LIVE] ') + 'Stripe connected. Account: ' + (account.email || account.id),
      data: { mode: isTest ? 'test' : 'live', accountId: account.id }
    }
  } catch (e: any) {
    return { pass: false, msg: 'Stripe error: ' + e.message }
  }
}

async function testStripePaymentIntent() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return { pass: false, msg: 'STRIPE_SECRET_KEY not set' }
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(key)
    const pi = await stripe.paymentIntents.create({
      amount: 799,   // $7.99 in cents
      currency: 'usd',
      description: 'Test - Certified Mail',
      metadata: { test: 'true', service: 'certified_mail', tier: 'certified' },
      automatic_payment_methods: { enabled: true },
    })
    return { 
      pass: true, 
      msg: 'Payment intent created: ' + pi.id + ' ($' + (pi.amount/100).toFixed(2) + ')',
      data: { id: pi.id, amount: pi.amount, currency: pi.currency, status: pi.status, clientSecret: pi.client_secret?.substring(0,20) + '...' }
    }
  } catch (e: any) {
    return { pass: false, msg: 'Stripe payment intent error: ' + e.message }
  }
}

async function testStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  return {
    pass: !!secret,
    msg: secret ? 'Webhook secret configured (' + secret.substring(0,8) + '...)' : 'STRIPE_WEBHOOK_SECRET not set — webhooks will fail',
    data: { configured: !!secret }
  }
}

async function testLetterGeneration(userId: string) {
  try {
    const res = await fetch(APP_URL + '/api/disputes/generate-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': '' },
      body: JSON.stringify({
        personalInfo: { firstName: 'John', lastName: 'Smith', address: '215 Clayton St', city: 'San Francisco', state: 'CA', zip: '94117', email: 'test@example.com', phone: '555-1234' },
        disputeItems: [{ id: 'test1', creditorName: 'Capital One', accountNumber: '****1234', disputeReason: 'Late payment reported incorrectly' }],
        letterType: 'dispute',
        letterTier: 'standard',
        creditBureau: 'experian',
        additionalContext: {
          disputeDetails: 'This late payment was reported in error. I made this payment on time and have bank records to prove it.',
          desiredOutcome: 'Remove late payment notation',
          bureauName: 'Experian',
          bureauAddress: '475 Anton Blvd, Costa Mesa, CA 92626',
        },
      }),
    })
    const data = await res.json()
    const hasContent = !!(data.data?.letter?.content)
    const isAI = hasContent && data.data.letter.content.length > 200
    return { 
      pass: hasContent, 
      msg: hasContent ? 'Letter generated (' + data.data.letter.content.length + ' chars, AI: ' + isAI + ')' : 'Letter generation failed: ' + data.error,
      data: hasContent ? { length: data.data.letter.content.length, preview: data.data.letter.content.substring(0, 200) + '...', tier: data.data.letter.metadata?.letterTier } : data
    }
  } catch (e: any) {
    return { pass: false, msg: 'Letter generation error: ' + e.message }
  }
}

async function testEnhanceExplanation() {
  try {
    const res = await fetch(APP_URL + '/api/ai/enhance-explanation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalExplanation: 'The late payment is wrong. I paid on time.',
        disputeReason: 'Late Payment',
        creditorName: 'Capital One',
        accountNumber: '****1234',
        desiredOutcome: 'Remove late payment',
      }),
    })
    const data = await res.json()
    const hasEnhanced = !!(data.data?.enhancedExplanation)
    return { 
      pass: hasEnhanced,
      msg: hasEnhanced ? 'Enhancement worked (' + data.data.enhancedExplanation.length + ' chars)' : 'Enhancement failed: ' + data.error,
      data: hasEnhanced ? { length: data.data.enhancedExplanation.length, preview: data.data.enhancedExplanation.substring(0, 150) + '...' } : data
    }
  } catch (e: any) {
    return { pass: false, msg: 'Enhance error: ' + e.message }
  }
}

async function testAnthropicConfig() {
  const key = process.env.ANTHROPIC_API_KEY
  return {
    pass: !!key,
    msg: key ? 'ANTHROPIC_API_KEY set (' + key.substring(0, 12) + '...)' : 'ANTHROPIC_API_KEY not set — letter AI generation will fail',
    data: { configured: !!key, prefix: key?.substring(0, 12) }
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(request)
  if (!isAuthenticated || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const suite = searchParams.get('suite') || 'all'

  const results: Record<string, any> = {}

  if (suite === 'all' || suite === 'config') {
    results.shippo_config = await testShippoConfig()
    results.stripe_config = await testStripeConfig()
    results.stripe_webhook = await testStripeWebhookSecret()
    results.anthropic_config = await testAnthropicConfig()
  }

  if (suite === 'all' || suite === 'shippo') {
    results.shippo_rates = await testShippoRates()
    results.shippo_label = await testShippoLabel()
  }

  if (suite === 'all' || suite === 'stripe') {
    results.stripe_payment_intent = await testStripePaymentIntent()
  }

  if (suite === 'all' || suite === 'letters') {
    results.enhance_explanation = await testEnhanceExplanation()
    results.letter_generation = await testLetterGeneration(user.id)
  }

  const passed = Object.values(results).filter((r: any) => r.pass).length
  const failed = Object.values(results).filter((r: any) => !r.pass).length

  return NextResponse.json({
    summary: { total: Object.keys(results).length, passed, failed, allPass: failed === 0 },
    results,
    suites: 'all | config | shippo | stripe | letters',
    usage: '?suite=all (default) | ?suite=config | ?suite=shippo | ?suite=stripe | ?suite=letters',
  })
}
