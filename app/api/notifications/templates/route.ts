import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/notification-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let templates
    if (category) {
      templates = notificationService.getTemplatesByCategory(category)
    } else {
      templates = notificationService.getAllTemplates()
    }

    return NextResponse.json({
      success: true,
      templates,
      count: templates.length
    })
  } catch (error) {
    console.error('Error fetching notification templates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId, data } = body

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      )
    }

    // Create notification from template
    await notificationService.createNotificationFromTemplate(templateId, data || {})

    return NextResponse.json({
      success: true,
      message: 'Notification created from template successfully'
    })
  } catch (error) {
    console.error('Error creating notification from template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create notification from template' },
      { status: 500 }
    )
  }
}

