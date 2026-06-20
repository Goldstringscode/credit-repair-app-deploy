import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { database } from '@/lib/database'
import { withRateLimit } from '@/lib/rate-limiter'
import { stripe } from '@/lib/stripe/config'

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
      if (!stripe) {
        return NextResponse.json({
          success: false,
          error: 'Stripe is not configured'
        }, { status: 500 })
      }

      // The client tokenizes the card directly with Stripe (CardElement +
      // stripe.createPaymentMethod) and only ever sends us the resulting
      // paymentMethodId. Raw card numbers and CVCs never reach this server.
      const body = await request.json()
      const { paymentMethodId } = body

      if (!paymentMethodId) {
        return NextResponse.json({
          success: false,
          error: 'paymentMethodId is required'
        }, { status: 400 })
      }

      // Get or create the Stripe customer for this user.
      let customerId = user.customerId
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
        })
        customerId = customer.id
        await database.updateUser(user.id, { customerId })
      }

      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      })

      if (!paymentMethod.card) {
        return NextResponse.json({
          success: false,
          error: 'Payment method is not a card'
        }, { status: 400 })
      }

      const existingCards = await database.getCards(user.id)
      const isFirstCard = existingCards.length === 0

      const card = await database.createCard({
        userId: user.id,
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
        isDefault: isFirstCard,
        name: paymentMethod.billing_details?.name || user.name,
        zipCode: paymentMethod.billing_details?.address?.postal_code || '',
        metadata: { stripePaymentMethodId: paymentMethod.id }
      })

      if (isFirstCard) {
        await stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: paymentMethod.id }
        })
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
