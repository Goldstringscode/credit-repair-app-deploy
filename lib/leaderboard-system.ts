interface LeaderboardEntry {
  id: string
  userId: string
  username: string
  displayName: string
  avatar?: string
  totalPoints: number
  completedMilestones: number
  rank: number
  previousRank?: number
  rankChange: "up" | "down" | "same" | "new"
  streakDays: number
  lastActivity: string
  joinDate: string
  badges: LeaderboardBadge[]
  categoryPoints: {
    onboarding: number
    engagement: number
    conversion: number
    retention: number
    custom: number
  }
  weeklyPoints: number
  monthlyPoints: number
  isCurrentUser?: boolean
}

interface LeaderboardBadge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  earnedAt: string
  category: "achievement" | "streak" | "milestone" | "special"
}

interface LeaderboardPeriod {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
}

interface LeaderboardStats {
  totalParticipants: number
  averagePoints: number
  topPerformer: LeaderboardEntry
  mostImproved: LeaderboardEntry
  longestStreak: LeaderboardEntry
  recentAchievements: {
    userId: string
    username: string
    achievement: string
    points: number
    timestamp: string
  }[]
}

class LeaderboardSystem {
  private static instance: LeaderboardSystem
  private entries: Map<string, LeaderboardEntry> = new Map()
  private badges: Map<string, LeaderboardBadge[]> = new Map()
  private periods: LeaderboardPeriod[] = []
  private stats: LeaderboardStats | null = null

  private constructor() {
    this.initializeDefaultBadges()
    this.initializePeriods()
    this.generateMockData()
    this.calculateStats()
  }

  static getInstance(): LeaderboardSystem {
    if (!LeaderboardSystem.instance) {
      LeaderboardSystem.instance = new LeaderboardSystem()
    }
    return LeaderboardSystem.instance
  }

  private initializeDefaultBadges() {
    const defaultBadges: LeaderboardBadge[] = [
      {
        id: "first_steps",
        name: "First Steps",
        description: "Completed your first milestone",
        icon: "👶",
        color: "#10B981",
        earnedAt: new Date().toISOString(),
        category: "achievement",
      },
      {
        id: "milestone_master",
        name: "Milestone Master",
        description: "Completed 10 milestones",
        icon: "🏆",
        color: "#F59E0B",
        earnedAt: new Date().toISOString(),
        category: "achievement",
      },
      {
        id: "streak_warrior",
        name: "Streak Warrior",
        description: "7-day activity streak",
        icon: "🔥",
        color: "#EF4444",
        earnedAt: new Date().toISOString(),
        category: "streak",
      },
      {
        id: "point_collector",
        name: "Point Collector",
        description: "Earned 1000+ points",
        icon: "💎",
        color: "#8B5CF6",
        earnedAt: new Date().toISOString(),
        category: "milestone",
      },
      {
        id: "onboarding_champion",
        name: "Onboarding Champion",
        description: "Completed all onboarding milestones",
        icon: "🎯",
        color: "#3B82F6",
        earnedAt: new Date().toISOString(),
        category: "achievement",
      },
      {
        id: "engagement_expert",
        name: "Engagement Expert",
        description: "High engagement score",
        icon: "⚡",
        color: "#06B6D4",
        earnedAt: new Date().toISOString(),
        category: "special",
      },
    ]

    // Assign badges to mock users
    const userIds = ["user_1", "user_2", "user_3", "user_4", "user_5"]
    userIds.forEach((userId, index) => {
      const userBadges = defaultBadges.slice(0, Math.floor(Math.random() * 4) + 1)
      this.badges.set(userId, userBadges)
    })
  }

  private initializePeriods() {
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    this.periods = [
      {
        id: "all_time",
        name: "All Time",
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2099-12-31T23:59:59Z",
        isActive: true,
      },
      {
        id: "monthly",
        name: "This Month",
        startDate: monthStart.toISOString(),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString(),
        isActive: true,
      },
      {
        id: "weekly",
        name: "This Week",
        startDate: weekStart.toISOString(),
        endDate: new Date(
          weekStart.getTime() + 6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000,
        ).toISOString(),
        isActive: true,
      },
    ]
  }

  private generateMockData() {
    const mockUsers = [
      {
        userId: "user_1",
        username: "sarah_johnson",
        displayName: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        totalPoints: 2450,
        completedMilestones: 18,
        streakDays: 12,
        weeklyPoints: 340,
        monthlyPoints: 1200,
      },
      {
        userId: "user_2",
        username: "mike_rodriguez",
        displayName: "Mike Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        totalPoints: 2180,
        completedMilestones: 16,
        streakDays: 8,
        weeklyPoints: 280,
        monthlyPoints: 980,
      },
      {
        userId: "user_3",
        username: "emily_chen",
        displayName: "Emily Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        totalPoints: 1950,
        completedMilestones: 15,
        streakDays: 15,
        weeklyPoints: 420,
        monthlyPoints: 1100,
      },
      {
        userId: "user_4",
        username: "david_wilson",
        displayName: "David Wilson",
        avatar: "/placeholder.svg?height=40&width=40",
        totalPoints: 1720,
        completedMilestones: 13,
        streakDays: 5,
        weeklyPoints: 190,
        monthlyPoints: 650,
      },
      {
        userId: "user_5",
        username: "lisa_anderson",
        displayName: "Lisa Anderson",
        avatar: "/placeholder.svg?height=40&width=40",
        totalPoints: 1580,
        completedMilestones: 12,
        streakDays: 3,
        weeklyPoints: 150,
        monthlyPoints: 580,
      },
      {
        userId: "current_user",
        username: "you",
        displayName: "You",
        avatar: "/placeholder.svg?height=40&width=40",
        totalPoints: 1350,
        completedMilestones: 10,
        streakDays: 7,
        weeklyPoints: 220,
        monthlyPoints: 750,
        isCurrentUser: true,
      },
    ]

    mockUsers.forEach((user, index) => {
      const entry: LeaderboardEntry = {
        id: `entry_${user.userId}`,
        ...user,
        rank: index + 1,
        previousRank: index + Math.floor(Math.random() * 3) - 1,
        rankChange: this.calculateRankChange(index + 1, index + Math.floor(Math.random() * 3) - 1),
        lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        joinDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        badges: this.badges.get(user.userId) || [],
        categoryPoints: {
          onboarding: Math.floor(user.totalPoints * 0.3),
          engagement: Math.floor(user.totalPoints * 0.25),
          conversion: Math.floor(user.totalPoints * 0.2),
          retention: Math.floor(user.totalPoints * 0.15),
          custom: Math.floor(user.totalPoints * 0.1),
        },
      }

      this.entries.set(user.userId, entry)
    })
  }

  private calculateRankChange(currentRank: number, previousRank?: number): "up" | "down" | "same" | "new" {
    if (!previousRank) return "new"
    if (currentRank < previousRank) return "up"
    if (currentRank > previousRank) return "down"
    return "same"
  }

  private calculateStats() {
    const entries = Array.from(this.entries.values())
    const totalPoints = entries.reduce((sum, entry) => sum + entry.totalPoints, 0)

    this.stats = {
      totalParticipants: entries.length,
      averagePoints: Math.floor(totalPoints / entries.length),
      topPerformer: entries[0],
      mostImproved: entries.find((e) => e.rankChange === "up") || entries[0],
      longestStreak: entries.reduce((longest, current) =>
        current.streakDays > longest.streakDays ? current : longest,
      ),
      recentAchievements: [
        {
          userId: "user_1",
          username: "sarah_johnson",
          achievement: "Completed 'First Referral Sent' milestone",
          points: 75,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          userId: "user_3",
          username: "emily_chen",
          achievement: "Earned 'Streak Warrior' badge",
          points: 100,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          userId: "user_2",
          username: "mike_rodriguez",
          achievement: "Completed 'Team Builder Accessed' milestone",
          points: 30,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
      ],
    }
  }

  // Public API methods
  getLeaderboard(periodId = "all_time", limit = 50): LeaderboardEntry[] {
    const entries = Array.from(this.entries.values())

    // Sort by total points (descending)
    entries.sort((a, b) => {
      if (periodId === "weekly") {
        return b.weeklyPoints - a.weeklyPoints
      }
      if (periodId === "monthly") {
        return b.monthlyPoints - a.monthlyPoints
      }
      return b.totalPoints - a.totalPoints
    })

    // Update ranks based on current sorting
    entries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return entries.slice(0, limit)
  }

  getUserRank(userId: string, periodId = "all_time"): LeaderboardEntry | null {
    const leaderboard = this.getLeaderboard(periodId)
    return leaderboard.find((entry) => entry.userId === userId) || null
  }

  getLeaderboardStats(): LeaderboardStats | null {
    return this.stats
  }

  getPeriods(): LeaderboardPeriod[] {
    return this.periods
  }

  updateUserPoints(userId: string, pointsToAdd: number, category: keyof LeaderboardEntry["categoryPoints"] = "custom") {
    const entry = this.entries.get(userId)
    if (!entry) return false

    entry.totalPoints += pointsToAdd
    entry.categoryPoints[category] += pointsToAdd
    entry.weeklyPoints += pointsToAdd
    entry.monthlyPoints += pointsToAdd
    entry.lastActivity = new Date().toISOString()

    // Check for badge eligibility
    this.checkBadgeEligibility(userId, entry)

    // Recalculate stats
    this.calculateStats()

    return true
  }

  private checkBadgeEligibility(userId: string, entry: LeaderboardEntry) {
    const userBadges = this.badges.get(userId) || []
    const newBadges: LeaderboardBadge[] = []

    // Check for various badge conditions
    if (entry.totalPoints >= 1000 && !userBadges.find((b) => b.id === "point_collector")) {
      newBadges.push({
        id: "point_collector",
        name: "Point Collector",
        description: "Earned 1000+ points",
        icon: "💎",
        color: "#8B5CF6",
        earnedAt: new Date().toISOString(),
        category: "milestone",
      })
    }

    if (entry.completedMilestones >= 10 && !userBadges.find((b) => b.id === "milestone_master")) {
      newBadges.push({
        id: "milestone_master",
        name: "Milestone Master",
        description: "Completed 10 milestones",
        icon: "🏆",
        color: "#F59E0B",
        earnedAt: new Date().toISOString(),
        category: "achievement",
      })
    }

    if (entry.streakDays >= 7 && !userBadges.find((b) => b.id === "streak_warrior")) {
      newBadges.push({
        id: "streak_warrior",
        name: "Streak Warrior",
        description: "7-day activity streak",
        icon: "🔥",
        color: "#EF4444",
        earnedAt: new Date().toISOString(),
        category: "streak",
      })
    }

    if (newBadges.length > 0) {
      this.badges.set(userId, [...userBadges, ...newBadges])
      entry.badges = [...userBadges, ...newBadges]

      // Dispatch badge earned event
      if (typeof window !== "undefined") {
        newBadges.forEach((badge) => {
          window.dispatchEvent(
            new CustomEvent("badge_earned", {
              detail: { userId, badge, entry },
            }),
          )
        })
      }
    }
  }

  addUser(userData: Omit<LeaderboardEntry, "id" | "rank" | "rankChange" | "badges" | "categoryPoints">): string {
    const id = `entry_${userData.userId}`
    const entry: LeaderboardEntry = {
      ...userData,
      id,
      rank: this.entries.size + 1,
      rankChange: "new",
      badges: [],
      categoryPoints: {
        onboarding: 0,
        engagement: 0,
        conversion: 0,
        retention: 0,
        custom: 0,
      },
    }

    this.entries.set(userData.userId, entry)
    this.calculateStats()

    return id
  }

  removeUser(userId: string): boolean {
    const deleted = this.entries.delete(userId)
    if (deleted) {
      this.badges.delete(userId)
      this.calculateStats()
    }
    return deleted
  }

  // Real-time updates
  subscribeToUpdates(callback: (leaderboard: LeaderboardEntry[]) => void) {
    // In a real implementation, this would set up WebSocket or SSE connection
    const interval = setInterval(() => {
      // Simulate real-time updates
      if (Math.random() < 0.1) {
        // 10% chance of update
        const entries = Array.from(this.entries.values())
        const randomEntry = entries[Math.floor(Math.random() * entries.length)]
        this.updateUserPoints(randomEntry.userId, Math.floor(Math.random() * 50) + 10)
        callback(this.getLeaderboard())
      }
    }, 5000)

    return () => clearInterval(interval)
  }
}

export default LeaderboardSystem
export type { LeaderboardEntry, LeaderboardBadge, LeaderboardPeriod, LeaderboardStats }
