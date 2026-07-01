import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const db = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function mapShippoStatus(s: string): string {
  const m: Record<string, string> = {
    UNKNOWN: 'sent', PRE_TRANSIT: 'sent',
    TRANSIT: 'in_transit', DELIVERED: 'delivered',
    RETURNED: 'returned', FAILURE: 'failed',
  }
  return m[s?.toUpperCase()] ?? 'in_transit'
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    // Verify signature (fail closed if secret is set)
    const secret = process.env.SHIPPO_WEBHOOK_SECRET
    if (secret) {
      const sig = request.headers.get('x-shippo-signature') ?? ''
      const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
      if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        console.error('Shippo webhook: signature mismatch')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(rawBody)
    if (!String(event.event ?? '').startsWith('track')) {
      return NextResponse.json({ received: true })
    }

    const d = event.data ?? {}
    const trackingNumber: string = d.tracking_number ?? ''
    const shippoStatus: string = d.tracking_status?.status ?? 'UNKNOWN'
    const statusDetails: string = d.tracking_status?.status_details ?? ''
    const location = d.tracking_status?.location ?? {}
    const eta: string | null = d.eta ?? null
    const internalStatus = mapShippoStatus(shippoStatus)
    const currentLocation = [location.city, location.state, location.country]
      .filter(Boolean).join(', ') || statusDetails || 'In Transit'

    // Find matching record
    const { data: record } = await db()
      .from('certified_mail_requests')
      .select('id, user_id')
      .eq('tracking_number', trackingNumber)
      .single()

    if (!record) {
      console.log('Shippo webhook: no record for tracking', trackingNumber)
      return NextResponse.json({ received: true })
    }

    // Update status
    const update: Record<string, any> = {
      status: internalStatus,
      updated_at: new Date().toISOString(),
    }
    if (internalStatus === 'delivered') update.delivered_at = new Date().toISOString()
    if (eta) update.estimated_delivery = new Date(eta).toLocaleDateString()

    await db().from('certified_mail_requests').update(update).eq('id', record.id)

    // Broadcast instant update to the user's channel
    await db().channel(`tracking:${record.user_id}`).send({
      type: 'broadcast',
      event: 'status_update',
      payload: {
        id: record.id,
        tracking_number: trackingNumber,
        status: internalStatus,
        current_location: currentLocation,
        status_details: statusDetails,
        estimated_delivery: eta ? new Date(eta).toLocaleDateString() : null,
        updated_at: new Date().toISOString(),
      },
    })

    console.log('Shippo webhook processed:', trackingNumber, '->', internalStatus)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Shippo webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
