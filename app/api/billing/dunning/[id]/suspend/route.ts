import { NextRequest, NextResponse } from 'next/server'
import { dunningManager } from '@/lib/dunning-manager'
import { withRateLimit } from '@/lib/rate-limiter'

export const POST = withRateLimit(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const eventId = params.id

      console.log('⏸️ Suspending subscription for dunning event:', eventId)

      // Get the dunning event
      const event = dunningManager.getEvent(eventId)
      if (!event) {
        return NextResponse.json({
          success: false,
          error: 'Dunning event not found'
        }, { status: 404 })
      }

      // Suspend subscription
      const success = await dunningManager.suspendSubscription(
        event.subscriptionId,
        'Payment failure - manual suspension'
      )

      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Subscription suspended successfully'
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Subscription suspension failed'
        }, { status: 500 })
      }

    } catch (error: any) {
      console.error('❌ Subscription suspension failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Subscription suspension failed',
        message: error.message
      }, { status: 500 })
    }
  }
)


