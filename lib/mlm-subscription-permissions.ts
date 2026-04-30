/**
 * MLM Subscription Permission Rules
 * 
 * basic ($39)        - Can join existing teams, earn commissions. CANNOT create teams.
 * professional ($79) - Can join existing teams, earn commissions. CANNOT create teams.
 * premium ($129)     - Full access: can join OR create/lead their own team.
 * enterprise        - Full access: can join OR create/lead their own team.
 * inactive/free     - Read-only MLM access. Cannot join or create teams.
 */

export type SubscriptionTier = 'basic' | 'professional' | 'premium' | 'enterprise' | 'free' | 'inactive' | string

export const MLM_PERMISSIONS = {
  // Can participate in MLM (join teams, earn commissions)
  canJoinTeam: (tier: SubscriptionTier) =>
    ['basic', 'professional', 'premium', 'enterprise'].includes(tier),

  // Can create and lead their own team
  canCreateTeam: (tier: SubscriptionTier) =>
    ['premium', 'enterprise'].includes(tier),

  // Can view MLM dashboard at all
  canAccessMLM: (tier: SubscriptionTier, status: string) =>
    status === 'active' || ['basic', 'professional', 'premium', 'enterprise'].includes(tier),

  // Tier display info
  tierInfo: {
    free:         { label: 'Free',         canJoin: false, canCreate: false, upgradeMsg: 'Subscribe to join the MLM program' },
    inactive:     { label: 'Inactive',      canJoin: false, canCreate: false, upgradeMsg: 'Subscribe to join the MLM program' },
    basic:        { label: 'Basic',         canJoin: true,  canCreate: false, upgradeMsg: 'Upgrade to Premium to create your own team' },
    professional: { label: 'Professional',  canJoin: true,  canCreate: false, upgradeMsg: 'Upgrade to Premium to create your own team' },
    premium:      { label: 'Premium',       canJoin: true,  canCreate: true,  upgradeMsg: null },
    enterprise:   { label: 'Enterprise',    canJoin: true,  canCreate: true,  upgradeMsg: null },
  } as Record<string, { label:string; canJoin:boolean; canCreate:boolean; upgradeMsg:string|null }>,
}

export function getTierInfo(tier: SubscriptionTier) {
  return MLM_PERMISSIONS.tierInfo[tier] || MLM_PERMISSIONS.tierInfo.inactive
}
