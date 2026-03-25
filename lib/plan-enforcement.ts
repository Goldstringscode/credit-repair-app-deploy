import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, User } from './auth'
import { getSupabaseClient } from './supabase-client'

export type PlanTier = 'free' | 'basic' | 'premium'

const PLAN_RANK: Record<string, number> = {
  free: 0,
  basic: 1,
  professional: 1, // treat 'professional' as equivalent to 'basic'
  premium: 2,
  enterprise: 2,  // treat 'enterprise' as equivalent to 'premium'
  executive: 2,   // treat 'executive' as equivalent to 'premium'
}

/**
 * Returns the numeric rank for a given plan id string.
 * Unknown plans default to 'free' (0).
 */
function rankOf(planId: string | null | undefined): number {
  if (!planId) return 0
  return PLAN_RANK[planId.toLowerCase()] ?? 0
}

/**
 * Look up the active plan for the authenticated user.
 * Returns null when no active subscription exists (treated as 'free').
 */
async function getActivePlanId(user: User): Promise<string | null> {
  try {
    const supabase = getSupabaseClient()
    const customerId = user.customerId || user.id

    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan_id, status')
      .eq('stripe_customer_id', customerId)
      .in('status', ['active', 'trialing'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null
    return data.plan_id ?? null
  } catch {
    return null
  }
}

/**
 * Middleware factory that enforces a minimum subscription plan.
 *
 * Usage:
 *   export const GET = requirePlan('premium')(async (request, user) => { ... })
 *
 * Returns a 403 JSON response when the user's active plan is below minPlan.
 */
export function requirePlan(minPlan: PlanTier) {
  return function wrap(
    handler: (request: NextRequest, user: User) => Promise<NextResponse>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const authResult = await getCurrentUser(request)

      if (!authResult.isAuthenticated || !authResult.user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }

      const user = authResult.user
      const activePlanId = await getActivePlanId(user)
      const userRank = rankOf(activePlanId)
      const requiredRank = rankOf(minPlan)

      if (userRank < requiredRank) {
        return NextResponse.json(
          {
            success: false,
            error: 'Upgrade required',
            message: `This feature requires a ${minPlan} plan or higher. Your current plan: ${activePlanId ?? 'free'}.`,
            requiredPlan: minPlan,
            currentPlan: activePlanId ?? 'free',
          },
          { status: 403 }
        )
      }

      return handler(request, user)
    }
  }
}
