import { mlmDatabaseService } from './database-service'
import { MLMUser, MLMCommission, MLMRank } from '@/lib/mlm-system'
import { sendCommissionEarnedEmail, sendRankAdvancementEmail } from '@/lib/email-service'

export interface CommissionCalculation {
  userId: string
  fromUserId: string
  type: string
  level: number
  amount: number
  percentage: number
  baseAmount: number
  rankBonus: number
  totalAmount: number
  periodStart: Date
  periodEnd: Date
}

export class MLMCommissionEngine {
  private db = mlmDatabaseService

  // Commission Types Configuration
  private commissionTypes = {
    direct_referral: { baseRate: 0.30, maxLevels: 1 },
    unilevel: { baseRate: 0.05, maxLevels: 10 },
    binary_left: { baseRate: 0.10, maxLevels: 1 },
    binary_right: { baseRate: 0.10, maxLevels: 1 },
    matrix_2x2: { baseRate: 0.15, maxLevels: 1 },
    matrix_3x3: { baseRate: 0.12, maxLevels: 1 },
    matrix_5x5: { baseRate: 0.08, maxLevels: 1 },
    fast_start: { baseRate: 0.10, maxLevels: 1 },
    matching_bonus: { baseRate: 0.25, maxLevels: 1 },
    leadership_bonus: { baseRate: 0.00, maxLevels: 1 }, // Fixed amount
    infinity_bonus: { baseRate: 0.02, maxLevels: -1 }, // Unlimited levels
    rank_advancement: { baseRate: 0.00, maxLevels: 1 } // Fixed amount
  }

  // Calculate commissions for a sale
  async calculateCommissions(
    saleData: {
      buyerId: string
      amount: number
      productType: string
      commissionType: string
    }
  ): Promise<CommissionCalculation[]> {
    const commissions: CommissionCalculation[] = []
    const buyer = await this.db.getMLMUser(saleData.buyerId)
    
    if (!buyer) {
      throw new Error('Buyer not found in MLM system')
    }

    // Get buyer's genealogy tree
    const genealogy = await this.db.getTeamStructure(buyer.id, 15)
    
    // Calculate different commission types
    switch (saleData.commissionType) {
      case 'unilevel':
        commissions.push(...await this.calculateUnilevelCommissions(buyer, saleData.amount, genealogy))
        break
      case 'binary':
        commissions.push(...await this.calculateBinaryCommissions(buyer, saleData.amount, genealogy))
        break
      case 'matrix':
        commissions.push(...await this.calculateMatrixCommissions(buyer, saleData.amount, genealogy))
        break
      case 'hybrid':
        commissions.push(...await this.calculateHybridCommissions(buyer, saleData.amount, genealogy))
        break
      default:
        commissions.push(...await this.calculateDirectReferralCommissions(buyer, saleData.amount))
    }

    // Add bonus commissions
    commissions.push(...await this.calculateBonusCommissions(buyer, saleData.amount, genealogy))

    return commissions
  }

  // Direct Referral Commissions
  private async calculateDirectReferralCommissions(
    buyer: MLMUser, 
    amount: number
  ): Promise<CommissionCalculation[]> {
    const commissions: CommissionCalculation[] = []
    
    if (!buyer.sponsorId) return commissions

    const sponsor = await this.db.getMLMUser(buyer.sponsorId)
    if (!sponsor) return commissions

    const commissionType = this.commissionTypes.direct_referral
    const baseRate = commissionType.baseRate
    const rankBonus = this.calculateRankBonus(sponsor.rank, baseRate)
    const totalRate = baseRate + rankBonus
    const commissionAmount = amount * totalRate

    commissions.push({
      userId: sponsor.userId,
      fromUserId: buyer.userId,
      type: 'direct_referral',
      level: 1,
      amount: commissionAmount,
      percentage: totalRate,
      baseAmount: amount,
      rankBonus: rankBonus,
      totalAmount: commissionAmount,
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    })

    return commissions
  }

  // Unilevel Commissions (up to 10 levels)
  private async calculateUnilevelCommissions(
    buyer: MLMUser,
    amount: number,
    genealogy: any[]
  ): Promise<CommissionCalculation[]> {
    const commissions: CommissionCalculation[] = []
    const commissionType = this.commissionTypes.unilevel
    const maxLevels = commissionType.maxLevels

    // Group genealogy by level
    const levelGroups = genealogy.reduce((acc, member) => {
      if (!acc[member.level]) acc[member.level] = []
      acc[member.level].push(member)
      return acc
    }, {})

    // Calculate commissions for each level
    for (let level = 1; level <= maxLevels; level++) {
      if (!levelGroups[level]) continue

      for (const member of levelGroups[level]) {
        const memberUser = await this.db.getMLMUser(member.userId)
        if (!memberUser) continue

        const baseRate = commissionType.baseRate * Math.pow(0.8, level - 1) // Decreasing rate
        const rankBonus = this.calculateRankBonus(memberUser.rank, baseRate)
        const totalRate = baseRate + rankBonus
        const commissionAmount = amount * totalRate

        if (commissionAmount > 0) {
          commissions.push({
            userId: memberUser.userId,
            fromUserId: buyer.userId,
            type: 'unilevel',
            level: level,
            amount: commissionAmount,
            percentage: totalRate,
            baseAmount: amount,
            rankBonus: rankBonus,
            totalAmount: commissionAmount,
            periodStart: new Date(),
            periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          })
        }
      }
    }

    return commissions
  }

  // Binary Commissions (left/right leg)
  private async calculateBinaryCommissions(
    buyer: MLMUser,
    amount: number,
    genealogy: any[]
  ): Promise<CommissionCalculation[]> {
    const commissions: CommissionCalculation[] = []
    
    // Find binary legs
    const leftLeg = genealogy.find(m => m.binaryLeg === 'left' && m.level === 1)
    const rightLeg = genealogy.find(m => m.binaryLeg === 'right' && m.level === 1)

    if (leftLeg) {
      const leftUser = await this.db.getMLMUser(leftLeg.userId)
      if (leftUser) {
        const commissionType = this.commissionTypes.binary_left
        const baseRate = commissionType.baseRate
        const rankBonus = this.calculateRankBonus(leftUser.rank, baseRate)
        const totalRate = baseRate + rankBonus
        const commissionAmount = amount * totalRate

        commissions.push({
          userId: leftUser.userId,
          fromUserId: buyer.userId,
          type: 'binary_left',
          level: 1,
          amount: commissionAmount,
          percentage: totalRate,
          baseAmount: amount,
          rankBonus: rankBonus,
          totalAmount: commissionAmount,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
      }
    }

    if (rightLeg) {
      const rightUser = await this.db.getMLMUser(rightLeg.userId)
      if (rightUser) {
        const commissionType = this.commissionTypes.binary_right
        const baseRate = commissionType.baseRate
        const rankBonus = this.calculateRankBonus(rightUser.rank, baseRate)
        const totalRate = baseRate + rankBonus
        const commissionAmount = amount * totalRate

        commissions.push({
          userId: rightUser.userId,
          fromUserId: buyer.userId,
          type: 'binary_right',
          level: 1,
          amount: commissionAmount,
          percentage: totalRate,
          baseAmount: amount,
          rankBonus: rankBonus,
          totalAmount: commissionAmount,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
      }
    }

    return commissions
  }

  // Matrix Commissions (2x2, 3x3, 5x5)
  private async calculateMatrixCommissions(
    buyer: MLMUser,
    amount: number,
    genealogy: any[]
  ): Promise<CommissionCalculation[]> {
    const commissions: CommissionCalculation[] = []
    
    // Find matrix positions
    const matrixMembers = genealogy.filter(m => m.matrixPosition !== null)
    
    for (const member of matrixMembers) {
      const memberUser = await this.db.getMLMUser(member.userId)
      if (!memberUser) continue

      let commissionType
      switch (member.matrixPosition) {
        case 1: // 2x2 matrix
          commissionType = this.commissionTypes.matrix_2x2
          break
        case 2: // 3x3 matrix
          commissionType = this.commissionTypes.matrix_3x3
          break
        case 3: // 5x5 matrix
          commissionType = this.commissionTypes.matrix_5x5
          break
        default:
          continue
      }

      const baseRate = commissionType.baseRate
      const rankBonus = this.calculateRankBonus(memberUser.rank, baseRate)
      const totalRate = baseRate + rankBonus
      const commissionAmount = amount * totalRate

      commissions.push({
        userId: memberUser.userId,
        fromUserId: buyer.userId,
        type: `matrix_${member.matrixPosition}x${member.matrixPosition}`,
        level: 1,
        amount: commissionAmount,
        percentage: totalRate,
        baseAmount: amount,
        rankBonus: rankBonus,
        totalAmount: commissionAmount,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })
    }

    return commissions
  }

  // Hybrid Commissions (combination of multiple types)
  private async calculateHybridCommissions(
    buyer: MLMUser,
    amount: number,
    genealogy: any[]
  ): Promise<CommissionCalculation[]> {
    const commissions: CommissionCalculation[] = []
    
    // Calculate all commission types
    const directCommissions = await this.calculateDirectReferralCommissions(buyer, amount)
    const unilevelCommissions = await this.calculateUnilevelCommissions(buyer, amount, genealogy)
    const binaryCommissions = await this.calculateBinaryCommissions(buyer, amount, genealogy)
    const matrixCommissions = await this.calculateMatrixCommissions(buyer, amount, genealogy)

    // Combine all commissions
    commissions.push(...directCommissions)
    commissions.push(...unilevelCommissions)
    commissions.push(...binaryCommissions)
    commissions.push(...matrixCommissions)

    return commissions
  }

  // Bonus Commissions
  private async calculateBonusCommissions(
    buyer: MLMUser,
    amount: number,
    genealogy: any[]
  ): Promise<CommissionCalculation[]> {
    const commissions: CommissionCalculation[] = []
    
    // Fast Start Bonus (first 30 days)
    const daysSinceJoin = Math.floor((Date.now() - buyer.joinDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceJoin <= 30) {
      const sponsor = await this.db.getMLMUser(buyer.sponsorId!)
      if (sponsor) {
        const fastStartAmount = amount * this.commissionTypes.fast_start.baseRate
        commissions.push({
          userId: sponsor.userId,
          fromUserId: buyer.userId,
          type: 'fast_start',
          level: 1,
          amount: fastStartAmount,
          percentage: this.commissionTypes.fast_start.baseRate,
          baseAmount: amount,
          rankBonus: 0,
          totalAmount: fastStartAmount,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
      }
    }

    // Matching Bonus (for qualified ranks)
    if (buyer.rank.bonusEligibility.includes('matching_bonus')) {
      const sponsor = await this.db.getMLMUser(buyer.sponsorId!)
      if (sponsor) {
        const matchingAmount = amount * this.commissionTypes.matching_bonus.baseRate
        commissions.push({
          userId: sponsor.userId,
          fromUserId: buyer.userId,
          type: 'matching_bonus',
          level: 1,
          amount: matchingAmount,
          percentage: this.commissionTypes.matching_bonus.baseRate,
          baseAmount: amount,
          rankBonus: 0,
          totalAmount: matchingAmount,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
      }
    }

    // Leadership Bonus (fixed amount for qualified ranks)
    if (buyer.rank.bonusEligibility.includes('leadership_bonus')) {
      const leadershipAmount = this.getLeadershipBonusAmount(buyer.rank)
      if (leadershipAmount > 0) {
        commissions.push({
          userId: buyer.userId,
          fromUserId: buyer.userId,
          type: 'leadership_bonus',
          level: 1,
          amount: leadershipAmount,
          percentage: 0,
          baseAmount: amount,
          rankBonus: 0,
          totalAmount: leadershipAmount,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
      }
    }

    return commissions
  }

  // Calculate rank bonus percentage
  private calculateRankBonus(rank: MLMRank, baseRate: number): number {
    const rankBonuses = {
      'associate': 0.00,
      'consultant': 0.05,
      'manager': 0.10,
      'director': 0.15,
      'executive': 0.20,
      'presidential': 0.25
    }

    return baseRate * (rankBonuses[rank.id as keyof typeof rankBonuses] || 0)
  }

  // Get leadership bonus amount
  private getLeadershipBonusAmount(rank: MLMRank): number {
    const leadershipBonuses = {
      'associate': 0,
      'consultant': 0,
      'manager': 500,
      'director': 1000,
      'executive': 2500,
      'presidential': 5000
    }

    return leadershipBonuses[rank.id as keyof typeof leadershipBonuses] || 0
  }

  // Process and save commissions
  async processCommissions(commissions: CommissionCalculation[]): Promise<MLMCommission[]> {
    const savedCommissions: MLMCommission[] = []

    for (const commission of commissions) {
      try {
        // Save commission to database
        const savedCommission = await this.db.createCommission({
          userId: commission.userId,
          fromUserId: commission.fromUserId,
          type: commission.type,
          level: commission.level,
          amount: commission.amount,
          percentage: commission.percentage,
          baseAmount: commission.baseAmount,
          rankBonus: commission.rankBonus,
          totalAmount: commission.totalAmount,
          status: 'pending',
          periodStart: commission.periodStart,
          periodEnd: commission.periodEnd
        })
        
        savedCommissions.push(savedCommission)

        // Update user earnings
        await this.updateUserEarnings(commission.userId, commission.totalAmount)

        // Log audit event
        try {
          await this.db.logAuditEvent({
            userId: commission.userId,
            action: 'commission_earned',
            entityType: 'commission',
            entityId: savedCommission.id,
            newValues: {
              amount: commission.totalAmount,
              type: commission.type,
              level: commission.level
            }
          })
        } catch (error) {
          console.log('🗄️ Could not log audit event, continuing without logging')
        }

        // Create notification for user
        try {
          await this.db.createNotification({
            userId: commission.userId,
            type: 'commission_earned',
            title: 'Commission Earned!',
            message: `You earned $${commission.totalAmount.toFixed(2)} from ${commission.type.replace('_', ' ')} commission.`,
            data: {
              amount: commission.totalAmount,
              type: commission.type,
              level: commission.level
            },
            priority: 'normal'
          })
        } catch (error) {
          console.log('🗄️ Could not create notification, continuing without notification')
        }

        // Send commission earned email
        try {
          const user = await this.db.getMLMUser(commission.userId)
          if (user) {
            await sendCommissionEarnedEmail({
              to: user.email,
              name: `${user.firstName} ${user.lastName}`,
              amount: commission.totalAmount,
              type: commission.type,
              level: commission.level,
              totalEarnings: user.totalEarnings,
              dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/mlm/dashboard`
            })
          }
        } catch (error) {
          console.log('📧 Could not send commission email, continuing without email')
        }

        console.log(`💰 Commission processed: ${commission.type} - $${commission.totalAmount} for user ${commission.userId}`)
      } catch (error) {
        console.error('Error processing commission:', error)
        // Continue with other commissions
      }
    }

    return savedCommissions
  }

  // Create mock commission for development
  private async createMockCommission(commission: CommissionCalculation): Promise<MLMCommission> {
    return {
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: commission.userId,
      fromUserId: commission.fromUserId,
      type: commission.type,
      level: commission.level,
      amount: commission.amount,
      percentage: commission.percentage,
      baseAmount: commission.baseAmount,
      rankBonus: commission.rankBonus,
      totalAmount: commission.totalAmount,
      status: 'pending',
      periodStart: commission.periodStart,
      periodEnd: commission.periodEnd,
      createdAt: new Date()
    }
  }

  // Update user earnings
  private async updateUserEarnings(userId: string, amount: number): Promise<void> {
    const user = await this.db.getMLMUser(userId)
    if (!user) return

    const updates = {
      totalEarnings: user.totalEarnings + amount,
      currentMonthEarnings: user.currentMonthEarnings + amount,
      lifetimeEarnings: user.lifetimeEarnings + amount
    }

    await this.db.updateMLMUser(userId, updates)
  }

  // Calculate team volume
  async calculateTeamVolume(userId: string): Promise<number> {
    try {
      const genealogy = await this.db.getTeamStructure(userId, 15)
      let totalVolume = 0

      for (const member of genealogy) {
        const memberUser = await this.db.getMLMUser(member.userId)
        if (memberUser) {
          totalVolume += memberUser.personalVolume
        }
      }

      // Update user's team volume (only if database is available)
      try {
        await this.db.updateMLMUser(userId, { teamVolume: totalVolume })
      } catch (error) {
        console.log('🗄️ Could not update team volume in database, using mock data')
      }

      return totalVolume
    } catch (error) {
      console.log('🗄️ Error calculating team volume, using mock data:', error.message)
      // Return mock team volume
      return 8500
    }
  }

  // Check rank advancement eligibility
  async checkRankAdvancement(userId: string): Promise<MLMRank | null> {
    try {
      const user = await this.db.getMLMUser(userId)
      if (!user) return null

      // Get all ranks ordered by level
      const ranks = await this.getMLMRanks()
      const currentRankIndex = ranks.findIndex(rank => rank.id === user.rank.id)
      
      // Check next rank
      const nextRank = ranks[currentRankIndex + 1]
      if (!nextRank) return null

      // Check if user meets requirements
      const meetsRequirements = 
        user.personalVolume >= nextRank.requirements.personalVolume &&
        user.teamVolume >= nextRank.requirements.teamVolume &&
        user.activeDownlines >= nextRank.requirements.activeDownlines &&
        user.qualifiedLegs >= nextRank.requirements.qualifiedLegs

      return meetsRequirements ? nextRank : null
    } catch (error) {
      console.log('🗄️ Error checking rank advancement, using mock data:', error.message)
      return null
    }
  }

  // Get all MLM ranks
  private async getMLMRanks(): Promise<MLMRank[]> {
    // This would typically query the database
    // For now, return the static ranks from the system
    const { mlmRanks } = await import('@/lib/mlm-system')
    return mlmRanks.sort((a, b) => a.level - b.level)
  }

  // Process rank advancement
  async processRankAdvancement(userId: string): Promise<MLMRank | null> {
    try {
      const user = await this.db.getMLMUser(userId)
      if (!user) return null

      const newRank = await this.checkRankAdvancement(userId)
      if (!newRank) return null

      // Update user rank
      await this.db.updateMLMUser(userId, { 
        rank: newRank,
        lastActivity: new Date()
      })

      // Send rank advancement email
      try {
        await sendRankAdvancementEmail({
          to: user.email,
          name: `${user.firstName} ${user.lastName}`,
          oldRank: user.rank.name,
          newRank: newRank.name,
          benefits: newRank.benefits.map(b => b.description),
          dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/mlm/dashboard`
        })
      } catch (error) {
        console.log('📧 Could not send rank advancement email, continuing without email')
      }

      console.log(`🎖️ Rank advancement: ${user.firstName} ${user.lastName} advanced to ${newRank.name}`)
      return newRank
    } catch (error) {
      console.error('Error processing rank advancement:', error)
      return null
    }
  }
}

// Export singleton instance
export const mlmCommissionEngine = new MLMCommissionEngine()
