import { mlmDatabaseService } from './database-service'
import { mlmNotificationSystem } from './notification-system'
import { MLMUser, MLMGenealogy } from '@/lib/mlm-system'

export interface GenealogyNode {
  id: string
  userId: string
  name: string
  email: string
  rank: string
  status: string
  volume: number
  earnings: number
  joinDate: Date
  level: number
  position: string
  children: GenealogyNode[]
  parent?: GenealogyNode
}

export interface GenealogyStats {
  totalMembers: number
  activeMembers: number
  newMembers: number
  totalVolume: number
  averageVolume: number
  maxDepth: number
  averageDepth: number
  retentionRate: number
  growthRate: number
}

export interface TeamStructure {
  root: GenealogyNode
  stats: GenealogyStats
  levels: {
    [level: number]: GenealogyNode[]
  }
}

export class MLMGenealogyManager {
  private db = mlmDatabaseService
  private notificationSystem = mlmNotificationSystem

  // Get complete genealogy tree for a user
  async getGenealogyTree(userId: string, maxDepth: number = 10): Promise<TeamStructure> {
    try {
      const user = await this.db.getMLMUser(userId)
      if (!user) {
        throw new Error('User not found')
      }

      // Get genealogy data
      const genealogy = await this.db.getTeamStructure(userId, maxDepth)
      
      // Build tree structure
      const root = await this.buildGenealogyNode(user, 0, genealogy)
      
      // Calculate statistics
      const stats = this.calculateGenealogyStats(root)
      
      // Organize by levels
      const levels = this.organizeByLevels(root)

      return {
        root,
        stats,
        levels
      }
    } catch (error) {
      console.error('Error getting genealogy tree:', error)
      throw error
    }
  }

  // Build genealogy node recursively
  private async buildGenealogyNode(
    user: MLMUser, 
    level: number, 
    genealogy: MLMGenealogy[]
  ): Promise<GenealogyNode> {
    // Get children for this user
    const children = genealogy.filter(g => g.sponsorId === user.id && g.level === level + 1)
    
    const childrenNodes = await Promise.all(
      children.map(async (child) => {
        const childUser = await this.db.getMLMUser(child.userId)
        if (!childUser) return null
        
        return await this.buildGenealogyNode(childUser, level + 1, genealogy)
      })
    )

    return {
      id: user.id,
      userId: user.userId,
      name: `${user.userId}`, // Would need actual name from user table
      email: user.userId, // Would need actual email
      rank: user.rank.name,
      status: user.status,
      volume: user.personalVolume,
      earnings: user.totalEarnings,
      joinDate: user.joinDate,
      level,
      position: children.find(c => c.userId === user.userId)?.position || 'left',
      children: childrenNodes.filter(child => child !== null) as GenealogyNode[]
    }
  }

  // Calculate genealogy statistics
  private calculateGenealogyStats(root: GenealogyNode): GenealogyStats {
    const allNodes = this.getAllNodes(root)
    
    const totalMembers = allNodes.length
    const activeMembers = allNodes.filter(n => n.status === 'active').length
    const newMembers = allNodes.filter(n => {
      const daysSinceJoin = (Date.now() - n.joinDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceJoin <= 30
    }).length
    
    const totalVolume = allNodes.reduce((sum, n) => sum + n.volume, 0)
    const averageVolume = totalMembers > 0 ? totalVolume / totalMembers : 0
    
    const maxDepth = Math.max(...allNodes.map(n => n.level), 0)
    const averageDepth = allNodes.reduce((sum, n) => sum + n.level, 0) / totalMembers
    
    const retentionRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0
    
    // Growth rate would need historical data
    const growthRate = 0

    return {
      totalMembers,
      activeMembers,
      newMembers,
      totalVolume,
      averageVolume,
      maxDepth,
      averageDepth,
      retentionRate,
      growthRate
    }
  }

  // Get all nodes in the tree
  private getAllNodes(root: GenealogyNode): GenealogyNode[] {
    const nodes = [root]
    
    for (const child of root.children) {
      nodes.push(...this.getAllNodes(child))
    }
    
    return nodes
  }

  // Organize nodes by levels
  private organizeByLevels(root: GenealogyNode): { [level: number]: GenealogyNode[] } {
    const levels: { [level: number]: GenealogyNode[] } = {}
    
    const addToLevel = (node: GenealogyNode) => {
      if (!levels[node.level]) {
        levels[node.level] = []
      }
      levels[node.level].push(node)
      
      for (const child of node.children) {
        addToLevel(child)
      }
    }
    
    addToLevel(root)
    return levels
  }

  // Get team members at specific level
  async getTeamMembersAtLevel(userId: string, level: number): Promise<GenealogyNode[]> {
    try {
      const genealogy = await this.db.getTeamStructure(userId, level)
      const levelMembers = genealogy.filter(g => g.level === level)
      
      const members = await Promise.all(
        levelMembers.map(async (member) => {
          const memberUser = await this.db.getMLMUser(member.userId)
          if (!memberUser) return null
          
          return {
            id: memberUser.id,
            userId: memberUser.userId,
            name: `${memberUser.userId}`,
            email: memberUser.userId,
            rank: memberUser.rank.name,
            status: memberUser.status,
            volume: memberUser.personalVolume,
            earnings: memberUser.totalEarnings,
            joinDate: memberUser.joinDate,
            level: member.level,
            position: member.position,
            children: []
          } as GenealogyNode
        })
      )
      
      return members.filter(member => member !== null) as GenealogyNode[]
    } catch (error) {
      console.error('Error getting team members at level:', error)
      return []
    }
  }

  // Get top performers in team
  async getTopPerformers(userId: string, limit: number = 10): Promise<GenealogyNode[]> {
    try {
      const genealogy = await this.db.getTeamStructure(userId, 10)
      const performers = []
      
      for (const member of genealogy) {
        const memberUser = await this.db.getMLMUser(member.userId)
        if (memberUser) {
          performers.push({
            id: memberUser.id,
            userId: memberUser.userId,
            name: `${memberUser.userId}`,
            email: memberUser.userId,
            rank: memberUser.rank.name,
            status: memberUser.status,
            volume: memberUser.personalVolume,
            earnings: memberUser.totalEarnings,
            joinDate: memberUser.joinDate,
            level: member.level,
            position: member.position,
            children: []
          } as GenealogyNode)
        }
      }
      
      // Sort by volume and return top performers
      return performers
        .sort((a, b) => b.volume - a.volume)
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting top performers:', error)
      return []
    }
  }

  // Get team growth over time
  async getTeamGrowth(userId: string, period: number = 30): Promise<any[]> {
    try {
      // In a real implementation, this would query historical data
      // For now, return mock data
      const growthData = []
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - period)
      
      for (let i = 0; i < period; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        
        growthData.push({
          date: date.toISOString().split('T')[0],
          members: Math.floor(Math.random() * 10) + 20,
          volume: Math.floor(Math.random() * 5000) + 10000,
          earnings: Math.floor(Math.random() * 1000) + 2000
        })
      }
      
      return growthData
    } catch (error) {
      console.error('Error getting team growth:', error)
      return []
    }
  }

  // Get team performance by rank
  async getTeamPerformanceByRank(userId: string): Promise<any> {
    try {
      const genealogy = await this.db.getTeamStructure(userId, 10)
      const rankPerformance: { [rank: string]: any } = {}
      
      for (const member of genealogy) {
        const memberUser = await this.db.getMLMUser(member.userId)
        if (memberUser) {
          const rank = memberUser.rank.name
          
          if (!rankPerformance[rank]) {
            rankPerformance[rank] = {
              count: 0,
              totalVolume: 0,
              totalEarnings: 0,
              averageVolume: 0,
              averageEarnings: 0
            }
          }
          
          rankPerformance[rank].count++
          rankPerformance[rank].totalVolume += memberUser.personalVolume
          rankPerformance[rank].totalEarnings += memberUser.totalEarnings
        }
      }
      
      // Calculate averages
      for (const rank in rankPerformance) {
        const perf = rankPerformance[rank]
        perf.averageVolume = perf.count > 0 ? perf.totalVolume / perf.count : 0
        perf.averageEarnings = perf.count > 0 ? perf.totalEarnings / perf.count : 0
      }
      
      return rankPerformance
    } catch (error) {
      console.error('Error getting team performance by rank:', error)
      return {}
    }
  }

  // Get team structure visualization data
  async getTeamVisualization(userId: string, maxDepth: number = 5): Promise<any> {
    try {
      const teamStructure = await this.getGenealogyTree(userId, maxDepth)
      
      // Convert to visualization format
      const visualizationData = {
        nodes: this.convertToVisualizationNodes(teamStructure.root),
        links: this.convertToVisualizationLinks(teamStructure.root),
        stats: teamStructure.stats
      }
      
      return visualizationData
    } catch (error) {
      console.error('Error getting team visualization:', error)
      return { nodes: [], links: [], stats: {} }
    }
  }

  // Convert nodes to visualization format
  private convertToVisualizationNodes(root: GenealogyNode): any[] {
    const nodes = []
    
    const addNode = (node: GenealogyNode) => {
      nodes.push({
        id: node.id,
        name: node.name,
        rank: node.rank,
        status: node.status,
        volume: node.volume,
        earnings: node.earnings,
        level: node.level,
        position: node.position
      })
      
      for (const child of node.children) {
        addNode(child)
      }
    }
    
    addNode(root)
    return nodes
  }

  // Convert links to visualization format
  private convertToVisualizationLinks(root: GenealogyNode): any[] {
    const links = []
    
    const addLinks = (node: GenealogyNode) => {
      for (const child of node.children) {
        links.push({
          source: node.id,
          target: child.id,
          type: child.position
        })
        
        addLinks(child)
      }
    }
    
    addLinks(root)
    return links
  }

  // Get team member details
  async getTeamMemberDetails(userId: string, memberId: string): Promise<GenealogyNode | null> {
    try {
      const memberUser = await this.db.getMLMUser(memberId)
      if (!memberUser) {
        return null
      }
      
      return {
        id: memberUser.id,
        userId: memberUser.userId,
        name: `${memberUser.userId}`,
        email: memberUser.userId,
        rank: memberUser.rank.name,
        status: memberUser.status,
        volume: memberUser.personalVolume,
        earnings: memberUser.totalEarnings,
        joinDate: memberUser.joinDate,
        level: 0, // Would need to calculate from genealogy
        position: 'left',
        children: []
      }
    } catch (error) {
      console.error('Error getting team member details:', error)
      return null
    }
  }

  // Get team activity feed
  async getTeamActivity(userId: string, limit: number = 50): Promise<any[]> {
    try {
      // In a real implementation, this would query an activity log
      // For now, return mock data
      const activities = [
        {
          id: 'activity_1',
          type: 'new_member',
          description: 'New team member joined',
          timestamp: new Date(),
          userId: 'user_123',
          data: { memberName: 'John Doe' }
        },
        {
          id: 'activity_2',
          type: 'rank_advancement',
          description: 'Team member advanced to Manager',
          timestamp: new Date(Date.now() - 86400000),
          userId: 'user_456',
          data: { memberName: 'Jane Smith', newRank: 'Manager' }
        },
        {
          id: 'activity_3',
          type: 'volume_milestone',
          description: 'Team member reached $10K monthly volume',
          timestamp: new Date(Date.now() - 172800000),
          userId: 'user_789',
          data: { memberName: 'Bob Johnson', volume: 10000 }
        }
      ]
      
      return activities.slice(0, limit)
    } catch (error) {
      console.error('Error getting team activity:', error)
      return []
    }
  }

  // Get team statistics summary
  async getTeamStatsSummary(userId: string): Promise<any> {
    try {
      const teamStats = await this.db.getTeamStats(userId, 30)
      const topPerformers = await this.getTopPerformers(userId, 5)
      const rankPerformance = await this.getTeamPerformanceByRank(userId)
      
      return {
        overview: teamStats.overview,
        topPerformers,
        rankPerformance,
        recentActivity: teamStats.recentActivity || []
      }
    } catch (error) {
      console.error('Error getting team stats summary:', error)
      return {
        overview: {},
        topPerformers: [],
        rankPerformance: {},
        recentActivity: []
      }
    }
  }
}

// Export singleton instance
export const mlmGenealogyManager = new MLMGenealogyManager()
