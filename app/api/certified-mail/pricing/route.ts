/**
 * API Route: Get Certified Mail Pricing Tiers
 * GET /api/certified-mail/pricing
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
import { certifiedMailService } from '@/lib/certified-mail-service-shipengine';

export async function GET(request: NextRequest) {
  try {
    const pricingTiers = certifiedMailService.getPricingTiers();

    return NextResponse.json({
      success: true,
      data: pricingTiers,
    });
  } catch (error) {
    console.error('Error getting pricing tiers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get pricing tiers',
      },
      { status: 500 }
    );
  }
}
