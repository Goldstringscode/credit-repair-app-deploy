import { type NextRequest, NextResponse } from "next/server"
import { aiDisputeLetterGenerator } from "@/lib/ai-dispute-letter-generator"

export async function GET(request: NextRequest) {
  try {
    // Test basic functionality
    const systemStatus = aiDisputeLetterGenerator.getSystemStatus()
    
    // Test with minimal data
    const testPersonalInfo = {
      firstName: "Test",
      lastName: "User",
      address: "123 Test St",
      city: "Test City",
      state: "CA",
      zipCode: "12345",
      phone: "555-1234",
      email: "test@example.com",
      ssnLast4: "1234",
      dateOfBirth: "1990-01-01"
    }

    const testDisputeItems = [{
      id: "test1",
      creditorName: "Test Bank",
      accountNumber: "123456789",
      itemType: "credit_dispute",
      dateReported: "2024-01-01",
      status: "disputed",
      disputeReason: "Not my account"
    }]

    console.log("🧪 Testing AI dispute letter generator...")
    
    const result = await aiDisputeLetterGenerator.generateDisputeLetter(
      testPersonalInfo,
      testDisputeItems,
      "standard",
      "experian",
      { letterPurpose: "dispute" }
    )

    console.log("✅ AI test successful:", {
      letterId: result.id,
      contentLength: result.content.length,
      qualityScore: result.metadata.qualityScore
    })

    return NextResponse.json({
      success: true,
      data: {
        systemStatus,
        testResult: {
          letterId: result.id,
          contentLength: result.content.length,
          qualityScore: result.metadata.qualityScore,
          uniquenessScore: result.metadata.uniquenessScore,
          customizationLevel: result.metadata.customizationLevel
        },
        message: "AI dispute letter generator test successful"
      }
    })

  } catch (error) {
    console.error("❌ AI test failed:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "AI test failed",
        details: error instanceof Error ? error.message : "Unknown error occurred",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
