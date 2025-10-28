import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database-service'

export async function GET(request: NextRequest) {
  try {
    // For now, return empty reports since we're focusing on the manual system
    // In the future, this could fetch uploaded PDF reports
    const reports = []
    
    return NextResponse.json({
      success: true,
      reports: reports
    })
  } catch (error) {
    console.error('Error fetching credit reports:', error)
    
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
