import { NextRequest, NextResponse } from 'next/server'
import { dunningManager } from '@/lib/dunning-manager'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

// Validation schemas
const processPaymentFailureSchema = z.object({
  subscriptionId: z.string().min(1),
  customerId: z.string().min(1),
  amount: z.number().min(0),
  currency: z.string().length(3),
  failureReason: z.string().min(1),
  metadata: z.record(z.any()).optional()
})

const processPaymentSuccessSchema = z.object({
  subscriptionId: z.string().min(1),
  customerId: z.string().min(1),
  amount: z.number().min(0),
  currency: z.string().length(3),
  metadata: z.record(z.any()).optional()
})

export const POST = withRateLimit(
  withValidation({
    body: z.union([
      z.object({
        action: z.literal('process_failure'),
        subscriptionId: z.string().min(1),
        customerId: z.string().min(1),
        amount: z.number().min(0),
        currency: z.string().length(3),
        failureReason: z.string().min(1),
        metadata: z.record(z.any()).optional()
      }),
      z.object({
        action: z.literal('process_success'),
        subscriptionId: z.string().min(1),
        customerId: z.string().min(1),
        amount: z.number().min(0),
        currency: z.string().length(3),
        metadata: z.record(z.any()).optional()
      })
    ])
  })(
    async (request: NextRequest, validatedData?: any) => {
      try {
        const body = validatedData?.body
        const action = body.action

        if (action === 'process_failure') {
          const parsedData = body
          
          console.log('🔔 Processing payment failure for subscription:', parsedData.subscriptionId)
          const event = await dunningManager.processPaymentFailure(
            parsedData.subscriptionId,
            parsedData.customerId,
            parsedData.amount,
            parsedData.currency,
            parsedData.failureReason,
            parsedData.metadata
          )

          return NextResponse.json({
            success: true,
            event: {
              id: event.id,
              subscriptionId: event.subscriptionId,
              customerId: event.customerId,
              attemptNumber: event.attemptNumber,
              eventType: event.eventType,
              amount: event.amount,
              currency: event.currency,
              failureReason: event.failureReason,
              nextRetryAt: event.nextRetryAt,
              status: event.status,
              createdAt: event.createdAt
            }
          })
        }

        if (action === 'process_success') {
          const parsedData = body
          
          console.log('✅ Processing payment success for subscription:', parsedData.subscriptionId)
          await dunningManager.processPaymentSuccess(
            parsedData.subscriptionId,
            parsedData.customerId,
            parsedData.amount,
            parsedData.currency,
            parsedData.metadata
          )

          return NextResponse.json({
            success: true,
            message: 'Payment success processed successfully'
          })
        }

        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })

      } catch (error: any) {
        console.error('❌ Dunning action failed:', error)
        console.error('Error stack:', error.stack)
        return NextResponse.json({
          success: false,
          error: 'Dunning action failed',
          message: error.message,
          details: error.stack
        }, { status: 500 })
      }
    }
  )
)

export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const subscriptionId = searchParams.get('subscriptionId')
      const type = searchParams.get('type')

      if (type === 'analytics') {
        console.log('📊 Fetching dunning analytics')
        const analytics = await dunningManager.getDunningAnalytics()
        
        return NextResponse.json({
          success: true,
          analytics
        })
      }

      if (subscriptionId) {
        console.log('📊 Fetching dunning events for subscription:', subscriptionId)
        const events = await dunningManager.getSubscriptionEvents(subscriptionId)
        
        return NextResponse.json({
          success: true,
          events: events.map(event => ({
            id: event.id,
            subscriptionId: event.subscriptionId,
            customerId: event.customerId,
            attemptNumber: event.attemptNumber,
            eventType: event.eventType,
            amount: event.amount,
            currency: event.currency,
            failureReason: event.failureReason,
            nextRetryAt: event.nextRetryAt,
            status: event.status,
            metadata: event.metadata,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt
          }))
        })
      }

      // Return all events and statistics by default
      console.log('📊 Fetching all dunning data')
      const allEvents = await dunningManager.getAllEvents()
      const statistics = await dunningManager.getDunningStatistics()
      
      return NextResponse.json({
        success: true,
        events: allEvents.map(event => ({
          id: event.id,
          subscriptionId: event.subscriptionId,
          customerId: event.customerId,
          attemptNumber: event.attemptNumber,
          eventType: event.eventType,
          amount: event.amount,
          currency: event.currency,
          failureReason: event.failureReason,
          nextRetryAt: event.nextRetryAt,
          status: event.status,
          metadata: event.metadata,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt
        })),
        statistics
      })

    } catch (error: any) {
      console.error('❌ Failed to fetch dunning data:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch dunning data',
        message: error.message
      }, { status: 500 })
    }
  }
)


