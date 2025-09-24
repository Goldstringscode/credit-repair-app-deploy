import { NextRequest, NextResponse } from 'next/server'
import { sendTeamCreationEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email, name, teamCode, dashboardLink } = await request.json()

    if (!email || !name || !teamCode) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, teamCode' },
        { status: 400 }
      )
    }

    const result = await sendTeamCreationEmail({
      to: email,
      name,
      teamCode,
      dashboardLink: dashboardLink || 'http://localhost:3001/mlm/dashboard'
    })

    return NextResponse.json({
      success: true,
      message: 'Team creation email sent successfully',
      messageId: result?.messageId || 'Email sent successfully'
    })
  } catch (error) {
    console.error('Team creation email test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send team creation email' },
      { status: 500 }
    )
  }
}
