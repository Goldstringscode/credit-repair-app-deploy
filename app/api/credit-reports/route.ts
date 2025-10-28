import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock credit reports data
    const mockReports = [
      {
        id: "report_1",
        file_name: "Experian_Report_2024.pdf",
        bureau: "Experian",
        credit_score: 720,
        upload_date: "2024-10-15T10:30:00Z",
        status: "processed",
        confidence: 0.95,
        processing_method: "AI OCR + Manual Review",
        ai_models_used: ["GPT-4", "Claude-3"],
        analysis_duration: 2500,
        risk_level: "Low",
        data_quality: 0.92
      },
      {
        id: "report_2",
        file_name: "Equifax_Report_2024.pdf",
        bureau: "Equifax",
        credit_score: 715,
        upload_date: "2024-10-14T14:20:00Z",
        status: "processed",
        confidence: 0.93,
        processing_method: "AI OCR + Manual Review",
        ai_models_used: ["GPT-4", "Claude-3"],
        analysis_duration: 2100,
        risk_level: "Low",
        data_quality: 0.89
      },
      {
        id: "report_3",
        file_name: "TransUnion_Report_2024.pdf",
        bureau: "TransUnion",
        credit_score: 725,
        upload_date: "2024-10-13T09:15:00Z",
        status: "processed",
        confidence: 0.94,
        processing_method: "AI OCR + Manual Review",
        ai_models_used: ["GPT-4", "Claude-3"],
        analysis_duration: 2300,
        risk_level: "Low",
        data_quality: 0.91
      }
    ]

    return NextResponse.json({
      success: true,
      reports: mockReports
    })

  } catch (error) {
    console.error('Error fetching credit reports:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch credit reports",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}
