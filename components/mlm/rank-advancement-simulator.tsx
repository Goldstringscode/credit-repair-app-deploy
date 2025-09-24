"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Award,
  Calculator,
  Crown,
  Star,
  Diamond,
  ArrowUp,
  ArrowRight,
  Calendar,
  Clock,
} from "lucide-react"
import { mlmRanks } from "@/lib/mlm-system"

interface SimulationInputs {
  personalSales: number
  teamSize: number
  averageTeamSales: number
  monthsToProject: number
  growthRate: number
  retentionRate: number
}

interface ProjectionResult {
  month: number
  personalVolume: number
  teamVolume: number
  totalVolume: number
  directCommissions: number
  teamCommissions: number
  bonuses: number
  totalEarnings: number
  rank: string
  teamSize: number
}

export function RankAdvancementSimulator() {
  const [inputs, setInputs] = useState<SimulationInputs>({
    personalSales: 1000,
    teamSize: 5,
    averageTeamSales: 500,
    monthsToProject: 12,
    growthRate: 20,
    retentionRate: 85,
  })

  const [projections, setProjections] = useState<ProjectionResult[]>([])
  const [selectedScenario, setSelectedScenario] = useState("realistic")

  const scenarios = {
    conservative: {
      personalSales: 800,
      teamSize: 3,
      averageTeamSales: 400,
      growthRate: 10,
      retentionRate: 80,
    },
    realistic: {
      personalSales: 1000,
      teamSize: 5,
      averageTeamSales: 500,
      growthRate: 20,
      retentionRate: 85,
    },
    aggressive: {
      personalSales: 1500,
      teamSize: 8,
      averageTeamSales: 700,
      growthRate: 35,
      retentionRate: 90,
    },
    superstar: {
      personalSales: 2500,
      teamSize: 15,
      averageTeamSales: 1000,
      growthRate: 50,
      retentionRate: 95,
    },
  }

  const calculateRank = (personalVolume: number, teamVolume: number, teamSize: number) => {
    for (let i = mlmRanks.length - 1; i >= 0; i--) {
      const rank = mlmRanks[i]
      if (
        personalVolume >= rank.requirements.personalVolume &&
        teamVolume >= rank.requirements.teamVolume &&
        teamSize >= rank.requirements.activeDownlines
      ) {
        return rank
      }
    }
    return mlmRanks[0]
  }

  const calculateProjections = () => {
    const results: ProjectionResult[] = []
    let currentTeamSize = inputs.teamSize
    let currentPersonalSales = inputs.personalSales
    let currentTeamSales = inputs.averageTeamSales

    for (let month = 1; month <= inputs.monthsToProject; month++) {
      // Apply growth and retention
      const monthlyGrowthFactor = 1 + inputs.growthRate / 100 / 12
      const retentionFactor = inputs.retentionRate / 100

      currentTeamSize = Math.floor(currentTeamSize * monthlyGrowthFactor * retentionFactor)
      currentPersonalSales = Math.floor(currentPersonalSales * monthlyGrowthFactor)
      currentTeamSales = Math.floor(currentTeamSales * monthlyGrowthFactor)

      const personalVolume = currentPersonalSales
      const teamVolume = currentTeamSize * currentTeamSales
      const totalVolume = personalVolume + teamVolume

      const currentRank = calculateRank(personalVolume, teamVolume, currentTeamSize)

      // Calculate commissions
      const directCommissions = personalVolume * currentRank.commissionRate
      const teamCommissions = teamVolume * 0.1 // 10% team commission
      const bonuses = Math.floor(totalVolume * 0.05) // 5% bonus pool

      const totalEarnings = directCommissions + teamCommissions + bonuses

      results.push({
        month,
        personalVolume,
        teamVolume,
        totalVolume,
        directCommissions,
        teamCommissions,
        bonuses,
        totalEarnings,
        rank: currentRank.name,
        teamSize: currentTeamSize,
      })
    }

    setProjections(results)
  }

  useEffect(() => {
    calculateProjections()
  }, [inputs])

  const applyScenario = (scenarioName: string) => {
    const scenario = scenarios[scenarioName as keyof typeof scenarios]
    setInputs({
      ...inputs,
      ...scenario,
    })
    setSelectedScenario(scenarioName)
  }

  const finalProjection = projections[projections.length - 1]
  const currentRank = finalProjection
    ? calculateRank(finalProjection.personalVolume, finalProjection.teamVolume, finalProjection.teamSize)
    : mlmRanks[0]

  const rankDistribution = projections.reduce(
    (acc, projection) => {
      acc[projection.rank] = (acc[projection.rank] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const rankDistributionData = Object.entries(rankDistribution).map(([rank, months]) => ({
    rank,
    months,
    percentage: Math.round((months / projections.length) * 100),
  }))

  const earningsBreakdown = finalProjection
    ? [
        { name: "Direct Commissions", value: finalProjection.directCommissions, color: "#3B82F6" },
        { name: "Team Commissions", value: finalProjection.teamCommissions, color: "#10B981" },
        { name: "Bonuses", value: finalProjection.bonuses, color: "#F59E0B" },
      ]
    : []

  const milestones = [
    { rank: "Consultant", volume: 1000, teamSize: 2, earnings: 500 },
    { rank: "Manager", volume: 5000, teamSize: 5, earnings: 2000 },
    { rank: "Director", volume: 15000, teamSize: 10, earnings: 6000 },
    { rank: "Executive", volume: 50000, teamSize: 25, earnings: 20000 },
    { rank: "Diamond", volume: 150000, teamSize: 50, earnings: 60000 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Rank Advancement Simulator</h1>
              <p className="text-purple-100">Project your MLM success and plan your path to the top</p>
            </div>
            <Calculator className="h-16 w-16 text-purple-200" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="simulator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Simulation Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Personal Monthly Sales</label>
                  <Slider
                    value={[inputs.personalSales]}
                    onValueChange={(value) => setInputs({ ...inputs, personalSales: value[0] })}
                    max={5000}
                    min={100}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>$100</span>
                    <span className="font-medium">${inputs.personalSales.toLocaleString()}</span>
                    <span>$5,000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Starting Team Size</label>
                  <Slider
                    value={[inputs.teamSize]}
                    onValueChange={(value) => setInputs({ ...inputs, teamSize: value[0] })}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>1</span>
                    <span className="font-medium">{inputs.teamSize} members</span>
                    <span>50</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Average Team Member Sales</label>
                  <Slider
                    value={[inputs.averageTeamSales]}
                    onValueChange={(value) => setInputs({ ...inputs, averageTeamSales: value[0] })}
                    max={2000}
                    min={100}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>$100</span>
                    <span className="font-medium">${inputs.averageTeamSales.toLocaleString()}</span>
                    <span>$2,000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Growth Rate (%)</label>
                  <Slider
                    value={[inputs.growthRate]}
                    onValueChange={(value) => setInputs({ ...inputs, growthRate: value[0] })}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0%</span>
                    <span className="font-medium">{inputs.growthRate}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Retention Rate (%)</label>
                  <Slider
                    value={[inputs.retentionRate]}
                    onValueChange={(value) => setInputs({ ...inputs, retentionRate: value[0] })}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>50%</span>
                    <span className="font-medium">{inputs.retentionRate}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Projection Period (Months)</label>
                  <Slider
                    value={[inputs.monthsToProject]}
                    onValueChange={(value) => setInputs({ ...inputs, monthsToProject: value[0] })}
                    max={36}
                    min={3}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>3</span>
                    <span className="font-medium">{inputs.monthsToProject} months</span>
                    <span>36</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Projection Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {finalProjection && (
                  <>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        ${finalProjection.totalEarnings.toLocaleString()}
                      </div>
                      <div className="text-gray-600">Monthly Earnings in Month {inputs.monthsToProject}</div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                          <span>Direct Commissions</span>
                        </div>
                        <span className="font-medium">${finalProjection.directCommissions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Users className="h-5 w-5 text-green-600" />
                          <span>Team Commissions</span>
                        </div>
                        <span className="font-medium">${finalProjection.teamCommissions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Star className="h-5 w-5 text-yellow-600" />
                          <span>Bonuses</span>
                        </div>
                        <span className="font-medium">${finalProjection.bonuses.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                      <div className="flex items-center space-x-2 mb-2">
                        <Crown className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-purple-800">Projected Rank</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{currentRank.name}</div>
                      <div className="text-sm text-purple-700">
                        Team Size: {finalProjection.teamSize} • Total Volume: $
                        {finalProjection.totalVolume.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button className="flex-1" onClick={calculateProjections}>
                        <Calculator className="h-4 w-4 mr-2" />
                        Recalculate
                      </Button>
                      <Button variant="outline" className="bg-transparent">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          {/* Earnings Projection Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings Projection Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={projections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                  <Area
                    type="monotone"
                    dataKey="directCommissions"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    name="Direct Commissions"
                  />
                  <Area
                    type="monotone"
                    dataKey="teamCommissions"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    name="Team Commissions"
                  />
                  <Area type="monotone" dataKey="bonuses" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Bonuses" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Team Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Team Growth Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={projections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="teamSize" stroke="#8B5CF6" strokeWidth={3} name="Team Size" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Earnings Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Final Month Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={earningsBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {earningsBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Rank Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Time Spent at Each Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rankDistributionData.map((item) => (
                  <div key={item.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{item.rank}</Badge>
                      <span>{item.months} months</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={item.percentage} className="w-20 h-2" />
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(scenarios).map(([name, scenario]) => (
              <Card
                key={name}
                className={`cursor-pointer transition-all ${
                  selectedScenario === name ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-lg"
                }`}
                onClick={() => applyScenario(name)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">{name} Scenario</CardTitle>
                    <Badge
                      variant={
                        name === "conservative"
                          ? "secondary"
                          : name === "realistic"
                            ? "default"
                            : name === "aggressive"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {name === "conservative" && "Safe"}
                      {name === "realistic" && "Balanced"}
                      {name === "aggressive" && "Ambitious"}
                      {name === "superstar" && "Elite"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Personal Sales:</span>
                      <span className="font-medium">${scenario.personalSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Starting Team:</span>
                      <span className="font-medium">{scenario.teamSize} members</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Growth Rate:</span>
                      <span className="font-medium">{scenario.growthRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Retention:</span>
                      <span className="font-medium">{scenario.retentionRate}%</span>
                    </div>
                  </div>

                  {/* Quick projection for this scenario */}
                  <div className="text-center p-4 bg-green-50 rounded-lg mb-4">
                    <div className="text-2xl font-bold text-green-600">
                      $
                      {Math.floor(
                        (scenario.personalSales * 0.4 + scenario.teamSize * scenario.averageTeamSales * 0.1) *
                          Math.pow(1 + scenario.growthRate / 100, 1),
                      ).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Estimated Year 1 Monthly Earnings</div>
                  </div>

                  <Button className="w-full" variant={selectedScenario === name ? "default" : "outline"}>
                    {selectedScenario === name ? "Currently Selected" : "Apply Scenario"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rank Achievement Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={milestone.rank} className="relative">
                    {index < milestones.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                    )}
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {index === 0 && <Users className="h-6 w-6 text-blue-600" />}
                        {index === 1 && <Target className="h-6 w-6 text-blue-600" />}
                        {index === 2 && <Award className="h-6 w-6 text-blue-600" />}
                        {index === 3 && <Crown className="h-6 w-6 text-blue-600" />}
                        {index === 4 && <Diamond className="h-6 w-6 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">{milestone.rank}</h3>
                          <Badge className="bg-green-100 text-green-800">
                            ${milestone.earnings.toLocaleString()}/month
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Volume Required:</span>
                            <div>${milestone.volume.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="font-medium">Team Size:</span>
                            <div>{milestone.teamSize}+ members</div>
                          </div>
                          <div>
                            <span className="font-medium">Earning Potential:</span>
                            <div>${milestone.earnings.toLocaleString()}/month</div>
                          </div>
                        </div>

                        {finalProjection && finalProjection.totalVolume >= milestone.volume && (
                          <div className="mt-2 flex items-center space-x-2 text-green-600">
                            <ArrowUp className="h-4 w-4" />
                            <span className="text-sm font-medium">Milestone Achieved!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline Projection */}
          <Card>
            <CardHeader>
              <CardTitle>Your Projected Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projections.length > 0 && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">Month 3</div>
                      <div className="text-sm text-gray-600">First Promotion</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">Month 6</div>
                      <div className="text-sm text-gray-600">Manager Rank</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">Month 12</div>
                      <div className="text-sm text-gray-600">Director Level</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Crown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-600">Month 18</div>
                      <div className="text-sm text-gray-600">Executive Rank</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
