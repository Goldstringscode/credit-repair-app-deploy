import { type NextRequest, NextResponse } from "next/server"
import { aiDisputeLetterGenerator } from "@/lib/ai-dispute-letter-generator"

export async function POST(request: NextRequest) {
  try {
    // Reset the uniqueness tracking in the AI dispute letter generator
    aiDisputeLetterGenerator.resetUniquenessTracking()
    
    return NextResponse.json({
      success: true,
      message: "Uniqueness tracking reset successfully"
    })
  } catch (error) {
    console.error("Failed to reset uniqueness tracking:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset uniqueness tracking",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}
