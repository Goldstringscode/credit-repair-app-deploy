import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { database } from '@/lib/database-config'
import { withRateLimit } from '@/lib/rate-limiter'
import { generateSamplePayments } from '@/lib/sample-data-generator'

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const filters = {
        status: searchParams.get('status') || undefined,
        type: searchParams.get('type') || undefined,
        search: searchParams.get('search') || undefined,
        dateFrom: searchParams.get('dateFrom') || undefined,
        dateTo: searchParams.get('dateTo') || undefined
      }

      let payments = await database.getPayments(user.id, filters)
      
      // If no payments exist, generate some sample data
      if (payments.length === 0) {
        payments = await generateSamplePayments(user.id)
      }
      
      return NextResponse.json({
        success: true,
        payments: payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          description: payment.description,
          date: payment.createdAt,
          type: payment.type,
          method: payment.method,
          transactionId: payment.transactionId
        }))
      })

    } catch (error: any) {
      console.error('❌ Failed to fetch user payments:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch payments',
        message: error.message
      }, { status: 500 })
    }
  }),
  'general'
)

export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const body = await request.json()
      const { amount, description, type = 'one_time', method = 'card' } = body

      if (!amount || !description) {
        return NextResponse.json({
          success: false,
          error: 'Amount and description are required'
        }, { status: 400 })
      }

      const payment = await database.createPayment({
        userId: user.id,
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        status: 'pending',
        description,
        type,
        method,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {}
      })

      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          description: payment.description,
          date: payment.createdAt,
          type: payment.type,
          method: payment.method,
          transactionId: payment.transactionId
        }
      })

    } catch (error: any) {
      console.error('❌ Failed to create payment:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create payment',
        message: error.message
      }, { status: 500 })
    }
  }),
  'general'
)