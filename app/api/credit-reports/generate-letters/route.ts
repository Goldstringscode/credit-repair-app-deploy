import { NextRequest, NextResponse } from 'next/server'
import { aiDisputeLetterGenerator } from '@/lib/ai-dispute-letter-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { personalInfo, negativeItems, letterTier, creditBureaus } = body
    
    if (!personalInfo || !negativeItems || !letterTier || !creditBureaus) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: personalInfo, negativeItems, letterTier, creditBureaus"
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

    // Validate credit bureaus
    const validBureaus = ["experian", "transunion", "equifax"]
    const invalidBureaus = creditBureaus.filter((bureau: string) => !validBureaus.includes(bureau.toLowerCase()))
    if (invalidBureaus.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid credit bureaus: ${invalidBureaus.join(", ")}. Must be one of: ${validBureaus.join(", ")}`
        },
        { status: 400 }
      )
    }

    // Convert negative items to dispute items format
    const disputeItems = negativeItems.map((item: any) => ({
      id: item.id,
      creditorName: item.creditor,
      accountNumber: item.accountNumber,
      itemType: item.itemType,
      dateReported: item.dateReported,
      amount: item.originalAmount,
      status: item.status,
      disputeReason: item.disputeReason,
      supportingEvidence: item.notes || '',
      previousDisputes: []
    }))

    // Generate letters for each credit bureau
    const generatedLetters: { [bureau: string]: any } = {}
    const errors: { [bureau: string]: string } = {}

    for (const bureau of creditBureaus) {
      try {
        const letter = await aiDisputeLetterGenerator.generateDisputeLetter(
          personalInfo,
          disputeItems,
          letterTier,
          bureau.toLowerCase(),
          {
            source: 'manual_credit_report',
            totalItems: disputeItems.length,
            itemTypes: [...new Set(disputeItems.map((item: any) => item.itemType))],
            averageAmount: disputeItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) / disputeItems.length
          }
        )

        generatedLetters[bureau.toLowerCase()] = {
          content: letter.content,
          metadata: letter.metadata,
          bureau: bureau.toLowerCase(),
          generatedAt: new Date().toISOString()
        }
      } catch (error) {
        console.error(`Error generating letter for ${bureau}:`, error)
        errors[bureau.toLowerCase()] = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Check if any letters were generated successfully
    if (Object.keys(generatedLetters).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate any letters",
          details: errors
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        letters: generatedLetters,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
        summary: {
          totalBureaus: creditBureaus.length,
          successfulLetters: Object.keys(generatedLetters).length,
          failedLetters: Object.keys(errors).length,
          letterTier,
          totalDisputeItems: disputeItems.length
        }
      }
    })

  } catch (error) {
    console.error("Letter generation failed:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate dispute letters",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const letterTier = searchParams.get("tier") || "standard"

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
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        letterOptions,
        currentSelection: {
          tier: letterTier
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
