import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const { role, reason } = await request.json()

    return NextResponse.json({
      success: true,
      data: {
        user: { id: userId, role },
        message: "User role changed successfully"
      }
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to change role",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
