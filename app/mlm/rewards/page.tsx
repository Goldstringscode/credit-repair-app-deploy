"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Gift,
  Trophy,
  Star,
  Crown,
  Zap,
  Target,
  Award,
  Coins,
  ShoppingBag,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  Lock,
  Sparkles,
  Medal,
  Gem,
} from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  rarity: "common" | "rare" | "epic" | "legendary"
  points: number
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedDate?: string
  category: "sales" | "team" | "training" | "milestone"
}

interface Reward {
  id: string
  title: string
  description: string
  cost: number
  category: "physical" | "digital" | "experience" | "bonus"
  image: string
  available: boolean
  claimed?: boolean
  popularity: number
}

interface Goal {
  id: string
  title: string
  description: string
  target: number
  current: number
  reward: string
  deadline: string
  category: "daily" | "weekly" | "monthly"
  completed: boolean
}

export default function RewardsPage() {
  const [currentPoints] = useState(2450)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const achievements: Achievement[] = [
    {
      id: "first-sale",
      title: "First Sale",
      description: "Complete your first successful sale",
      icon: <DollarSign className="h-6 w-6" />,
      rarity: "common",
      points: 100,
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedDate: "2024-01-15",
      category: "sales",
    },
    {
      id: "team-builder",
      title: "Team Builder",
      description: "Recruit 10 active team members",
      icon: <Users className="h-6 w-6" />,
      rarity: "rare",
      points: 500,
      progress: 15,
      maxProgress: 10,
      unlocked: true,
      unlockedDate: "2024-02-20",
      category: "team",
    },
    {
      id: "sales-master",
      title: "Sales Master",
      description: "Achieve $10,000 in monthly sales",
      icon: <Trophy className="h-6 w-6" />,
      rarity: "epic",
      points: 1000,
      progress: 8500,
      maxProgress: 10000,
      unlocked: false,
      category: "sales",
    },
    {
      id: "training-guru",
      title: "Training Guru",
      description: "Complete all available training courses",
      icon: <Award className="h-6 w-6" />,
      rarity: "rare",
      points: 750,
      progress: 8,
      maxProgress: 12,
      unlocked: false,
      category: "training",
    },
    {
      id: "diamond-rank",
      title: "Diamond Achiever",
      description: "Reach Diamond rank status",
      icon: <Gem className="h-6 w-6" />,
      rarity: "legendary",
      points: 2500,
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      category: "milestone",
    },
    {
      id: "mentor",
      title: "Master Mentor",
      description: "Help 5 team members reach Manager rank",
      icon: <Crown className="h-6 w-6" />,
      rarity: "epic",
      points: 1500,
      progress: 3,
      maxProgress: 5,
      unlocked: false,
      category: "team",
    },
  ]

  const rewards: Reward[] = [
    {
      id: "gift-card-50",
      title: "$50 Amazon Gift Card",
      description: "Redeem for a $50 Amazon gift card",
      cost: 500,
      category: "digital",
      image: "/placeholder.svg?height=100&width=100&text=Gift",
      available: true,
      popularity: 95,
    },
    {
      id: "branded-hoodie",
      title: "Premium Branded Hoodie",
      description: "High-quality hoodie with company logo",
      cost: 800,
      category: "physical",
      image: "/placeholder.svg?height=100&width=100&text=Hoodie",
      available: true,
      popularity: 87,
    },
    {
      id: "training-course",
      title: "Advanced Sales Training",
      description: "Exclusive access to premium training content",
      cost: 1200,
      category: "digital",
      image: "/placeholder.svg?height=100&width=100&text=Course",
      available: true,
      popularity: 92,
    },
    {
      id: "conference-ticket",
      title: "Annual Conference Ticket",
      description: "Free ticket to the annual company conference",
      cost: 2000,
      category: "experience",
      image: "/placeholder.svg?height=100&width=100&text=Ticket",
      available: true,
      popularity: 98,
    },
    {
      id: "cash-bonus",
      title: "$200 Cash Bonus",
      description: "Direct cash bonus added to your next payout",
      cost: 1800,
      category: "bonus",
      image: "/placeholder.svg?height=100&width=100&text=Cash",
      available: true,
      popularity: 99,
    },
    {
      id: "laptop",
      title: "MacBook Air",
      description: "Brand new MacBook Air for top performers",
      cost: 5000,
      category: "physical",
      image: "/placeholder.svg?height=100&width=100&text=Laptop",
      available: false,
      popularity: 100,
    },
  ]

  const goals: Goal[] = [
    {
      id: "daily-contacts",
      title: "Daily Contacts",
      description: "Contact 5 prospects today",
      target: 5,
      current: 3,
      reward: "50 points",
      deadline: "Today",
      category: "daily",
      completed: false,
    },
    {
      id: "weekly-sales",
      title: "Weekly Sales Goal",
      description: "Complete 3 sales this week",
      target: 3,
      current: 2,
      reward: "200 points",
      deadline: "This Week",
      category: "weekly",
      completed: false,
    },
    {
      id: "monthly-recruitment",
      title: "Monthly Recruitment",
      description: "Recruit 2 new team members this month",
      target: 2,
      current: 1,
      reward: "500 points + Bonus",
      deadline: "End of Month",
      category: "monthly",
      completed: false,
    },
    {
      id: "training-completion",
      title: "Complete Training Module",
      description: "Finish the Advanced Techniques course",
      target: 1,
      current: 1,
      reward: "300 points",
      deadline: "Completed",
      category: "weekly",
      completed: true,
    },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common":
        return <Star className="h-3 w-3" />
      case "rare":
        return <Zap className="h-3 w-3" />
      case "epic":
        return <Crown className="h-3 w-3" />
      case "legendary":
        return <Gem className="h-3 w-3" />
      default:
        return <Star className="h-3 w-3" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "physical":
        return <ShoppingBag className="h-4 w-4" />
      case "digital":
        return <Zap className="h-4 w-4" />
      case "experience":
        return <Calendar className="h-4 w-4" />
      case "bonus":
        return <DollarSign className="h-4 w-4" />
      default:
        return <Gift className="h-4 w-4" />
    }
  }

  const filteredAchievements = achievements.filter(
    (achievement) => selectedCategory === "all" || achievement.category === selectedCategory,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rewards & Recognition</h1>
          <p className="text-lg text-gray-600">Track your achievements and redeem exciting rewards</p>
        </div>

        {/* Points Overview */}
        <Card className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Your Reward Points</h2>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold">{currentPoints.toLocaleString()}</div>
                  <Badge className="bg-white/20 text-white border-white/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +250 this week
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <Coins className="h-16 w-16 opacity-80 mb-2" />
                <p className="text-sm opacity-90">Rank: Top 5%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="rewards">Reward Store</TabsTrigger>
            <TabsTrigger value="goals">Goals & Challenges</TabsTrigger>
          </TabsList>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All Categories
              </Button>
              <Button
                variant={selectedCategory === "sales" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("sales")}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Sales
              </Button>
              <Button
                variant={selectedCategory === "team" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("team")}
              >
                <Users className="h-4 w-4 mr-1" />
                Team Building
              </Button>
              <Button
                variant={selectedCategory === "training" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("training")}
              >
                <Award className="h-4 w-4 mr-1" />
                Training
              </Button>
              <Button
                variant={selectedCategory === "milestone" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("milestone")}
              >
                <Trophy className="h-4 w-4 mr-1" />
                Milestones
              </Button>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                    achievement.unlocked ? "bg-white border-2 border-green-200" : "bg-gray-50 border-2 border-gray-200"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-3 rounded-lg ${
                          achievement.unlocked ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {achievement.unlocked ? achievement.icon : <Lock className="h-6 w-6" />}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={`${getRarityColor(achievement.rarity)} border`}>
                          {getRarityIcon(achievement.rarity)}
                          <span className="ml-1 capitalize">{achievement.rarity}</span>
                        </Badge>
                        {achievement.unlocked && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Unlocked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {Math.min(achievement.progress, achievement.maxProgress)}/{achievement.maxProgress}
                        </span>
                      </div>
                      <Progress
                        value={
                          (Math.min(achievement.progress, achievement.maxProgress) / achievement.maxProgress) * 100
                        }
                        className="h-2"
                      />
                    </div>

                    {/* Points and Date */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-1">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900">{achievement.points} points</span>
                      </div>
                      {achievement.unlockedDate && (
                        <span className="text-xs text-gray-500">Unlocked {achievement.unlockedDate}</span>
                      )}
                    </div>
                  </CardContent>

                  {/* Sparkle Effect for Unlocked Achievements */}
                  {achievement.unlocked && (
                    <div className="absolute top-2 right-2">
                      <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Rewards Store Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <Card key={reward.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <img
                      src={reward.image || "/placeholder.svg"}
                      alt={reward.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{reward.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryIcon(reward.category)}
                        <span className="ml-1 capitalize">{reward.category}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

                    {/* Popularity */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-1">
                        <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${reward.popularity}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{reward.popularity}% popular</span>
                    </div>

                    {/* Cost and Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold text-gray-900">{reward.cost.toLocaleString()}</span>
                      </div>
                      <Button
                        size="sm"
                        disabled={!reward.available || currentPoints < reward.cost}
                        className={
                          currentPoints >= reward.cost && reward.available ? "bg-purple-600 hover:bg-purple-700" : ""
                        }
                      >
                        {reward.claimed ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Claimed
                          </>
                        ) : currentPoints >= reward.cost && reward.available ? (
                          "Redeem"
                        ) : !reward.available ? (
                          "Unavailable"
                        ) : (
                          "Not Enough Points"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Goals & Challenges Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Daily Challenges
                  </CardTitle>
                  <CardDescription>Complete these tasks today to earn bonus points</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals
                    .filter((goal) => goal.category === "daily")
                    .map((goal) => (
                      <div
                        key={goal.id}
                        className={`p-4 rounded-lg border-2 ${
                          goal.completed
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-gray-200 hover:border-blue-200"
                        } transition-colors`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                          {goal.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-medium">
                              {goal.current}/{goal.target}
                            </span>
                          </div>
                          <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Gift className="h-3 w-3 mr-1" />
                            {goal.reward}
                          </Badge>
                          <span className="text-xs text-gray-500">{goal.deadline}</span>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* Weekly Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Weekly Goals
                  </CardTitle>
                  <CardDescription>Bigger challenges with greater rewards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals
                    .filter((goal) => goal.category === "weekly")
                    .map((goal) => (
                      <div
                        key={goal.id}
                        className={`p-4 rounded-lg border-2 ${
                          goal.completed
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-gray-200 hover:border-green-200"
                        } transition-colors`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                          {goal.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-medium">
                              {goal.current}/{goal.target}
                            </span>
                          </div>
                          <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <Badge className="bg-green-100 text-green-800">
                            <Gift className="h-3 w-3 mr-1" />
                            {goal.reward}
                          </Badge>
                          <span className="text-xs text-gray-500">{goal.deadline}</span>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* Monthly Goals */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="h-5 w-5 text-purple-500" />
                    Monthly Challenges
                  </CardTitle>
                  <CardDescription>Ultimate challenges for the most dedicated members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {goals
                      .filter((goal) => goal.category === "monthly")
                      .map((goal) => (
                        <div
                          key={goal.id}
                          className={`p-4 rounded-lg border-2 ${
                            goal.completed
                              ? "bg-purple-50 border-purple-200"
                              : "bg-white border-gray-200 hover:border-purple-200"
                          } transition-colors`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                            {goal.completed && <CheckCircle className="h-5 w-5 text-purple-500" />}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-medium">
                                {goal.current}/{goal.target}
                              </span>
                            </div>
                            <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                            <Badge className="bg-purple-100 text-purple-800">
                              <Gift className="h-3 w-3 mr-1" />
                              {goal.reward}
                            </Badge>
                            <span className="text-xs text-gray-500">{goal.deadline}</span>
                          </div>
                        </div>
                      ))}
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
