import { type NextRequest, NextResponse } from "next/server"
import { mockPayoutMethods } from "@/lib/mlm-payout-system"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // In real app, fetch from database
    const userMethods = mockPayoutMethods.filter((method) => method.userId === userId)

    return NextResponse.json({
      success: true,
      data: userMethods,
    })
  } catch (error) {
    console.error("Payout methods fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch payout methods" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, details } = body

    if (!userId || !type || !details) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Validate the payout method details
    // 2. For bank accounts: verify routing/account numbers
    // 3. For Stripe: create Stripe Connect account
    // 4. Store encrypted details in database
    // 5. Send verification email/SMS if required

    const newMethod = {
      id: `pm_${Date.now()}`,
      userId,
      type,
      status: type === "stripe_connect" ? "verified" : "pending",
      isDefault: false,
      details,
      createdAt: new Date(),
    }

    return NextResponse.json({
      success: true,
      message: "Payout method added successfully",
      data: newMethod,
    })
  } catch (error) {
    console.error("Add payout method error:", error)
    return NextResponse.json({ error: "Failed to add payout method" }, { status: 500 })
  }
}
