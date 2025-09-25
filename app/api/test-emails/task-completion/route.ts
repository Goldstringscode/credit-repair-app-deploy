import { NextRequest, NextResponse } from 'next/server'
import { sendTaskCompletionEmail } from '@/lib/email-service-server'

export async function POST(request: NextRequest) {
  try {
    const { email, name, taskName, pointsEarned, nextTask, dashboardLink } = await request.json()

    if (!email || !name || !taskName || pointsEarned === undefined || !nextTask) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, taskName, pointsEarned, nextTask' },
        { status: 400 }
      )
    }

    const result = await sendTaskCompletionEmail({
      to: email,
      name,
      taskName,
      pointsEarned: parseInt(pointsEarned),
      nextTask,
      dashboardLink: dashboardLink || 'http://localhost:3001/mlm/dashboard'
    })

    return NextResponse.json({
      success: true,
      message: 'Task completion email sent successfully',
      messageId: result?.messageId || 'Email sent successfully'
    })
  } catch (error) {
    console.error('Task completion email test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send task completion email' },
      { status: 500 }
    )
  }
}
