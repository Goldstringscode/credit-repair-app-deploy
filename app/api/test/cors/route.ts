import { NextRequest, NextResponse } from 'next/server'
import { withCors } from '@/lib/cors'

const optionsHandler = async (request: NextRequest) => {
  return new NextResponse(null, { status: 200 })
}

const getHandler = async (request: NextRequest) => {
  return NextResponse.json({ 
    success: true, 
    message: 'CORS test endpoint',
    origin: request.headers.get('origin')
  })
}

export const OPTIONS = withCors()(optionsHandler)
export const GET = withCors()(getHandler)
