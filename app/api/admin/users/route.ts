import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

// GET - Get all users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    // Mock data for development
    if (!supabase) {
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
        },
        {
          id: "3",
          name: "Bob Johnson",
          email: "bob@example.com",
          role: "trial",
          status: "pending",
          joinDate: "2024-10-10",
          lastLogin: "2024-10-15",
          subscription: "Trial",
          creditScore: 650,
          phone: "+1234567892",
          createdAt: "2024-10-10T10:30:00Z"
        },
        {
          id: "4",
          name: "Alice Brown",
          email: "alice@example.com",
          role: "premium",
          status: "suspended",
          joinDate: "2024-03-05",
          lastLogin: "2024-10-12",
          subscription: "Premium Plan",
          creditScore: 750,
          phone: "+1234567893",
          createdAt: "2024-03-05T10:30:00Z"
        }
      ]

      // Apply filters
      let filteredUsers = mockUsers
      
      if (search) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        )
      }
      
      if (role && role !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === role)
      }
      
      if (status && status !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.status === status)
      }

      // Calculate pagination
      const total = filteredUsers.length
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

      return NextResponse.json({
        success: true,
        data: {
          users: paginatedUsers,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      })
    }

    // Real database implementation would go here
    // For now, return mock data
    return NextResponse.json({
      success: true,
      data: {
        users: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, role, phone, subscription } = body

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      )
    }

    // Mock user creation
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
    console.error('Error creating user:', error)
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
