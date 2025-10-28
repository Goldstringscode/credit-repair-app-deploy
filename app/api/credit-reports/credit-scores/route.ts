import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const result = await databaseService.getCreditScores(userId || undefined)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to fetch credit scores"
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching credit scores:', error)
    
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['userId', 'bureau', 'score', 'date']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      )
    }

    const result = await databaseService.createCreditScore(body)
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to create credit score"
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating credit score:', error)
    
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Score ID is required"
        },
        { status: 400 }
      )
    }

    const result = await databaseService.updateCreditScore(id, updates)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to update credit score"
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating credit score:', error)
    
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Score ID is required"
        },
        { status: 400 }
      )
    }

    const result = await databaseService.deleteCreditScore(id)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to delete credit score"
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting credit score:', error)
    
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
