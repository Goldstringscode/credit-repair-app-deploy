/**
 * API Route: Validate Address
 * Phase 1: Core Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server'
import { shipEngineService, type CertifiedMailAddress } from '@/lib/shipengine-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.address || !body.address.address1 || !body.address.city || 
        !body.address.state || !body.address.zip) {
      return NextResponse.json(
        { error: 'Invalid address format. Required: address1, city, state, zip' },
        { status: 400 }
      )
    }

    const address: CertifiedMailAddress = {
      name: body.address.name || 'Test Name',
      company: body.address.company,
      address1: body.address.address1,
      address2: body.address.address2,
      city: body.address.city,
      state: body.address.state,
      zip: body.address.zip,
      country: body.address.country || 'US',
      phone: body.address.phone,
      email: body.address.email
    }

    // Validate address
    const validation = await shipEngineService.validateAddress(address)

    return NextResponse.json({
      success: true,
      data: validation
    })

  } catch (error) {
    console.error('Error validating address:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to validate address',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Use POST to validate an address'
  }, { status: 405 })
}

