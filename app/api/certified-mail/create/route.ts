/**
 * API Route: Create Certified Mail Request
 * Phase 1: Core Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server'
import { certifiedMailService, type CertifiedMailRequest } from '@/lib/certified-mail-service-shipengine'
import { stripeMailPayments, type MailPaymentRequest } from '@/lib/stripe-mail-payments'
import { requirePlan } from '@/lib/plan-enforcement'
import type { User } from '@/lib/auth'

export const POST = requirePlan('premium')(async (request: NextRequest, _user: User) => {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'userId', 'recipient', 'sender', 'letter', 'serviceTier'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate recipient address
    if (!body.recipient.address || !body.recipient.address.address1 || 
        !body.recipient.address.city || !body.recipient.address.state || 
        !body.recipient.address.zip) {
      return NextResponse.json(
        { error: 'Invalid recipient address format' },
        { status: 400 }
      )
    }

    // Validate sender address
    if (!body.sender.address || !body.sender.address.address1 || 
        !body.sender.address.city || !body.sender.address.state || 
        !body.sender.address.zip) {
      return NextResponse.json(
        { error: 'Invalid sender address format' },
        { status: 400 }
      )
    }

    // Create mail request
    const mailRequest: CertifiedMailRequest = {
      userId: body.userId,
      recipient: {
        name: body.recipient.name,
        company: body.recipient.company,
        address: body.recipient.address
      },
      sender: {
        name: body.sender.name,
        company: body.sender.company,
        address: body.sender.address
      },
      letter: {
        subject: body.letter.subject,
        content: body.letter.content,
        type: body.letter.type,
        templateId: body.letter.templateId
      },
      serviceTier: body.serviceTier,
      additionalServices: body.additionalServices,
      deliveryInstructions: body.deliveryInstructions
    }

    // Create the mail request
    const mailResponse = await certifiedMailService.instance.createMailRequest(mailRequest)

    // Create payment intent
    const paymentRequest: MailPaymentRequest = {
      trackingId: mailResponse.trackingId,
      amount: mailResponse.cost.total,
      currency: 'usd',
      description: `Certified Mail - ${mailRequest.letter.subject}`,
      customerId: body.customerId,
      metadata: {
        mailType: mailRequest.letter.type,
        serviceType: mailRequest.serviceTier,
        trackingNumber: mailResponse.trackingNumber,
        userId: mailRequest.userId
      }
    }

    const paymentResponse = await stripeMailPayments.instance.createPaymentIntent(paymentRequest)

    return NextResponse.json({
      success: true,
      data: {
        mail: mailResponse,
        payment: paymentResponse
      }
    })

  } catch (error) {
    console.error('Error creating certified mail request:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create certified mail request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
})

export async function GET() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Use POST to create a certified mail request'
  }, { status: 405 })
}

