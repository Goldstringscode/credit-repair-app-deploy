import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { withRateLimit } from '@/lib/rate-limiter'

// Read-only endpoint used by the checkout success page to verify, server-side,
// that a PaymentIntent actually succeeded before showing any "payment
// successful" UI or firing notifications. The client must never be trusted
// to self-report a successful payment.
export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const paymentIntentId = request.nextUrl.searchParams.get('paymentIntentId')

      if (!paymentIntentId) {
        return NextResponse.json(
          { success: false, error: 'paymentIntentId is required' },
          { status: 400 }
        )
      }

      if (!stripe) {
        return NextResponse.json(
          { success: false, error: 'Stripe is not configured' },
          { status: 500 }
        )
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

      return NextResponse.json({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      })
    } catch (error: any) {
      console.error('❌ Payment verification failed:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to verify payment', message: error.message },
        { status: 500 }
      )
    }
  }
)
