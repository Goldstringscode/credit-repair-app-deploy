import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database-service'
import { getAuthenticatedUser } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const result = await databaseService.getNegativeItems(user.userId)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to fetch negative items"
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching negative items:', error)
    
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
    const user = getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    body.userId = user.userId
    
    // Validate required fields
    const requiredFields = ['creditor', 'accountNumber', 'originalAmount', 'currentBalance', 'dateOpened', 'dateReported', 'status', 'itemType', 'disputeReason']
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

    const result = await databaseService.createNegativeItem(body)
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to create negative item"
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating negative item:', error)
    
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
    const user = getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Item ID is required"
        },
        { status: 400 }
      )
    }

    const result = await databaseService.updateNegativeItem(id, updates)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to update negative item"
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating negative item:', error)
    
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
    const user = getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Item ID is required"
        },
        { status: 400 }
      )
    }

    const result = await databaseService.deleteNegativeItem(id)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to delete negative item"
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting negative item:', error)
    
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