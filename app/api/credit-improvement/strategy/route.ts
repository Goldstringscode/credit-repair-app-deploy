import { NextRequest, NextResponse } from "next/server"
import { CreditImprovementStrategyGenerator } from "@/lib/credit-improvement-strategy"

export async function POST(request: NextRequest) {
  try {
    const { creditData, strategyType } = await request.json()

    if (!creditData) {
      return NextResponse.json(
        { error: "Credit data is required" },
        { status: 400 }
      )
    }

    console.log("🚀 Generating credit improvement strategy...")

    const generator = new CreditImprovementStrategyGenerator()
    let result: any

    switch (strategyType) {
      case "comprehensive":
        result = await generator.generateStrategy(creditData)
        break
      case "dispute_letter":
        if (!creditData.item) {
          return NextResponse.json(
            { error: "Item data is required for dispute letter generation" },
            { status: 400 }
          )
        }
        const letter = await generator.generateDisputeLetter(creditData.item)
        result = { success: true, letter, generated_at: new Date().toISOString() }
        break
      case "payment_plan":
        if (!creditData.accounts) {
          return NextResponse.json(
            { error: "Accounts data is required for payment plan generation" },
            { status: 400 }
          )
        }
        result = await generator.generatePaymentPlan(creditData.accounts)
        break
      default:
        result = await generator.generateStrategy(creditData)
    }

    if (!result.success) {
      return NextResponse.json(
        { error: "Strategy generation failed", details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Credit improvement strategy generated successfully",
      strategy: result,
      generated_at: new Date().toISOString(),
    })

  } catch (error) {
    console.error("❌ Strategy generation error:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Strategy generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/credit-improvement/strategy",
    description: "Generate personalized credit improvement strategies",
    supported_strategies: [
      "comprehensive - Full credit improvement plan",
      "dispute_letter - Professional dispute letter",
      "payment_plan - Strategic debt payment plan",
    ],
    features: [
      "AI-powered strategy generation",
      "Personalized recommendations",
      "Actionable improvement steps",
      "Timeline and milestone planning",
      "Risk mitigation strategies",
      "Dispute letter templates",
      "Payment prioritization",
    ],
    status: "active",
  })
}

