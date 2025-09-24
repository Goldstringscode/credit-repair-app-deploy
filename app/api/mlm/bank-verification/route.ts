import { type NextRequest, NextResponse } from "next/server"
import { initiateBankVerification, verifyMicroDeposits, mockBankVerifications } from "@/lib/bank-verification"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const payoutMethodId = searchParams.get("payoutMethodId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    let verifications = mockBankVerifications.filter((v) => v.userId === userId)

    if (payoutMethodId) {
      verifications = verifications.filter((v) => v.payoutMethodId === payoutMethodId)
    }

    return NextResponse.json({
      success: true,
      data: verifications,
    })
  } catch (error) {
    console.error("Bank verification fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch bank verifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, payoutMethodId, bankDetails, amount1, amount2, verificationId } = body

    if (action === "initiate") {
      if (!userId || !payoutMethodId || !bankDetails) {
        return NextResponse.json({ error: "Missing required fields for initiation" }, { status: 400 })
      }

      const verification = await initiateBankVerification(userId, payoutMethodId, bankDetails)

      return NextResponse.json({
        success: true,
        message: "Micro-deposits sent successfully",
        data: verification,
      })
    }

    if (action === "verify") {
      if (!verificationId || amount1 === undefined || amount2 === undefined) {
        return NextResponse.json({ error: "Missing required fields for verification" }, { status: 400 })
      }

      const verification = mockBankVerifications.find((v) => v.id === verificationId)
      if (!verification) {
        return NextResponse.json({ error: "Verification not found" }, { status: 404 })
      }

      const result = verifyMicroDeposits(verification, amount1, amount2)

      return NextResponse.json({
        success: result.success,
        message: result.message,
        data: result.verification,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Bank verification error:", error)
    return NextResponse.json({ error: "Failed to process bank verification" }, { status: 500 })
  }
}
