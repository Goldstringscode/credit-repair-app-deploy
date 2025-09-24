import { type NextRequest, NextResponse } from "next/server"
import { mlmPayoutProcessor } from "@/lib/mlm/payout-processor"
import { mlmDatabaseService } from "@/lib/mlm/database-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get real commission data from database
    const commissions = await mlmDatabaseService.getCommissions(userId)
    const balance = await mlmPayoutProcessor.calculateAvailablePayout(userId)
    const payoutHistory = await mlmPayoutProcessor.getPayoutHistory(userId)
    const payoutMethods = await mlmPayoutProcessor.getPayoutMethods(userId)

    return NextResponse.json({
      success: true,
      data: {
        balance,
        commissions: commissions.filter(c => c.status === 'pending'),
        payoutHistory,
        payoutMethods
      },
    })
  } catch (error) {
    console.error("Payout balance fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch payout data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, payoutMethodId, commissionIds, notes } = body

    if (!userId || !amount || !payoutMethodId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get payout methods for user
    const payoutMethods = await mlmPayoutProcessor.getPayoutMethods(userId)
    const payoutMethod = payoutMethods.find(m => m.id === payoutMethodId)
    
    if (!payoutMethod) {
      return NextResponse.json({ error: "Payout method not found" }, { status: 404 })
    }

    // Validate payout method
    const isValidMethod = await mlmPayoutProcessor.validatePayoutMethod(payoutMethod)
    if (!isValidMethod) {
      return NextResponse.json({ error: "Invalid payout method" }, { status: 400 })
    }

    // Get available balance
    const availableBalance = await mlmPayoutProcessor.calculateAvailablePayout(userId)
    if (amount > availableBalance) {
      return NextResponse.json({ 
        error: "Insufficient balance", 
        details: { available: availableBalance, requested: amount }
      }, { status: 400 })
    }

    // Process payout request
    const payoutRequest: any = {
      userId,
      amount,
      method: payoutMethod,
      commissionIds: commissionIds || [],
      notes
    }

    const payout = await mlmPayoutProcessor.processPayoutRequest(payoutRequest)

    return NextResponse.json({
      success: true,
      message: "Payout request submitted successfully",
      data: payout,
    })
  } catch (error) {
    console.error("Payout request error:", error)
    return NextResponse.json({ 
      error: "Failed to process payout request",
      details: error.message 
    }, { status: 500 })
  }
}
