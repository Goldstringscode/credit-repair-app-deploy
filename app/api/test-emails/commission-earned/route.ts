import { NextRequest, NextResponse } from 'next/server'
import { sendCommissionEarnedEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email, name, amount, type, level, totalEarnings, dashboardLink } = await request.json()

    if (!email || !name || amount === undefined || !type || level === undefined || totalEarnings === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, amount, type, level, totalEarnings' },
        { status: 400 }
      )
    }

    const result = await sendCommissionEarnedEmail({
      to: email,
      name,
      amount: parseFloat(amount),
      type,
      level: parseInt(level),
      totalEarnings: parseFloat(totalEarnings),
      dashboardLink: dashboardLink || 'http://localhost:3001/mlm/dashboard'
    })

    return NextResponse.json({
      success: true,
      message: 'Commission earned email sent successfully',
      messageId: result?.messageId || 'Email sent successfully'
    })
  } catch (error) {
    console.error('Commission earned email test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send commission earned email' },
      { status: 500 }
    )
  }
}
