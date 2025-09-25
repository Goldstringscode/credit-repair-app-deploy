import { NextRequest, NextResponse } from 'next/server'
import { sendPayoutProcessedEmail } from '@/lib/email-service-server'

export async function POST(request: NextRequest) {
  try {
    const { email, name, amount, method, transactionId, dashboardLink } = await request.json()

    if (!email || !name || amount === undefined || !method || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, amount, method, transactionId' },
        { status: 400 }
      )
    }

    const result = await sendPayoutProcessedEmail({
      to: email,
      name,
      amount: parseFloat(amount),
      method,
      transactionId,
      dashboardLink: dashboardLink || 'http://localhost:3001/mlm/dashboard'
    })

    return NextResponse.json({
      success: true,
      message: 'Payout processed email sent successfully',
      messageId: result?.messageId || 'Email sent successfully'
    })
  } catch (error) {
    console.error('Payout processed email test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send payout processed email' },
      { status: 500 }
    )
  }
}
