import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, inviteData } = body

    if (!userId || !inviteData) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    const { email, template, personalMessage } = inviteData

    // In a real app, you would:
    // 1. Validate user permissions
    // 2. Generate unique invite link
    // 3. Send email invitation
    // 4. Track invite in database
    // 5. Set up follow-up sequences

    const inviteLink = `https://creditrepair.com/join/${userId}?ref=invite_${Date.now()}`

    // Mock email sending
    console.log("Sending MLM invite:", {
      to: email,
      template,
      personalMessage,
      inviteLink,
    })

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      data: {
        inviteId: `invite_${Date.now()}`,
        inviteLink,
        sentAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Team invite error:", error)
    return NextResponse.json({ error: "Failed to send team invitation" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Mock invite history
    const invites = [
      {
        id: "invite_001",
        email: "prospect1@example.com",
        status: "pending",
        sentAt: "2024-01-15",
        template: "welcome",
        clicks: 2,
        converted: false,
      },
      {
        id: "invite_002",
        email: "prospect2@example.com",
        status: "converted",
        sentAt: "2024-01-10",
        template: "financial_freedom",
        clicks: 5,
        converted: true,
        convertedAt: "2024-01-12",
      },
    ]

    const stats = {
      totalInvites: invites.length,
      pendingInvites: invites.filter((i) => i.status === "pending").length,
      convertedInvites: invites.filter((i) => i.status === "converted").length,
      conversionRate: (invites.filter((i) => i.status === "converted").length / invites.length) * 100,
    }

    return NextResponse.json({
      success: true,
      data: {
        invites,
        stats,
      },
    })
  } catch (error) {
    console.error("Invite history fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch invite history" }, { status: 500 })
  }
}
