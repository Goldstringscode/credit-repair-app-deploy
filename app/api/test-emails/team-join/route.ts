import { NextRequest, NextResponse } from 'next/server'
import { sendTeamJoinEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email, name, teamCode, sponsorName, dashboardLink } = await request.json()

    if (!email || !name || !teamCode || !sponsorName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, teamCode, sponsorName' },
        { status: 400 }
      )
    }

    const result = await sendTeamJoinEmail({
      to: email,
      name,
      teamCode,
      sponsorName,
      dashboardLink: dashboardLink || 'http://localhost:3001/mlm/dashboard'
    })

    return NextResponse.json({
      success: true,
      message: 'Team join email sent successfully',
      messageId: result?.messageId || 'Email sent successfully'
    })
  } catch (error) {
    console.error('Team join email test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send team join email' },
      { status: 500 }
    )
  }
}
