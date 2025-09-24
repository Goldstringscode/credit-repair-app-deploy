import { NextRequest, NextResponse } from 'next/server'

// Mock data - in production, this would come from a database
let emailLists = [
  {
    id: "1",
    name: "All Subscribers",
    subscribers: 2150,
    activeSubscribers: 1980,
    unsubscribed: 170,
    createdAt: "2024-01-01",
    lastUpdated: "2024-01-22",
    tags: ["all", "active"],
    description: "All active subscribers in the system"
  },
  {
    id: "2",
    name: "Premium Users",
    subscribers: 450,
    activeSubscribers: 420,
    unsubscribed: 30,
    createdAt: "2024-01-01",
    lastUpdated: "2024-01-22",
    tags: ["premium", "active"],
    description: "Users with premium subscriptions"
  },
  {
    id: "3",
    name: "New Users (Last 30 Days)",
    subscribers: 180,
    activeSubscribers: 175,
    unsubscribed: 5,
    createdAt: "2024-01-01",
    lastUpdated: "2024-01-22",
    tags: ["new", "recent"],
    description: "Users who joined in the last 30 days"
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')

    let filteredLists = emailLists

    if (search) {
      filteredLists = filteredLists.filter(list => 
        list.name.toLowerCase().includes(search.toLowerCase()) ||
        list.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (tag) {
      filteredLists = filteredLists.filter(list => 
        list.tags.includes(tag)
      )
    }

    return NextResponse.json({
      success: true,
      lists: filteredLists,
      total: filteredLists.length
    })
  } catch (error) {
    console.error('❌ Error fetching email lists:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email lists' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, tags = [] } = body

    const newList = {
      id: Date.now().toString(),
      name,
      description: description || "",
      subscribers: 0,
      activeSubscribers: 0,
      unsubscribed: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      tags
    }

    emailLists.push(newList)

    return NextResponse.json({
      success: true,
      list: newList
    })
  } catch (error) {
    console.error('❌ Error creating email list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create email list' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const listIndex = emailLists.findIndex(l => l.id === id)
    if (listIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Email list not found' },
        { status: 404 }
      )
    }

    emailLists[listIndex] = { 
      ...emailLists[listIndex], 
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    return NextResponse.json({
      success: true,
      list: emailLists[listIndex]
    })
  } catch (error) {
    console.error('❌ Error updating email list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update email list' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Email list ID is required' },
        { status: 400 }
      )
    }

    const listIndex = emailLists.findIndex(l => l.id === id)
    if (listIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Email list not found' },
        { status: 404 }
      )
    }

    emailLists.splice(listIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Email list deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting email list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete email list' },
      { status: 500 }
    )
  }
}
