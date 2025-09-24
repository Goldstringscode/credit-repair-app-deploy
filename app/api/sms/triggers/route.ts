import { NextRequest, NextResponse } from 'next/server'
import { smsNotificationService } from '@/lib/sms-notification-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const event = searchParams.get('event')

    console.log(`📱 SMS Triggers API: GET request${event ? ` for event ${event}` : ''}`)

    if (event) {
      const triggers = smsNotificationService.getTriggersByEvent(event)
      return NextResponse.json({
        success: true,
        triggers
      })
    } else {
      const triggers = smsNotificationService.getTriggers()
      return NextResponse.json({
        success: true,
        triggers
      })
    }
  } catch (error) {
    console.error('❌ SMS Triggers API Error:', error)
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    console.log(`📱 SMS Triggers API: ${action} request`)

    switch (action) {
      case 'create_trigger':
        const { name, event, templateId, conditions, isActive } = data
        
        if (!name || !event || !templateId) {
          return NextResponse.json(
            { success: false, error: 'Name, event, and template ID are required' },
            { status: 400 }
          )
        }

        const newTrigger = smsNotificationService.createTrigger({
          name,
          event,
          templateId,
          conditions: conditions || {},
          isActive: isActive !== false
        })

        return NextResponse.json({
          success: true,
          trigger: newTrigger
        })

      case 'update_trigger':
        const { id, updates } = data
        
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'Trigger ID is required' },
            { status: 400 }
          )
        }

        const updatedTrigger = smsNotificationService.updateTrigger(id, updates)
        if (!updatedTrigger) {
          return NextResponse.json(
            { success: false, error: 'Trigger not found' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          trigger: updatedTrigger
        })

      case 'delete_trigger':
        const { triggerId } = data
        
        if (!triggerId) {
          return NextResponse.json(
            { success: false, error: 'Trigger ID is required' },
            { status: 400 }
          )
        }

        const deleted = smsNotificationService.deleteTrigger(triggerId)
        if (!deleted) {
          return NextResponse.json(
            { success: false, error: 'Trigger not found' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Trigger deleted successfully'
        })

      case 'test_trigger':
        const { testTriggerId, testData } = data
        
        if (!testTriggerId) {
          return NextResponse.json(
            { success: false, error: 'Trigger ID is required' },
            { status: 400 }
          )
        }

        const triggers = smsNotificationService.getTriggers()
        const trigger = triggers.find(t => t.id === testTriggerId)
        
        if (!trigger) {
          return NextResponse.json(
            { success: false, error: 'Trigger not found' },
            { status: 404 }
          )
        }

        // Execute the trigger manually
        await smsNotificationService.processEvent(trigger.event, testData || {})
        
        return NextResponse.json({
          success: true,
          message: 'Trigger test executed successfully'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ SMS Triggers API Error:', error)
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
