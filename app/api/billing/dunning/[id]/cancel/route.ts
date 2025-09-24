import { NextRequest, NextResponse } from 'next/server'
import { dunningManager } from '@/lib/dunning-manager'
import { withRateLimit } from '@/lib/rate-limiter'

export const POST = withRateLimit(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const eventId = params.id

      console.log('❌ Canceling subscription for dunning event:', eventId)

      // Get the dunning event
      const event = dunningManager.getEvent(eventId)
      if (!event) {
        return NextResponse.json({
          success: false,
          error: 'Dunning event not found'
        }, { status: 404 })
      }

      // Cancel subscription
      const success = await dunningManager.cancelSubscription(
        event.subscriptionId,
        'Persistent payment failure - manual cancellation'
      )

      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Subscription canceled successfully'
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Subscription cancellation failed'
        }, { status: 500 })
      }

    } catch (error: any) {
      console.error('❌ Subscription cancellation failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Subscription cancellation failed',
        message: error.message
      }, { status: 500 })
    }
  }
)


