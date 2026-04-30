import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: u } = await db().from('users').select('subscription_tier,subscription_status,email').eq('id', user.id).maybeSingle()
  const { data: m } = await db().from('mlm_users').select('rank,status,join_date,mlm_code').eq('user_id', user.id).maybeSingle()
  const tier = u?.subscription_tier || 'free'
  const PRICES: Record<string,number> = {free:0,basic:39,professional:79,premium:129,enterprise:299}
  return NextResponse.json({ success:true, billing:{ currentPlan:tier, planPrice:PRICES[tier]||0, status:u?.subscription_status||'inactive', email:u?.email, mlmCode:m?.mlm_code||null, mlmStatus:m?.status||null, joinDate:m?.join_date||null, canCreateTeam:['premium','enterprise'].includes(tier) } })
}