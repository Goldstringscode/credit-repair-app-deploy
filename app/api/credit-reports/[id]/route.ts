import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // For now, return mock data since we're focusing on the manual system
    // In the future, this could fetch specific report details from database
    const reportDetails = {
      personal_info: {
        name: "John Doe",
        address: "123 Main St, Anytown, ST 12345",
        ssn_last_4: "1234"
      },
      credit_scores: [
        { model: "FICO 8", score: 720, version: "8.0", date: "2024-10-01" },
        { model: "VantageScore 3.0", score: 715, version: "3.0", date: "2024-10-01" }
      ],
      accounts: [
        {
          creditor_name: "Chase Bank",
          account_number_last_4: "1234",
          balance: 2500,
          credit_limit: 10000,
          account_status: "Open",
          account_type: "Credit Card"
        }
      ],
      negative_items: [
        {
          item_type: "Late Payment",
          status: "Closed",
          creditor_name: "Capital One",
          amount: 1500,
          date_reported: "2023-12-01",
          dispute_status: "Not Disputed",
          description: "30-day late payment"
        }
      ],
      inquiries: [],
      risk_analysis: {
        risk_level: "Medium",
        risk_score: 65,
        risk_factors: [
          "Recent late payment",
          "High credit utilization",
          "Limited credit history"
        ]
      },
      recommendations: [
        {
          action: "Dispute late payment",
          priority: "High",
          expected_impact: "Potential 20-30 point increase",
          timeline: "30-45 days"
        },
        {
          action: "Reduce credit utilization",
          priority: "Medium",
          expected_impact: "Potential 10-15 point increase",
          timeline: "1-2 months"
        }
      ],
      validation_results: {
        data_quality: 0.95,
        confidence_score: 0.88
      }
    }
    
    return NextResponse.json({
      success: true,
      ...reportDetails
    })
  } catch (error) {
    console.error('Error fetching report details:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}
