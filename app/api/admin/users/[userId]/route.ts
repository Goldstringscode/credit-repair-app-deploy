import { type NextRequest, NextResponse } from "next/server"
import { databaseService } from "@/lib/database-service"

// GET - Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    // For now, return mock data - will be replaced with real database query
    const mockUser = {
      id: userId,
      name: "John Doe",
      email: "john@example.com",
      role: "premium",
      status: "active",
      joinDate: "2024-01-15",
      lastLogin: "2024-10-15",
      subscription: "Premium Plan",
      creditScore: 720,
      phone: "+1234567890",
      createdAt: "2024-01-15T10:30:00Z",
      isVerified: true,
      totalSpent: 299.99,
      lastActivity: "2024-10-15T14:30:00Z"
    }

    return NextResponse.json({
      success: true,
      data: { user: mockUser }
    })

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch user",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const body = await request.json()
    const { name, email, role, phone, subscription } = body

    const result = await databaseService.updateUser(userId, {
      name,
      email,
      role,
      phone,
      subscription
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update user",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    const result = await databaseService.deleteUser(userId)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}