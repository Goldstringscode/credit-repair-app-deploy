import { NextRequest, NextResponse } from 'next/server'
import { sendNewTeamMemberEmail } from '@/lib/email-service-server'

export async function POST(request: NextRequest) {
  try {
    const { email, sponsorName, newMemberName, newMemberEmail, teamCode, dashboardLink } = await request.json()

    if (!email || !sponsorName || !newMemberName || !newMemberEmail || !teamCode) {
      return NextResponse.json(
        { error: 'Missing required fields: email, sponsorName, newMemberName, newMemberEmail, teamCode' },
        { status: 400 }
      )
    }

    const result = await sendNewTeamMemberEmail({
      to: email,
      sponsorName,
      newMemberName,
      newMemberEmail,
      teamCode,
      dashboardLink: dashboardLink || 'http://localhost:3001/mlm/dashboard'
    })

    return NextResponse.json({
      success: true,
      message: 'New team member email sent successfully',
      messageId: result?.messageId || 'Email sent successfully'
    })
  } catch (error) {
    console.error('New team member email test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send new team member email' },
      { status: 500 }
    )
  }
}
