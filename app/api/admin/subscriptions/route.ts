import { type NextRequest, NextResponse } from "next/server"
import { databaseService } from "@/lib/database-service"

// GET - Get all subscriptions with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const plan = searchParams.get('plan') || ''

    const filters = {
      search,
      status,
      plan,
      page,
      limit
    }

    const result = await databaseService.getSubscriptions(filters)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch subscriptions",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}