import { NextRequest, NextResponse } from 'next/server'
import { stripeWebhookService } from '@/lib/stripe/webhooks'
import { stripeConfig } from '@/lib/stripe/config'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('❌ Missing Stripe signature')
      return NextResponse.json({
        error: 'Missing Stripe signature'
      }, { status: 400 })
    }

    if (!stripeConfig.webhookSecret) {
      console.error('❌ Missing webhook secret')
      return NextResponse.json({
        error: 'Webhook secret not configured'
      }, { status: 500 })
    }

    // Verify webhook signature
    const event = stripeWebhookService.verifyWebhookSignature(
      body,
      signature,
      stripeConfig.webhookSecret
    )

    console.log('🔔 Webhook event received:', event.type)

    // Handle the webhook event
    await stripeWebhookService.handleWebhookEvent(event)

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    })

  } catch (error: any) {
    console.error('❌ Webhook processing failed:', error)
    return NextResponse.json({
      error: 'Webhook processing failed',
      message: error.message
    }, { status: 500 })
  }
}
