import { NextRequest, NextResponse } from 'next/server'

export const POST = async (request: NextRequest) => {
  try {
    console.log('🔍 Minimal API: Request received')
    
    const body = await request.json()
    console.log('🔍 Minimal API: Body received:', body)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Minimal test successful',
      receivedData: body
    })
  } catch (error: any) {
    console.error('❌ Minimal API: Error occurred:', error)
    console.error('❌ Minimal API: Error stack:', error.stack)
    return NextResponse.json({ 
      error: 'Minimal test failed',
      message: error.message 
    }, { status: 500 })
  }
}
