"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  Filter,
  ChevronUp,
  ChevronDown,
  FlameIcon as Fire,
} from "lucide-react"

interface LeaderboardEntry {
  id: string
  rank: number
  previousRank?: number
  name: string
  avatar: string
  title: string
  points: number
  earnings: number
  teamSize: number
  salesCount: number
  region: string
  joinDate: string
  isCurrentUser?: boolean
  badges: string[]
  trend: "up" | "down" | "same"
}

interface TimeFilter {
  label: string
  value: string
  active: boolean
}

export default function LeaderboardPage() {
  const [selectedCategory, setSelectedCategory] = useState("points")
  const [selectedTimeframe, setSelectedTimeframe] = useState("monthly")

  const timeFilters: TimeFilter[] = [
    { label: "This Week", value: "weekly", active: false },
    { label: "This Month", value: "monthly", active: true },
    { label: "This Quarter", value: "quarterly", active: false },
    { label: "All Time", value: "alltime", active: false },
  ]

  const leaderboardData: LeaderboardEntry[] = [
    {
      id: "1",
      rank: 1,
      previousRank: 1,
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=50&width=50&text=SJ",
      title: "Executive Director",
      points: 15420,
      earnings: 28500,
      teamSize: 127,
      salesCount: 89,
      region: "North America",
      joinDate: "2023-01-15",
      badges: ["Top Performer", "Team Builder", "Sales Master"],
      trend: "same",
    },
    {
      id: "2",
      rank: 2,
      previousRank: 3,
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=50&width=50&text=MC",
      title: "Senior Director",
      points: 14890,
      earnings: 26200,
      teamSize: 98,
      salesCount: 76,
      region: "Asia Pacific",
      joinDate: "2023-02-20",
      badges: ["Rising Star", "Mentor"],
      trend: "up",
    },
    {
      id: "3",
      rank: 3,
      previousRank: 2,
      name: "Jennifer Adams",
      avatar: "/placeholder.svg?height=50&width=50&text=JA",
      title: "Senior Director",
      points: 14250,
      earnings: 25800,
      teamSize: 112,
      salesCount: 71,
      region: "Europe",
      joinDate: "2022-11-10",
      badges: ["Veteran", "Team Builder"],
      trend: "down",
    },
    {
      id: "4",
      rank: 4,
      previousRank: 5,
      name: "David Rodriguez",
      avatar: "/placeholder.svg?height=50&width=50&text=DR",
      title: "Director",
      points: 12680,
      earnings: 22100,
      teamSize: 84,
      salesCount: 65,
      region: "Latin America",
      joinDate: "2023-03-05",
      badges: ["Fast Climber"],
      trend: "up",
    },
    {
      id: "5",
      rank: 5,
      previousRank: 4,
      name: "Lisa Thompson",
      avatar: "/placeholder.svg?height=50&width=50&text=LT",
      title: "Director",
      points: 11950,
      earnings: 21400,
      teamSize: 76,
      salesCount: 58,
      region: "North America",
      joinDate: "2023-01-28",
      badges: ["Consistent Performer"],
      trend: "down",
    },
    {
      id: "6",
      rank: 6,
      previousRank: 7,
      name: "John Doe",
      avatar: "/placeholder.svg?height=50&width=50&text=JD",
      title: "Director",
      points: 10850,
      earnings: 19200,
      teamSize: 47,
      salesCount: 52,
      region: "North America",
      joinDate: "2023-04-12",
      isCurrentUser: true,
      badges: ["Team Builder"],
      trend: "up",
    },
    {
      id: "7",
      rank: 7,
      previousRank: 6,
      name: "Amanda Wilson",
      avatar: "/placeholder.svg?height=50&width=50&text=AW",
      title: "Manager",
      points: 9720,
      earnings: 17800,
      teamSize: 39,
      salesCount: 48,
      region: "North America",
      joinDate: "2023-05-20",
      badges: ["New Talent"],
      trend: "down",
    },
    {
      id: "8",
      rank: 8,
      previousRank: 9,
      name: "Robert Kim",
      avatar: "/placeholder.svg?height=50&width=50&text=RK",
      title: "Manager",
      points: 8940,
      earnings: 16500,
      teamSize: 32,
      salesCount: 44,
      region: "Asia Pacific",
      joinDate: "2023-06-15",
      badges: ["Rising Star"],
      trend: "up",
    },
  ]

  const topThree = leaderboardData.slice(0, 3)
  const restOfLeaderboard = leaderboardData.slice(3)

  const getTrendIcon = (trend: string, size = "h-4 w-4") => {
    switch (trend) {
      case "up":
        return <ChevronUp className={`${size} text-green-500`} />
      case "down":
        return <ChevronDown className={`${size} text-red-500`} />
      default:
        return <div className={`${size}`} />
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return (
          <div className="h-6 w-6 flex items-center justify-center bg-gray-100 rounded-full text-sm font-bold text-gray-600">
            {rank}
          </div>
        )
    }
  }

  const getBadgeColor = (badge: string) => {
    const colors = {
      "Top Performer": "bg-purple-100 text-purple-800",
      "Team Builder": "bg-blue-100 text-blue-800",
      "Sales Master": "bg-green-100 text-green-800",
      "Rising Star": "bg-yellow-100 text-yellow-800",
      Mentor: "bg-indigo-100 text-indigo-800",
      Veteran: "bg-gray-100 text-gray-800",
      "Fast Climber": "bg-red-100 text-red-800",
      "Consistent Performer": "bg-teal-100 text-teal-800",
      "New Talent": "bg-pink-100 text-pink-800",
    }
    return colors[badge as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-lg text-gray-600">See how you stack up against top performers</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {timeFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedTimeframe === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe(filter.value)}
              >
                <Calendar className="h-4 w-4 mr-1" />
                {filter.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            More Filters
          </Button>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="points">
              <Star className="h-4 w-4 mr-1" />
              Points
            </TabsTrigger>
            <TabsTrigger value="earnings">
              <DollarSign className="h-4 w-4 mr-1" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-1" />
              Team Size
            </TabsTrigger>
            <TabsTrigger value="sales">
              <Target className="h-4 w-4 mr-1" />
              Sales
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-6">
            {/* Top 3 Podium */}
            <Card className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold">🏆 Top Performers 🏆</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 2nd Place */}
                  <div className="order-1 md:order-1 text-center">
                    <div className="relative mb-4">
                      <div className="w-20 h-24 bg-gray-300 rounded-t-lg mx-auto flex items-end justify-center pb-2">
                        <span className="text-gray-700 font-bold text-lg">2</span>
                      </div>
                      <Avatar className="absolute -top-8 left-1/2 transform -translate-x-1/2 h-16 w-16 border-4 border-white">
                        <img src={topThree[1]?.avatar || "/placeholder.svg"} alt={topThree[1]?.name} />
                      </Avatar>
                    </div>
                    <h3 className="font-bold text-lg">{topThree[1]?.name}</h3>
                    <p className="text-sm opacity-90">{topThree[1]?.title}</p>
                    <div className="mt-2">
                      <Badge className="bg-white/20 text-white">
                        {selectedCategory === "points" && `${topThree[1]?.points.toLocaleString()} pts`}
                        {selectedCategory === "earnings" && `$${topThree[1]?.earnings.toLocaleString()}`}
                        {selectedCategory === "team" && `${topThree[1]?.teamSize} members`}
                        {selectedCategory === "sales" && `${topThree[1]?.salesCount} sales`}
                      </Badge>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="order-2 md:order-2 text-center">
                    <div className="relative mb-4">
                      <div className="w-20 h-32 bg-yellow-400 rounded-t-lg mx-auto flex items-end justify-center pb-2">
                        <Crown className="h-8 w-8 text-yellow-700" />
                      </div>
                      <Avatar className="absolute -top-8 left-1/2 transform -translate-x-1/2 h-20 w-20 border-4 border-white">
                        <img src={topThree[0]?.avatar || "/placeholder.svg"} alt={topThree[0]?.name} />
                      </Avatar>
                    </div>
                    <h3 className="font-bold text-xl">{topThree[0]?.name}</h3>
                    <p className="text-sm opacity-90">{topThree[0]?.title}</p>
                    <div className="mt-2">
                      <Badge className="bg-white/20 text-white text-lg px-3 py-1">
                        {selectedCategory === "points" && `${topThree[0]?.points.toLocaleString()} pts`}
                        {selectedCategory === "earnings" && `$${topThree[0]?.earnings.toLocaleString()}`}
                        {selectedCategory === "team" && `${topThree[0]?.teamSize} members`}
                        {selectedCategory === "sales" && `${topThree[0]?.salesCount} sales`}
                      </Badge>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="order-3 md:order-3 text-center">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 bg-amber-600 rounded-t-lg mx-auto flex items-end justify-center pb-2">
                        <span className="text-amber-100 font-bold text-lg">3</span>
                      </div>
                      <Avatar className="absolute -top-8 left-1/2 transform -translate-x-1/2 h-16 w-16 border-4 border-white">
                        <img src={topThree[2]?.avatar || "/placeholder.svg"} alt={topThree[2]?.name} />
                      </Avatar>
                    </div>
                    <h3 className="font-bold text-lg">{topThree[2]?.name}</h3>
                    <p className="text-sm opacity-90">{topThree[2]?.title}</p>
                    <div className="mt-2">
                      <Badge className="bg-white/20 text-white">
                        {selectedCategory === "points" && `${topThree[2]?.points.toLocaleString()} pts`}
                        {selectedCategory === "earnings" && `$${topThree[2]?.earnings.toLocaleString()}`}
                        {selectedCategory === "team" && `${topThree[2]?.teamSize} members`}
                        {selectedCategory === "sales" && `${topThree[2]?.salesCount} sales`}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rest of Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Full Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {restOfLeaderboard.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                        entry.isCurrentUser
                          ? "bg-blue-50 border-blue-200 shadow-md"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Rank */}
                        <div className="flex items-center space-x-2">
                          {getRankIcon(entry.rank)}
                          {getTrendIcon(entry.trend)}
                        </div>

                        {/* Avatar and Info */}
                        <Avatar className="h-12 w-12">
                          <img src={entry.avatar || "/placeholder.svg"} alt={entry.name} />
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-semibold ${entry.isCurrentUser ? "text-blue-900" : "text-gray-900"}`}>
                              {entry.name}
                            </h3>
                            {entry.isCurrentUser && <Badge className="bg-blue-100 text-blue-800 text-xs">You</Badge>}
                          </div>
                          <p className="text-sm text-gray-600">{entry.title}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.badges.slice(0, 2).map((badge) => (
                              <Badge key={badge} className={`text-xs ${getBadgeColor(badge)}`}>
                                {badge}
                              </Badge>
                            ))}
                            {entry.badges.length > 2 && (
                              <Badge className="text-xs bg-gray-100 text-gray-600">
                                +{entry.badges.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {selectedCategory === "points" && `${entry.points.toLocaleString()}`}
                          {selectedCategory === "earnings" && `$${entry.earnings.toLocaleString()}`}
                          {selectedCategory === "team" && `${entry.teamSize}`}
                          {selectedCategory === "sales" && `${entry.salesCount}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedCategory === "points" && "points"}
                          {selectedCategory === "earnings" && "earned"}
                          {selectedCategory === "team" && "members"}
                          {selectedCategory === "sales" && "sales"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{entry.region}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Your Rank</h3>
                      <div className="text-3xl font-bold">#6</div>
                      <div className="text-sm opacity-90 flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Up 1 position
                      </div>
                    </div>
                    <Trophy className="h-12 w-12 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Points to Next</h3>
                      <div className="text-3xl font-bold">1,100</div>
                      <div className="text-sm opacity-90">To reach rank #5</div>
                    </div>
                    <Target className="h-12 w-12 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Top 10%</h3>
                      <div className="text-3xl font-bold">Elite</div>
                      <div className="text-sm opacity-90 flex items-center mt-1">
                        <Fire className="h-4 w-4 mr-1" />
                        Keep it up!
                      </div>
                    </div>
                    <Star className="h-12 w-12 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
