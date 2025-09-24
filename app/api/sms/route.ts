import { NextRequest, NextResponse } from 'next/server'
import { smsService } from '@/lib/sms-service'
import { smsNotificationService } from '@/lib/sms-notification-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    console.log(`📱 SMS API: ${action} request`)

    switch (action) {
      case 'send_sms':
        const { to, message, from, mediaUrl } = data
        if (!to || !message) {
          return NextResponse.json(
            { success: false, error: 'Recipient phone number and message are required' },
            { status: 400 }
          )
        }

        const result = await smsService.sendSMS({
          to,
          body: message,
          from,
          mediaUrl
        })

        return NextResponse.json(result)

      case 'send_template':
        const { phoneNumber, templateId, variables } = data
        if (!phoneNumber || !templateId) {
          return NextResponse.json(
            { success: false, error: 'Phone number and template ID are required' },
            { status: 400 }
          )
        }

        const templateResult = await smsService.sendTemplateSMS(
          phoneNumber,
          templateId,
          variables || {}
        )

        return NextResponse.json(templateResult)

      case 'send_bulk':
        const { messages } = data
        if (!Array.isArray(messages) || messages.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Messages array is required' },
            { status: 400 }
          )
        }

        const bulkResults = await smsService.sendBulkSMS(messages)
        return NextResponse.json({
          success: true,
          results: bulkResults,
          totalSent: bulkResults.filter(r => r.success).length,
          totalFailed: bulkResults.filter(r => !r.success).length
        })

      case 'trigger_event':
        const { event, eventData } = data
        if (!event) {
          return NextResponse.json(
            { success: false, error: 'Event name is required' },
            { status: 400 }
          )
        }

        await smsNotificationService.processEvent(event, eventData || {})
        return NextResponse.json({ success: true, message: 'Event processed successfully' })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ SMS API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'get_templates'

    console.log(`📱 SMS API: GET request - ${action}`)

    switch (action) {
      case 'get_templates':
        const templates = await smsService.getAllTemplates()
        return NextResponse.json({
          success: true,
          templates: templates.map(t => ({
            id: t.id,
            name: t.name,
            category: t.category,
            variables: t.variables,
            isActive: t.isActive,
            usageCount: t.usageCount
          }))
        })

      case 'get_templates_by_category':
        const category = searchParams.get('category')
        if (!category) {
          return NextResponse.json(
            { success: false, error: 'Category parameter is required' },
            { status: 400 }
          )
        }

        const categoryTemplates = await smsService.getTemplatesByCategory(category)
        return NextResponse.json({
          success: true,
          templates: categoryTemplates
        })

      case 'get_triggers':
        const triggers = smsNotificationService.getTriggers()
        return NextResponse.json({
          success: true,
          triggers
        })

      case 'get_logs':
        const limit = parseInt(searchParams.get('limit') || '100')
        const logs = smsNotificationService.getLogs(limit)
        return NextResponse.json({
          success: true,
          logs
        })

      case 'get_stats':
        const stats = smsNotificationService.getStats()
        const usageStats = await smsService.getUsageStats()
        return NextResponse.json({
          success: true,
          stats: {
            ...stats,
            ...usageStats
          }
        })

      case 'get_message_status':
        const messageId = searchParams.get('messageId')
        if (!messageId) {
          return NextResponse.json(
            { success: false, error: 'Message ID is required' },
            { status: 400 }
          )
        }

        const messageStatus = await smsService.getMessageStatus(messageId)
        return NextResponse.json({
          success: true,
          message: messageStatus
        })

      case 'validate_phone':
        const phoneNumber = searchParams.get('phoneNumber')
        if (!phoneNumber) {
          return NextResponse.json(
            { success: false, error: 'Phone number is required' },
            { status: 400 }
          )
        }

        const isValid = smsService.validatePhoneNumber(phoneNumber)
        const formatted = isValid ? smsService.formatPhoneNumber(phoneNumber) : null

        return NextResponse.json({
          success: true,
          isValid,
          formatted
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ SMS API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
