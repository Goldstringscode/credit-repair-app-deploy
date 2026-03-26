"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Crown, Star, Award, Target, Users, CheckCircle, Diamond } from "lucide-react"

interface MLMRank {
  id: string
  name: string
  level: number
  icon: React.ReactNode
  color: string
  requirements: {
    personalVolume: number
    teamVolume: number
    activeDownlines: number
    qualifiedLegs: number
    timeInRank?: number
    specialRequirements?: string[]
  }
  benefits: {
    commissionRate: number
    bonusEligibility: string[]
    perks: string[]
    monthlyBonus?: number
    carBonus?: number
    travelIncentive?: number
  }
  averageEarnings: {
    monthly: number
    annual: number
  }
  achievementRate: number // Percentage of people who reach this rank
  averageTimeToAchieve: number // Months
}

const mlmRanks: MLMRank[] = [
  {
    id: "associate",
    name: "Associate",
    level: 1,
    icon: <Users className="h-6 w-6" />,
    color: "#94A3B8",
    requirements: {
      personalVolume: 0,
      teamVolume: 0,
      activeDownlines: 0,
      qualifiedLegs: 0,
    },
    benefits: {
      commissionRate: 30,
      bonusEligibility: ["fast_start"],
      perks: ["Basic training access", "Marketing materials", "Support community"],
    },
    averageEarnings: {
      monthly: 450,
      annual: 5400,
    },
    achievementRate: 100,
    averageTimeToAchieve: 0,
  },
  {
    id: "consultant",
    name: "Consultant",
    level: 2,
    icon: <Target className="h-6 w-6" />,
    color: "#10B981",
    requirements: {
      personalVolume: 500,
      teamVolume: 1000,
      activeDownlines: 2,
      qualifiedLegs: 1,
    },
    benefits: {
      commissionRate: 35,
      bonusEligibility: ["fast_start", "matching_bonus"],
      perks: ["Advanced training", "Custom landing pages", "Priority support"],
    },
    averageEarnings: {
      monthly: 1200,
      annual: 14400,
    },
    achievementRate: 65,
    averageTimeToAchieve: 3,
  },
  {
    id: "manager",
    name: "Manager",
    level: 3,
    icon: <Award className="h-6 w-6" />,
    color: "#3B82F6",
    requirements: {
      personalVolume: 1000,
      teamVolume: 5000,
      activeDownlines: 5,
      qualifiedLegs: 2,
    },
    benefits: {
      commissionRate: 40,
      bonusEligibility: ["fast_start", "matching_bonus", "leadership_bonus"],
      perks: ["Team management tools", "Monthly coaching calls", "Recognition events"],
      monthlyBonus: 500,
    },
    averageEarnings: {
      monthly: 3200,
      annual: 38400,
    },
    achievementRate: 35,
    averageTimeToAchieve: 8,
  },
  {
    id: "director",
    name: "Director",
    level: 4,
    icon: <Star className="h-6 w-6" />,
    color: "#8B5CF6",
    requirements: {
      personalVolume: 2000,
      teamVolume: 15000,
      activeDownlines: 10,
      qualifiedLegs: 3,
      timeInRank: 3,
    },
    benefits: {
      commissionRate: 45,
      bonusEligibility: ["fast_start", "matching_bonus", "leadership_bonus", "infinity_bonus"],
      perks: ["Personal mentor", "Exclusive events", "Advanced analytics"],
      monthlyBonus: 1500,
      carBonus: 500,
    },
    averageEarnings: {
      monthly: 7500,
      annual: 90000,
    },
    achievementRate: 15,
    averageTimeToAchieve: 18,
  },
  {
    id: "executive",
    name: "Executive Director",
    level: 5,
    icon: <Crown className="h-6 w-6" />,
    color: "#F59E0B",
    requirements: {
      personalVolume: 3000,
      teamVolume: 50000,
      activeDownlines: 25,
      qualifiedLegs: 5,
      timeInRank: 6,
    },
    benefits: {
      commissionRate: 50,
      bonusEligibility: ["fast_start", "matching_bonus", "leadership_bonus", "infinity_bonus"],
      perks: ["Executive coaching", "Global recognition", "Mastermind access"],
      monthlyBonus: 3000,
      carBonus: 1000,
      travelIncentive: 5000,
    },
    averageEarnings: {
      monthly: 15000,
      annual: 180000,
    },
    achievementRate: 5,
    averageTimeToAchieve: 36,
  },
  {
    id: "diamond",
    name: "Diamond Executive",
    level: 6,
    icon: <Diamond className="h-6 w-6" />,
    color: "#EF4444",
    requirements: {
      personalVolume: 5000,
      teamVolume: 150000,
      activeDownlines: 50,
      qualifiedLegs: 8,
      timeInRank: 12,
      specialRequirements: ["Maintain rank for 12 consecutive months", "Mentor 3 Directors to success"],
    },
    benefits: {
      commissionRate: 55,
      bonusEligibility: ["fast_start", "matching_bonus", "leadership_bonus", "infinity_bonus"],
      perks: ["Equity participation", "Board advisory role", "Legacy building program"],
      monthlyBonus: 10000,
      carBonus: 2000,
      travelIncentive: 15000,
    },
    averageEarnings: {
      monthly: 35000,
      annual: 420000,
    },
    achievementRate: 1,
    averageTimeToAchieve: 60,
  },
]

interface UserProgress {
  currentRank: string
  personalVolume: number
  teamVolume: number
  activeDownlines: number
  qualifiedLegs: number
  timeInCurrentRank: number
  monthlyEarnings: number
}

const defaultUserProgress: UserProgress = {
  currentRank: "associate",
  personalVolume: 0,
  teamVolume: 0,
  activeDownlines: 0,
  qualifiedLegs: 0,
  timeInCurrentRank: 0,
  monthlyEarnings: 0,
}

export function MLMRankProgressionChart() {
  const [selectedRank, setSelectedRank] = useState<MLMRank | null>(null)
  const [showRequirements, setShowRequirements] = useState(false)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const response = await fetch('/api/mlm/users')
        if (response.ok) {
          const json = await response.json()
          const data = json.data
          if (data) {
            setUserProgress({
              currentRank: data.rank?.id ?? 'associate',
              personalVolume: data.personalVolume ?? 0,
              teamVolume: data.teamVolume ?? 0,
              activeDownlines: data.activeDownlines ?? 0,
              qualifiedLegs: data.qualifiedLegs ?? 0,
              timeInCurrentRank: 0,
              monthlyEarnings: data.currentMonthEarnings ?? 0,
            })
          }
        }
      } catch (err) {
        console.error('Failed to load rank progress:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserProgress()
  }, [])

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
        <div className="h-40 bg-gray-200 rounded" />
        <div className="h-40 bg-gray-200 rounded" />
      </div>
    )
  }

  // Fallback to neutral defaults if fetch failed
  const effectiveProgress = userProgress ?? defaultUserProgress

  const currentRankIndex = mlmRanks.findIndex((rank) => rank.id === effectiveProgress.currentRank)
  const currentRank = mlmRanks[currentRankIndex] ?? mlmRanks[0]
  const nextRank = mlmRanks[currentRankIndex + 1]

  const calculateProgress = (current: number, required: number) => {
    return Math.min((current / required) * 100, 100)
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`

  const getRankIcon = (rank: MLMRank) => {
    return (
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white"
        style={{ backgroundColor: rank.color }}
      >
        {rank.icon}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">MLM Rank Progression</h2>
        <p className="text-gray-600">Your journey to financial freedom and leadership excellence</p>
      </div>

      {/* Current Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getRankIcon(currentRank)}
              <div>
                <h3 className="text-xl font-bold text-blue-900">Current Rank: {currentRank.name}</h3>
                <p className="text-blue-700">
                  Level {currentRank.level} • {effectiveProgress.timeInCurrentRank} months in rank
                </p>
              </div>
            </div>
            <Badge className="bg-blue-600 text-white">{formatCurrency(effectiveProgress.monthlyEarnings)}/month</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextRank && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Progress to {nextRank.name}</h4>
                <span className="text-sm text-gray-600">Next Level</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Personal Volume</span>
                    <span>
                      {formatCurrency(effectiveProgress.personalVolume)} /{" "}
                      {formatCurrency(nextRank.requirements.personalVolume)}
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(effectiveProgress.personalVolume, nextRank.requirements.personalVolume)}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Team Volume</span>
                    <span>
                      {formatCurrency(effectiveProgress.teamVolume)} / {formatCurrency(nextRank.requirements.teamVolume)}
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(effectiveProgress.teamVolume, nextRank.requirements.teamVolume)}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Downlines</span>
                    <span>
                      {effectiveProgress.activeDownlines} / {nextRank.requirements.activeDownlines}
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(effectiveProgress.activeDownlines, nextRank.requirements.activeDownlines)}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Qualified Legs</span>
                    <span>
                      {effectiveProgress.qualifiedLegs} / {nextRank.requirements.qualifiedLegs}
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(effectiveProgress.qualifiedLegs, nextRank.requirements.qualifiedLegs)}
                    className="h-2"
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h5 className="font-medium text-green-800 mb-2">Unlock at {nextRank.name}:</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Commission Rate:</span>
                    <span className="text-green-600 ml-2">{nextRank.benefits.commissionRate}%</span>
                  </div>
                  <div>
                    <span className="font-medium">Avg Monthly:</span>
                    <span className="text-green-600 ml-2">{formatCurrency(nextRank.averageEarnings.monthly)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Monthly Bonus:</span>
                    <span className="text-green-600 ml-2">{formatCurrency(nextRank.benefits.monthlyBonus || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="progression" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progression">Rank Progression</TabsTrigger>
          <TabsTrigger value="earnings">Earnings Potential</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>

        <TabsContent value="progression" className="space-y-6">
          {/* Rank Progression Visual */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Rank Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 top-16 bottom-16 w-0.5 bg-gray-200"></div>
                <div
                  className="absolute left-6 top-16 w-0.5 bg-blue-500 transition-all duration-1000"
                  style={{ height: `${(currentRankIndex / (mlmRanks.length - 1)) * 100}%` }}
                ></div>

                <div className="space-y-8">
                  {mlmRanks.map((rank, index) => {
                    const isCompleted = index <= currentRankIndex
                    const isCurrent = index === currentRankIndex
                    const isNext = index === currentRankIndex + 1

                    return (
                      <div key={rank.id} className="relative flex items-center space-x-6">
                        {/* Rank Icon */}
                        <div className="relative z-10">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${
                              isCompleted
                                ? "border-white text-white"
                                : isNext
                                  ? "border-blue-200 bg-blue-50 text-blue-600"
                                  : "border-gray-200 bg-gray-50 text-gray-400"
                            }`}
                            style={{
                              backgroundColor: isCompleted ? rank.color : undefined,
                            }}
                          >
                            {rank.icon}
                          </div>
                          {isCurrent && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Rank Details */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3
                                className={`font-bold text-lg ${isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-600"}`}
                              >
                                {rank.name}
                              </h3>
                              <p className="text-sm text-gray-500">Level {rank.level}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{formatCurrency(rank.averageEarnings.monthly)}</p>
                              <p className="text-sm text-gray-500">avg/month</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Commission:</span>
                              <span className="font-medium ml-2">{rank.benefits.commissionRate}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Team Volume:</span>
                              <span className="font-medium ml-2">{formatCurrency(rank.requirements.teamVolume)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Achievement Rate:</span>
                              <span className="font-medium ml-2">{rank.achievementRate}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Avg Time:</span>
                              <span className="font-medium ml-2">{rank.averageTimeToAchieve}mo</span>
                            </div>
                          </div>

                          {isCurrent && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-blue-800">
                                <strong>You are here!</strong> You've been at this rank for{" "}
                                {effectiveProgress.timeInCurrentRank} months.
                                {nextRank && ` Focus on reaching ${nextRank.name} to unlock higher earnings.`}
                              </p>
                            </div>
                          )}

                          {isNext && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="text-sm text-yellow-800">
                                <strong>Next Goal:</strong> Complete your requirements to unlock{" "}
                                {formatCurrency(rank.averageEarnings.monthly)}/month earning potential.
                              </p>
                            </div>
                          )}
                        </div>

                        <Button variant="outline" size="sm" onClick={() => setSelectedRank(rank)}>
                          View Details
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mlmRanks.map((rank) => (
              <Card
                key={rank.id}
                className={`hover:shadow-lg transition-shadow ${rank.id === effectiveProgress.currentRank ? "ring-2 ring-blue-500" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    {getRankIcon(rank)}
                    <Badge variant="outline">{rank.achievementRate}% achieve</Badge>
                  </div>
                  <CardTitle className="text-lg">{rank.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold" style={{ color: rank.color }}>
                      {formatCurrency(rank.averageEarnings.monthly)}
                    </p>
                    <p className="text-sm text-gray-600">Average Monthly</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {formatCurrency(rank.averageEarnings.annual)}/year
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Commission Rate:</span>
                      <span className="font-medium">{rank.benefits.commissionRate}%</span>
                    </div>
                    {rank.benefits.monthlyBonus && (
                      <div className="flex justify-between">
                        <span>Monthly Bonus:</span>
                        <span className="font-medium text-green-600">{formatCurrency(rank.benefits.monthlyBonus)}</span>
                      </div>
                    )}
                    {rank.benefits.carBonus && (
                      <div className="flex justify-between">
                        <span>Car Bonus:</span>
                        <span className="font-medium text-blue-600">{formatCurrency(rank.benefits.carBonus)}</span>
                      </div>
                    )}
                    {rank.benefits.travelIncentive && (
                      <div className="flex justify-between">
                        <span>Travel Incentive:</span>
                        <span className="font-medium text-purple-600">
                          {formatCurrency(rank.benefits.travelIncentive)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">Avg time to achieve: {rank.averageTimeToAchieve} months</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <div className="grid gap-6">
            {mlmRanks.map((rank) => (
              <Card key={rank.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getRankIcon(rank)}
                      <div>
                        <CardTitle>{rank.name}</CardTitle>
                        <p className="text-sm text-gray-600">Level {rank.level}</p>
                      </div>
                    </div>
                    <Badge style={{ backgroundColor: rank.color }} className="text-white">
                      {rank.benefits.commissionRate}% Commission
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Requirements</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Personal Volume:</span>
                          <span className="font-medium">{formatCurrency(rank.requirements.personalVolume)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Team Volume:</span>
                          <span className="font-medium">{formatCurrency(rank.requirements.teamVolume)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Downlines:</span>
                          <span className="font-medium">{rank.requirements.activeDownlines}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Qualified Legs:</span>
                          <span className="font-medium">{rank.requirements.qualifiedLegs}</span>
                        </div>
                        {rank.requirements.timeInRank && (
                          <div className="flex justify-between">
                            <span>Time in Rank:</span>
                            <span className="font-medium">{rank.requirements.timeInRank} months</span>
                          </div>
                        )}
                      </div>

                      {rank.requirements.specialRequirements && (
                        <div className="mt-4">
                          <h5 className="font-medium text-sm mb-2">Special Requirements:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {rank.requirements.specialRequirements.map((req, index) => (
                              <li key={index}>• {req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Benefits & Perks</h4>
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-green-600 mb-1">Bonus Eligibility:</h5>
                          <div className="flex flex-wrap gap-1">
                            {rank.benefits.bonusEligibility.map((bonus) => (
                              <Badge key={bonus} variant="outline" className="text-xs">
                                {bonus.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-blue-600 mb-1">Perks:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {rank.benefits.perks.map((perk, index) => (
                              <li key={index}>• {perk}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Rank Details Modal */}
      {selectedRank && (
        <Dialog open={!!selectedRank} onOpenChange={() => setSelectedRank(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                {getRankIcon(selectedRank)}
                <div>
                  <span>{selectedRank.name}</span>
                  <p className="text-sm font-normal text-gray-600">Level {selectedRank.level}</p>
                </div>
              </DialogTitle>
              <DialogDescription>Complete breakdown of requirements, benefits, and earning potential</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedRank.averageEarnings.monthly)}
                  </p>
                  <p className="text-sm text-green-700">Average Monthly</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedRank.achievementRate}%</p>
                  <p className="text-sm text-blue-700">Achievement Rate</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Requirements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Personal Volume:</span>
                      <span className="font-medium">{formatCurrency(selectedRank.requirements.personalVolume)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Team Volume:</span>
                      <span className="font-medium">{formatCurrency(selectedRank.requirements.teamVolume)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Downlines:</span>
                      <span className="font-medium">{selectedRank.requirements.activeDownlines}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Qualified Legs:</span>
                      <span className="font-medium">{selectedRank.requirements.qualifiedLegs}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Financial Benefits</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Commission Rate:</span>
                      <span className="font-medium">{selectedRank.benefits.commissionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Earnings:</span>
                      <span className="font-medium">{formatCurrency(selectedRank.averageEarnings.annual)}</span>
                    </div>
                    {selectedRank.benefits.monthlyBonus && (
                      <div className="flex justify-between">
                        <span>Monthly Bonus:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(selectedRank.benefits.monthlyBonus)}
                        </span>
                      </div>
                    )}
                    {selectedRank.benefits.carBonus && (
                      <div className="flex justify-between">
                        <span>Car Bonus:</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(selectedRank.benefits.carBonus)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Exclusive Perks</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRank.benefits.perks.map((perk, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Success Timeline:</strong> On average, it takes {selectedRank.averageTimeToAchieve} months to
                  achieve {selectedRank.name} rank. Only {selectedRank.achievementRate}% of associates reach this level,
                  making it a significant achievement in your MLM journey.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
