import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SIMULATED_RATES = [
  { carrier: 'USPS', service: 'First-Class Mail', serviceCode: 'usps_first', days: '3-5 days', cents: 68, dollars: '$0.68', objectId: 'sim_first_class', recommended: false, simulated: true },
  { carrier: 'USPS', service: 'Certified Mail', serviceCode: 'usps_certified', days: '3-5 days', cents: 435, dollars: '$4.35', objectId: 'sim_certified', recommended: true, simulated: true },
  { carrier: 'USPS', service: 'Priority Mail', serviceCode: 'usps_priority', days: '1-3 days', cents: 799, dollars: '$7.99', objectId: 'sim_priority', recommended: false, simulated: true },
]

export async function GET() {
  return NextResponse.json({ success: true, rates: SIMULATED_RATES, simulated: true })
}

export async function POST(request: NextRequest) {
  const key = process.env.SHIPPO_API_KEY

  // No key — return simulated rates immediately (test/preview mode)
  if (!key) {
    console.log('📮 Shippo: no key — returning simulated rates')
    return NextResponse.json({ success: true, simulated: true, rates: SIMULATED_RATES })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { toAddress } = body

    const addressTo = toAddress || {
      name: 'Experian',
      company: 'Experian Information Solutions',
      street1: '475 Anton Blvd',
      city: 'Costa Mesa',
      state: 'CA',
      zip: '92626',
      country: 'US',
    }

    const addressFrom = {
      name: 'Credit Repair AI',
      street1: '215 Clayton St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94117',
      country: 'US',
    }

    const res = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        'Authorization': 'ShippoToken ' + key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address_from: addressFrom,
        address_to: addressTo,
        parcels: [{ length: '9', width: '6', height: '0.25', distance_unit: 'in', weight: '1', mass_unit: 'oz' }],
        async: false,
      }),
    })

    if (!res.ok) {
      console.error('Shippo API error:', res.status)
      return NextResponse.json({ success: true, simulated: true, rates: SIMULATED_RATES, error: 'Shippo API returned ' + res.status })
    }

    const data = await res.json()
    const rawRates: any[] = data.rates || []

    if (rawRates.length === 0) {
      console.warn('Shippo returned no rates — using simulated')
      return NextResponse.json({ success: true, simulated: true, rates: SIMULATED_RATES })
    }

    const rates = rawRates.map((r: any) => ({
      carrier: r.provider,
      service: r.servicelevel?.name || r.service_level_name || 'Standard',
      serviceCode: (r.provider || '').toLowerCase() + '_' + (r.servicelevel?.token || 'standard'),
      days: r.estimated_days ? r.estimated_days + (r.estimated_days === 1 ? ' day' : ' days') : 'Varies',
      cents: Math.round(parseFloat(r.amount || '0') * 100),
      dollars: '$' + parseFloat(r.amount || '0').toFixed(2),
      objectId: r.object_id,
      recommended: r.provider === 'USPS' && (r.servicelevel?.name || '').toLowerCase().includes('certified'),
      simulated: false,
    }))

    // Sort: recommended first, then by price
    rates.sort((a: any, b: any) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0) || a.cents - b.cents)

    console.log('📮 Shippo rates returned:', rates.length, 'rates')
    return NextResponse.json({ success: true, simulated: false, rates, mode: key.startsWith('shippo_test_') ? 'test' : 'live' })
  } catch (err: any) {
    console.error('Rates route error:', err.message)
    // Always fall back to simulated rates on any error — never block the UI
    return NextResponse.json({ success: true, simulated: true, rates: SIMULATED_RATES, error: err.message })
  }
}
