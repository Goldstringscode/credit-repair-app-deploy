import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params

  const userDetails = {
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
    createdAt: "2024-01-15T10:30:00Z"
  }

  return NextResponse.json({
    success: true,
    data: userDetails
  })
}

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const updates = await request.json()

    const updatedUser = {
      id: userId,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        message: "User updated successfully"
      }
    })

  } catch (error) {
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

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params

  return NextResponse.json({
    success: true,
    message: "User deleted successfully"
  })
}
