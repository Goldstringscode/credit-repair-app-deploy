import { NextRequest, NextResponse } from 'next/server'
import { notificationPrioritySystem } from '@/lib/notification-priority-system'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'stats'
    const userId = searchParams.get('userId') || '550e8400-e29b-41d4-a716-446655440000'

    switch (action) {
      case 'stats':
        const stats = notificationPrioritySystem.getPriorityStats()
        return NextResponse.json({
          success: true,
          stats
        })

      case 'rules':
        const rules = notificationPrioritySystem.getAllRules()
        return NextResponse.json({
          success: true,
          rules
        })

      case 'user-context':
        const userContext = notificationPrioritySystem.getUserContextData(userId)
        return NextResponse.json({
          success: true,
          userContext
        })

      case 'rules-by-priority':
        const priority = searchParams.get('priority') as 'low' | 'medium' | 'high'
        if (!priority) {
          return NextResponse.json(
            { success: false, error: 'Priority parameter is required' },
            { status: 400 }
          )
        }
        const priorityRules = notificationPrioritySystem.getRulesByPriority(priority)
        return NextResponse.json({
          success: true,
          rules: priorityRules
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error with priority system request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process priority system request' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, notification, userId, rule, userContext } = body

    switch (action) {
      case 'calculate-priority':
        if (!notification || !userId) {
          return NextResponse.json(
            { success: false, error: 'Notification and userId are required' },
            { status: 400 }
          )
        }

        const priorityScore = notificationPrioritySystem.calculatePriority(notification, userId)
        return NextResponse.json({
          success: true,
          priority: priorityScore
        })

      case 'add-rule':
        if (!rule) {
          return NextResponse.json(
            { success: false, error: 'Rule is required' },
            { status: 400 }
          )
        }

        notificationPrioritySystem.addRule(rule)
        return NextResponse.json({
          success: true,
          message: 'Priority rule added successfully'
        })

      case 'remove-rule':
        const { ruleId } = body
        if (!ruleId) {
          return NextResponse.json(
            { success: false, error: 'Rule ID is required' },
            { status: 400 }
          )
        }

        const removed = notificationPrioritySystem.removeRule(ruleId)
        return NextResponse.json({
          success: removed,
          message: removed ? 'Priority rule removed successfully' : 'Rule not found'
        })

      case 'update-user-context':
        if (!userId || !userContext) {
          return NextResponse.json(
            { success: false, error: 'User ID and user context are required' },
            { status: 400 }
          )
        }

        notificationPrioritySystem.updateUserContext(userId, userContext)
        return NextResponse.json({
          success: true,
          message: 'User context updated successfully'
        })

      case 'test-priority':
        const testNotification = notification || {
          category: 'credit',
          type: 'success',
          title: 'Credit Score Improved!',
          message: 'Your credit score has increased by 25 points'
        }
        const testUserId = userId || '550e8400-e29b-41d4-a716-446655440000'
        
        const testPriority = notificationPrioritySystem.calculatePriority(testNotification, testUserId)
        return NextResponse.json({
          success: true,
          notification: testNotification,
          priority: testPriority
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error with priority system action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process priority system action' },
      { status: 500 }
    )
  }
}













