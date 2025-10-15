import { type NextRequest, NextResponse } from "next/server"

// POST - Send email to user
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const { subject, message, type } = await request.json()

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, error: "Subject and message are required" },
        { status: 400 }
      )
    }

    // Mock email sending
    const emailData = {
      userId,
      subject,
      message,
      type: type || 'general',
      sentAt: new Date().toISOString(),
      status: 'sent'
    }

    return NextResponse.json({
      success: true,
      data: {
        email: emailData,
        message: "Email sent successfully"
      }
    })

  } catch (error) {
    console.error('Error sending email:', error)
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
