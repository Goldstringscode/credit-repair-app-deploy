import { NextRequest, NextResponse } from "next/server"
import { UltimateCreditParserWorking } from "@/lib/ultimate-credit-parser-working"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing Ultimate Parser...")
    
    const { testData } = await request.json()
    
    if (!testData) {
      return NextResponse.json(
        { success: false, error: "No test data provided" },
        { status: 400 }
      )
    }

    console.log(`📄 Test data length: ${testData.length} characters`)

    // Use the Ultimate Credit Parser
    const parser = new UltimateCreditParserWorking(testData)
    const analysis = await parser.parse()

    console.log("✅ Ultimate parser test complete:", {
      scores: analysis.scores.length,
      accounts: analysis.accounts.length,
      negativeItems: analysis.negativeItems.length,
      confidence: analysis.confidence,
      method: analysis.parsingMethod
    })

    return NextResponse.json({
      success: true,
      message: "Ultimate parser test completed successfully",
      analysis,
      stats: {
        method: `Ultimate ${analysis.parsingMethod.replace('_', ' ')}`,
        text_length: testData.length,
        confidence_score: analysis.confidence,
        accounts_found: analysis.accounts.length,
        scores_found: analysis.scores.length,
        primary_score: analysis.scores[0]?.score || null,
        parsing_method: analysis.parsingMethod
      }
    })
  } catch (error) {
    console.error("Ultimate parser test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

// GET endpoint for simple testing
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Ultimate Parser Test Endpoint",
    usage: "POST with { testData: 'your credit report text here' }",
    example: {
      testData: "EXPERIAN: 750\nCredit Card: CHASE BANK\nBalance: $2,500"
    }
  })
}

