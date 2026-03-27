import { type NextRequest, NextResponse } from "next/server"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { getAuthenticatedUser } from "@/lib/auth-helpers"
import { withRateLimit } from "@/lib/rate-limiter"

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const authUser = getAuthenticatedUser(request)
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    // Admins can pass ?userId= to view other users' trees; normal users always see their own
    const targetUserId = authUser.role === 'admin'
      ? (searchParams.get("userId") ?? authUser.userId)
      : authUser.userId
    const depth = Math.min(Number.parseInt(searchParams.get("depth") ?? "5"), 10)

      // Get the main user data
      const mainUser = await mlmDatabaseService.getMLMUser(targetUserId)
      if (!mainUser) {
        return NextResponse.json({ 
          success: false,
          error: "User not found" 
        }, { status: 404 })
      }

      // Get genealogy data from database
      const genealogy = await mlmDatabaseService.getTeamStructure(targetUserId, depth)

      // Build tree structure
      const buildTree = async (userId: string, level: number = 0): Promise<any> => {
        if (level > depth) return null

        const user = await mlmDatabaseService.getMLMUser(userId)
        if (!user) return null

        // Get direct children
        const children = genealogy.filter(g => g.sponsorId === userId && g.level === level + 1)

        const childrenData = await Promise.all(
          children.map(child => buildTree(child.userId, level + 1))
        )

        // Use displayName/email enriched by getTeamStructure, fall back to userId
        const enriched = genealogy.find(g => g.userId === userId) as any
        return {
          id: user.id,
          userId: user.userId,
          name: enriched?.displayName ?? user.userId,
          email: enriched?.email ?? user.userId,
          rank: user.rank.name,
          rankId: user.rank.id,
          status: user.status,
          personalVolume: user.personalVolume,
          teamVolume: user.teamVolume,
          totalEarnings: user.totalEarnings,
          joinDate: user.joinDate,
          level,
          activeDownlines: user.activeDownlines,
          children: childrenData.filter(Boolean),
        }
      }

      const tree = await buildTree(targetUserId, 0)

      // Calculate stats
      const allMembers = tree ? [tree, ...getAllChildren(tree)] : []
      const stats = {
        totalMembers: genealogy.length,
        activeMembers: allMembers.filter((m: any) => m.status === 'active').length,
        totalVolume: allMembers.reduce((sum: number, m: any) => sum + (m.personalVolume ?? 0), 0),
        totalEarnings: allMembers.reduce((sum: number, m: any) => sum + (m.totalEarnings ?? 0), 0),
        averageDepth: tree ? calculateAverageDepth(tree) : 0,
        maxDepth: Math.max(...allMembers.map((m: any) => m.level), 0)
      }

    return NextResponse.json({
      success: true,
      data: {
        tree,
        stats,
        depth,
      },
    })
  } catch (error) {
    console.error("Genealogy fetch error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch genealogy data" 
    }, { status: 500 })
  }
}, 'general')

// Helper functions
function getAllChildren(node: any): any[] {
  const children = node.children || []
  const allChildren = [...children]
  
  children.forEach((child: any) => {
    allChildren.push(...getAllChildren(child))
  })
  
  return allChildren
}

function calculateAverageDepth(node: any): number {
  const allMembers = [node, ...getAllChildren(node)]
  if (allMembers.length === 0) return 0
  
  const totalDepth = allMembers.reduce((sum, m) => sum + m.level, 0)
  return Math.round((totalDepth / allMembers.length) * 10) / 10
}
