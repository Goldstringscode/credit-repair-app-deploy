import { NextRequest, NextResponse } from 'next/server'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    console.log('💳 Test payment endpoint called:', body)

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Return mock success response
    return NextResponse.json({
      success: true,
      message: 'Test payment processed successfully',
      data: {
        paymentId: `test_payment_${Date.now()}`,
        status: 'succeeded',
        amount: body.amount || 29.99,
        currency: body.currency || 'usd',
        timestamp: new Date().toISOString(),
        testMode: true
      }
    })

  } catch (error: any) {
    console.error('❌ Test payment failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Test payment failed',
      message: error.message
    }, { status: 500 })
  }
}

export const GET = async (request: NextRequest) => {
  try {
    console.log('💳 Test payment status endpoint called')

    return NextResponse.json({
      success: true,
      message: 'Test payment system is working',
      status: 'operational',
      timestamp: new Date().toISOString(),
      testMode: true
    })

  } catch (error: any) {
    console.error('❌ Test payment status failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Test payment status failed',
      message: error.message
    }, { status: 500 })
  }
}
