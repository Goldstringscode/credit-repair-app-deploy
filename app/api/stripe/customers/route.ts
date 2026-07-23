import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe-client'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getSupabaseClient } from '@/lib/supabase-client'
import { withRateLimit } from '@/lib/rate-limiter'
import { withValidation } from '@/lib/validation-middleware'
import { z } from 'zod'

// Validation schema for customer creation
const createCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.string().length(2)
  }).optional(),
  metadata: z.record(z.string()).optional()
})

/**
 * POST /api/billing/../stripe/customers
 *
 * Creates the Stripe customer for the authenticated user's billing profile,
 * or reuses their existing one. Previously this endpoint had no auth check
 * at all and never saved the resulting Stripe customer id anywhere, which
 * meant every other billing endpoint (subscription lookup, billing portal)
 * had no reliable way to find "this user's" Stripe customer afterward.
 */
export const POST = withRateLimit(
  withValidation({
    body: createCustomerSchema
  })(
    async (request: NextRequest, validatedData: any) => {
      try {
        const authUser = getAuthenticatedUser(request)
        if (!authUser) {
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = getSupabaseClient()
        const stripe = getStripeClient()
        const body = validatedData.body

        const { data: userRow } = await supabase
          .from('users')
          .select('stripe_customer_id')
          .eq('id', authUser.userId)
          .maybeSingle()

        // Reuse the existing Stripe customer if this user already has one —
        // keeps billing history, cards, and subscriptions on a single
        // customer instead of fragmenting across duplicates on every checkout.
        if (userRow?.stripe_customer_id) {
          try {
            const existing = await stripe.customers.retrieve(userRow.stripe_customer_id)
            if (!('deleted' in existing && existing.deleted)) {
              const updated = await stripe.customers.update(userRow.stripe_customer_id, {
                email: body.email,
                name: body.name,
                phone: body.phone,
                address: body.address,
                metadata: { ...body.metadata, userId: authUser.userId },
              })
              return NextResponse.json({
                success: true,
                customer: {
                  id: updated.id,
                  email: updated.email,
                  name: updated.name,
                  phone: updated.phone,
                  address: updated.address,
                  created: updated.created,
                },
              })
            }
          } catch {
            // Stored customer id is stale/invalid (e.g. deleted in Stripe) —
            // fall through and create a fresh one below.
          }
        }

        const customer = await stripe.customers.create({
          email: body.email,
          name: body.name,
          phone: body.phone,
          address: body.address,
          metadata: { ...body.metadata, userId: authUser.userId },
        })

        const { error: saveError } = await supabase
          .from('users')
          .update({ stripe_customer_id: customer.id })
          .eq('id', authUser.userId)

        if (saveError) {
          console.error('Failed to save stripe_customer_id:', saveError)
        }

        return NextResponse.json({
          success: true,
          customer: {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            created: customer.created,
          },
        })
      } catch (error: any) {
        console.error('❌ Customer creation failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to create customer',
          message: error.message
        }, { status: 500 })
      }
    }
  )
)
