import { NextRequest, NextResponse } from "next/server"

// Mock channels data
const mockChannels = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "general",
    type: "team",
    description: "General team discussions",
    memberCount: 8,
    unreadCount: 0,
    isPrivate: false,
    createdBy: "550e8400-e29b-41d4-a716-446655440000",
    createdAt: new Date("2023-01-15").toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessage: {
      content: "Welcome to the team!",
      sender: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "John Smith",
        avatar: "/avatars/john.jpg"
      },
      timestamp: new Date(Date.now() - 60000).toISOString()
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "announcements",
    type: "team",
    description: "Important announcements",
    memberCount: 8,
    unreadCount: 0,
    isPrivate: false,
    createdBy: "550e8400-e29b-41d4-a716-446655440000",
    createdAt: new Date("2023-01-15").toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessage: {
      content: "New commission structure announced!",
      sender: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "John Smith",
        avatar: "/avatars/john.jpg"
      },
      timestamp: new Date(Date.now() - 300000).toISOString()
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "training",
    type: "team",
    description: "Training and development",
    memberCount: 8,
    unreadCount: 0,
    isPrivate: false,
    createdBy: "550e8400-e29b-41d4-a716-446655440000",
    createdAt: new Date("2023-02-01").toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessage: {
      content: "Check out the new training materials",
      sender: {
        id: "mlm-user-456",
        name: "Sarah Johnson",
        avatar: "/avatars/sarah.jpg"
      },
      timestamp: new Date(Date.now() - 600000).toISOString()
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`📋 Fetching channels for user: ${userId}`)

    // Return mock channels
    return NextResponse.json({
      success: true,
      data: mockChannels
    })
  } catch (error) {
    console.error("Error fetching channels:", error)
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, isPrivate, userId } = body

    if (!name || !type || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new channel
    const newChannel = {
      id: `channel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      description: description || "",
      memberCount: 1,
      unreadCount: 0,
      isPrivate: isPrivate || false,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: {
        content: "Channel created",
        sender: {
          id: userId,
          name: "System",
          avatar: "/avatars/system.png"
        },
        timestamp: new Date().toISOString()
      }
    }

    // Add to mock channels
    mockChannels.push(newChannel)

    return NextResponse.json({
      success: true,
      message: "Channel created successfully",
      data: newChannel
    })
  } catch (error) {
    console.error("Error creating channel:", error)
    return NextResponse.json({ error: "Failed to create channel" }, { status: 500 })
  }
}