import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { certifiedMailService } from '@/lib/certified-mail-service-shipengine'
import { sanitizeError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { trackingId, paymentIntentId } = await request.json()
    if (!trackingId || !paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Missing trackingId or paymentIntentId' },
        { status: 400 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    // Verify payment was confirmed client-side (confirmCardPayment handles 3DS/SCA)
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (pi.status !== 'succeeded' && pi.status !== 'processing') {
      return NextResponse.json(
        { success: false, error: 'Payment not completed. Status: ' + pi.status },
        { status: 402 }
      )
    }

    // Payment verified — purchase shipping label and finalize
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
    console.error('[process-payment] Error:', err.message)
    return NextResponse.json(
      { success: false, error: sanitizeError(err, 'process-payment') },
      { status: 500 }
    )
  }
}
