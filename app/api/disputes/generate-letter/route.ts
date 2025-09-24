import { type NextRequest, NextResponse } from "next/server"
import { aiDisputeLetterGenerator } from "@/lib/ai-dispute-letter-generator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { personalInfo, disputeItems, letterType, letterTier, creditBureau, additionalContext } = body
    
    if (!personalInfo || !disputeItems || !letterType || !letterTier || !creditBureau) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: personalInfo, disputeItems, letterType, letterTier, creditBureau"
        },
        { status: 400 }
      )
    }

    // Validate letter type
    const validLetterTypes = ["dispute", "debt_validation", "cease_and_desist", "goodwill", "pay_for_delete"]
    if (!validLetterTypes.includes(letterType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid letter type. Must be one of: ${validLetterTypes.join(", ")}`
        },
        { status: 400 }
      )
    }

    // Validate letter tier
    const validLetterTiers = ["standard", "enhanced", "premium"]
    if (!validLetterTiers.includes(letterTier)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid letter tier. Must be one of: ${validLetterTiers.join(", ")}`
        },
        { status: 400 }
      )
    }

    // Validate credit bureau
    const validBureaus = ["experian", "transunion", "equifax"]
    if (!validBureaus.includes(creditBureau.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid credit bureau. Must be one of: ${validBureaus.join(", ")}`
        },
        { status: 400 }
      )
    }

    // Generate the letter
    const letter = await aiDisputeLetterGenerator.generateDisputeLetter(
      personalInfo,
      disputeItems,
      letterType,
      letterTier,
      creditBureau,
      additionalContext
    )

    return NextResponse.json({
      success: true,
      data: {
        letter,
        message: `Successfully generated ${letterTier} ${letterType.replace('_', ' ')} letter`
      }
    })

  } catch (error) {
    console.error("Letter generation failed:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate dispute letter",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const letterType = searchParams.get("type")
    const creditBureau = searchParams.get("bureau")

    // Return available options and pricing
    const letterOptions = {
      standard: {
        name: "Standard Dispute Letter",
        description: "Basic FCRA-compliant dispute letter",
        price: 9.99,
        features: [
          "FCRA compliance verification",
          "Basic legal citations",
          "Standard dispute template",
          "Quality score assessment"
        ],
        bestFor: "Simple disputes, first-time disputers"
      },
      enhanced: {
        name: "Enhanced Dispute Letter",
        description: "Standard + CFPB complaint threat",
        price: 22.99,
        features: [
          "All Standard features",
          "CFPB complaint preparation",
          "Enhanced legal language",
          "Follow-up strategy included"
        ],
        bestFor: "Serious disputes, repeat offenders"
      },
      premium: {
        name: "Premium Dispute Letter",
        description: "Attorney-supervised with legal threats",
        price: 49.99,
        features: [
          "All Enhanced features",
          "Attorney supervision notice",
          "Legal threat language",
          "Comprehensive follow-up protocol"
        ],
        bestFor: "Complex disputes, maximum impact"
      },
      attorney: {
        name: "Attorney Representation Letter",
        description: "Full legal representation notice",
        price: 99.99,
        features: [
          "All Premium features",
          "Attorney representation notice",
          "Legal counsel contact info",
          "Full legal protection"
        ],
        bestFor: "Legal disputes, maximum protection"
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        letterOptions,
        currentSelection: {
          type: letterType || "standard",
          bureau: creditBureau || "experian"
        },
        message: "Dispute letter options retrieved successfully"
      }
    })

  } catch (error) {
    console.error("❌ Get letter options error:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve letter options",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}
