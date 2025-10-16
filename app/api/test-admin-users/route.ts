import { NextResponse } from "next/server"

export async function GET() {
  const mockUsers = [
    {
      id: "1",
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
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "user",
      status: "active",
      joinDate: "2024-02-20",
      lastLogin: "2024-10-14",
      subscription: "Basic Plan",
      creditScore: 680,
      phone: "+1234567891",
      createdAt: "2024-02-20T10:30:00Z"
    }
  ]

  return NextResponse.json({
    success: true,
    data: {
      users: mockUsers,
      total: mockUsers.length,
      page: 1,
      limit: 50,
      totalPages: 1
    }
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, role, phone, subscription } = body

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      )
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      role: role || 'user',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().split('T')[0],
      subscription: subscription || 'Basic Plan',
      creditScore: 650,
      phone: phone || '',
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: {
        user: newUser,
        message: "User created successfully"
      }
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create user",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
