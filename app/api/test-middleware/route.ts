import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

const testSchema = z.object({
  test: z.string().min(1)
})

export const POST = withRateLimit(
  withValidation(
    async (request: NextRequest) => {
      try {
        const body = await request.json()
        console.log('Test middleware API received:', body)
        
        return NextResponse.json({
          success: true,
          message: 'Middleware test working',
          data: body
        })
      } catch (error: any) {
        console.error('Test middleware error:', error)
        return NextResponse.json({
          success: false,
          error: error.message,
          stack: error.stack
        }, { status: 500 })
      }
    },
    testSchema
  )
)
