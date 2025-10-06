import { type NextRequest, NextResponse } from "next/server"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { withRateLimit } from "@/lib/rate-limiter"

export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get("userId") || 'demo-user-123'
    const depth = Number.parseInt(searchParams.get("depth") || "5")

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
          children.map(async (child) => {
            const childUser = await mlmDatabaseService.getMLMUser(child.userId)
            if (!childUser) return null

            return {
              id: childUser.userId,
              name: childUser.mlmCode || 'Unknown User',
              email: '', // Personal info would come from user profile
              rank: childUser.rank.name,
              status: childUser.status,
              volume: childUser.personalVolume,
              earnings: childUser.currentMonthEarnings,
              joinDate: childUser.joinDate,
              level: level + 1,
              children: await buildTree(childUser.userId, level + 1)
            }
          })
        )

        return childrenData.filter(child => child !== null)
      }

      const children = await buildTree(targetUserId, 0)

      const genealogyTree = {
        id: mainUser.userId,
        name: mainUser.mlmCode || 'You',
        email: '', // Personal info would come from user profile
        rank: mainUser.rank.name,
        status: mainUser.status,
        volume: mainUser.personalVolume,
        earnings: mainUser.currentMonthEarnings,
        joinDate: mainUser.joinDate,
        level: 0,
        children: children
      }

      // Calculate stats
      const allMembers = [genealogyTree, ...getAllChildren(genealogyTree)]
      const stats = {
        totalMembers: allMembers.length,
        activeMembers: allMembers.filter(m => m.status === 'active').length,
        totalVolume: allMembers.reduce((sum, m) => sum + m.volume, 0),
        totalEarnings: allMembers.reduce((sum, m) => sum + m.earnings, 0),
        averageDepth: calculateAverageDepth(genealogyTree),
        maxDepth: Math.max(...allMembers.map(m => m.level), 0)
      }

    return NextResponse.json({
      success: true,
      data: {
        tree: genealogyTree,
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
  
  children.forEach(child => {
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
