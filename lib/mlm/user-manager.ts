import { mlmDatabaseService } from './database-service'
import { mlmCommissionEngine } from './commission-engine'
import { mlmNotificationSystem } from './notification-system'
import { MLMUser, MLMRank } from '@/lib/mlm-system'

export interface UserRegistrationData {
  userId: string
  sponsorId?: string
  uplineId?: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  billingInfo?: {
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    paymentMethod?: string
  }
  taxInfo?: {
    ssn?: string
    ein?: string
    taxId?: string
  }
  preferences?: {
    notifications: boolean
    marketing: boolean
    autoship: boolean
  }
}

export interface UserUpdateData {
  personalInfo?: Partial<UserRegistrationData['personalInfo']>
  billingInfo?: Partial<UserRegistrationData['billingInfo']>
  taxInfo?: Partial<UserRegistrationData['taxInfo']>
  preferences?: Partial<UserRegistrationData['preferences']>
  status?: 'active' | 'inactive' | 'suspended' | 'pending'
}

export interface UserSearchFilters {
  status?: string
  rank?: string
  joinDateFrom?: Date
  joinDateTo?: Date
  minVolume?: number
  maxVolume?: number
  searchTerm?: string
}

export class MLMUserManager {
  private db = mlmDatabaseService
  private commissionEngine = mlmCommissionEngine
  private notificationSystem = mlmNotificationSystem

  // Register new MLM user
  async registerUser(data: UserRegistrationData): Promise<MLMUser> {
    try {
      // Validate sponsor if provided
      if (data.sponsorId) {
        const sponsor = await this.db.getMLMUser(data.sponsorId)
        if (!sponsor) {
          throw new Error('Sponsor not found')
        }
        if (sponsor.status !== 'active') {
          throw new Error('Sponsor is not active')
        }
      }

      // Create MLM user
      const mlmUser = await this.db.createMLMUser({
        userId: data.userId,
        sponsorId: data.sponsorId,
        uplineId: data.uplineId || data.sponsorId,
        personalVolume: 0,
        teamVolume: 0,
        totalEarnings: 0,
        currentMonthEarnings: 0,
        lifetimeEarnings: 0,
        activeDownlines: 0,
        totalDownlines: 0,
        qualifiedLegs: 0,
        autoshipActive: data.preferences?.autoship || false,
        billing: data.billingInfo,
        tax: data.taxInfo
      })

      // Send welcome notification
      await this.notificationSystem.sendNotification(
        data.userId,
        'welcome',
        {
          firstName: data.personalInfo.firstName,
          mlmCode: mlmUser.mlmCode
        },
        'normal'
      )

      // Notify sponsor of new recruit
      if (data.sponsorId) {
        await this.notificationSystem.sendNotification(
          data.sponsorId,
          'team_member_joined',
          {
            memberName: `${data.personalInfo.firstName} ${data.personalInfo.lastName}`,
            mlmCode: mlmUser.mlmCode
          },
          'normal'
        )
      }

      console.log(`✅ MLM user registered: ${data.personalInfo.firstName} ${data.personalInfo.lastName} (${mlmUser.mlmCode})`)
      return mlmUser
    } catch (error) {
      console.error('Error registering MLM user:', error)
      throw error
    }
  }

  // Update user information
  async updateUser(userId: string, data: UserUpdateData): Promise<MLMUser> {
    try {
      const user = await this.db.getMLMUser(userId)
      if (!user) {
        throw new Error('User not found')
      }

      // Update user data
      const updates: Partial<MLMUser> = {}
      
      if (data.personalInfo) {
        // Update personal info in main user table (would need to implement)
        console.log('📝 Personal info updated for user:', userId)
      }
      
      if (data.billingInfo) {
        updates.billing = { ...user.billing, ...data.billingInfo }
      }
      
      if (data.taxInfo) {
        updates.tax = { ...user.tax, ...data.taxInfo }
      }
      
      if (data.status) {
        updates.status = data.status
      }

      const updatedUser = await this.db.updateMLMUser(userId, updates)

      // Send notification about profile update
      await this.notificationSystem.sendNotification(
        userId,
        'profile_updated',
        {
          updatedFields: Object.keys(data)
        },
        'normal'
      )

      console.log(`✅ User updated: ${userId}`)
      return updatedUser
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  // Get user by ID
  async getUser(userId: string): Promise<MLMUser | null> {
    try {
      return await this.db.getMLMUser(userId)
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  // Search users with filters
  async searchUsers(filters: UserSearchFilters, limit: number = 50, offset: number = 0): Promise<MLMUser[]> {
    try {
      // In a real implementation, this would query the database with filters
      // For now, return mock data
      const mockUsers: MLMUser[] = [
        {
          id: 'mlm_1',
          userId: 'user_1',
          sponsorId: null,
          uplineId: null,
          mlmCode: 'CR001',
          rank: {
            id: 'manager',
            name: 'Manager',
            level: 3,
            requirements: { personalVolume: 1000, teamVolume: 5000, activeDownlines: 5, qualifiedLegs: 2 },
            benefits: [],
            commissionRate: 0.40,
            bonusEligibility: ['fast_start', 'matching_bonus', 'leadership_bonus'],
            color: '#3B82F6',
            icon: 'users'
          },
          status: 'active',
          joinDate: new Date('2024-01-01'),
          personalVolume: 1250,
          teamVolume: 8500,
          totalEarnings: 12450,
          currentMonthEarnings: 2100,
          lifetimeEarnings: 45600,
          activeDownlines: 8,
          totalDownlines: 23,
          qualifiedLegs: 2,
          autoshipActive: true,
          lastActivity: new Date(),
          nextRankRequirement: null,
          billing: {},
          tax: {}
        }
      ]

      return mockUsers.slice(offset, offset + limit)
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  // Get user's team members
  async getUserTeam(userId: string, maxLevel: number = 5): Promise<any[]> {
    try {
      const genealogy = await this.db.getTeamStructure(userId, maxLevel)
      const teamMembers = []

      for (const member of genealogy) {
        const memberUser = await this.db.getMLMUser(member.userId)
        if (memberUser) {
          teamMembers.push({
            ...member,
            user: memberUser
          })
        }
      }

      return teamMembers
    } catch (error) {
      console.error('Error getting user team:', error)
      return []
    }
  }

  // Promote user to next rank
  async promoteUser(userId: string): Promise<MLMUser> {
    try {
      const user = await this.db.getMLMUser(userId)
      if (!user) {
        throw new Error('User not found')
      }

      // Check if user is eligible for promotion
      const nextRank = await this.commissionEngine.checkRankAdvancement(userId)
      if (!nextRank) {
        throw new Error('User is not eligible for rank advancement')
      }

      // Update user rank
      const updatedUser = await this.db.updateMLMUser(userId, {
        rank: nextRank
      })

      // Send rank advancement notification
      await this.notificationSystem.sendNotification(
        userId,
        'rank_advancement',
        {
          newRank: nextRank.name,
          oldRank: user.rank.name
        },
        'high'
      )

      // Notify team members
      const teamMembers = await this.getUserTeam(userId, 3)
      for (const member of teamMembers) {
        await this.notificationSystem.sendNotification(
          member.userId,
          'team_rank_advancement',
          {
            memberName: `${user.userId}`, // Would need actual name
            newRank: nextRank.name
          },
          'normal'
        )
      }

      console.log(`🎉 User promoted: ${userId} to ${nextRank.name}`)
      return updatedUser
    } catch (error) {
      console.error('Error promoting user:', error)
      throw error
    }
  }

  // Suspend user
  async suspendUser(userId: string, reason: string): Promise<MLMUser> {
    try {
      const user = await this.db.getMLMUser(userId)
      if (!user) {
        throw new Error('User not found')
      }

      // Update user status
      const updatedUser = await this.db.updateMLMUser(userId, {
        status: 'suspended'
      })

      // Send suspension notification
      await this.notificationSystem.sendNotification(
        userId,
        'account_suspended',
        {
          reason: reason
        },
        'urgent'
      )

      console.log(`⚠️ User suspended: ${userId} - ${reason}`)
      return updatedUser
    } catch (error) {
      console.error('Error suspending user:', error)
      throw error
    }
  }

  // Reactivate user
  async reactivateUser(userId: string): Promise<MLMUser> {
    try {
      const user = await this.db.getMLMUser(userId)
      if (!user) {
        throw new Error('User not found')
      }

      // Update user status
      const updatedUser = await this.db.updateMLMUser(userId, {
        status: 'active'
      })

      // Send reactivation notification
      await this.notificationSystem.sendNotification(
        userId,
        'account_reactivated',
        {},
        'normal'
      )

      console.log(`✅ User reactivated: ${userId}`)
      return updatedUser
    } catch (error) {
      console.error('Error reactivating user:', error)
      throw error
    }
  }

  // Get user statistics
  async getUserStats(userId: string): Promise<any> {
    try {
      const user = await this.db.getMLMUser(userId)
      if (!user) {
        throw new Error('User not found')
      }

      const teamStats = await this.db.getTeamStats(userId, 30)
      const commissions = await this.db.getCommissions(userId)
      const payouts = await this.db.getPayouts(userId)

      return {
        user: {
          id: user.id,
          mlmCode: user.mlmCode,
          rank: user.rank.name,
          status: user.status,
          joinDate: user.joinDate,
          lastActivity: user.lastActivity
        },
        performance: {
          personalVolume: user.personalVolume,
          teamVolume: user.teamVolume,
          totalEarnings: user.totalEarnings,
          currentMonthEarnings: user.currentMonthEarnings,
          lifetimeEarnings: user.lifetimeEarnings
        },
        team: {
          totalMembers: teamStats.overview.totalMembers,
          activeMembers: teamStats.overview.activeMembers,
          newMembers: teamStats.overview.newMembersThisMonth,
          retentionRate: teamStats.overview.retentionRate
        },
        commissions: {
          total: commissions.length,
          pending: commissions.filter(c => c.status === 'pending').length,
          paid: commissions.filter(c => c.status === 'paid').length,
          totalAmount: commissions.reduce((sum, c) => sum + c.totalAmount, 0)
        },
        payouts: {
          total: payouts.length,
          pending: payouts.filter(p => p.status === 'pending').length,
          completed: payouts.filter(p => p.status === 'completed').length,
          totalAmount: payouts.reduce((sum, p) => sum + p.amount, 0)
        }
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      throw error
    }
  }

  // Get user activity log
  async getUserActivity(userId: string, limit: number = 50): Promise<any[]> {
    try {
      // In a real implementation, this would query an activity log table
      // For now, return mock data
      return [
        {
          id: 'activity_1',
          type: 'commission_earned',
          description: 'Earned $225.00 from direct referral commission',
          timestamp: new Date(),
          data: { amount: 225.00, type: 'direct_referral' }
        },
        {
          id: 'activity_2',
          type: 'team_member_joined',
          description: 'New team member joined',
          timestamp: new Date(Date.now() - 86400000),
          data: { memberName: 'John Doe' }
        }
      ]
    } catch (error) {
      console.error('Error getting user activity:', error)
      return []
    }
  }

  // Validate user eligibility for MLM
  async validateUserEligibility(userId: string): Promise<{ eligible: boolean; reasons: string[] }> {
    try {
      const reasons: string[] = []
      
      // Check if user already exists in MLM system
      const existingUser = await this.db.getMLMUser(userId)
      if (existingUser) {
        reasons.push('User already exists in MLM system')
      }

      // Check if user is active in main system
      // This would query the main users table
      // For now, assume eligible
      
      // Check age requirements (would need birth date)
      // Check location requirements (would need address)
      // Check other business rules

      return {
        eligible: reasons.length === 0,
        reasons
      }
    } catch (error) {
      console.error('Error validating user eligibility:', error)
      return { eligible: false, reasons: ['Validation error'] }
    }
  }

  // Get user's sponsor chain
  async getSponsorChain(userId: string): Promise<MLMUser[]> {
    try {
      const user = await this.db.getMLMUser(userId)
      if (!user || !user.sponsorId) {
        return []
      }

      const sponsorChain: MLMUser[] = []
      let currentSponsorId = user.sponsorId

      while (currentSponsorId) {
        const sponsor = await this.db.getMLMUser(currentSponsorId)
        if (sponsor) {
          sponsorChain.push(sponsor)
          currentSponsorId = sponsor.sponsorId
        } else {
          break
        }
      }

      return sponsorChain
    } catch (error) {
      console.error('Error getting sponsor chain:', error)
      return []
    }
  }

  // Get user's downline summary
  async getDownlineSummary(userId: string): Promise<any> {
    try {
      const teamStats = await this.db.getTeamStats(userId, 30)
      const teamMembers = await this.getUserTeam(userId, 3)

      return {
        totalMembers: teamStats.overview.totalMembers,
        activeMembers: teamStats.overview.activeMembers,
        newMembers: teamStats.overview.newMembersThisMonth,
        totalVolume: teamStats.overview.totalVolume,
        averageVolume: teamStats.overview.averageVolume,
        retentionRate: teamStats.overview.retentionRate,
        topPerformers: teamMembers.slice(0, 5),
        recentActivity: teamStats.recentActivity || []
      }
    } catch (error) {
      console.error('Error getting downline summary:', error)
      return {
        totalMembers: 0,
        activeMembers: 0,
        newMembers: 0,
        totalVolume: 0,
        averageVolume: 0,
        retentionRate: 0,
        topPerformers: [],
        recentActivity: []
      }
    }
  }
}

// Export singleton instance
export const mlmUserManager = new MLMUserManager()
