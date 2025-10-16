import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const { subject, message, type } = await request.json()

    // Simulate email sending
    console.log(`Sending email to user ${userId}:`, { subject, message, type })

    return NextResponse.json({
      success: true,
      data: {
        message: "Email sent successfully",
        emailId: `email_${Date.now()}`
      }
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
