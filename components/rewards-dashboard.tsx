"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Gift,
  Smartphone,
  Laptop,
  Car,
  Plane,
  DollarSign,
  CreditCard,
  Package,
  Users,
  Target,
  Zap,
  Clock,
  CheckCircle,
  Truck,
  Mail,
} from "lucide-react"
import RewardsSystem, { type Reward, type UserReward, type RewardTier, type Competition } from "@/lib/rewards-system"

interface RewardsDashboardProps {
  currentUserId?: string
  userRank?: number
  userPoints?: number
  className?: string
}

export default function RewardsDashboard({
  currentUserId = "current_user",
  userRank = 6,
  userPoints = 1350,
  className,
}: RewardsDashboardProps) {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [userRewards, setUserRewards] = useState<UserReward[]>([])
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([])
  const [userTier, setUserTier] = useState<RewardTier | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [stats, setStats] = useState<any>(null)
  const [system] = useState(() => RewardsSystem.getInstance())

  useEffect(() => {
    loadRewardsData()
  }, [])

  const loadRewardsData = () => {
    const allRewards = system.getAllRewards()
    const userRewardsList = system.getUserRewards(currentUserId)
    const available = system.getAvailableRewards(currentUserId, userRank, userPoints)
    const tier = system.getUserTier(userRank)
    const activeCompetitions = system.getActiveCompetitions()
    const rewardStats = system.getRewardStats()

    setRewards(allRewards)
    setUserRewards(userRewardsList)
    setAvailableRewards(available)
    setUserTier(tier)
    setCompetitions(activeCompetitions)
    setStats(rewardStats)
  }

  const handleClaimReward = (rewardId: string) => {
    const result = system.claimReward(currentUserId, rewardId)
    if (result.success) {
      loadRewardsData() // Refresh data
      // Show success notification
      alert(`${result.message}`)
    } else {
      alert(`Failed to claim reward: ${result.message}`)
    }
  }

  const getRarityColor = (rarity: Reward["rarity"]) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800"
      case "rare":
        return "bg-blue-100 text-blue-800"
      case "epic":
        return "bg-purple-100 text-purple-800"
      case "legendary":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRewardIcon = (reward: Reward) => {
    switch (reward.type) {
      case "cash":
        return <DollarSign className="h-6 w-6" />
      case "credit":
        return <CreditCard className="h-6 w-6" />
      case "physical":
        if (reward.name.includes("iPhone")) return <Smartphone className="h-6 w-6" />
        if (reward.name.includes("MacBook")) return <Laptop className="h-6 w-6" />
        if (reward.name.includes("Tesla")) return <Car className="h-6 w-6" />
        return <Package className="h-6 w-6" />
      case "experience":
        return <Plane className="h-6 w-6" />
      default:
        return <Gift className="h-6 w-6" />
    }
  }

  const getStatusIcon = (status: UserReward["status"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "failed":
        return <Zap className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getDeliveryIcon = (method: UserReward["deliveryMethod"]) => {
    switch (method) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "platform_credit":
        return <CreditCard className="h-4 w-4" />
      case "physical_shipping":
        return <Truck className="h-4 w-4" />
      case "digital_download":
        return <Package className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(value)
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const totalRewardValue = system.calculateTotalRewardValue(currentUserId)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Rewards & Prizes</h2>
          <p className="text-gray-600">Earn amazing rewards for your achievements and performance!</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Rewards Earned</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRewardValue, "USD")}</p>
          </div>
        </div>
      </div>

      {/* Current Tier Card */}
      {userTier && (
        <Card className="border-2" style={{ borderColor: userTier.color }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: userTier.color + "20" }}
                >
                  {userTier.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: userTier.color }}>
                    {userTier.name}
                  </h3>
                  <p className="text-gray-600">
                    Rank #{userRank} • {userPoints.toLocaleString()} points
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {userTier.benefits.slice(0, 2).map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                    {userTier.benefits.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{userTier.benefits.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">Next Tier Progress</p>
                <Progress value={75} className="w-32" />
                <p className="text-xs text-gray-500 mt-1">3 ranks to go</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available">Available Rewards</TabsTrigger>
          <TabsTrigger value="my-rewards">My Rewards</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="all-rewards">All Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableRewards.map((reward) => (
              <Card key={reward.id} className="relative overflow-hidden">
                <div
                  className="absolute top-0 right-0 w-16 h-16 transform rotate-45 translate-x-8 -translate-y-8"
                  style={{ backgroundColor: reward.color }}
                />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: reward.color + "20", color: reward.color }}
                      >
                        {getRewardIcon(reward)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{reward.name}</CardTitle>
                        <Badge className={getRarityColor(reward.rarity)}>{reward.rarity}</Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">{reward.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold" style={{ color: reward.color }}>
                      {formatCurrency(reward.value, reward.currency)}
                    </span>
                    <Badge variant="outline">
                      {reward.availability.maxClaims - reward.availability.currentClaims} left
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Requirements:</p>
                    {reward.requirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <Target className="h-3 w-3" />
                        <span>{req.description}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleClaimReward(reward.id)}
                    className="w-full"
                    style={{ backgroundColor: reward.color }}
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Claim Reward
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-rewards" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">{userRewards.length}</p>
                <p className="text-sm text-gray-600">Total Rewards</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{formatCurrency(totalRewardValue, "USD")}</p>
                <p className="text-sm text-gray-600">Total Value</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{userRewards.filter((ur) => ur.status === "delivered").length}</p>
                <p className="text-sm text-gray-600">Delivered</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{userRewards.filter((ur) => ur.status === "processing").length}</p>
                <p className="text-sm text-gray-600">Processing</p>
              </CardContent>
            </Card>
          </div>

          {/* Rewards List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Reward History</CardTitle>
              <CardDescription>Track all your claimed rewards and their delivery status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRewards.map((userReward) => (
                  <div key={userReward.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: userReward.reward.color + "20", color: userReward.reward.color }}
                      >
                        {getRewardIcon(userReward.reward)}
                      </div>
                      <div>
                        <h4 className="font-medium">{userReward.reward.name}</h4>
                        <p className="text-sm text-gray-600">Claimed {formatTimeAgo(userReward.claimedAt)}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getDeliveryIcon(userReward.deliveryMethod)}
                          <span className="text-xs text-gray-500 capitalize">
                            {userReward.deliveryMethod.replace("_", " ")}
                          </span>
                          {userReward.trackingInfo && (
                            <Badge variant="outline" className="text-xs">
                              {userReward.trackingInfo}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(userReward.reward.value, userReward.reward.currency)}
                      </p>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(userReward.status)}
                        <span className="text-sm capitalize">{userReward.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {userRewards.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No rewards claimed yet</p>
                    <p className="text-sm">Start earning points to unlock amazing rewards!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {competitions.map((competition) => (
              <Card key={competition.id} className="overflow-hidden">
                {competition.image && (
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Trophy className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold">{competition.name}</h3>
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{competition.name}</CardTitle>
                    <Badge className="bg-green-100 text-green-800">
                      {competition.participants.toLocaleString()} participants
                    </Badge>
                  </div>
                  <CardDescription>{competition.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Start Date</p>
                      <p className="font-medium">{new Date(competition.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">End Date</p>
                      <p className="font-medium">{new Date(competition.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Top Prizes:</p>
                    <div className="space-y-2">
                      {competition.prizes.slice(0, 3).map((prize, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{prize.position}</span>
                          <span>{prize.reward.name}</span>
                          <span className="font-bold">{formatCurrency(prize.reward.value, prize.reward.currency)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Join Competition
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all-rewards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: reward.color + "20", color: reward.color }}
                    >
                      <span className="text-lg">{reward.icon}</span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{reward.name}</CardTitle>
                      <Badge className={getRarityColor(reward.rarity)} variant="secondary">
                        {reward.rarity}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold" style={{ color: reward.color }}>
                      {formatCurrency(reward.value, reward.currency)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {reward.category}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {reward.availability.currentClaims}/{reward.availability.maxClaims} claimed
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
