import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { database } from '@/lib/database'
import { withRateLimit } from '@/lib/rate-limiter'

export const PATCH = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const url = new URL(request.url)
      const pathParts = url.pathname.split('/')
      const id = pathParts[pathParts.length - 1] // Get the ID from the URL path
      const body = await request.json()

      // Verify the card belongs to the user
      const cards = await database.getCards(user.id)
      const card = cards.find(c => c.id === id)
      
      if (!card) {
        return NextResponse.json({
          success: false,
          error: 'Card not found'
        }, { status: 404 })
      }

      const updatedCard = await database.updateCard(id, {
        ...body,
        updatedAt: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        card: {
          id: updatedCard.id,
          last4: updatedCard.last4,
          brand: updatedCard.brand,
          expMonth: updatedCard.expMonth,
          expYear: updatedCard.expYear,
          isDefault: updatedCard.isDefault,
          name: updatedCard.name
        }
      })

    } catch (error: any) {
      console.error('❌ Failed to update card:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update card',
        message: error.message
      }, { status: 500 })
    }
  }),
  'general'
)

export const DELETE = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const url = new URL(request.url)
      const pathParts = url.pathname.split('/')
      const id = pathParts[pathParts.length - 1] // Get the ID from the URL path

      // Verify the card belongs to the user
      const cards = await database.getCards(user.id)
      const card = cards.find(c => c.id === id)
      
      if (!card) {
        return NextResponse.json({
          success: false,
          error: 'Card not found'
        }, { status: 404 })
      }

      if (card.isDefault) {
        return NextResponse.json({
          success: false,
          error: 'Cannot delete default card. Set another card as default first.'
        }, { status: 400 })
      }

      const deleted = await database.deleteCard(id)
      
      if (!deleted) {
        return NextResponse.json({
          success: false,
          error: 'Failed to delete card'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Card deleted successfully'
      })

    } catch (error: any) {
      console.error('❌ Failed to delete card:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete card',
        message: error.message
      }, { status: 500 })
    }
  }),
  'general'
)