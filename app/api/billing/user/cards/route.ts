import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { database } from '@/lib/database'
import { withRateLimit } from '@/lib/rate-limiter'

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const cards = await database.getCards(user.id)
      
      return NextResponse.json({
        success: true,
        cards: cards.map(card => ({
          id: card.id,
          last4: card.last4,
          brand: card.brand,
          expMonth: card.expMonth,
          expYear: card.expYear,
          isDefault: card.isDefault,
          name: card.name
        }))
      })

    } catch (error: any) {
      console.error('❌ Failed to fetch user cards:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch cards',
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
      const { cardNumber, expiryMonth, expiryYear, cvc, name, zipCode } = body

      if (!cardNumber || !expiryMonth || !expiryYear || !cvc || !name || !zipCode) {
        return NextResponse.json({
          success: false,
          error: 'All card fields are required'
        }, { status: 400 })
      }

      // Basic validation
      const cleanCardNumber = cardNumber.replace(/\s/g, '')
      if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        return NextResponse.json({
          success: false,
          error: 'Invalid card number'
        }, { status: 400 })
      }

      if (expiryMonth < 1 || expiryMonth > 12) {
        return NextResponse.json({
          success: false,
          error: 'Invalid expiry month'
        }, { status: 400 })
      }

      const currentYear = new Date().getFullYear()
      if (expiryYear < currentYear) {
        return NextResponse.json({
          success: false,
          error: 'Card has expired'
        }, { status: 400 })
      }

      // Determine card brand
      const getCardBrand = (number: string) => {
        if (number.startsWith('4')) return 'Visa'
        if (number.startsWith('5')) return 'Mastercard'
        if (number.startsWith('3')) return 'American Express'
        return 'Card'
      }

      const card = await database.createCard({
        userId: user.id,
        last4: cleanCardNumber.slice(-4),
        brand: getCardBrand(cleanCardNumber),
        expMonth: parseInt(expiryMonth),
        expYear: parseInt(expiryYear),
        isDefault: false, // Will be set as default if it's the first card
        name,
        zipCode,
        metadata: {}
      })

      // If this is the first card, set it as default
      const allCards = await database.getCards(user.id)
      if (allCards.length === 1) {
        await database.setDefaultCard(user.id, card.id)
        card.isDefault = true
      }

      return NextResponse.json({
        success: true,
        card: {
          id: card.id,
          last4: card.last4,
          brand: card.brand,
          expMonth: card.expMonth,
          expYear: card.expYear,
          isDefault: card.isDefault,
          name: card.name
        }
      })

    } catch (error: any) {
      console.error('❌ Failed to create card:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create card',
        message: error.message
      }, { status: 500 })
    }
  }),
  'general'
)