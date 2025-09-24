import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const affiliateId = searchParams.get("affiliateId")

    if (!affiliateId) {
      return NextResponse.json({ error: "Affiliate ID is required" }, { status: 400 })
    }

    // Mock payment history
    const payments = [
      {
        id: "pay_001",
        affiliateId,
        date: "2024-01-15",
        amount: 450.0,
        method: "PayPal",
        status: "completed",
        referrals: 8,
        transactionId: "TXN_123456789",
      },
      {
        id: "pay_002",
        affiliateId,
        date: "2023-12-15",
        amount: 380.5,
        method: "PayPal",
        status: "completed",
        referrals: 6,
        transactionId: "TXN_123456788",
      },
      {
        id: "pay_003",
        affiliateId,
        date: "2023-11-15",
        amount: 290.0,
        method: "PayPal",
        status: "completed",
        referrals: 5,
        transactionId: "TXN_123456787",
      },
    ]

    return NextResponse.json({
      success: true,
      payments,
      summary: {
        totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
        totalPayments: payments.length,
        lastPayment: payments[0]?.date || null,
      },
    })
  } catch (error) {
    console.error("Payments fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { affiliateId, amount, method } = body

    if (!affiliateId || !amount || !method) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Validate affiliate has sufficient balance
    // 2. Process payment through payment provider
    // 3. Update affiliate balance
    // 4. Send confirmation email
    // 5. Log transaction

    const payoutRequest = {
      id: `payout_${Date.now()}`,
      affiliateId,
      amount,
      method,
      status: "processing",
      requestDate: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    }

    return NextResponse.json({
      success: true,
      message: "Payout request submitted successfully",
      payout: payoutRequest,
    })
  } catch (error) {
    console.error("Payout request error:", error)
    return NextResponse.json({ error: "Failed to process payout request" }, { status: 500 })
  }
}
