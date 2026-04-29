import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface TreeNode {
  userId: string
  name: string
  email: string
  rank: string
  status: string
  totalEarnings: number
  monthlyEarnings: number
  joinedAt: string
  mlmCode: string
  mlmId: string
  children: TreeNode[]
  depth: number
}

async function buildTree(mlmUserId: string, depth: number = 0, maxDepth: number = 6): Promise<TreeNode[]> {
  if (depth >= maxDepth) return []

  const { data: genealogy } = await supabase
    .from('mlm_genealogy')
    .select('user_id, joined_at')
    .eq('sponsor_mlm_id', mlmUserId)

  if (!genealogy || genealogy.length === 0) return []

  const userIds = genealogy.map((g: any) => g.user_id)

  const [{ data: mlmUsers }, { data: users }] = await Promise.all([
    supabase.from('mlm_users').select('id,user_id,rank,status,total_earnings,current_month_earnings,mlm_code').in('user_id', userIds),
    supabase.from('users').select('id,email,first_name,last_name').in('id', userIds),
  ])

  const nodes: TreeNode[] = []

  for (const g of genealogy) {
    const mlm = (mlmUsers || []).find((u: any) => u.user_id === g.user_id)
    const user = (users || []).find((u: any) => u.id === g.user_id)
    if (!mlm) continue

    const children = await buildTree(mlm.id, depth + 1, maxDepth)

    nodes.push({
      userId: g.user_id,
      mlmId: mlm.id,
      name: user ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email : 'Member',
      email: user?.email || '',
      rank: mlm.rank || 'associate',
      status: mlm.status || 'active',
      totalEarnings: Number(mlm.total_earnings) || 0,
      monthlyEarnings: Number(mlm.current_month_earnings) || 0,
      joinedAt: g.joined_at,
      mlmCode: mlm.mlm_code || '',
      children,
      depth,
    })
  }

  return nodes
}

function countNodes(nodes: TreeNode[]): { total: number; active: number } {
  let total = 0, active = 0
  for (const n of nodes) {
    total++
    if (n.status === 'active') active++
    const sub = countNodes(n.children)
    total += sub.total
    active += sub.active
  }
  return { total, active }
}

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: mlmUser } = await supabase.from('mlm_users')
    .select('id,user_id,rank,mlm_code,total_downlines,active_downlines')
    .eq('user_id', user.id).maybeSingle()

  if (!mlmUser) return NextResponse.json({ success: true, tree: null, downlines: [], stats: { total: 0, active: 0, direct: 0 } })

  const tree = await buildTree(mlmUser.id)
  const { total, active } = countNodes(tree)

  // Flat list of direct downlines for simple view
  const downlines = tree.map(n => ({
    userId: n.userId,
    name: n.name,
    email: n.email,
    rank: n.rank,
    status: n.status,
    earnings: n.totalEarnings,
    monthlyEarnings: n.monthlyEarnings,
    joinedAt: n.joinedAt,
    mlmCode: n.mlmCode,
    teamSize: countNodes(n.children).total,
  }))

  return NextResponse.json({
    success: true,
    tree: {
      userId: user.id,
      mlmId: mlmUser.id,
      rank: mlmUser.rank,
      mlmCode: mlmUser.mlm_code,
      directDownlines: tree.length,
      totalDownlines: total,
      activeDownlines: active,
      children: tree,
    },
    downlines,
    stats: { total, active, direct: tree.length },
  })
}