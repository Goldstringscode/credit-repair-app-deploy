/**
 * API Route: Process Payment and Send Mail
 * Phase 1: Core Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server'
import { certifiedMailService } from '@/lib/certified-mail-service-shipengine'
import { stripeMailPayments } from '@/lib/stripe-mail-payments'
import { requirePlan } from '@/lib/plan-enforcement'
import type { User } from '@/lib/auth'

export const POST = requirePlan('premium')(async (request: NextRequest, _user: User) => {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.trackingId || !body.paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing required fields: trackingId and paymentIntentId' },
        { status: 400 }
      )
    }

    // Verify payment status
    const paymentStatus = await stripeMailPayments.getPaymentStatus(body.paymentIntentId)
    
    if (paymentStatus.status !== 'succeeded') {
      return NextResponse.json(
        { 
          error: 'Payment not completed',
          details: `Payment status: ${paymentStatus.status}`
        },
        { status: 400 }
      )
    }

    // Process payment and send mail
    const mailResponse = await certifiedMailService.processPaymentAndSend(
      body.trackingId,
      body.paymentIntentId
    )

    return NextResponse.json({
      success: true,
      data: mailResponse
    })

  } catch (error) {
    console.error('Error processing payment and sending mail:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process payment and send mail',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
})

export async function GET() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Use POST to process payment and send mail'
  }, { status: 405 })
}

