import { NextRequest, NextResponse } from 'next/server'
import { pushNotificationService } from '@/lib/push-notification-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'status':
        const status = pushNotificationService.getStatus()
        return NextResponse.json({
          success: true,
          status
        })

      case 'settings':
        const settings = pushNotificationService.getSettings()
        return NextResponse.json({
          success: true,
          settings
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error with push notification request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process push notification request' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, title, body: messageBody, options, category, userId } = body

    switch (action) {
      case 'request-permission':
        // Note: This can only be called from the client side
        return NextResponse.json({
          success: false,
          error: 'Permission requests must be made from the client side'
        }, { status: 400 })

      case 'send-notification':
        if (!title || !messageBody) {
          return NextResponse.json(
            { success: false, error: 'Title and body are required' },
            { status: 400 }
          )
        }

        const notification = pushNotificationService.showNotification(title, {
          body: messageBody,
          ...options
        })

        return NextResponse.json({
          success: true,
          message: 'Notification sent successfully',
          notification: notification ? {
            id: notification.tag || 'server-notification',
            title,
            body: messageBody
          } : null
        })

      case 'send-by-category':
        if (!category || !title || !messageBody) {
          return NextResponse.json(
            { success: false, error: 'Category, title, and body are required' },
            { status: 400 }
          )
        }

        const categoryNotification = await pushNotificationService.sendNotificationByCategory(
          category,
          title,
          messageBody,
          options || {}
        )

        return NextResponse.json({
          success: true,
          message: 'Category notification sent successfully',
          notification: categoryNotification
        })

      case 'update-settings':
        const { settings } = body
        if (!settings) {
          return NextResponse.json(
            { success: false, error: 'Settings are required' },
            { status: 400 }
          )
        }

        pushNotificationService.updateSettings(settings)
        return NextResponse.json({
          success: true,
          message: 'Settings updated successfully'
        })

      case 'test-notification':
        const testNotification = pushNotificationService.showNotification(
          'Test Notification 🧪',
          'This is a test notification to verify your push notification setup.',
          {
            icon: '/icons/notification-bell.png',
            tag: 'test',
            requireInteraction: false,
            actions: [
              {
                action: 'test-action',
                title: 'Got it!',
                icon: '/icons/check.png'
              }
            ]
          }
        )

        return NextResponse.json({
          success: true,
          message: 'Test notification sent',
          notification: testNotification ? {
            id: 'test-notification',
            title: 'Test Notification 🧪',
            body: 'This is a test notification to verify your push notification setup.'
          } : null
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error with push notification action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process push notification action' },
      { status: 500 }
    )
  }
}
























