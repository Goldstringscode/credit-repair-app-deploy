import { NextRequest, NextResponse } from 'next/server'
import { sendRankAdvancementEmail } from '@/lib/email-service-server'

export async function POST(request: NextRequest) {
  try {
    const { email, name, oldRank, newRank, benefits, dashboardLink } = await request.json()

    if (!email || !name || !oldRank || !newRank || !benefits) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, oldRank, newRank, benefits' },
        { status: 400 }
      )
    }

    // Ensure benefits is an array
    const benefitsArray = Array.isArray(benefits) ? benefits : benefits.split('\n').filter((b: string) => b.trim())

    const result = await sendRankAdvancementEmail({
      to: email,
      name,
      oldRank,
      newRank,
      benefits: benefitsArray,
      dashboardLink: dashboardLink || 'http://localhost:3001/mlm/dashboard'
    })

    return NextResponse.json({
      success: true,
      message: 'Rank advancement email sent successfully',
      messageId: result?.messageId || 'Email sent successfully'
    })
  } catch (error) {
    console.error('Rank advancement email test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send rank advancement email' },
      { status: 500 }
    )
  }
}
