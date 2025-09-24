import { type NextRequest, NextResponse } from "next/server"

// Mock user ID - in real app, get from auth context
const MOCK_MLM_USER_ID = "550e8400-e29b-41d4-a716-446655440000"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || MOCK_MLM_USER_ID
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('🔔 MLM Notifications API: Fetching notifications for user:', userId)

    // For now, return mock data - in production, connect to database
    const mockNotifications = getMockMLMNotifications()

    return NextResponse.json({
      notifications: mockNotifications,
      total: mockNotifications.length,
      hasMore: false
    })

  } catch (error) {
    console.error('Error fetching MLM notifications:', error)
    return NextResponse.json({ error: "Failed to fetch MLM notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, type = 'info', priority = 'medium', userId = MOCK_MLM_USER_ID, data, actions, category } = body

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    console.log('🔔 MLM Notifications API: Creating notification:', { title, type, priority, userId })

    // For now, return mock notification - in production, save to database
    const mockNotification = {
      id: `mlm_notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      type,
      priority,
      timestamp: new Date().toISOString(),
      read: false,
      data: data || null,
      actions: actions || null,
      category: category || 'general'
    }

    return NextResponse.json({
      success: true,
      notification: mockNotification
    })

  } catch (error) {
    console.error('Error creating MLM notification:', error)
    return NextResponse.json({ error: "Failed to create MLM notification" }, { status: 500 })
  }
}

// PATCH method to mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    console.log('🔔 MLM Notifications API: Marking notification as read:', id)

    // For now, return mock response - in production, update database
    return NextResponse.json({ 
      success: true, 
      message: 'MLM notification marked as read (mock)',
      id 
    })

  } catch (error) {
    console.error('Error in PATCH /api/mlm/notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getMockMLMNotifications() {
  return [
    {
      id: "welcome-mlm",
      title: "Welcome to MLM Program! 🎉",
      message: "Congratulations on joining our MLM program. Start building your team and earning commissions!",
      type: "success",
      priority: "high",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: "welcome",
      actions: [
        {
          label: "View Dashboard",
          action: "view_dashboard",
          variant: "default"
        }
      ]
    },
    {
      id: "team-join-success",
      title: "New Team Member Joined! 👥",
      message: "John Smith has joined your team using code TEAM123. You earned a $50 referral bonus!",
      type: "team_join",
      priority: "high",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: "team",
      actions: [
        {
          label: "View Team",
          action: "view_team",
          variant: "default"
        }
      ]
    },
    {
      id: "rank-advancement",
      title: "Rank Advancement! 🏆",
      message: "Congratulations! You've been promoted to Silver rank. New benefits and higher commission rates unlocked!",
      type: "rank_advancement",
      priority: "high",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: true,
      category: "achievement",
      actions: [
        {
          label: "View Benefits",
          action: "view_benefits",
          variant: "default"
        }
      ]
    },
    {
      id: "commission-earned",
      title: "Commission Earned! 💰",
      message: "You earned $125.50 in commissions this week. Check your earnings breakdown in the dashboard.",
      type: "commission_earned",
      priority: "medium",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: "earnings",
      actions: [
        {
          label: "View Earnings",
          action: "view_earnings",
          variant: "default"
        }
      ]
    },
    {
      id: "training-completed",
      title: "Training Module Completed! 📚",
      message: "Great job completing 'MLM Fundamentals'. You earned 50 points and unlocked new training materials.",
      type: "training_completed",
      priority: "medium",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      read: true,
      category: "training",
      actions: [
        {
          label: "Continue Training",
          action: "continue_training",
          variant: "outline"
        }
      ]
    },
    {
      id: "payout-processed",
      title: "Payout Processed! 💳",
      message: "Your payout of $500.00 has been processed and sent to your bank account. Expected delivery: 2-3 business days.",
      type: "payout_processed",
      priority: "high",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: "payout",
      actions: [
        {
          label: "View Transaction",
          action: "view_transaction",
          variant: "default"
        }
      ]
    },
    {
      id: "milestone-achieved",
      title: "Team Milestone Achieved! 🎯",
      message: "Congratulations! Your team has reached 10 active members. You've unlocked the Team Leader bonus program!",
      type: "milestone",
      priority: "high",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: "achievement",
      actions: [
        {
          label: "View Milestone",
          action: "view_milestone",
          variant: "default"
        }
      ]
    },
    {
      id: "invitation-sent",
      title: "Invitation Sent! 📧",
      message: "Your team invitation has been sent to jane@example.com. They have 7 days to join your team.",
      type: "invitation_sent",
      priority: "medium",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: true,
      category: "team",
      actions: [
        {
          label: "Send Another",
          action: "send_another",
          variant: "outline"
        }
      ]
    },
    {
      id: "task-completed",
      title: "Task Completed! ✅",
      message: "You completed 'Update Profile Information' and earned 25 points. Keep up the great work!",
      type: "task_completed",
      priority: "low",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      read: true,
      category: "tasks",
      actions: [
        {
          label: "View Tasks",
          action: "view_tasks",
          variant: "outline"
        }
      ]
    },
    {
      id: "new-member-alert",
      title: "New Team Member Alert! 🔔",
      message: "Sarah Johnson joined your team through your referral link. Welcome them and help them get started!",
      type: "new_member",
      priority: "medium",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: "team",
      actions: [
        {
          label: "Welcome Member",
          action: "welcome_member",
          variant: "default"
        }
      ]
    }
  ]
}
