import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { certifiedMailService } from '@/lib/certified-mail-service-shipengine'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { trackingId, paymentIntentId, paymentMethodId } = await request.json()
    if (!trackingId || !paymentIntentId) {
      return NextResponse.json({ success: false, error: 'Missing trackingId or paymentIntentId' }, { status: 400 })
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (pi.status !== 'succeeded') {
      if (!paymentMethodId) {
        return NextResponse.json({ success: false, error: 'Payment method required' }, { status: 400 })
      }
      const confirmed = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      })
      if (confirmed.status !== 'succeeded' && confirmed.status !== 'processing') {
        return NextResponse.json({ success: false, error: 'Payment failed: ' + confirmed.status }, { status: 402 })
      }
    }
    const result = await certifiedMailService.processPaymentAndSend(trackingId, paymentIntentId)
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
    return NextResponse.json({
      success: true, trackingId,
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
