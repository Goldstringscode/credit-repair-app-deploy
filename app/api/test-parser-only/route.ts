import { NextRequest, NextResponse } from "next/server"
import { SuperiorCreditParser } from "@/lib/superior-credit-parser"

export async function POST(request: NextRequest) {
  try {
    const { testData } = await request.json()
    
    if (!testData) {
      return NextResponse.json(
        { success: false, error: "No test data provided" },
        { status: 400 }
      )
    }
    
    console.log("🧪 Testing Superior Parser with provided data...")
    console.log(`📄 Data length: ${testData.length} characters`)
    
    const parser = new SuperiorCreditParser(testData)
    const result = await parser.parse()
    
    console.log("🎯 Parsing completed:", {
      scores: result.scores.length,
      accounts: result.accounts.length,
      negativeItems: result.negativeItems.length,
      confidence: result.confidence
    })
    
    return NextResponse.json({
      success: true,
      message: "Parser test completed successfully",
      result: {
        scores: result.scores,
        accounts: result.accounts,
        negativeItems: result.negativeItems,
        summary: result.summary,
        confidence: result.confidence,
        parsingMethod: result.parsingMethod
      }
    })
    
  } catch (error) {
    console.error("❌ Parser test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
