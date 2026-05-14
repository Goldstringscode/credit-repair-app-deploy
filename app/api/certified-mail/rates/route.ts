import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHIPPO_BASE = 'https://api.goshippo.com'

export async function POST(request: NextRequest) {
  try {
    const { fromAddress, toAddress, bureauCount = 1 } = await request.json()
    const key = process.env.SHIPPO_API_KEY

    // Return hardcoded rates if no key (test/preview mode)
    if (!key) {
      return NextResponse.json({
        success: true,
        simulated: true,
        rates: [
          { carrier: 'USPS', service: 'First-Class Mail', serviceCode: 'usps_first', days: '3-5', cents: 68, dollars: '$0.68', objectId: 'sim_first_class' },
          { carrier: 'USPS', service: 'Certified Mail', serviceCode: 'usps_certified', days: '3-5', cents: 435, dollars: '$4.35', objectId: 'sim_certified', recommended: true },
          { carrier: 'USPS', service: 'Priority Mail', serviceCode: 'usps_priority', days: '1-3', cents: 799, dollars: '$7.99', objectId: 'sim_priority' },
        ],
      })
    }

    // Build addresses — use sender defaults if not provided
    const from = fromAddress || {
      name: 'Credit Repair AI',
      street1: '215 Clayton St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94117',
      country: 'US',
    }

    // Default to Experian if no bureau specified
    const to = toAddress || {
      name: 'Experian',
      company: 'Experian Information Solutions',
      street1: '475 Anton Blvd',
      city: 'Costa Mesa',
      state: 'CA',
      zip: '92626',
      country: 'US',
    }

    const res = await fetch(SHIPPO_BASE + '/shipments/', {
      method: 'POST',
      headers: { 'Authorization': 'ShippoToken ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address_from: from,
        address_to: to,
        parcels: [{ length: '9', width: '6', height: '0.25', distance_unit: 'in', weight: '1', mass_unit: 'oz' }],
        async: false,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ success: false, error: data.detail || 'Shippo API error' }, { status: 500 })
    }

    const rates = (data.rates || []).map((r: any) => ({
      carrier: r.provider,
      service: r.servicelevel?.name,
      serviceCode: r.provider?.toLowerCase() + '_' + (r.servicelevel?.token || r.servicelevel?.name?.toLowerCase().replace(/\s+/g, '_')),
      days: r.estimated_days ? r.estimated_days + (r.estimated_days === 1 ? ' day' : ' days') : 'Varies',
      cents: Math.round(parseFloat(r.amount) * 100),
      dollars: '$' + parseFloat(r.amount).toFixed(2),
      objectId: r.object_id,
      recommended: r.provider === 'USPS' && r.servicelevel?.name?.toLowerCase().includes('certified'),
    }))

    // Sort: certified first, then by price
    rates.sort((a: any, b: any) => b.recommended - a.recommended || a.cents - b.cents)

    return NextResponse.json({ success: true, rates, bureauCount })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
