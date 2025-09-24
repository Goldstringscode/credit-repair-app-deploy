"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Target, TrendingUp, Award, Star, Crown, Zap, BarChart3, Calendar, Users, DollarSign, Medal, Flame, ChevronUp, ChevronDown, ArrowUpRight, ArrowDownRight, Clock, CheckCircle } from 'lucide-react'

const currentUser = {
  name: "John Doe",
  rank: "Director",
  level: 3,
  points: 8750,
  nextRankPoints: 12000,
  globalRanking: 3,
  teamRanking: 1,
  monthlyPerformance: 92,
  achievements: ["Top Performer", "Team Builder", "Sales Leader", "Mentor"]
}

const leaderboardData = [
  {
    id: 1,
    name: "Sarah Johnson",
    rank: "Executive",
    points: 15420,
    earnings: 12450,
    teamSize: 47,
    growth: 18.5,
    avatar: "/placeholder.svg?height=40&width=40",
    badges: ["#1 Global", "Top Recruiter", "Sales Champion"]
  },
  {
    id: 2,
    name: "Michael Chen",
    rank: "Executive",
    points: 14200,
    earnings: 11200,
    teamSize: 38,
    growth: 15.2,
    avatar: "/placeholder.svg?height=40&width=40",
    badges: ["Rising Star", "Team Builder"]
  },
  {
    id: 3,
    name: "John Doe",
    rank: "Director",
    points: 8750,
    earnings: 6800,
    teamSize: 23,
    growth: 12.8,
    avatar: "/placeholder.svg?height=40&width=40",
    badges: ["Consistent Performer", "Mentor"],
    isCurrentUser: true
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    rank: "Director",
    points: 8200,
    earnings: 6200,
    teamSize: 19,
    growth: 10.5,
    avatar: "/placeholder.svg?height=40&width=40",
    badges: ["Team Leader"]
  },
  {
    id: 5,
    name: "David Thompson",
    rank: "Manager",
    points: 5800,
    earnings: 4200,
    teamSize: 12,
    growth: 8.2,
    avatar: "/placeholder.svg?height=40&width=40",
    badges: ["New Leader"]
  }
]

const achievements = [
  {
    id: 1,
    title: "Sales Champion",
    description: "Achieve $10,000+ in monthly sales",
    icon: <Trophy className="h-6 w-6" />,
    earned: true,
    earnedDate: "2024-01-15",
    rarity: "rare",
    points: 500
  },
  {
    id: 2,
    title: "Team Builder",
    description: "Recruit 20+ active team members",
    icon: <Users className="h-6 w-6" />,
    earned: true,
    earnedDate: "2024-01-10",
    rarity: "uncommon",
    points: 300
  },
  {
    id: 3,
    title: "Mentor Master",
    description: "Help 5 team members reach Manager rank",
    icon: <Award className="h-6 w-6" />,
    earned: true,
    earnedDate: "2024-01-05",
    rarity: "epic",
    points: 750
  },
  {
    id: 4,
    title: "Consistency King",
    description: "Maintain 90%+ performance for 6 months",
    icon: <Target className="h-6 w-6" />,
    earned: false,
    progress: 83,
    rarity: "legendary",
    points: 1000
  },
  {
    id: 5,
    title: "Global Elite",
    description: "Reach top 10 global ranking",
    icon: <Crown className="h-6 w-6" />,
    earned: false,
    progress: 30,
    rarity: "legendary",
    points: 2000
  }
]

const performanceMetrics = {
  thisMonth: {
    sales: 8500,
    recruits: 3,
    teamGrowth: 12.8,
    performance: 92,
    rank: 3
  },
  lastMonth: {
    sales: 7200,
    recruits: 2,
    teamGrowth: 8.5,
    performance: 87,
    rank: 4
  },
  goals: {
    monthlySales: 10000,
    monthlyRecruits: 5,
    teamGrowth: 15,
    performance: 95
  }
}

const rankProgression = [
  { rank: "Associate", points: 0, achieved: true, date: "2023-08-15" },
  { rank: "Senior Associate", points: 1000, achieved: true, date: "2023-09-20" },
  { rank: "Manager", points: 2500, achieved: true, date: "2023-11-10" },
  { rank: "Director", points: 5000, achieved: true, date: "2024-01-05" },
  { rank: "Executive", points: 12000, achieved: false, progress: 72.9 },
  { rank: "Senior Executive", points: 25000, achieved: false, progress: 0 },
  { rank: "Presidential", points: 50000, achieved: false, progress: 0 }
]

export default function PerformanceRankingsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("this-month")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-100 text-gray-800"
      case "uncommon": return "bg-green-100 text-green-800"
      case "rare": return "bg-blue-100 text-blue-800"
      case "epic": return "bg-purple-100 text-purple-800"
      case "legendary": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />
      case 2: return <Medal className="h-5 w-5 text-gray-400" />
      case 3: return <Award className="h-5 w-5 text-orange-500" />
      default: return <span className="text-sm font-bold text-gray-600">#{position}</span>
    }
  }

  const getChangeIcon = (growth: number) => {
    if (growth > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />
    if (growth < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />
    return <div className="h-4 w-4" />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance & Rankings</h1>
          <p className="text-gray-600 mt-1">Track your performance and compete with your team</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Report
          </Button>
        </div>
      </div>

      {/* Current User Performance Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                <AvatarImage src="/placeholder.svg?height=64&width=64" alt={currentUser.name} />
                <AvatarFallback className="text-lg font-bold">JD</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-800">{currentUser.rank}</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">#{currentUser.globalRanking} Global</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-blue-600">{currentUser.monthlyPerformance}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Points</p>
                <p className="text-2xl font-bold text-purple-600">{currentUser.points.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Next Rank</p>
                <div className="mt-1">
                  <Progress 
                    value={(currentUser.points / currentUser.nextRankPoints) * 100} 
                    className="w-full h-2" 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {currentUser.nextRankPoints - currentUser.points} points to Executive
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-green-600">{currentUser.achievements.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Sales</p>
                <p className="text-2xl font-bold text-gray-900">${performanceMetrics.thisMonth.sales.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {getChangeIcon(performanceMetrics.thisMonth.sales - performanceMetrics.lastMonth.sales)}
                  <p className="text-xs text-green-600 ml-1">
                    +${(performanceMetrics.thisMonth.sales - performanceMetrics.lastMonth.sales).toLocaleString()} vs last month
                  </p>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Recruits</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.thisMonth.recruits}</p>
                <div className="flex items-center mt-1">
                  <Target className="h-3 w-3 text-blue-500 mr-1" />
                  <p className="text-xs text-blue-600">Goal: {performanceMetrics.goals.monthlyRecruits}</p>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Growth</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.thisMonth.teamGrowth}%</p>
                <div className="flex items-center mt-1">
                  {performanceMetrics.thisMonth.teamGrowth > performanceMetrics.lastMonth.teamGrowth ? 
                    <ChevronUp className="h-3 w-3 text-green-500 mr-1" /> : 
                    <ChevronDown className="h-3 w-3 text-red-500 mr-1" />
                  }
                  <p className="text-xs text-gray-600">
                    {performanceMetrics.thisMonth.teamGrowth > performanceMetrics.lastMonth.teamGrowth ? '+' : ''}
                    {(performanceMetrics.thisMonth.teamGrowth - performanceMetrics.lastMonth.teamGrowth).toFixed(1)}% vs last month
                  </p>
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Global Rank</p>
                <p className="text-2xl font-bold text-gray-900">#{currentUser.globalRanking}</p>
                <div className="flex items-center mt-1">
                  {currentUser.globalRanking < performanceMetrics.lastMonth.rank ? 
                    <ChevronUp className="h-3 w-3 text-green-500 mr-1" /> : 
                    <ChevronDown className="h-3 w-3 text-red-500 mr-1" />
                  }
                  <p className="text-xs text-green-600">
                    {currentUser.globalRanking < performanceMetrics.lastMonth.rank ? 'Up' : 'Down'} from #{performanceMetrics.lastMonth.rank}
                  </p>
                </div>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="rank-progression">Rank Progression</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Global Leaderboard</CardTitle>
                  <CardDescription>Top performers across all teams</CardDescription>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="sales">Sales Volume</SelectItem>
                    <SelectItem value="recruits">Recruitment</SelectItem>
                    <SelectItem value="growth">Team Growth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboardData.map((member, index) => (
                  <div
                    key={member.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      member.isCurrentUser ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(index + 1)}
                    </div>
                    
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        {member.isCurrentUser && <Badge className="bg-blue-100 text-blue-800">You</Badge>}
                        <Badge className="bg-gray-100 text-gray-800">{member.rank}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {member.badges.map((badge, badgeIndex) => (
                          <Badge key={badgeIndex} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Points</p>
                        <p className="font-semibold">{member.points.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Earnings</p>
                        <p className="font-semibold text-green-600">${member.earnings.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Team</p>
                        <p className="font-semibold">{member.teamSize}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {getChangeIcon(member.growth)}
                      <span className="text-sm font-medium text-green-600">+{member.growth}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`${achievement.earned ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${achievement.earned ? 'bg-yellow-100' : 'bg-gray-200'}`}>
                      <div className={achievement.earned ? 'text-yellow-600' : 'text-gray-400'}>
                        {achievement.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                        <Badge className={getRarityColor(achievement.rarity)}>{achievement.rarity}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      
                      {achievement.earned ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">
                            Earned {new Date(achievement.earnedDate!).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium">{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{achievement.points} points</span>
                        </div>
                        {achievement.earned && <Flame className="h-4 w-4 text-orange-500" />}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rank-progression" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rank Progression Path</CardTitle>
              <CardDescription>Your journey through the MLM ranks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {rankProgression.map((rank, index) => (
                  <div key={rank.rank} className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      rank.achieved 
                        ? 'bg-green-100 border-green-500 text-green-600' 
                        : rank.progress 
                        ? 'bg-blue-100 border-blue-500 text-blue-600'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      {rank.achieved ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : rank.progress ? (
                        <Clock className="h-6 w-6" />
                      ) : (
                        <span className="font-bold">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{rank.rank}</h3>
                        <Badge variant="outline">{rank.points.toLocaleString()} points</Badge>
                        {rank.achieved && (
                          <Badge className="bg-green-100 text-green-800">
                            Achieved {new Date(rank.date!).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      
                      {rank.progress !== undefined && !rank.achieved && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Progress to {rank.rank}</span>
                            <span className="text-sm font-medium">{rank.progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={rank.progress} className="h-2" />
                          <p className="text-xs text-gray-500">
                            {Math.round((rank.points - currentUser.points) * (1 - rank.progress / 100))} points remaining
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Your performance metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mb-2" />
                  <p>Performance analytics chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
                <CardDescription>Track your monthly objectives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Sales Goal</span>
                    <span className="text-sm font-medium">
                      ${performanceMetrics.thisMonth.sales.toLocaleString()} / ${performanceMetrics.goals.monthlySales.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(performanceMetrics.thisMonth.sales / performanceMetrics.goals.monthlySales) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Recruitment Goal</span>
                    <span className="text-sm font-medium">
                      {performanceMetrics.thisMonth.recruits} / {performanceMetrics.goals.monthlyRecruits}
                    </span>
                  </div>
                  <Progress value={(performanceMetrics.thisMonth.recruits / performanceMetrics.goals.monthlyRecruits) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Performance Goal</span>
                    <span className="text-sm font-medium">
                      {performanceMetrics.thisMonth.performance}% / {performanceMetrics.goals.performance}%
                    </span>
                  </div>
                  <Progress value={(performanceMetrics.thisMonth.performance / performanceMetrics.goals.performance) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Win Rate</p>
                    <p className="text-xl font-bold">87.5%</p>
                  </div>
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Streak</p>
                    <p className="text-xl font-bold">12 days</p>
                  </div>
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Efficiency</p>
                    <p className="text-xl font-bold">94%</p>
                  </div>
                  <Zap className="h-5 w-5 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Momentum</p>
                    <p className="text-xl font-bold">High</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
