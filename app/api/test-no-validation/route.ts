import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'

export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      console.log('Test API received:', body)
      
      return NextResponse.json({
        success: true,
        message: 'No validation test working',
        data: body
      })
    } catch (error: any) {
      console.error('Test API error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        stack: error.stack
      }, { status: 500 })
    }
  }
)
