import { type NextRequest, NextResponse } from "next/server"
import { aiDisputeLetterGenerator } from "@/lib/ai-dispute-letter-generator"

export async function GET(request: NextRequest) {
  try {
    // Get the actual system status from the AI dispute letter generator
    const systemStatus = aiDisputeLetterGenerator.getSystemStatus()
    
    return NextResponse.json({
      success: true,
      data: systemStatus,
      message: "System status retrieved successfully"
    })
  } catch (error) {
    console.error("Failed to get system status:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve system status",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}
