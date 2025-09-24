import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'

const handler = async (request: NextRequest) => {
  return NextResponse.json({ 
    success: true, 
    message: 'Rate limit test endpoint',
    timestamp: new Date().toISOString()
  })
}

export const POST = withRateLimit(handler, 'general')
