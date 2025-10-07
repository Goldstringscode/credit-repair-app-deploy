import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { notificationTemplateService } from "@/lib/notification-templates"
import { notificationScheduler } from "@/lib/notification-scheduler"
import { notificationAnalyticsService } from "@/lib/notification-analytics"
import { notificationPrioritySystem } from "@/lib/notification-priority-system"

// Mock user ID - in real app, get from auth context
const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440000"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId') || MOCK_USER_ID

    switch (action) {
      case 'analytics':
        return handleGetAnalytics(userId)
      case 'templates':
        return handleGetTemplates()
      case 'schedules':
        return handleGetSchedules(userId)
      case 'priority-rules':
        return handleGetPriorityRules()
      case 'user-profile':
        return handleGetUserProfile(userId)
      default:
        return handleGetNotifications(userId, searchParams)
    }
  } catch (error) {
    console.error('Error in enhanced notifications API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId = MOCK_USER_ID } = body

    switch (action) {
      case 'create-from-template':
        return handleCreateFromTemplate(body, userId)
      case 'schedule':
        return handleScheduleNotification(body, userId)
      case 'track-analytics':
        return handleTrackAnalytics(body, userId)
      case 'calculate-priority':
        return handleCalculatePriority(body, userId)
      case 'bulk-operations':
        return handleBulkOperations(body, userId)
      default:
        return handleCreateNotification(body, userId)
    }
  } catch (error) {
    console.error('Error in enhanced notifications API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId = MOCK_USER_ID } = body

    switch (action) {
      case 'update-priority-rules':
        return handleUpdatePriorityRules(body)
      case 'update-user-context':
        return handleUpdateUserContext(body, userId)
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in enhanced notifications API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Handler functions

async function handleGetNotifications(userId: string, searchParams: URLSearchParams) {
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  const category = searchParams.get('category')
  const priority = searchParams.get('priority')
  const read = searchParams.get('read')

  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
    }
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }
    if (read && read !== 'all') {
      query = query.eq('read', read === 'read')
    }

    const { data: dbNotifications, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        notifications: getMockNotifications(),
        total: 2,
        hasMore: false
      })
    }

    const notifications = dbNotifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      priority: notification.priority || 'medium',
      timestamp: notification.created_at,
      read: notification.read || false,
      category: notification.category,
      data: notification.data || null,
      actions: notification.actions || null,
      templateId: notification.template_id,
      analyticsId: notification.analytics_id
    }))

    return NextResponse.json({
      notifications,
      total: notifications.length,
      hasMore: notifications.length === limit
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

async function handleGetAnalytics(userId: string) {
  try {
    const overallMetrics = notificationAnalyticsService.getOverallMetrics()
    const userProfile = notificationAnalyticsService.getUserEngagementProfile(userId)
    const insights = notificationAnalyticsService.getNotificationInsights()

    return NextResponse.json({
      success: true,
      data: {
        overallMetrics,
        userProfile,
        insights
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

async function handleGetTemplates() {
  try {
    const templates = notificationTemplateService.getAllTemplates()
    const categories = ['credit', 'training', 'milestone', 'system', 'payment', 'alert']
    const templatesByCategory = categories.map(category => ({
      category,
      templates: notificationTemplateService.getTemplatesByCategory(category)
    }))

    return NextResponse.json({
      success: true,
      data: {
        templates,
        templatesByCategory
      }
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

async function handleGetSchedules(userId: string) {
  try {
    const scheduledNotifications = notificationScheduler.getUserScheduledNotifications(userId)
    const activeSchedules = notificationScheduler.getActiveSchedules()
    const stats = notificationScheduler.getStats()

    return NextResponse.json({
      success: true,
      data: {
        scheduledNotifications,
        activeSchedules,
        stats
      }
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
  }
}

async function handleGetPriorityRules() {
  try {
    const rules = notificationPrioritySystem.getAllRules()
    const activeRules = notificationPrioritySystem.getActiveRules()
    const stats = notificationPrioritySystem.getPriorityStats()

    return NextResponse.json({
      success: true,
      data: {
        rules,
        activeRules,
        stats
      }
    })
  } catch (error) {
    console.error('Error fetching priority rules:', error)
    return NextResponse.json({ error: "Failed to fetch priority rules" }, { status: 500 })
  }
}

async function handleGetUserProfile(userId: string) {
  try {
    const userProfile = notificationAnalyticsService.getUserEngagementProfile(userId)
    const userContext = notificationPrioritySystem.getUserContextData(userId)

    return NextResponse.json({
      success: true,
      data: {
        userProfile,
        userContext
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

async function handleCreateFromTemplate(body: any, userId: string) {
  try {
    const { templateId, data = {} } = body

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 })
    }

    // Validate template data
    const validation = notificationTemplateService.validateTemplateData(templateId, data)
    if (!validation.valid) {
      return NextResponse.json({ 
        error: "Invalid template data", 
        missing: validation.missing 
      }, { status: 400 })
    }

    // Generate notification from template
    const generatedNotification = notificationTemplateService.generateNotification(templateId, data, userId)

    // Track analytics
    const analyticsId = notificationAnalyticsService.trackNotificationSent(
      generatedNotification.id,
      userId,
      templateId,
      generatedNotification.category || 'info',
      generatedNotification.type,
      generatedNotification.priority
    )

    generatedNotification.analyticsId = analyticsId

    // Save to database
    try {
      const supabase = createClient()
      if (!supabase) {
        return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
      }
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          id: generatedNotification.id,
          user_id: userId,
          title: generatedNotification.title,
          message: generatedNotification.message,
          type: generatedNotification.type,
          priority: generatedNotification.priority,
          category: generatedNotification.category,
          read: false,
          data: generatedNotification.data,
          actions: generatedNotification.actions,
          template_id: templateId,
          analytics_id: analyticsId,
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
        notification: generatedNotification
      })
    } catch (dbError) {
      console.log('Database not available, using mock notification')
      return NextResponse.json({
        success: true,
        notification: generatedNotification
      })
    }
  } catch (error) {
    console.error('Error creating notification from template:', error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

async function handleScheduleNotification(body: any, userId: string) {
  try {
    const { templateId, delayMinutes, data = {}, priority = 'medium' } = body

    if (!templateId || !delayMinutes) {
      return NextResponse.json({ 
        error: "Template ID and delay minutes are required" 
      }, { status: 400 })
    }

    const scheduleId = notificationScheduler.scheduleDelayed(
      userId,
      templateId,
      delayMinutes,
      data,
      priority
    )

    return NextResponse.json({
      success: true,
      scheduleId,
      message: `Notification scheduled for ${delayMinutes} minutes from now`
    })
  } catch (error) {
    console.error('Error scheduling notification:', error)
    return NextResponse.json({ error: "Failed to schedule notification" }, { status: 500 })
  }
}

async function handleTrackAnalytics(body: any, userId: string) {
  try {
    const { analyticsId, action, data = {} } = body

    if (!analyticsId || !action) {
      return NextResponse.json({ 
        error: "Analytics ID and action are required" 
      }, { status: 400 })
    }

    switch (action) {
      case 'delivered':
        notificationAnalyticsService.trackNotificationDelivered(analyticsId)
        break
      case 'read':
        notificationAnalyticsService.trackNotificationRead(analyticsId)
        break
      case 'clicked':
        notificationAnalyticsService.trackNotificationClick(analyticsId, data.actionTaken)
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Analytics tracked for action: ${action}`
    })
  } catch (error) {
    console.error('Error tracking analytics:', error)
    return NextResponse.json({ error: "Failed to track analytics" }, { status: 500 })
  }
}

async function handleCalculatePriority(body: any, userId: string) {
  try {
    const { notification, context } = body

    if (!notification) {
      return NextResponse.json({ 
        error: "Notification data is required" 
      }, { status: 400 })
    }

    // Use provided context or get from system
    const userContext = context || notificationPrioritySystem.getUserContextData(userId) || {
      userId,
      userTier: 'premium',
      userEngagement: 75,
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      recentNotifications: 5,
      userPreferences: {},
      deviceInfo: {
        platform: 'web',
        browser: 'chrome',
        isMobile: false
      }
    }

    const priorityResult = notificationPrioritySystem.calculatePriority(
      notification,
      userId
    )

    return NextResponse.json({
      success: true,
      data: priorityResult
    })
  } catch (error) {
    console.error('Error calculating priority:', error)
    return NextResponse.json({ error: "Failed to calculate priority" }, { status: 500 })
  }
}

async function handleBulkOperations(body: any, userId: string) {
  try {
    const { operation, notificationIds, filters } = body

    if (!operation || !notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ 
        error: "Operation and notification IDs are required" 
      }, { status: 400 })
    }

    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
    }
    let result: any

    switch (operation) {
      case 'mark_read':
        result = await supabase
          .from('notifications')
          .update({ read: true })
          .in('id', notificationIds)
          .eq('user_id', userId)
        break
      case 'mark_unread':
        result = await supabase
          .from('notifications')
          .update({ read: false })
          .in('id', notificationIds)
          .eq('user_id', userId)
        break
      case 'delete':
        result = await supabase
          .from('notifications')
          .delete()
          .in('id', notificationIds)
          .eq('user_id', userId)
        break
      case 'update_priority':
        const { priority } = body
        if (!priority) {
          return NextResponse.json({ error: "Priority is required" }, { status: 400 })
        }
        result = await supabase
          .from('notifications')
          .update({ priority })
          .in('id', notificationIds)
          .eq('user_id', userId)
        break
      default:
        return NextResponse.json({ error: "Invalid operation" }, { status: 400 })
    }

    if (result.error) {
      console.error('Database error:', result.error)
      return NextResponse.json({ error: "Database operation failed" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Bulk operation '${operation}' completed successfully`,
      affectedCount: (result.data && Array.isArray(result.data) ? result.data.length : 0) || notificationIds.length
    })
  } catch (error) {
    console.error('Error in bulk operations:', error)
    return NextResponse.json({ error: "Failed to perform bulk operations" }, { status: 500 })
  }
}

async function handleCreateNotification(body: any, userId: string) {
  try {
    const { title, message, type = 'info', priority = 'medium', category, data, actions } = body

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    // Calculate smart priority if not provided
    let finalPriority = priority
    if (!priority || priority === 'auto') {
      const context = notificationPrioritySystem.getUserContextData(userId) || {
        userId,
        userTier: 'premium',
        userEngagement: 75,
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        recentNotifications: 5,
        userPreferences: {},
        deviceInfo: {
          platform: 'web',
          browser: 'chrome',
          isMobile: false
        }
      }

      const priorityResult = notificationPrioritySystem.calculatePriority(
        { title, message, type, category, priority: 'medium' },
        userId
      )
      finalPriority = priorityResult.priority
    }

    try {
      const supabase = createClient()
      if (!supabase) {
        return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
      }
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          priority: finalPriority,
          category,
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
          priority: finalPriority,
          category: notification.category,
          timestamp: notification.created_at,
          read: notification.read,
          data: notification.data,
          actions: notification.actions
        }
      })
    } catch (dbError) {
      console.log('Database not available, using mock notification')
      
      const mockNotification = {
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        message,
        type,
        priority: finalPriority,
        category,
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

async function handleUpdatePriorityRules(body: any) {
  try {
    const { rules } = body

    if (!rules || !Array.isArray(rules)) {
      return NextResponse.json({ error: "Rules array is required" }, { status: 400 })
    }

    // Import rules configuration
    const success = notificationPrioritySystem.importRules(JSON.stringify(rules))

    if (!success) {
      return NextResponse.json({ error: "Failed to import rules" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Priority rules updated successfully"
    })
  } catch (error) {
    console.error('Error updating priority rules:', error)
    return NextResponse.json({ error: "Failed to update priority rules" }, { status: 500 })
  }
}

async function handleUpdateUserContext(body: any, userId: string) {
  try {
    const { context } = body

    if (!context) {
      return NextResponse.json({ error: "Context is required" }, { status: 400 })
    }

    notificationPrioritySystem.setUserContext(userId, context)

    return NextResponse.json({
      success: true,
      message: "User context updated successfully"
    })
  } catch (error) {
    console.error('Error updating user context:', error)
    return NextResponse.json({ error: "Failed to update user context" }, { status: 500 })
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
      category: "system",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: "credit-score-update",
      title: "Credit Score Updated",
      message: "Your TransUnion score has increased by 15 points!",
      type: "success",
      priority: "high",
      category: "credit",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    }
  ]
}
