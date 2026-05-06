import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: me } = await db().from('users').select('role').eq('id', user.id).maybeSingle()
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const userType = searchParams.get('type') // 'credit_repair' | 'mlm' | 'both' | 'all'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
  const offset = (page - 1) * limit

  // Get ALL users from the users table (source of truth)
  const { data: users, count } = await db().from('users')
    .select('id, email, first_name, last_name, role, subscription_tier, subscription_status, user_type, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (!users) return NextResponse.json({ success: true, users: [], total: 0 })

  const userIds = users.map((u: any) => u.id)

  // Get MLM data for these users (left join equivalent)
  const { data: mlmUsers } = await db().from('mlm_users')
    .select('user_id, id, mlm_code, rank, status, team_id, total_earnings, current_month_earnings, join_date')
    .in('user_id', userIds)

  const { data: teams } = await db().from('mlm_teams')
    .select('id, name, team_code, status')

  const mlmMap = new Map((mlmUsers||[]).map((m: any) => [m.user_id, m]))
  const teamMap = new Map((teams||[]).map((t: any) => [t.id, t]))

  const enriched = users.map((u: any) => {
    const mlm = mlmMap.get(u.id)
    const team = mlm ? teamMap.get(mlm.team_id) : null

    // Compute user_type dynamically (authoritative)
    let userType = 'credit_repair'
    if (u.role === 'admin') userType = 'admin'
    else if (mlm && u.subscription_status === 'active') userType = 'both'
    else if (mlm) userType = 'mlm'

    return {
      // Core identity
      id: u.id,
      email: u.email,
      name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role || 'user',
      createdAt: u.created_at,

      // User type classification
      userType,
      isCreditRepairUser: userType === 'credit_repair' || userType === 'both' || userType === 'admin',
      isMLMUser: !!mlm,
      isBoth: userType === 'both',

      // Credit repair subscription
      subscriptionTier: u.subscription_tier || 'free',
      subscriptionStatus: u.subscription_status || 'inactive',

      // MLM data (null if not an MLM member)
      mlm: mlm ? {
        mlmId: mlm.id,
        mlmCode: mlm.mlm_code,
        rank: mlm.rank || 'associate',
        status: mlm.status,
        teamId: mlm.team_id,
        teamName: team?.name || null,
        teamCode: team?.team_code || null,
        totalEarnings: Number(mlm.total_earnings) || 0,
        monthlyEarnings: Number(mlm.current_month_earnings) || 0,
        joinDate: mlm.join_date,
      } : null,
    }
  })

  // Summary stats
  const stats = {
    total: count || 0,
    creditRepairOnly: enriched.filter(u => u.userType === 'credit_repair').length,
    mlmOnly: enriched.filter(u => u.userType === 'mlm').length,
    both: enriched.filter(u => u.userType === 'both').length,
    admins: enriched.filter(u => u.userType === 'admin').length,
    activeSubscriptions: enriched.filter(u => u.subscriptionStatus === 'active').length,
  }

  return NextResponse.json({ success: true, users: enriched, stats, page, limit, total: count || 0 })
}
