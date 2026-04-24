import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computeEarnedRank, RANK_CONFIG, type MLMRank } from '@/lib/mlm-commission-config'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

/**
 * POST /api/mlm/rank-check
 * Called by internal cron or on subscription payment.
 * Computes rank from verified DB metrics only - never from client input.
 * Requires x-internal-secret header matching INTERNAL_API_SECRET env var.
 */
export async function POST(req: NextRequest) {
  if (req.headers.get('x-internal-secret') !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const { data: mlmUser } = await supabase
    .from('mlm_users').select('id, user_id, rank, subscription_status, created_at')
    .eq('user_id', userId).maybeSingle()

  if (!mlmUser) return NextResponse.json({ error: 'MLM user not found' }, { status: 404 })
  if (mlmUser.subscription_status !== 'active') return NextResponse.json({ message: 'No active subscription' })

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Personal volume from DB — never from client
  const { data: pvData } = await supabase.from('mlm_commissions')
    .select('sale_amount').eq('source_user_id', userId)
    .gte('created_at', monthStart).neq('status', 'voided')
  const personalVolume = (pvData ?? []).reduce((s, r) => s + (r.sale_amount ?? 0), 0)

  // Team volume via DB RPC
  const { data: tvData } = await supabase.rpc('get_mlm_team_volume', { p_mlm_user_id: mlmUser.id, p_since: monthStart })
  const teamVolume = (tvData as number) ?? 0

  // Active direct downlines from DB
  const { count: activeDownlines } = await supabase.from('mlm_genealogy')
    .select('user_id', { count: 'exact', head: true }).eq('sponsor_mlm_id', mlmUser.id)
    .filter('user_id', 'in', '(SELECT user_id FROM mlm_users WHERE subscription_status = 'active')')

  const earnedRank = computeEarnedRank(personalVolume, teamVolume, activeDownlines ?? 0)
  const currentRank = mlmUser.rank as MLMRank
  const earned = RANK_CONFIG[earnedRank]
  const current = RANK_CONFIG[currentRank]

  if (earned.level > current.level) {
    await supabase.from('mlm_users')
      .update({ rank: earnedRank, rank_achieved_at: now.toISOString(), updated_at: now.toISOString() })
      .eq('id', mlmUser.id)

    const bonus = earned.advancementBonus
    if (bonus > 0) {
      await supabase.from('mlm_commissions').insert({
        recipient_user_id: userId, recipient_mlm_id: mlmUser.id,
        source_user_id: userId, commission_type: 'rank_advancement',
        commission_amount: bonus, status: 'payable',
        payable_at: now.toISOString(), created_at: now.toISOString(),
      })
    }

    await supabase.from('mlm_audit_log').insert({
      event_type: 'rank_advancement', user_id: userId,
      details: { from_rank: currentRank, to_rank: earnedRank, personal_volume: personalVolume, team_volume: teamVolume, active_downlines: activeDownlines, bonus },
      detected_at: now.toISOString(),
    })

    return NextResponse.json({ advanced: true, from: currentRank, to: earnedRank, bonus })
  }

  return NextResponse.json({ advanced: false, currentRank, earnedRank, metrics: { personalVolume, teamVolume, activeDownlines } })
}