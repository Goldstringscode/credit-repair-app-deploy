"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Star,
  Flame,
  Target,
  Users,
  Zap,
} from "lucide-react"
import LeaderboardSystem, { type LeaderboardEntry, type LeaderboardStats } from "@/lib/leaderboard-system"

interface LeaderboardDashboardProps {
  currentUserId?: string
  className?: string
}

export default function LeaderboardDashboard({ currentUserId = "current_user", className }: LeaderboardDashboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState<LeaderboardStats | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("all_time")
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null)
  const [system] = useState(() => LeaderboardSystem.getInstance())

  useEffect(() => {
    loadLeaderboard()
    loadStats()
  }, [selectedPeriod])

  const loadLeaderboard = () => {
    const data = system.getLeaderboard(selectedPeriod, 50)
    setLeaderboard(data)

    const userRank = system.getUserRank(currentUserId, selectedPeriod)
    setCurrentUserRank(userRank)
  }

  const loadStats = () => {
    const statsData = system.getLeaderboardStats()
    setStats(statsData)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-600">#{rank}</span>
    }
  }

  const getRankChangeIcon = (change: LeaderboardEntry["rankChange"]) => {
    switch (change) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "same":
        return <Minus className="h-4 w-4 text-gray-400" />
      case "new":
        return <Star className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getBadgeIcon = (badge: any) => {
    return <span className="text-lg">{badge.icon}</span>
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const getPointsForPeriod = (entry: LeaderboardEntry, period: string) => {
    switch (period) {
      case "weekly":
        return entry.weeklyPoints
      case "monthly":
        return entry.monthlyPoints
      default:
        return entry.totalPoints
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Leaderboard</h2>
          <p className="text-gray-600">Compete with other users and climb the ranks!</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_time">All Time</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="weekly">This Week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Current User Rank Card */}
      {currentUserRank && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getRankIcon(currentUserRank.rank)}
                  <span className="text-2xl font-bold text-blue-600">#{currentUserRank.rank}</span>
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={currentUserRank.avatar || "/placeholder.svg"} alt={currentUserRank.displayName} />
                  <AvatarFallback>{currentUserRank.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-blue-900">{currentUserRank.displayName}</h3>
                  <p className="text-sm text-blue-700">
                    {getPointsForPeriod(currentUserRank, selectedPeriod).toLocaleString()} points
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  {getRankChangeIcon(currentUserRank.rankChange)}
                  <span className="text-sm text-blue-700">
                    {currentUserRank.rankChange === "new" ? "New!" : "vs last period"}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-blue-600">
                  <div className="flex items-center space-x-1">
                    <Flame className="h-4 w-4" />
                    <span>{currentUserRank.streakDays} day streak</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>{currentUserRank.completedMilestones} milestones</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="achievements">Recent Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          {/* Top 3 Podium */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {leaderboard.slice(0, 3).map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`text-center p-6 rounded-lg border-2 ${
                      index === 0
                        ? "border-yellow-300 bg-yellow-50"
                        : index === 1
                          ? "border-gray-300 bg-gray-50"
                          : "border-amber-300 bg-amber-50"
                    } ${entry.isCurrentUser ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <div className="mb-4">{getRankIcon(entry.rank)}</div>
                    <Avatar className="h-16 w-16 mx-auto mb-4">
                      <AvatarImage src={entry.avatar || "/placeholder.svg"} alt={entry.displayName} />
                      <AvatarFallback>{entry.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold mb-1">{entry.displayName}</h3>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      {getPointsForPeriod(entry, selectedPeriod).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">{entry.completedMilestones} milestones</p>
                    <div className="flex justify-center space-x-1">
                      {entry.badges.slice(0, 3).map((badge) => (
                        <div
                          key={badge.id}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          style={{ backgroundColor: badge.color + "20" }}
                          title={badge.name}
                        >
                          {getBadgeIcon(badge)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Full Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Full Rankings</CardTitle>
              <CardDescription>Complete leaderboard for {selectedPeriod.replace("_", " ")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      entry.isCurrentUser ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 w-12">
                        {getRankIcon(entry.rank)}
                        {getRankChangeIcon(entry.rankChange)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.avatar || "/placeholder.svg"} alt={entry.displayName} />
                        <AvatarFallback>{entry.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{entry.displayName}</h4>
                        <p className="text-sm text-gray-600">@{entry.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {getPointsForPeriod(entry, selectedPeriod).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">points</p>
                      </div>

                      <div className="text-right">
                        <p className="font-medium">{entry.completedMilestones}</p>
                        <p className="text-sm text-gray-600">milestones</p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{entry.streakDays}</span>
                        </div>
                        <p className="text-sm text-gray-600">day streak</p>
                      </div>

                      <div className="flex space-x-1">
                        {entry.badges.slice(0, 3).map((badge) => (
                          <div
                            key={badge.id}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: badge.color + "20" }}
                            title={badge.name}
                          >
                            {getBadgeIcon(badge)}
                          </div>
                        ))}
                        {entry.badges.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                            +{entry.badges.length - 3}
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-gray-500">{formatTimeAgo(entry.lastActivity)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {stats && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                    <p className="text-sm text-gray-600">Total Participants</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold">{stats.averagePoints.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Average Points</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <p className="text-2xl font-bold">{stats.topPerformer.totalPoints.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Top Score</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Flame className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-2xl font-bold">{stats.longestStreak.streakDays}</p>
                    <p className="text-sm text-gray-600">Longest Streak</p>
                  </CardContent>
                </Card>
              </div>

              {/* Featured Users */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                      Top Performer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={stats.topPerformer.avatar || "/placeholder.svg"}
                          alt={stats.topPerformer.displayName}
                        />
                        <AvatarFallback>{stats.topPerformer.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{stats.topPerformer.displayName}</h4>
                        <p className="text-2xl font-bold text-yellow-600">
                          {stats.topPerformer.totalPoints.toLocaleString()} points
                        </p>
                        <p className="text-sm text-gray-600">{stats.topPerformer.completedMilestones} milestones</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                      Most Improved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={stats.mostImproved.avatar || "/placeholder.svg"}
                          alt={stats.mostImproved.displayName}
                        />
                        <AvatarFallback>{stats.mostImproved.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{stats.mostImproved.displayName}</h4>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.mostImproved.totalPoints.toLocaleString()} points
                        </p>
                        <p className="text-sm text-gray-600">Rank #{stats.mostImproved.rank}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Flame className="h-5 w-5 mr-2 text-orange-500" />
                      Streak Leader
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={stats.longestStreak.avatar || "/placeholder.svg"}
                          alt={stats.longestStreak.displayName}
                        />
                        <AvatarFallback>{stats.longestStreak.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{stats.longestStreak.displayName}</h4>
                        <p className="text-2xl font-bold text-orange-600">{stats.longestStreak.streakDays} days</p>
                        <p className="text-sm text-gray-600">Active streak</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-purple-500" />
                Recent Achievements
              </CardTitle>
              <CardDescription>Latest milestone completions and badge earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Award className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">@{achievement.username}</h4>
                        <p className="text-sm text-gray-600">{achievement.achievement}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-purple-100 text-purple-800">+{achievement.points} points</Badge>
                      <p className="text-sm text-gray-500 mt-1">{formatTimeAgo(achievement.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
