import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { database } from '@/lib/database'
import { withRateLimit } from '@/lib/rate-limiter'

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const filters = {
        type: searchParams.get('type') || undefined,
        status: searchParams.get('status') || undefined,
        search: searchParams.get('search') || undefined
      }

      const mailPayments = await database.getMailPayments(user.id, filters)
      
      return NextResponse.json({
        success: true,
        mailPayments: mailPayments.map(payment => ({
          id: payment.id,
          type: payment.type,
          letterType: payment.letterType,
          amount: payment.amount,
          status: payment.status,
          trackingNumber: payment.trackingNumber,
          sentDate: payment.sentDate,
          expectedDelivery: payment.expectedDelivery,
          actualDelivery: payment.actualDelivery,
          recipient: payment.recipient,
          address: payment.address,
          description: payment.description,
          notes: payment.notes
        }))
      })

    } catch (error: any) {
      console.error('❌ Failed to fetch mail payments:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch mail payments',
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
      const { type, letterType, amount, recipient, address, description, notes } = body

      if (!type || !letterType || !amount || !recipient || !address || !description) {
        return NextResponse.json({
          success: false,
          error: 'Type, letter type, amount, recipient, address, and description are required'
        }, { status: 400 })
      }

      // Generate tracking number
      const trackingNumber = `${type.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      // Calculate expected delivery date (1-3 days for priority, 2-5 days for certified)
      const sentDate = new Date()
      const expectedDelivery = new Date(sentDate)
      expectedDelivery.setDate(expectedDelivery.getDate() + (type === 'priority' ? 2 : 4))

      const mailPayment = await database.createMailPayment({
        userId: user.id,
        type,
        letterType,
        amount: Math.round(amount * 100), // Convert to cents
        status: 'pending',
        trackingNumber,
        sentDate: sentDate.toISOString(),
        expectedDelivery: expectedDelivery.toISOString(),
        recipient,
        address,
        description,
        notes: notes || '',
        metadata: {}
      })

      return NextResponse.json({
        success: true,
        mailPayment: {
          id: mailPayment.id,
          type: mailPayment.type,
          letterType: mailPayment.letterType,
          amount: mailPayment.amount,
          status: mailPayment.status,
          trackingNumber: mailPayment.trackingNumber,
          sentDate: mailPayment.sentDate,
          expectedDelivery: mailPayment.expectedDelivery,
          recipient: mailPayment.recipient,
          address: mailPayment.address,
          description: mailPayment.description,
          notes: mailPayment.notes
        }
      })

    } catch (error: any) {
      console.error('❌ Failed to create mail payment:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create mail payment',
        message: error.message
      }, { status: 500 })
    }
  }),
  'general'
)