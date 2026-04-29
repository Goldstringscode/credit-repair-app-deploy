import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  if (!code) return NextResponse.json({ valid: false, error: 'Code required' }, { status: 400 })

  const { data: mlmUser } = await supabase
    .from('mlm_users')
    .select('id, user_id, mlm_code, rank, status, team_id')
    .eq('mlm_code', code.toUpperCase())
    .eq('status', 'active')
    .maybeSingle()

  if (!mlmUser) return NextResponse.json({ valid: false, error: 'Invalid or inactive referral code' })

  const [{ data: user }, { data: team }] = await Promise.all([
    supabase.from('users').select('first_name,last_name,email').eq('id', mlmUser.user_id).maybeSingle(),
    mlmUser.team_id
      ? supabase.from('mlm_teams').select('name,team_code').eq('id', mlmUser.team_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  return NextResponse.json({
    valid: true,
    sponsor: {
      mlmCode: mlmUser.mlm_code,
      rank: mlmUser.rank,
      name: user ? [user.first_name,user.last_name].filter(Boolean).join(' ')||user.email : 'MLM Member',
      team: team ? { name: team.name, code: team.team_code } : null,
    }
  })
}