import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { getStripeClient } from '@/lib/stripe-client'
import { getSupabaseClient } from '@/lib/supabase-client'
import { withRateLimit } from '@/lib/rate-limiter'

export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      const user = getAuthenticatedUser(request)
      if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      const supabase = getSupabaseClient()
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.userId)
        .in('status', ['active', 'trialing', 'past_due'])
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !subscription?.stripe_customer_id) {
        return NextResponse.json({ success: false, error: 'No active subscription found' }, { status: 404 })
      }

      const stripe = getStripeClient()
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      })

      return NextResponse.json({ success: true, url: session.url })
    } catch (error: any) {
      console.error('❌ Failed to create billing portal session:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create portal session', message: error.message },
        { status: 500 }
      )
    }
  },
  'general'
)
