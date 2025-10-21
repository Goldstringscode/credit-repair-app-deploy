import { type NextRequest, NextResponse } from "next/server"
import { databaseService } from "@/lib/database-service"

// GET - Get all users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    console.log('API: GET /api/admin/users called')
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    const filters = {
      search,
      role,
      status,
      page,
      limit
    }

    console.log('API: Calling databaseService.getUsers with filters:', filters)
    const result = await databaseService.getUsers(filters)
    console.log('API: Database service returned:', result)
    return NextResponse.json(result)

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

    const result = await databaseService.createUser({
      name,
      email,
      role,
      phone,
      subscription
    })

    return NextResponse.json(result)

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