import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { certifiedMailService } from '@/lib/certified-mail-service-shipengine'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackingId, paymentIntentId, card } = body

    if (!trackingId || !paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: trackingId, paymentIntentId' },
        { status: 400 }
      )
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json({ success: false, error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(stripeKey)

    // Step 1: Check current payment intent status
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
    console.log('PaymentIntent status:', pi.status)

    if (pi.status !== 'succeeded') {
      // Need to confirm with card details
      if (!card || !card.number || !card.expMonth || !card.expYear || !card.cvc) {
        return NextResponse.json(
          { success: false, error: 'Card details required to confirm payment' },
          { status: 400 }
        )
      }

      try {
        // Step 2: Create a PaymentMethod from raw card details
        const paymentMethod = await stripe.paymentMethods.create({
          type: 'card',
          card: {
            number: String(card.number).replace(/\s/g, ''),
            exp_month: parseInt(String(card.expMonth)),
            exp_year: parseInt(String(card.expYear)) < 100
              ? 2000 + parseInt(String(card.expYear))
              : parseInt(String(card.expYear)),
            cvc: String(card.cvc),
          },
        })

        // Step 3: Confirm the PaymentIntent with the PaymentMethod
        const confirmed = await stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method: paymentMethod.id,
          return_url: process.env.NEXT_PUBLIC_APP_URL || 'https://example.com',
        })

        console.log('Payment confirmed. Status:', confirmed.status)

        if (confirmed.status !== 'succeeded' && confirmed.status !== 'processing') {
          return NextResponse.json(
            { success: false, error: 'Payment failed: ' + confirmed.status },
            { status: 402 }
          )
        }
      } catch (stripeErr: any) {
        console.error('Stripe confirmation error:', stripeErr.message)
        return NextResponse.json(
          { success: false, error: 'Card declined: ' + (stripeErr.raw?.message || stripeErr.message) },
          { status: 402 }
        )
      }
    }

    // Step 4: Payment confirmed — process and send the letter via Shippo
    console.log('Processing certified mail for trackingId:', trackingId)
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
  } catch (error: any) {
    console.error('process-payment error:', error.message)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
