/**
 * Stripe Webhook Handler for Certified Mail Payments
 * Phase 1: Core Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripeMailPayments } from '@/lib/stripe-mail-payments'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }

    // Handle webhook event
    const result = await stripeMailPayments.handleWebhookEvent(body, signature)

    return NextResponse.json({
      success: true,
      processed: result.processed,
      eventType: result.type
    })

  } catch (error) {
    console.error('Error handling Stripe webhook:', error)
    
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests from Stripe'
  }, { status: 405 })
}

