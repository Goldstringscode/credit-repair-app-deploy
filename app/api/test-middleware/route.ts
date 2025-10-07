import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

const testSchema = z.object({
  test: z.string().min(1)
})

export const POST = withRateLimit(
  withValidation({
    body: testSchema
  })(
    async (request: NextRequest, validatedData: any) => {
      try {
        console.log('Test middleware API received:', validatedData.body)
        
        return NextResponse.json({
          success: true,
          message: 'Middleware test working',
          data: validatedData.body
        })
      } catch (error: any) {
        console.error('Test middleware error:', error)
        return NextResponse.json({
          success: false,
          error: error.message,
          stack: error.stack
        }, { status: 500 })
      }
    }
  )
)
