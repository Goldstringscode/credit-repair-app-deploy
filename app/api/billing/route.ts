import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const PLANS: Record<string, { name: string; price: number; features: string[] }> = {
  free:         { name: 'Free',         price: 0,   features: ['1 credit report', '3 AI letters', 'Basic support'] },
  basic:        { name: 'Basic',        price: 39,  features: ['3 credit reports/mo', '10 AI letters', 'Email support'] },
  professional: { name: 'Professional', price: 79,  features: ['Unlimited reports', 'Unlimited letters', 'Priority support', 'Certified mail'] },
  premium:      { name: 'Premium',      price: 129, features: ['Everything in Pro', 'MLM access', 'Attorney referrals', 'Dedicated advisor'] },
  enterprise:   { name: 'Enterprise',   price: 299, features: ['Everything in Premium', 'White label', 'API access', 'Custom integrations'] },
}

export async function GET(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser(request)
    if (!isAuthenticated || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await db().from('users')
      .select('subscription_tier, subscription_status, email, created_at')
      .eq('id', user.id).maybeSingle()

    const tier = userData?.subscription_tier || 'free'
    const plan = PLANS[tier] || PLANS.free
    const isActive = userData?.subscription_status === 'active'

    // Get invoices from Stripe via our existing billing endpoints
    // For now return subscription info from DB
    return NextResponse.json({
      success: true,
      currentPlan: tier,
      planName: plan.name,
      planPrice: plan.price,
      planFeatures: plan.features,
      status: userData?.subscription_status || 'inactive',
      email: userData?.email,
      isActive,
      subscription: isActive ? {
        id: user.id,
        status: userData?.subscription_status,
        tierId: tier,
        tierName: plan.name,
        billingCycle: 'monthly',
        amount: plan.price,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
      } : null,
    })
  } catch (error) {
    console.error('Billing API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch billing info' }, { status: 500 })
  }
}