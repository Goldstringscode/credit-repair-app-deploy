/**
 * API Route: Calculate Certified Mail Cost
 * POST /api/certified-mail/calculate-cost
 */

import { NextRequest, NextResponse } from 'next/server';
import { certifiedMailService, type CertifiedMailRequest } from '@/lib/certified-mail-service-shipengine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { recipient, sender, serviceTier, additionalServices } = body;
    
    if (!recipient || !sender || !serviceTier) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: recipient, sender, serviceTier',
        },
        { status: 400 }
      );
    }

    // Create request object for cost calculation
    const mailRequest: CertifiedMailRequest = {
      userId: body.userId || 'temp-user',
      recipient: {
        name: recipient.name,
        company: recipient.company,
        address: recipient.address,
      },
      sender: {
        name: sender.name,
        company: sender.company,
        address: sender.address,
      },
      letter: {
        subject: body.letter?.subject || 'Certified Mail',
        content: body.letter?.content || 'Letter content',
        type: body.letter?.type || 'general',
        templateId: body.letter?.templateId,
      },
      serviceTier: serviceTier,
      additionalServices: additionalServices,
      deliveryInstructions: body.deliveryInstructions,
    };

    // Calculate cost
    const costBreakdown = certifiedMailService.calculateCost(mailRequest);

    return NextResponse.json({
      success: true,
      data: costBreakdown,
    });
  } catch (error) {
    console.error('Error calculating cost:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate cost',
      },
      { status: 500 }
    );
  }
}
