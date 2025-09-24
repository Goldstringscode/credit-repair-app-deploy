/**
 * API Route: Get USPS Service Rates
 * Phase 1: Core Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server'
import { certifiedMailService } from '@/lib/certified-mail-service-shipengine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { fromAddress, toAddress } = body;
    
    if (!fromAddress || !toAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: fromAddress, toAddress',
        },
        { status: 400 }
      );
    }

    // Get service rates
    const rates = await certifiedMailService.getServiceRates(fromAddress, toAddress);

    return NextResponse.json({
      success: true,
      data: rates,
    });
  } catch (error) {
    console.error('Error getting service rates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get service rates',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Use POST to get service rates with addresses'
  }, { status: 405 })
}

