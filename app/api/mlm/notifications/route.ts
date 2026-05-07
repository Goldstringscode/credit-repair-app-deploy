import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get MLM user
  const { data: mlmUser } = await db().from('mlm_users')
    .select('id, rank, team_id').eq('user_id', user.id).maybeSingle()
  if (!mlmUser) return NextResponse.json({ success: true, notifications: [] })

  // Build notifications from real events: commissions, rank changes, team activity
  const notifications: any[] = []

  // Recent commissions
  const { data: comms } = await db().from('mlm_commissions')
    .select('id, commission_amount, commission_type, status, created_at')
    .eq('recipient_user_id', user.id)
    .order('created_at', { ascending: false }).limit(10)

  ;(comms || []).forEach((c: any) => {
    const labels: Record<string,string> = {
      direct_referral: 'Direct Referral Commission',
      unilevel: 'Unilevel Commission',
      matching_bonus: 'Matching Bonus',
      rank_advancement: 'Rank Advancement Bonus',
      fast_start: 'Fast Start Bonus',
      leadership_bonus: 'Leadership Bonus',
      infinity_bonus: 'Infinity Bonus',
    }
    notifications.push({
      id: 'comm_' + c.id,
      type: c.commission_type === 'rank_advancement' ? 'rank' : 'commission',
      title: labels[c.commission_type] || 'Commission Earned',
      message: `You earned $${Number(c.commission_amount).toFixed(2)} — ${c.status}`,
      read: c.status === 'paid',
      created_at: c.created_at,
      action_url: '/mlm/payouts',
    })
  })

  // Recent payouts
  const { data: payouts } = await db().from('mlm_payouts')
    .select('id, amount, status, created_at').eq('user_id', user.id)
    .order('created_at', { ascending: false }).limit(5)

  ;(payouts || []).forEach((p: any) => {
    notifications.push({
      id: 'payout_' + p.id,
      type: 'payout',
      title: p.status === 'completed' ? 'Payout Processed' : 'Payout Requested',
      message: `$${Number(p.amount).toFixed(2)} — ${p.status}`,
      read: p.status === 'completed',
      created_at: p.created_at,
      action_url: '/mlm/payouts',
    })
  })

  // Team join events from genealogy (new members under this user)
  if (mlmUser.id) {
    const { data: newMembers } = await db().from('mlm_genealogy')
      .select('user_id, joined_at').eq('sponsor_mlm_id', mlmUser.id)
      .order('joined_at', { ascending: false }).limit(5)

    ;(newMembers || []).forEach((m: any) => {
      notifications.push({
        id: 'member_' + m.user_id,
        type: 'team',
        title: 'New Team Member',
        message: 'A new member joined your downline',
        read: new Date(m.joined_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        created_at: m.joined_at,
        action_url: '/mlm/team-genealogy',
      })
    })
  }

  // Sort by date desc
  notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return NextResponse.json({ success: true, notifications: notifications.slice(0, 25) })
}

export async function PATCH(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // Notifications are derived from real tables — mark_read is client-side only
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ success: true })
}