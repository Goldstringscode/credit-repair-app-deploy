/**
 * API Route: Get Mail Templates
 * Phase 1: Core Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server'
import { certifiedMailService } from '@/lib/certified-mail-service-shipengine'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Get mail templates
    const templates = await certifiedMailService.getMailTemplates(category || undefined)

    return NextResponse.json({
      success: true,
      data: templates
    })

  } catch (error) {
    console.error('Error getting mail templates:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get mail templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Use GET to retrieve mail templates'
  }, { status: 405 })
}

