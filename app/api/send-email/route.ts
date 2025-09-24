import { type NextRequest, NextResponse } from "next/server"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { type, to, data } = await request.json()

    if (!to || !type) {
      return NextResponse.json({ error: "Missing required fields: to, type" }, { status: 400 })
    }

    let result

    switch (type) {
      case "welcome":
        result = await EmailService.sendWelcomeEmail(to, data.userName, data.planName)
        break
      case "password-reset":
        result = await EmailService.sendPasswordResetEmail(to, data.resetToken)
        break
      case "dispute-letter":
        result = await EmailService.sendDisputeLetterNotification(to, data.userName, data.letterType)
        break
      case "credit-score-update":
        result = await EmailService.sendCreditScoreUpdate(to, data.userName, data.bureau, data.oldScore, data.newScore)
        break
      case "subscription-confirmation":
        result = await EmailService.sendSubscriptionConfirmation(to, data.userName, data.planName, data.amount)
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
