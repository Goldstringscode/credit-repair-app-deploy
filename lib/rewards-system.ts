interface Reward {
  id: string
  name: string
  description: string
  type: "cash" | "credit" | "physical" | "digital" | "experience" | "subscription"
  value: number
  currency: string
  image?: string
  icon: string
  color: string
  rarity: "common" | "rare" | "epic" | "legendary"
  requirements: RewardRequirement[]
  availability: {
    startDate: string
    endDate: string
    maxClaims: number
    currentClaims: number
  }
  isActive: boolean
  category: "daily" | "weekly" | "monthly" | "seasonal" | "milestone" | "achievement"
}

interface RewardRequirement {
  type: "rank" | "points" | "streak" | "milestones" | "referrals" | "revenue"
  value: number
  period?: "daily" | "weekly" | "monthly" | "all_time"
  description: string
}

interface UserReward {
  id: string
  userId: string
  rewardId: string
  reward: Reward
  claimedAt: string
  status: "pending" | "processing" | "delivered" | "failed"
  deliveryMethod: "email" | "platform_credit" | "physical_shipping" | "digital_download"
  trackingInfo?: string
  notes?: string
}

interface RewardTier {
  id: string
  name: string
  minRank: number
  maxRank: number
  color: string
  icon: string
  benefits: string[]
  monthlyRewards: Reward[]
}

interface Competition {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  type: "leaderboard" | "milestone" | "team" | "individual"
  prizes: CompetitionPrize[]
  participants: number
  isActive: boolean
  rules: string[]
  image?: string
}

interface CompetitionPrize {
  position: number | string // "1st", "2nd", "3rd", "top_10", etc.
  reward: Reward
  quantity: number
}

class RewardsSystem {
  private static instance: RewardsSystem
  private rewards: Map<string, Reward> = new Map()
  private userRewards: Map<string, UserReward[]> = new Map()
  private tiers: RewardTier[] = []
  private competitions: Map<string, Competition> = new Map()

  private constructor() {
    this.initializeRewards()
    this.initializeTiers()
    this.initializeCompetitions()
    this.generateMockUserRewards()
  }

  static getInstance(): RewardsSystem {
    if (!RewardsSystem.instance) {
      RewardsSystem.instance = new RewardsSystem()
    }
    return RewardsSystem.instance
  }

  private initializeRewards() {
    const rewards: Reward[] = [
      // Daily Rewards
      {
        id: "daily_bonus_credit",
        name: "$5 Platform Credit",
        description: "Daily bonus credit for active users",
        type: "credit",
        value: 5,
        currency: "USD",
        icon: "💰",
        color: "#10B981",
        rarity: "common",
        requirements: [
          {
            type: "points",
            value: 50,
            period: "daily",
            description: "Earn 50 points in a day",
          },
        ],
        availability: {
          startDate: "2024-01-01T00:00:00Z",
          endDate: "2024-12-31T23:59:59Z",
          maxClaims: 1000,
          currentClaims: 234,
        },
        isActive: true,
        category: "daily",
      },

      // Weekly Rewards
      {
        id: "weekly_cash_prize",
        name: "$50 Cash Prize",
        description: "Weekly cash prize for top 10 performers",
        type: "cash",
        value: 50,
        currency: "USD",
        icon: "💵",
        color: "#059669",
        rarity: "rare",
        requirements: [
          {
            type: "rank",
            value: 10,
            period: "weekly",
            description: "Finish in top 10 this week",
          },
        ],
        availability: {
          startDate: "2024-01-01T00:00:00Z",
          endDate: "2024-12-31T23:59:59Z",
          maxClaims: 520, // 52 weeks * 10 winners
          currentClaims: 89,
        },
        isActive: true,
        category: "weekly",
      },

      // Monthly Rewards
      {
        id: "monthly_iphone",
        name: "iPhone 15 Pro",
        description: "Latest iPhone for monthly champion",
        type: "physical",
        value: 999,
        currency: "USD",
        image: "/placeholder.svg?height=200&width=200&text=iPhone+15+Pro",
        icon: "📱",
        color: "#3B82F6",
        rarity: "legendary",
        requirements: [
          {
            type: "rank",
            value: 1,
            period: "monthly",
            description: "Finish #1 for the month",
          },
        ],
        availability: {
          startDate: "2024-01-01T00:00:00Z",
          endDate: "2024-12-31T23:59:59Z",
          maxClaims: 12, // 12 months
          currentClaims: 3,
        },
        isActive: true,
        category: "monthly",
      },

      {
        id: "monthly_macbook",
        name: "MacBook Air M3",
        description: "MacBook Air for top 3 monthly performers",
        type: "physical",
        value: 1299,
        currency: "USD",
        image: "/placeholder.svg?height=200&width=200&text=MacBook+Air",
        icon: "💻",
        color: "#6366F1",
        rarity: "legendary",
        requirements: [
          {
            type: "rank",
            value: 3,
            period: "monthly",
            description: "Finish in top 3 for the month",
          },
        ],
        availability: {
          startDate: "2024-01-01T00:00:00Z",
          endDate: "2024-12-31T23:59:59Z",
          maxClaims: 36, // 12 months * 3 winners
          currentClaims: 8,
        },
        isActive: true,
        category: "monthly",
      },

      // Milestone Rewards
      {
        id: "milestone_vacation",
        name: "All-Expenses Paid Vacation",
        description: "7-day vacation package to Hawaii",
        type: "experience",
        value: 5000,
        currency: "USD",
        image: "/placeholder.svg?height=200&width=200&text=Hawaii+Vacation",
        icon: "🏝️",
        color: "#F59E0B",
        rarity: "legendary",
        requirements: [
          {
            type: "milestones",
            value: 50,
            description: "Complete 50 milestones",
          },
          {
            type: "referrals",
            value: 10,
            description: "Refer 10 successful users",
          },
        ],
        availability: {
          startDate: "2024-01-01T00:00:00Z",
          endDate: "2024-12-31T23:59:59Z",
          maxClaims: 50,
          currentClaims: 12,
        },
        isActive: true,
        category: "milestone",
      },

      // Achievement Rewards
      {
        id: "achievement_tesla",
        name: "Tesla Model 3",
        description: "Brand new Tesla for ultimate achievers",
        type: "physical",
        value: 45000,
        currency: "USD",
        image: "/placeholder.svg?height=200&width=200&text=Tesla+Model+3",
        icon: "🚗",
        color: "#EF4444",
        rarity: "legendary",
        requirements: [
          {
            type: "revenue",
            value: 100000,
            period: "all_time",
            description: "Generate $100K in platform revenue",
          },
          {
            type: "referrals",
            value: 50,
            description: "Successfully refer 50 users",
          },
        ],
        availability: {
          startDate: "2024-01-01T00:00:00Z",
          endDate: "2024-12-31T23:59:59Z",
          maxClaims: 10,
          currentClaims: 1,
        },
        isActive: true,
        category: "achievement",
      },

      // Seasonal Rewards
      {
        id: "seasonal_bonus",
        name: "$1000 Holiday Bonus",
        description: "Special holiday bonus for top performers",
        type: "cash",
        value: 1000,
        currency: "USD",
        icon: "🎄",
        color: "#DC2626",
        rarity: "epic",
        requirements: [
          {
            type: "rank",
            value: 5,
            period: "monthly",
            description: "Top 5 during holiday season",
          },
        ],
        availability: {
          startDate: "2024-12-01T00:00:00Z",
          endDate: "2024-12-31T23:59:59Z",
          maxClaims: 25, // 5 winners * 5 categories
          currentClaims: 0,
        },
        isActive: true,
        category: "seasonal",
      },
    ]

    rewards.forEach((reward) => {
      this.rewards.set(reward.id, reward)
    })
  }

  private initializeTiers() {
    this.tiers = [
      {
        id: "bronze",
        name: "Bronze Tier",
        minRank: 51,
        maxRank: 100,
        color: "#CD7F32",
        icon: "🥉",
        benefits: ["5% bonus on all earnings", "Access to bronze-tier rewards", "Monthly $10 platform credit"],
        monthlyRewards: [this.rewards.get("daily_bonus_credit")!].filter(Boolean),
      },
      {
        id: "silver",
        name: "Silver Tier",
        minRank: 11,
        maxRank: 50,
        color: "#C0C0C0",
        icon: "🥈",
        benefits: [
          "10% bonus on all earnings",
          "Access to silver-tier rewards",
          "Monthly $25 platform credit",
          "Priority customer support",
        ],
        monthlyRewards: [this.rewards.get("weekly_cash_prize")!].filter(Boolean),
      },
      {
        id: "gold",
        name: "Gold Tier",
        minRank: 4,
        maxRank: 10,
        color: "#FFD700",
        icon: "🥇",
        benefits: [
          "15% bonus on all earnings",
          "Access to gold-tier rewards",
          "Monthly $50 platform credit",
          "VIP customer support",
          "Exclusive training sessions",
        ],
        monthlyRewards: [this.rewards.get("monthly_macbook")!].filter(Boolean),
      },
      {
        id: "platinum",
        name: "Platinum Tier",
        minRank: 2,
        maxRank: 3,
        color: "#E5E4E2",
        icon: "💎",
        benefits: [
          "20% bonus on all earnings",
          "Access to platinum-tier rewards",
          "Monthly $100 platform credit",
          "Dedicated account manager",
          "Exclusive events and networking",
        ],
        monthlyRewards: [this.rewards.get("monthly_iphone")!].filter(Boolean),
      },
      {
        id: "diamond",
        name: "Diamond Tier",
        minRank: 1,
        maxRank: 1,
        color: "#B9F2FF",
        icon: "💍",
        benefits: [
          "25% bonus on all earnings",
          "Access to all rewards",
          "Monthly $200 platform credit",
          "Personal success coach",
          "Luxury retreat invitations",
          "Revenue sharing opportunities",
        ],
        monthlyRewards: [this.rewards.get("monthly_iphone")!, this.rewards.get("milestone_vacation")!].filter(Boolean),
      },
    ]
  }

  private initializeCompetitions() {
    const competitions: Competition[] = [
      {
        id: "monthly_championship",
        name: "Monthly Championship",
        description: "Compete for the ultimate monthly prizes including iPhone, MacBook, and cash rewards",
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-01-31T23:59:59Z",
        type: "leaderboard",
        participants: 1247,
        isActive: true,
        rules: [
          "Must be active for at least 15 days in the month",
          "Minimum 500 points required to qualify",
          "Fair play policy strictly enforced",
        ],
        image: "/placeholder.svg?height=300&width=600&text=Monthly+Championship",
        prizes: [
          {
            position: "1st",
            reward: this.rewards.get("monthly_iphone")!,
            quantity: 1,
          },
          {
            position: "2nd",
            reward: this.rewards.get("monthly_macbook")!,
            quantity: 1,
          },
          {
            position: "3rd",
            reward: this.rewards.get("monthly_macbook")!,
            quantity: 1,
          },
          {
            position: "top_10",
            reward: this.rewards.get("weekly_cash_prize")!,
            quantity: 7,
          },
        ],
      },
      {
        id: "holiday_spectacular",
        name: "Holiday Spectacular",
        description: "Special holiday competition with massive prizes and bonuses",
        startDate: "2024-12-01T00:00:00Z",
        endDate: "2024-12-31T23:59:59Z",
        type: "milestone",
        participants: 892,
        isActive: true,
        rules: [
          "Complete special holiday milestones",
          "Bonus points for referrals during December",
          "Team challenges available",
        ],
        image: "/placeholder.svg?height=300&width=600&text=Holiday+Spectacular",
        prizes: [
          {
            position: "1st",
            reward: this.rewards.get("achievement_tesla")!,
            quantity: 1,
          },
          {
            position: "top_5",
            reward: this.rewards.get("seasonal_bonus")!,
            quantity: 5,
          },
          {
            position: "top_25",
            reward: this.rewards.get("milestone_vacation")!,
            quantity: 20,
          },
        ],
      },
    ]

    competitions.forEach((competition) => {
      this.competitions.set(competition.id, competition)
    })
  }

  private generateMockUserRewards() {
    const userIds = ["current_user", "user_1", "user_2", "user_3", "user_4", "user_5"]

    userIds.forEach((userId) => {
      const rewards: UserReward[] = []

      // Generate some claimed rewards
      const numRewards = Math.floor(Math.random() * 5) + 1
      const availableRewards = Array.from(this.rewards.values())

      for (let i = 0; i < numRewards; i++) {
        const reward = availableRewards[Math.floor(Math.random() * availableRewards.length)]
        const claimedDaysAgo = Math.floor(Math.random() * 30)

        rewards.push({
          id: `user_reward_${userId}_${i}`,
          userId,
          rewardId: reward.id,
          reward,
          claimedAt: new Date(Date.now() - claimedDaysAgo * 24 * 60 * 60 * 1000).toISOString(),
          status: Math.random() > 0.1 ? "delivered" : "processing",
          deliveryMethod:
            reward.type === "cash"
              ? "email"
              : reward.type === "credit"
                ? "platform_credit"
                : reward.type === "physical"
                  ? "physical_shipping"
                  : "digital_download",
          trackingInfo:
            reward.type === "physical" ? `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}` : undefined,
        })
      }

      this.userRewards.set(userId, rewards)
    })
  }

  // Public API methods
  getAllRewards(): Reward[] {
    return Array.from(this.rewards.values())
  }

  getRewardsByCategory(category: Reward["category"]): Reward[] {
    return Array.from(this.rewards.values()).filter((reward) => reward.category === category)
  }

  getAvailableRewards(userId: string, userRank: number, userPoints: number): Reward[] {
    return Array.from(this.rewards.values()).filter((reward) => {
      if (!reward.isActive) return false
      if (reward.availability.currentClaims >= reward.availability.maxClaims) return false

      return reward.requirements.every((req) => {
        switch (req.type) {
          case "rank":
            return userRank <= req.value
          case "points":
            return userPoints >= req.value
          default:
            return true // For demo purposes
        }
      })
    })
  }

  getUserRewards(userId: string): UserReward[] {
    return this.userRewards.get(userId) || []
  }

  getTiers(): RewardTier[] {
    return this.tiers
  }

  getUserTier(userRank: number): RewardTier | null {
    return this.tiers.find((tier) => userRank >= tier.minRank && userRank <= tier.maxRank) || null
  }

  getCompetitions(): Competition[] {
    return Array.from(this.competitions.values())
  }

  getActiveCompetitions(): Competition[] {
    return Array.from(this.competitions.values()).filter((comp) => comp.isActive)
  }

  claimReward(userId: string, rewardId: string): { success: boolean; message: string; userReward?: UserReward } {
    const reward = this.rewards.get(rewardId)
    if (!reward) {
      return { success: false, message: "Reward not found" }
    }

    if (!reward.isActive) {
      return { success: false, message: "Reward is not active" }
    }

    if (reward.availability.currentClaims >= reward.availability.maxClaims) {
      return { success: false, message: "Reward is no longer available" }
    }

    // Create user reward
    const userReward: UserReward = {
      id: `user_reward_${userId}_${Date.now()}`,
      userId,
      rewardId,
      reward,
      claimedAt: new Date().toISOString(),
      status: "pending",
      deliveryMethod:
        reward.type === "cash"
          ? "email"
          : reward.type === "credit"
            ? "platform_credit"
            : reward.type === "physical"
              ? "physical_shipping"
              : "digital_download",
    }

    // Add to user rewards
    const existingRewards = this.userRewards.get(userId) || []
    this.userRewards.set(userId, [...existingRewards, userReward])

    // Update availability
    reward.availability.currentClaims++

    return {
      success: true,
      message: "Reward claimed successfully!",
      userReward,
    }
  }

  calculateTotalRewardValue(userId: string): number {
    const userRewards = this.getUserRewards(userId)
    return userRewards.filter((ur) => ur.status === "delivered").reduce((total, ur) => total + ur.reward.value, 0)
  }

  getRewardStats() {
    const allRewards = Array.from(this.rewards.values())
    const totalValue = allRewards.reduce((sum, reward) => sum + reward.value * reward.availability.currentClaims, 0)

    const totalClaimed = allRewards.reduce((sum, reward) => sum + reward.availability.currentClaims, 0)

    return {
      totalRewards: allRewards.length,
      totalValue,
      totalClaimed,
      activeCompetitions: this.getActiveCompetitions().length,
      availableTiers: this.tiers.length,
    }
  }
}

export default RewardsSystem
export type { Reward, UserReward, RewardTier, Competition, CompetitionPrize, RewardRequirement }
