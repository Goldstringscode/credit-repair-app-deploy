import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface TeamContext {
  userId: string
  mlmId: string
  teamId: string | null
  teamCode: string | null
  isAdmin: boolean
  isTeamFounder: boolean
  canModerate: boolean
}

export async function getTeamContext(userId: string): Promise<TeamContext | null> {
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  const isAdmin = user?.role === 'admin'

  const { data: mlmUser } = await supabase
    .from('mlm_users')
    .select('id, team_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!mlmUser) return null

  let teamCode: string | null = null
  let isTeamFounder = false
  if (mlmUser.team_id) {
    const { data: team } = await supabase
      .from('mlm_teams')
      .select('team_code, founder_id, leader_id')
      .eq('id', mlmUser.team_id)
      .maybeSingle()
    if (team) {
      teamCode = team.team_code
      isTeamFounder = team.founder_id === userId || team.leader_id === mlmUser.id
    }
  }

  return {
    userId,
    mlmId: mlmUser.id,
    teamId: mlmUser.team_id,
    teamCode,
    isAdmin,
    isTeamFounder,
    canModerate: isAdmin || isTeamFounder,
  }
}

export async function getVisibleTeamIds(ctx: TeamContext): Promise<string[]> {
  if (ctx.isAdmin) {
    const { data: teams } = await supabase.from('mlm_teams').select('id')
    return (teams || []).map((t: any) => t.id)
  }
  return ctx.teamId ? [ctx.teamId] : []
}
