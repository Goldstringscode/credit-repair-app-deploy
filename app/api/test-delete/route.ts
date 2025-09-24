import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    console.log('📝 Test DELETE endpoint reached')
    const body = await request.json().catch(() => ({}))
    console.log('📝 Test DELETE body:', body)
    
    return NextResponse.json({
      success: true,
      message: 'Test DELETE endpoint working',
      body: body
    })
  } catch (error: any) {
    console.error('Test DELETE error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
