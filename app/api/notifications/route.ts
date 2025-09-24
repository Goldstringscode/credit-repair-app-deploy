import { type NextRequest, NextResponse } from "next/server"
import { isSupabaseAvailable, createSupabaseClient } from "@/lib/supabase"

// Mock user ID - in real app, get from auth context
const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440000"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || MOCK_USER_ID
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check if Supabase is available
    if (!isSupabaseAvailable()) {
      console.log('Supabase not available, using mock notifications')
      return NextResponse.json({
        notifications: getMockNotifications(),
        total: getMockNotifications().length,
        hasMore: false
      })
    }

    // Try to get from database first
    try {
      const supabase = createSupabaseClient()
      const { data: dbNotifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Database error:', error)
        // Fall back to mock data if database fails
        return NextResponse.json({
          notifications: getMockNotifications(),
          total: getMockNotifications().length,
          hasMore: false
        })
      }

      // Transform database notifications to match our interface
      const notifications = dbNotifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        priority: 'medium', // Default priority
        timestamp: notification.created_at,
        read: notification.read || false,
        data: notification.data || null,
        actions: notification.actions || null
      }))

      return NextResponse.json({
        notifications,
        total: notifications.length,
        hasMore: notifications.length === limit
      })
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      // Fall back to mock data if database connection fails
      return NextResponse.json({
        notifications: getMockNotifications(),
        total: getMockNotifications().length,
        hasMore: false
      })
    }

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, type = 'info', priority = 'medium', userId = MOCK_USER_ID, data, actions } = body

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    // Check if Supabase is available
    if (!isSupabaseAvailable()) {
      console.log('Supabase not available, using mock notification')
      
      // Fall back to mock notification when database is not available
      const mockNotification = {
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        message,
        type,
        priority,
        timestamp: new Date().toISOString(),
        read: false,
        data: data || null,
        actions: actions || null
      }

      return NextResponse.json({
        success: true,
        notification: mockNotification
      })
    }

    // Try to save to database first
    try {
      const supabase = createSupabaseClient()
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          read: false,
          data: data || null,
          actions: actions || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw new Error('Database operation failed')
      }

      return NextResponse.json({
        success: true,
        notification: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority,
          timestamp: notification.created_at,
          read: notification.read,
          data: notification.data,
          actions: notification.actions
        }
      })
    } catch (dbError) {
      console.log('Database not available, using mock notification')
      
      // Fall back to mock notification when database fails
      const mockNotification = {
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        message,
        type,
        priority,
        timestamp: new Date().toISOString(),
        read: false,
        data: data || null,
        actions: actions || null
      }

      return NextResponse.json({
        success: true,
        notification: mockNotification
      })
    }

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

function getMockNotifications() {
  return [
    {
      id: "welcome",
      title: "Welcome to Credit Repair AI",
      message: "Thank you for joining our platform. Let's improve your credit score together!",
      type: "info",
      priority: "medium",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: "credit-score-update",
      title: "Credit Score Updated",
      message: "Your TransUnion score has increased by 15 points!",
      type: "success",
      priority: "high",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: "lesson-completed",
      title: "Lesson Completed! 🎉",
      message: "Great job completing 'Understanding Your Credit Report'. You're making excellent progress!",
      type: "success",
      priority: "medium",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: false,
      actions: [
        {
          label: "View Progress",
          action: "view_progress",
          variant: "default"
        }
      ]
    },
    {
      id: "milestone-achieved",
      title: "Milestone Achieved! 🏆",
      message: "Congratulations! You've completed 5 lessons in the Credit Basics course.",
      type: "success",
      priority: "high",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: false,
      actions: [
        {
          label: "View Certificate",
          action: "view_certificate",
          variant: "default"
        }
      ]
    }
  ]
}

// PATCH method to mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    // Check if Supabase is available
    if (!isSupabaseAvailable()) {
      console.log('Supabase not available, using mock response for PATCH')
      return NextResponse.json({ 
        success: true, 
        message: 'Notification marked as read (mock)',
        id 
      })
    }

    // Update notification in Supabase
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', MOCK_USER_ID)

    if (error) {
      console.error('Error updating notification:', error)
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Notification marked as read',
      id 
    })

  } catch (error) {
    console.error('Error in PATCH /api/notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
