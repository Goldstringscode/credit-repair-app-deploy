import { NextRequest, NextResponse } from 'next/server'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

const validationSchema = z.object({
  email: z.string().email('Invalid email format')
})

const handler = async (request: NextRequest) => {
  return NextResponse.json({ 
    success: true, 
    message: 'Validation test passed',
    data: { email: 'validated' }
  })
}

export const POST = withValidation({
  body: validationSchema
})(handler)
