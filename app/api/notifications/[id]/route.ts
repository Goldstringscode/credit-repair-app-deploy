import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

// Mock user ID - in real app, get from auth context
const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440000"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { read, userId = MOCK_USER_ID } = body

    if (read === undefined) {
      return NextResponse.json({ error: "Read status is required" }, { status: 400 })
    }

    const supabase = createClient()
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
    }

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: 'medium',
        timestamp: notification.created_at,
        read: notification.read,
        data: notification.data,
        actions: notification.actions
      }
    })

  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || MOCK_USER_ID

    const supabase = createClient()
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully"
    })

  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}
