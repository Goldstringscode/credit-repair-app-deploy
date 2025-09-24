import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/notification-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'metrics'
    const userId = searchParams.get('userId') || '550e8400-e29b-41d4-a716-446655440000'

    let data
    switch (type) {
      case 'metrics':
        data = await notificationService.getNotificationMetrics(userId)
        break
      case 'profile':
        data = await notificationService.getUserEngagementProfile(userId)
        break
      case 'insights':
        data = await notificationService.getNotificationInsights(userId)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid analytics type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      type,
      data
    })
  } catch (error) {
    console.error('Error fetching notification analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, notificationId, userId, actionType } = body

    if (!action || !notificationId) {
      return NextResponse.json(
        { success: false, error: 'Action and notificationId are required' },
        { status: 400 }
      )
    }

    const defaultUserId = '550e8400-e29b-41d4-a716-446655440000'
    const targetUserId = userId || defaultUserId

    switch (action) {
      case 'read':
        await notificationService.trackNotificationRead(notificationId, targetUserId)
        break
      case 'click':
        await notificationService.trackNotificationClick(notificationId, actionType, targetUserId)
        break
      case 'dismiss':
        await notificationService.trackNotificationDismiss(notificationId, targetUserId)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully tracked ${action} for notification ${notificationId}`
    })
  } catch (error) {
    console.error('Error tracking notification analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track analytics' },
      { status: 500 }
    )
  }
}

