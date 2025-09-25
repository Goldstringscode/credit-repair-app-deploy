import { type NextRequest, NextResponse } from "next/server"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { mlmNotificationSystem } from "@/lib/mlm/notification-system"
import { withRateLimit } from "@/lib/rate-limiter"
import { sendInvitationEmail } from "@/lib/email-service-server"

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, name, sponsorId } = body

    if (!email || !name) {
      return NextResponse.json({ 
        success: false,
        error: "Email and name are required" 
      }, { status: 400 })
    }

    // For development, use a mock user ID
    const userId = 'demo-user-123'

    // Check if user already exists
    const existingUser = await mlmDatabaseService.getMLMUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ 
        success: false,
        error: "User with this email already exists" 
      }, { status: 409 })
    }

    // Generate invitation token
    const invitationToken = generateInvitationToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store invitation in database
    const invitation = await mlmDatabaseService.createInvitation({
      email,
      name,
      sponsorId: sponsorId || userId,
      token: invitationToken,
      expiresAt,
      status: 'pending'
    })

    // Get sponsor's team code
    const sponsor = await mlmDatabaseService.getMLMUser(userId)
    const teamCode = sponsor?.teamCode || 'DEMO123'

    // Send invitation email
    await sendInvitationEmail({
      to: email,
      name: name,
      sponsorName: 'Demo User',
      teamCode: teamCode,
      invitationCode: invitationToken,
      invitationLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/join?code=${invitationToken}`
    })

    // Note: Client-side notifications will be handled by the frontend
    // after the API call completes successfully

    // Send notification to sponsor (legacy system)
    try {
      await mlmNotificationSystem.sendNotification(
        userId,
        'invitation_sent',
        {
          title: 'Invitation Sent',
          message: `Invitation sent to ${name} (${email})`,
          data: {
            inviteeName: name,
            inviteeEmail: email,
            invitationId: invitation.id
          }
        },
        'normal'
      )
    } catch (notificationError) {
      console.log('Legacy notification system error:', notificationError)
      // Don't fail the request if legacy notification fails
    }

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      data: {
        invitationId: invitation.id,
        email,
        name,
        expiresAt
      }
    })
  } catch (error) {
    console.error("Invitation error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to send invitation" 
    }, { status: 500 })
  }
}, 'general')

// Helper functions
function generateInvitationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
