import { NextRequest, NextResponse } from 'next/server'
import { certifiedMailService } from '@/lib/certified-mail-service-shipengine'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { trackingId, paymentIntentId } = await request.json()

    if (!trackingId || !paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: trackingId, paymentIntentId' },
        { status: 400 }
      )
    }

    console.log('Processing payment for trackingId:', trackingId)
    const result = await certifiedMailService.processPaymentAndSend(trackingId, paymentIntentId)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      trackingId,
      trackingNumber: result.trackingNumber,
      trackingUrl: result.trackingUrl,
      labelUrl: result.labelUrl,
      estimatedDelivery: result.estimatedDelivery,
      cost: result.cost,
    })
  } catch (err: any) {
    console.error('process-payment error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
