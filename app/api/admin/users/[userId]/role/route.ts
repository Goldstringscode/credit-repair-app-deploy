import { type NextRequest, NextResponse } from "next/server"

// PUT - Change user role
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const { role, reason } = await request.json()

    if (!role) {
      return NextResponse.json(
        { success: false, error: "Role is required" },
        { status: 400 }
      )
    }

    const validRoles = ['admin', 'premium', 'user', 'trial']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      )
    }

    // Mock role change
    const updatedUser = {
      id: userId,
      role,
      updatedAt: new Date().toISOString(),
      roleChangeReason: reason || 'Role changed by admin'
    }

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        message: `User role changed to ${role} successfully`
      }
    })

  } catch (error) {
    console.error('Error changing user role:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to change user role",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
