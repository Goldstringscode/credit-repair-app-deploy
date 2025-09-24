import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { database } from '@/lib/database'
import { withRateLimit } from '@/lib/rate-limiter'

export const PATCH = withRateLimit(
  requireAuth(async (request: NextRequest, user, { params }) => {
    try {
      const { id } = params

      // Verify the card belongs to the user
      const cards = await database.getCards(user.id)
      const card = cards.find(c => c.id === id)
      
      if (!card) {
        return NextResponse.json({
          success: false,
          error: 'Card not found'
        }, { status: 404 })
      }

      const success = await database.setDefaultCard(user.id, id)
      
      if (!success) {
        return NextResponse.json({
          success: false,
          error: 'Failed to set default card'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Default card updated successfully'
      })

    } catch (error: any) {
      console.error('❌ Failed to set default card:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to set default card',
        message: error.message
      }, { status: 500 })
    }
  }),
  'general'
)
