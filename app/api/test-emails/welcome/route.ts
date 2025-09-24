import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email, name, teamCode, dashboardLink } = await request.json()

    if (!email || !name || !teamCode) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, teamCode' },
        { status: 400 }
      )
    }

    const result = await sendWelcomeEmail({
      to: email,
      name,
      teamCode,
      dashboardLink: dashboardLink || 'http://localhost:3001/mlm/dashboard'
    })

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      messageId: result?.messageId || 'Email sent successfully'
    })
  } catch (error) {
    console.error('Welcome email test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send welcome email' },
      { status: 500 }
    )
  }
}
