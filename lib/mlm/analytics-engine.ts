import { mlmDatabaseService } from './database-service'
import { MLMUser, MLMCommission, MLMPayout } from '@/lib/mlm-system'

export interface AnalyticsMetrics {
  userId: string
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: Date
  endDate: Date
  metrics: {
    // Sales Metrics
    totalSales: number
    salesCount: number
    averageSaleValue: number
    salesGrowth: number
    
    // Commission Metrics
    totalCommissions: number
    commissionCount: number
    averageCommission: number
    commissionGrowth: number
    
    // Team Metrics
    totalTeamSize: number
    activeTeamSize: number
    newRecruits: number
    teamGrowth: number
    retentionRate: number
    
    // Performance Metrics
    personalVolume: number
    teamVolume: number
    volumeGrowth: number
    rankProgress: number
    
    // Financial Metrics
    totalEarnings: number
    pendingEarnings: number
    paidEarnings: number
    earningsGrowth: number
    
    // Activity Metrics
    loginCount: number
    trainingHours: number
    communicationCount: number
    lastActivity: Date
  }
}

export interface LeaderboardEntry {
  userId: string
  name: string
  rank: string
  points: number
  earnings: number
  teamSize: number
  growth: number
  badges: string[]
  position: number
}

export interface TeamPerformance {
  userId: string
  teamStats: {
    totalMembers: number
    activeMembers: number
    newMembers: number
    totalVolume: number
    averageVolume: number
    retentionRate: number
  }
  topPerformers: LeaderboardEntry[]
  recentActivity: any[]
  monthlyTrends: any[]
}

export class MLMAnalyticsEngine {
  private db = mlmDatabaseService

  // Get comprehensive analytics for a user
  async getUserAnalytics(userId: string, period: string = 'monthly'): Promise<AnalyticsMetrics> {
    try {
      const user = await this.db.getMLMUser(userId)
      if (!user) {
        throw new Error('User not found')
      }

      const { startDate, endDate } = this.getPeriodDates(period)
      
      // Get commissions for the period
      const commissions = await this.db.getCommissions(userId, startDate, endDate)
      
      // Get team stats
      const teamStats = await this.db.getTeamStats(userId, this.getPeriodDays(period))
      
      // Get payouts for the period
      const payouts = await this.db.getPayouts(userId)
      const periodPayouts = payouts.filter(p => 
        p.createdAt >= startDate && p.createdAt <= endDate
      )

      // Calculate metrics
      const metrics = this.calculateMetrics(user, commissions, teamStats, periodPayouts, period)

      return {
        userId,
        period: period as any,
        startDate,
        endDate,
        metrics
      }
    } catch (error) {
      console.error('Error getting user analytics:', error)
      throw error
    }
  }

  // Get leaderboard data
  async getLeaderboard(limit: number = 50, category: string = 'earnings'): Promise<LeaderboardEntry[]> {
    try {
      // In a real implementation, this would query the database
      // For now, return mock data with real structure
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          userId: 'user_001',
          name: 'Sarah Johnson',
          rank: 'Executive Director',
          points: 15420,
          earnings: 12450,
          teamSize: 47,
          growth: 18.5,
          badges: ['#1 Global', 'Top Recruiter', 'Sales Champion'],
          position: 1
        },
        {
          userId: 'user_002',
          name: 'Michael Chen',
          rank: 'Executive Director',
          points: 14200,
          earnings: 11200,
          teamSize: 38,
          growth: 15.2,
          badges: ['Rising Star', 'Team Builder'],
          position: 2
        },
        {
          userId: 'user_003',
          name: 'Emily Rodriguez',
          rank: 'Director',
          points: 8750,
          earnings: 6800,
          teamSize: 23,
          growth: 12.8,
          badges: ['Consistent Performer', 'Mentor'],
          position: 3
        }
      ]

      return mockLeaderboard.slice(0, limit)
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return []
    }
  }

  // Get team performance analytics
  async getTeamPerformance(userId: string): Promise<TeamPerformance> {
    try {
      const teamStats = await this.db.getTeamStats(userId, 30)
      const topPerformers = await this.getLeaderboard(10, 'earnings')
      
      return {
        userId,
        teamStats: {
          totalMembers: teamStats.overview.totalMembers,
          activeMembers: teamStats.overview.activeMembers,
          newMembers: teamStats.overview.newMembersThisMonth,
          totalVolume: teamStats.overview.totalVolume,
          averageVolume: teamStats.overview.averageVolume,
          retentionRate: teamStats.overview.retentionRate
        },
        topPerformers: topPerformers.slice(0, 5),
        recentActivity: teamStats.recentActivity || [],
        monthlyTrends: [] // Would be calculated from historical data
      }
    } catch (error) {
      console.error('Error getting team performance:', error)
      throw error
    }
  }

  // Get rank progression analytics
  async getRankProgression(userId: string): Promise<any> {
    try {
      const user = await this.db.getMLMUser(userId)
      if (!user) {
        throw new Error('User not found')
      }

      // Get all ranks
      const { mlmRanks } = await import('@/lib/mlm-system')
      const sortedRanks = mlmRanks.sort((a, b) => a.level - b.level)
      
      const currentRankIndex = sortedRanks.findIndex(rank => rank.id === user.rank.id)
      const nextRank = sortedRanks[currentRankIndex + 1]
      
      if (!nextRank) {
        return {
          currentRank: user.rank,
          nextRank: null,
          progress: 100,
          requirements: null
        }
      }

      // Calculate progress towards next rank
      const progress = this.calculateRankProgress(user, nextRank)
      
      return {
        currentRank: user.rank,
        nextRank,
        progress,
        requirements: nextRank.requirements,
        estimatedTimeToNextRank: this.estimateTimeToNextRank(user, nextRank)
      }
    } catch (error) {
      console.error('Error getting rank progression:', error)
      throw error
    }
  }

  // Get commission analytics
  async getCommissionAnalytics(userId: string, period: string = 'monthly'): Promise<any> {
    try {
      const { startDate, endDate } = this.getPeriodDates(period)
      const commissions = await this.db.getCommissions(userId, startDate, endDate)
      
      const totalCommissions = commissions.reduce((sum, c) => sum + c.totalAmount, 0)
      const paidCommissions = commissions.filter(c => c.status === 'paid')
      const pendingCommissions = commissions.filter(c => c.status === 'pending')
      
      const commissionByType = commissions.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + c.totalAmount
        return acc
      }, {} as Record<string, number>)

      return {
        total: totalCommissions,
        paid: paidCommissions.reduce((sum, c) => sum + c.totalAmount, 0),
        pending: pendingCommissions.reduce((sum, c) => sum + c.totalAmount, 0),
        count: commissions.length,
        byType: commissionByType,
        average: commissions.length > 0 ? totalCommissions / commissions.length : 0,
        growth: 0 // Would calculate from historical data
      }
    } catch (error) {
      console.error('Error getting commission analytics:', error)
      throw error
    }
  }

  // Get training analytics
  async getTrainingAnalytics(userId: string): Promise<any> {
    try {
      const trainingRecords = await this.db.getTrainingProgress(userId)
      
      const completed = trainingRecords.filter(t => t.completed)
      const inProgress = trainingRecords.filter(t => !t.completed)
      
      const totalHours = trainingRecords.reduce((sum, t) => sum + (t.duration || 0), 0)
      const averageScore = completed.length > 0 
        ? completed.reduce((sum, t) => sum + (t.score || 0), 0) / completed.length 
        : 0

      return {
        totalModules: trainingRecords.length,
        completed: completed.length,
        inProgress: inProgress.length,
        completionRate: trainingRecords.length > 0 ? (completed.length / trainingRecords.length) * 100 : 0,
        totalHours,
        averageScore,
        certificatesEarned: completed.filter(t => t.certificateIssued).length
      }
    } catch (error) {
      console.error('Error getting training analytics:', error)
      throw error
    }
  }

  // Calculate comprehensive metrics
  private calculateMetrics(
    user: MLMUser,
    commissions: MLMCommission[],
    teamStats: any,
    payouts: MLMPayout[],
    period: string
  ): AnalyticsMetrics['metrics'] {
    const totalCommissions = commissions.reduce((sum, c) => sum + c.totalAmount, 0)
    const paidCommissions = commissions.filter(c => c.status === 'paid')
    const pendingCommissions = commissions.filter(c => c.status === 'pending')
    
    const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0)

    return {
      // Sales Metrics
      totalSales: user.personalVolume,
      salesCount: 0, // Would need sales records
      averageSaleValue: 0, // Would calculate from sales records
      salesGrowth: 0, // Would calculate from historical data
      
      // Commission Metrics
      totalCommissions,
      commissionCount: commissions.length,
      averageCommission: commissions.length > 0 ? totalCommissions / commissions.length : 0,
      commissionGrowth: 0, // Would calculate from historical data
      
      // Team Metrics
      totalTeamSize: teamStats.overview.totalMembers,
      activeTeamSize: teamStats.overview.activeMembers,
      newRecruits: teamStats.overview.newMembersThisMonth,
      teamGrowth: 0, // Would calculate from historical data
      retentionRate: teamStats.overview.retentionRate,
      
      // Performance Metrics
      personalVolume: user.personalVolume,
      teamVolume: user.teamVolume,
      volumeGrowth: 0, // Would calculate from historical data
      rankProgress: 0, // Would calculate from rank requirements
      
      // Financial Metrics
      totalEarnings: user.totalEarnings,
      pendingEarnings: pendingCommissions.reduce((sum, c) => sum + c.totalAmount, 0),
      paidEarnings: paidCommissions.reduce((sum, c) => sum + c.totalAmount, 0),
      earningsGrowth: 0, // Would calculate from historical data
      
      // Activity Metrics
      loginCount: 0, // Would track from login records
      trainingHours: 0, // Would calculate from training records
      communicationCount: 0, // Would track from communication records
      lastActivity: user.lastActivity
    }
  }

  // Calculate rank progress
  private calculateRankProgress(user: MLMUser, nextRank: any): number {
    const requirements = nextRank.requirements
    const progress = {
      personalVolume: Math.min((user.personalVolume / requirements.personalVolume) * 100, 100),
      teamVolume: Math.min((user.teamVolume / requirements.teamVolume) * 100, 100),
      activeDownlines: Math.min((user.activeDownlines / requirements.activeDownlines) * 100, 100),
      qualifiedLegs: Math.min((user.qualifiedLegs / requirements.qualifiedLegs) * 100, 100)
    }

    return Object.values(progress).reduce((sum, p) => sum + p, 0) / Object.keys(progress).length
  }

  // Estimate time to next rank
  private estimateTimeToNextRank(user: MLMUser, nextRank: any): string {
    // This would use historical data to estimate time
    // For now, return a placeholder
    return '3-6 months'
  }

  // Get period dates
  private getPeriodDates(period: string): { startDate: Date; endDate: Date } {
    const endDate = new Date()
    const startDate = new Date()

    switch (period) {
      case 'daily':
        startDate.setDate(endDate.getDate() - 1)
        break
      case 'weekly':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case 'quarterly':
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case 'yearly':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setMonth(endDate.getMonth() - 1)
    }

    return { startDate, endDate }
  }

  // Get period days
  private getPeriodDays(period: string): number {
    switch (period) {
      case 'daily': return 1
      case 'weekly': return 7
      case 'monthly': return 30
      case 'quarterly': return 90
      case 'yearly': return 365
      default: return 30
    }
  }

  // Generate analytics report
  async generateReport(userId: string, period: string = 'monthly'): Promise<any> {
    try {
      const analytics = await this.getUserAnalytics(userId, period)
      const teamPerformance = await this.getTeamPerformance(userId)
      const commissionAnalytics = await this.getCommissionAnalytics(userId, period)
      const trainingAnalytics = await this.getTrainingAnalytics(userId)
      const rankProgression = await this.getRankProgression(userId)

      return {
        period,
        generatedAt: new Date(),
        user: {
          id: userId,
          analytics
        },
        team: teamPerformance,
        commissions: commissionAnalytics,
        training: trainingAnalytics,
        rankProgression
      }
    } catch (error) {
      console.error('Error generating report:', error)
      throw error
    }
  }
}

// Export singleton instance
export const mlmAnalyticsEngine = new MLMAnalyticsEngine()
