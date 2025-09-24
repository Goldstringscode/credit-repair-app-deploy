import { NextRequest, NextResponse } from 'next/server'
import { 
  scheduleEmail, 
  triggerAutomation, 
  getScheduledEmails, 
  getAutomations, 
  cancelEmail, 
  getEmailStatus 
} from '@/lib/email-scheduler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    console.log(`📅 Email Scheduler API: ${action} request`)

    switch (action) {
      case 'schedule':
        const { templateId, recipientEmail, recipientName, variables, scheduledFor, maxRetries = 3 } = data
        
        if (!templateId || !recipientEmail || !recipientName || !scheduledFor) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: templateId, recipientEmail, recipientName, scheduledFor' },
            { status: 400 }
          )
        }

        const emailId = scheduleEmail({
          templateId,
          recipientEmail,
          recipientName,
          variables: variables || {},
          scheduledFor: new Date(scheduledFor),
          maxRetries
        })

        return NextResponse.json({
          success: true,
          emailId,
          message: 'Email scheduled successfully'
        })

      case 'trigger_automation':
        const { automationId, recipientEmail: autoRecipientEmail, recipientName: autoRecipientName, variables: autoVariables } = data
        
        if (!automationId || !autoRecipientEmail || !autoRecipientName) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: automationId, recipientEmail, recipientName' },
            { status: 400 }
          )
        }

        const triggeredEmailId = triggerAutomation(automationId, autoRecipientEmail, autoRecipientName, autoVariables || {})
        
        if (!triggeredEmailId) {
          return NextResponse.json(
            { success: false, error: 'Failed to trigger automation' },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          emailId: triggeredEmailId,
          message: 'Automation triggered successfully'
        })

      case 'cancel':
        const { emailId: cancelEmailId } = data
        
        if (!cancelEmailId) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: emailId' },
            { status: 400 }
          )
        }

        const cancelled = cancelEmail(cancelEmailId)
        
        if (!cancelled) {
          return NextResponse.json(
            { success: false, error: 'Email not found or cannot be cancelled' },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Email cancelled successfully'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Email Scheduler API Error:', error)
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
    const action = searchParams.get('action') || 'list_emails'
    const emailId = searchParams.get('emailId')

    console.log(`📅 Email Scheduler API: GET request - ${action}`)

    switch (action) {
      case 'list_emails':
        const emails = getScheduledEmails()
        return NextResponse.json({
          success: true,
          emails: emails.map(email => ({
            id: email.id,
            templateId: email.templateId,
            recipientEmail: email.recipientEmail,
            recipientName: email.recipientName,
            scheduledFor: email.scheduledFor,
            status: email.status,
            createdAt: email.createdAt,
            sentAt: email.sentAt,
            retryCount: email.retryCount,
            maxRetries: email.maxRetries
          }))
        })

      case 'list_automations':
        const automations = getAutomations()
        return NextResponse.json({
          success: true,
          automations: automations.map(automation => ({
            id: automation.id,
            name: automation.name,
            description: automation.description,
            trigger: automation.trigger,
            triggerConditions: automation.triggerConditions,
            templateId: automation.templateId,
            delayMinutes: automation.delayMinutes,
            isActive: automation.isActive,
            createdAt: automation.createdAt,
            lastTriggered: automation.lastTriggered,
            triggerCount: automation.triggerCount
          }))
        })

      case 'email_status':
        if (!emailId) {
          return NextResponse.json(
            { success: false, error: 'Missing required parameter: emailId' },
            { status: 400 }
          )
        }

        const emailStatus = getEmailStatus(emailId)
        
        if (!emailStatus) {
          return NextResponse.json(
            { success: false, error: 'Email not found' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          email: {
            id: emailStatus.id,
            templateId: emailStatus.templateId,
            recipientEmail: emailStatus.recipientEmail,
            recipientName: emailStatus.recipientName,
            scheduledFor: emailStatus.scheduledFor,
            status: emailStatus.status,
            createdAt: emailStatus.createdAt,
            sentAt: emailStatus.sentAt,
            errorMessage: emailStatus.errorMessage,
            retryCount: emailStatus.retryCount,
            maxRetries: emailStatus.maxRetries
          }
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Email Scheduler API Error:', error)
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
