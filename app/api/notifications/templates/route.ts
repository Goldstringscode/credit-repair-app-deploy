import { NextRequest, NextResponse } from 'next/server'
import { notificationTemplateService } from '@/lib/notification-templates'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let templates
    if (category) {
      templates = notificationTemplateService.getTemplatesByCategory(category)
    } else {
      templates = notificationTemplateService.getAllTemplates()
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

    // Get the template
    const template = notificationTemplateService.getTemplate(templateId)
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Validate template data
    const validation = notificationTemplateService.validateTemplateData(templateId, data || {})
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid template data',
          missing: validation.missing
        },
        { status: 400 }
      )
    }

    // For now, just return success since we don't have a notification creation method
    // In a real implementation, this would create and send the notification
    return NextResponse.json({
      success: true,
      message: 'Template validated successfully',
      template: {
        id: template.id,
        name: template.name,
        title: template.title,
        message: template.message
      }
    })
  } catch (error) {
    console.error('Error creating notification from template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create notification from template' },
      { status: 500 }
    )
  }
}

