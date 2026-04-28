import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: mlmUser } = await supabase.from('mlm_users')
    .select('id,rank,mlm_code,total_downlines,active_downlines')
    .eq('user_id', user.id).maybeSingle()

  if (!mlmUser) return NextResponse.json({ success: false, tree: null, downlines: [] })

  const { data: genealogy } = await supabase.from('mlm_genealogy')
    .select('user_id,joined_at').eq('sponsor_mlm_id', mlmUser.id)

  const downlineUserIds = (genealogy||[]).map(g=>g.user_id)
  let downlines: any[] = []

  if (downlineUserIds.length > 0) {
    const { data: downlineUsers } = await supabase.from('mlm_users')
      .select('user_id,rank,status,total_earnings,current_month_earnings,join_date,mlm_code')
      .in('user_id', downlineUserIds)
    const { data: userDetails } = await supabase.from('users')
      .select('id,email,first_name,last_name').in('id', downlineUserIds)

    downlines = (downlineUsers||[]).map(du => {
      const ud = (userDetails||[]).find(u=>u.id===du.user_id)
      const geo = (genealogy||[]).find(g=>g.user_id===du.user_id)
      return {
        userId: du.user_id,
        name: ud ? [ud.first_name,ud.last_name].filter(Boolean).join(' ')||ud.email : 'Member',
        email: ud?.email,
        rank: du.rank||'associate',
        status: du.status,
        earnings: du.total_earnings||0,
        monthlyEarnings: du.current_month_earnings||0,
        joinedAt: geo?.joined_at||du.join_date,
        mlmCode: du.mlm_code,
      }
    })
  }

  return NextResponse.json({
    success: true,
    tree: { userId:user.id, rank:mlmUser.rank, mlmCode:mlmUser.mlm_code, directDownlines:downlines.length, totalDownlines:mlmUser.total_downlines||0, activeDownlines:mlmUser.active_downlines||0 },
    downlines
  })
}