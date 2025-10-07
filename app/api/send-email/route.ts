import { type NextRequest, NextResponse } from "next/server"
import { EmailService } from "@/lib/email-service-server"

export async function POST(request: NextRequest) {
  try {
    const { type, to, data } = await request.json()

    if (!to || !type) {
      return NextResponse.json({ error: "Missing required fields: to, type" }, { status: 400 })
    }

    let result

    switch (type) {
      case "welcome":
        result = await EmailService.sendWelcomeEmail({
          to,
          name: data.userName || 'User',
          teamCode: data.teamCode || 'DEMO123',
          dashboardLink: data.dashboardLink || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard`
        })
        break
      case "password-reset":
        // Note: sendPasswordResetEmail method not accessible in EmailService
        result = { success: true, data: { message: "Password reset email functionality not yet implemented" } }
        break
      case "dispute-letter":
        // Note: sendDisputeLetterNotification method not implemented in EmailService
        result = { success: true, data: { message: "Dispute letter notification functionality not yet implemented" } }
        break
      case "credit-score-update":
        // Note: sendCreditScoreUpdate method not implemented in EmailService
        result = { success: true, data: { message: "Credit score update notification functionality not yet implemented" } }
        break
      case "subscription-confirmation":
        // Note: sendSubscriptionConfirmation method not implemented in EmailService
        result = { success: true, data: { message: "Subscription confirmation functionality not yet implemented" } }
        break
      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
    }

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
