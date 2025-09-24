import { NextRequest, NextResponse } from 'next/server'
import { sendTrainingCompletionEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email, name, courseName, pointsEarned, nextCourse, dashboardLink } = await request.json()

    if (!email || !name || !courseName || pointsEarned === undefined || !nextCourse) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, courseName, pointsEarned, nextCourse' },
        { status: 400 }
      )
    }

    const result = await sendTrainingCompletionEmail({
      to: email,
      name,
      courseName,
      pointsEarned: parseInt(pointsEarned),
      nextCourse,
      dashboardLink: dashboardLink || 'http://localhost:3001/mlm/dashboard'
    })

    return NextResponse.json({
      success: true,
      message: 'Training completion email sent successfully',
      messageId: result?.messageId || 'Email sent successfully'
    })
  } catch (error) {
    console.error('Training completion email test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send training completion email' },
      { status: 500 }
    )
  }
}
