import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const TIER_CONFIG: Record<string, { name: string; amount: number }> = {
  free:         { name: 'Free',         amount: 0 },
  basic:        { name: 'Basic',        amount: 39 },
  professional: { name: 'Professional', amount: 79 },
  premium:      { name: 'Premium',      amount: 129 },
  enterprise:   { name: 'Enterprise',   amount: 299 },
}

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: u } = await db().from('users')
    .select('subscription_tier, subscription_status, email, created_at')
    .eq('id', user.id).maybeSingle()

  const { data: m } = await db().from('mlm_users')
    .select('id, mlm_code, rank, status, join_date, team_id')
    .eq('user_id', user.id).maybeSingle()

  if (!m) return NextResponse.json({ error: 'No MLM account' }, { status: 404 })

  const tier = u?.subscription_tier || 'free'
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.free
  const isActive = u?.subscription_status === 'active'

  // Build BillingInfo shape that matches the billing page interface exactly
  return NextResponse.json({
    success: true,
    subscription: isActive ? {
      id: user.id,
      status: u?.subscription_status || 'inactive',
      tierId: tier,
      tierName: cfg.name,
      billingCycle: 'monthly',
      amount: cfg.amount,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
    } : null,
    paymentMethod: null,
    // Extra MLM info for context
    mlmCode: m.mlm_code,
    mlmStatus: m.status,
    joinDate: m.join_date,
    canCreateTeam: ['premium', 'enterprise'].includes(tier),
  })
}