/**
 * API Route: Get Certified Mail Status
 * Phase 1: Core Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server'
import { certifiedMailService } from '@/lib/certified-mail-service-shipengine'

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const { trackingId } = params
    
    if (!trackingId) {
      return NextResponse.json(
        { error: 'Tracking ID is required' },
        { status: 400 }
      )
    }

    // Get mail status
    const status = await certifiedMailService.getMailStatus(trackingId)

    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error) {
    console.error('Error getting mail status:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get mail status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Use GET to retrieve mail status'
  }, { status: 405 })
}

