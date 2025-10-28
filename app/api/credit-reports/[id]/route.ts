import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id

    // Mock report details data
    const mockReportDetails = {
      personal_info: {
        name: "John Doe",
        address: "123 Main St, Anytown, ST 12345",
        ssn_last_4: "1234",
        date_of_birth: "1990-01-01"
      },
      credit_scores: [
        {
          model: "FICO Score 8",
          score: 720,
          date: "2024-10-01",
          version: "8.0"
        },
        {
          model: "VantageScore 3.0",
          score: 715,
          date: "2024-10-01",
          version: "3.0"
        }
      ],
      accounts: [
        {
          creditor_name: "Chase Bank",
          account_number_last_4: "1234",
          balance: 2500,
          credit_limit: 10000,
          account_status: "Open",
          account_type: "Credit Card"
        },
        {
          creditor_name: "Capital One",
          account_number_last_4: "5678",
          balance: 0,
          credit_limit: 5000,
          account_status: "Closed",
          account_type: "Credit Card"
        }
      ],
      negative_items: [
        {
          item_type: "Late Payment",
          status: "Resolved",
          creditor_name: "Chase Bank",
          amount: 2500,
          date_reported: "2023-12-01",
          dispute_status: "Not Disputed",
          description: "30-day late payment on credit card"
        }
      ],
      inquiries: [
        {
          creditor_name: "Chase Bank",
          date: "2024-09-15",
          type: "Hard Inquiry"
        }
      ],
      risk_analysis: {
        risk_level: "Low",
        risk_score: 25,
        risk_factors: [
          "Low credit utilization",
          "No recent late payments",
          "Good payment history"
        ]
      },
      recommendations: [
        {
          action: "Keep credit utilization below 30%",
          priority: "High",
          expected_impact: "Maintain or improve credit score",
          timeline: "Ongoing"
        },
        {
          action: "Continue making payments on time",
          priority: "High",
          expected_impact: "Maintain good payment history",
          timeline: "Ongoing"
        }
      ],
      validation_results: {
        data_completeness: 0.95,
        accuracy_score: 0.92,
        validation_status: "Passed"
      }
    }

    return NextResponse.json({
      success: true,
      ...mockReportDetails
    })

  } catch (error) {
    console.error('Error fetching report details:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch report details",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}
