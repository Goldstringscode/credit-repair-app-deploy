"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Calculator,
  DollarSign,
  Users,
  Target,
  Award,
  Zap,
  ArrowUp,
  ArrowDown,
  Download,
  RefreshCw,
} from "lucide-react"

interface CommissionInputs {
  personalSales: number
  teamSize: number
  averageTeamSales: number
  currentRank: string
  bonusQualified: boolean
  fastStartBonus: boolean
  matchingBonus: boolean
  leadershipBonus: boolean
}

interface CommissionBreakdown {
  directCommissions: number
  teamCommissions: number
  fastStartBonus: number
  matchingBonus: number
  leadershipBonus: number
  rankBonus: number
  totalCommissions: number
}

interface RankInfo {
  id: string
  name: string
  commissionRate: number
  teamCommissionRate: number
  bonusEligibility: string[]
  requirements: {
    personalVolume: number
    teamVolume: number
    activeDownlines: number
  }
}

export function CommissionCalculator() {
  const [inputs, setInputs] = useState<CommissionInputs>({
    personalSales: 1000,
    teamSize: 5,
    averageTeamSales: 500,
    currentRank: "consultant",
    bonusQualified: true,
    fastStartBonus: true,
    matchingBonus: false,
    leadershipBonus: false,
  })

  const [breakdown, setBreakdown] = useState<CommissionBreakdown>({
    directCommissions: 0,
    teamCommissions: 0,
    fastStartBonus: 0,
    matchingBonus: 0,
    leadershipBonus: 0,
    rankBonus: 0,
    totalCommissions: 0,
  })

  const [comparisonMode, setComparisonMode] = useState(false)
  const [comparisonRank, setComparisonRank] = useState("manager")

  const ranks: RankInfo[] = [
    {
      id: "associate",
      name: "Associate",
      commissionRate: 0.3,
      teamCommissionRate: 0.05,
      bonusEligibility: ["fast_start"],
      requirements: { personalVolume: 0, teamVolume: 0, activeDownlines: 0 },
    },
    {
      id: "consultant",
      name: "Consultant",
      commissionRate: 0.35,
      teamCommissionRate: 0.08,
      bonusEligibility: ["fast_start", "matching"],
      requirements: { personalVolume: 500, teamVolume: 1000, activeDownlines: 2 },
    },
    {
      id: "manager",
      name: "Manager",
      commissionRate: 0.4,
      teamCommissionRate: 0.1,
      bonusEligibility: ["fast_start", "matching", "leadership"],
      requirements: { personalVolume: 1000, teamVolume: 5000, activeDownlines: 5 },
    },
    {
      id: "director",
      name: "Director",
      commissionRate: 0.45,
      teamCommissionRate: 0.12,
      bonusEligibility: ["fast_start", "matching", "leadership", "infinity"],
      requirements: { personalVolume: 2000, teamVolume: 15000, activeDownlines: 10 },
    },
    {
      id: "executive",
      name: "Executive Director",
      commissionRate: 0.5,
      teamCommissionRate: 0.15,
      bonusEligibility: ["fast_start", "matching", "leadership", "infinity"],
      requirements: { personalVolume: 3000, teamVolume: 50000, activeDownlines: 25 },
    },
    {
      id: "diamond",
      name: "Diamond Executive",
      commissionRate: 0.55,
      teamCommissionRate: 0.18,
      bonusEligibility: ["fast_start", "matching", "leadership", "infinity"],
      requirements: { personalVolume: 5000, teamVolume: 150000, activeDownlines: 50 },
    },
  ]

  const calculateCommissions = (inputData: CommissionInputs, rankId: string) => {
    const rank = ranks.find((r) => r.id === rankId) || ranks[0]
    const teamVolume = inputData.teamSize * inputData.averageTeamSales
    const totalVolume = inputData.personalSales + teamVolume

    // Direct commissions
    const directCommissions = inputData.personalSales * rank.commissionRate

    // Team commissions
    const teamCommissions = teamVolume * rank.teamCommissionRate

    // Fast Start Bonus (10% extra on first 30 days)
    const fastStartBonus =
      inputData.fastStartBonus && rank.bonusEligibility.includes("fast_start") ? inputData.personalSales * 0.1 : 0

    // Matching Bonus (25% of direct recruits' commissions)
    const matchingBonus =
      inputData.matchingBonus && rank.bonusEligibility.includes("matching") ? teamCommissions * 0.25 : 0

    // Leadership Bonus (based on team volume)
    const leadershipBonus =
      inputData.leadershipBonus && rank.bonusEligibility.includes("leadership") ? Math.min(teamVolume * 0.02, 2000) : 0

    // Rank Bonus (monthly bonus for achieving rank)
    const rankBonus = inputData.bonusQualified ? getRankBonus(rank.id) : 0

    const totalCommissions =
      directCommissions + teamCommissions + fastStartBonus + matchingBonus + leadershipBonus + rankBonus

    return {
      directCommissions,
      teamCommissions,
      fastStartBonus,
      matchingBonus,
      leadershipBonus,
      rankBonus,
      totalCommissions,
    }
  }

  const getRankBonus = (rankId: string) => {
    const bonuses: { [key: string]: number } = {
      associate: 0,
      consultant: 100,
      manager: 300,
      director: 750,
      executive: 1500,
      diamond: 3000,
    }
    return bonuses[rankId] || 0
  }

  useEffect(() => {
    const newBreakdown = calculateCommissions(inputs, inputs.currentRank)
    setBreakdown(newBreakdown)
  }, [inputs])

  const currentRankInfo = ranks.find((r) => r.id === inputs.currentRank) || ranks[0]
  const comparisonBreakdown = comparisonMode ? calculateCommissions(inputs, comparisonRank) : null

  const chartData = [
    { name: "Direct", current: breakdown.directCommissions, comparison: comparisonBreakdown?.directCommissions || 0 },
    { name: "Team", current: breakdown.teamCommissions, comparison: comparisonBreakdown?.teamCommissions || 0 },
    { name: "Fast Start", current: breakdown.fastStartBonus, comparison: comparisonBreakdown?.fastStartBonus || 0 },
    { name: "Matching", current: breakdown.matchingBonus, comparison: comparisonBreakdown?.matchingBonus || 0 },
    { name: "Leadership", current: breakdown.leadershipBonus, comparison: comparisonBreakdown?.leadershipBonus || 0 },
    { name: "Rank Bonus", current: breakdown.rankBonus, comparison: comparisonBreakdown?.rankBonus || 0 },
  ]

  const pieData = [
    { name: "Direct Commissions", value: breakdown.directCommissions, color: "#3B82F6" },
    { name: "Team Commissions", value: breakdown.teamCommissions, color: "#10B981" },
    {
      name: "Bonuses",
      value: breakdown.fastStartBonus + breakdown.matchingBonus + breakdown.leadershipBonus + breakdown.rankBonus,
      color: "#F59E0B",
    },
  ].filter((item) => item.value > 0)

  const scenarios = [
    {
      name: "Conservative",
      personalSales: 800,
      teamSize: 3,
      averageTeamSales: 400,
    },
    {
      name: "Realistic",
      personalSales: 1000,
      teamSize: 5,
      averageTeamSales: 500,
    },
    {
      name: "Aggressive",
      personalSales: 1500,
      teamSize: 8,
      averageTeamSales: 700,
    },
    {
      name: "Superstar",
      personalSales: 2500,
      teamSize: 15,
      averageTeamSales: 1000,
    },
  ]

  const applyScenario = (scenario: (typeof scenarios)[0]) => {
    setInputs({
      ...inputs,
      personalSales: scenario.personalSales,
      teamSize: scenario.teamSize,
      averageTeamSales: scenario.averageTeamSales,
    })
  }

  const resetCalculator = () => {
    setInputs({
      personalSales: 1000,
      teamSize: 5,
      averageTeamSales: 500,
      currentRank: "consultant",
      bonusQualified: true,
      fastStartBonus: true,
      matchingBonus: false,
      leadershipBonus: false,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Commission Calculator</h1>
              <p className="text-green-100">Calculate your MLM earnings across all income streams</p>
            </div>
            <Calculator className="h-16 w-16 text-green-200" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="comparison">Rank Comparison</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="breakdown">Detailed Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Commission Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Personal Monthly Sales</label>
                  <Slider
                    value={[inputs.personalSales]}
                    onValueChange={(value) => setInputs({ ...inputs, personalSales: value[0] })}
                    max={5000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>$0</span>
                    <span className="font-medium">${inputs.personalSales.toLocaleString()}</span>
                    <span>$5,000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Size</label>
                  <Slider
                    value={[inputs.teamSize]}
                    onValueChange={(value) => setInputs({ ...inputs, teamSize: value[0] })}
                    max={50}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0</span>
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
                    min={0}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>$0</span>
                    <span className="font-medium">${inputs.averageTeamSales.toLocaleString()}</span>
                    <span>$2,000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Rank</label>
                  <Select
                    value={inputs.currentRank}
                    onValueChange={(value) => setInputs({ ...inputs, currentRank: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ranks.map((rank) => (
                        <SelectItem key={rank.id} value={rank.id}>
                          {rank.name} ({Math.round(rank.commissionRate * 100)}% commission)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Bonus Eligibility</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="fastStart"
                        checked={inputs.fastStartBonus}
                        onChange={(e) => setInputs({ ...inputs, fastStartBonus: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="fastStart" className="text-sm">
                        Fast Start Bonus (10%)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="matching"
                        checked={inputs.matchingBonus}
                        onChange={(e) => setInputs({ ...inputs, matchingBonus: e.target.checked })}
                        className="rounded"
                        disabled={!currentRankInfo.bonusEligibility.includes("matching")}
                      />
                      <label htmlFor="matching" className="text-sm">
                        Matching Bonus (25%)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="leadership"
                        checked={inputs.leadershipBonus}
                        onChange={(e) => setInputs({ ...inputs, leadershipBonus: e.target.checked })}
                        className="rounded"
                        disabled={!currentRankInfo.bonusEligibility.includes("leadership")}
                      />
                      <label htmlFor="leadership" className="text-sm">
                        Leadership Bonus (2%)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="rankBonus"
                        checked={inputs.bonusQualified}
                        onChange={(e) => setInputs({ ...inputs, bonusQualified: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="rankBonus" className="text-sm">
                        Rank Bonus (${getRankBonus(inputs.currentRank)})
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={resetCalculator} className="bg-transparent">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button variant="outline" className="bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Commission Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    ${breakdown.totalCommissions.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Total Monthly Commissions</div>
                  <div className="text-sm text-green-600 mt-1">
                    ${(breakdown.totalCommissions * 12).toLocaleString()} annually
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Direct Commissions</span>
                    </div>
                    <span className="font-medium">${breakdown.directCommissions.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Team Commissions</span>
                    </div>
                    <span className="font-medium">${breakdown.teamCommissions.toLocaleString()}</span>
                  </div>

                  {breakdown.fastStartBonus > 0 && (
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Fast Start Bonus</span>
                      </div>
                      <span className="font-medium">${breakdown.fastStartBonus.toLocaleString()}</span>
                    </div>
                  )}

                  {breakdown.matchingBonus > 0 && (
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Matching Bonus</span>
                      </div>
                      <span className="font-medium">${breakdown.matchingBonus.toLocaleString()}</span>
                    </div>
                  )}

                  {breakdown.leadershipBonus > 0 && (
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm">Leadership Bonus</span>
                      </div>
                      <span className="font-medium">${breakdown.leadershipBonus.toLocaleString()}</span>
                    </div>
                  )}

                  {breakdown.rankBonus > 0 && (
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-red-600" />
                        <span className="text-sm">Rank Bonus</span>
                      </div>
                      <span className="font-medium">${breakdown.rankBonus.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Current Rank: {currentRankInfo.name}</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Commission Rate: {Math.round(currentRankInfo.commissionRate * 100)}%</div>
                    <div>Team Commission: {Math.round(currentRankInfo.teamCommissionRate * 100)}%</div>
                    <div>Personal Volume: ${inputs.personalSales.toLocaleString()}</div>
                    <div>Team Volume: ${(inputs.teamSize * inputs.averageTeamSales).toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Rank Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span>Compare with:</span>
                  <Select value={comparisonRank} onValueChange={setComparisonRank}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ranks
                        .filter((r) => r.id !== inputs.currentRank)
                        .map((rank) => (
                          <SelectItem key={rank.id} value={rank.id}>
                            {rank.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="comparisonMode"
                    checked={comparisonMode}
                    onChange={(e) => setComparisonMode(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="comparisonMode" className="text-sm">
                    Enable comparison mode
                  </label>
                </div>
              </CardContent>
            </Card>

            {comparisonMode && comparisonBreakdown && (
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Difference</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold mb-2 ${
                        comparisonBreakdown.totalCommissions > breakdown.totalCommissions
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {comparisonBreakdown.totalCommissions > breakdown.totalCommissions ? "+" : ""}$
                      {(comparisonBreakdown.totalCommissions - breakdown.totalCommissions).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Monthly difference</div>
                    <div className="flex items-center justify-center mt-2">
                      {comparisonBreakdown.totalCommissions > breakdown.totalCommissions ? (
                        <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className="text-sm">
                        {Math.round(
                          ((comparisonBreakdown.totalCommissions - breakdown.totalCommissions) /
                            breakdown.totalCommissions) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Commission Comparison Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                  <Bar dataKey="current" fill="#3B82F6" name={currentRankInfo.name} />
                  {comparisonMode && (
                    <Bar dataKey="comparison" fill="#10B981" name={ranks.find((r) => r.id === comparisonRank)?.name} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {scenarios.map((scenario) => (
              <Card key={scenario.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{scenario.name} Scenario</CardTitle>
                    <Badge
                      variant={
                        scenario.name === "Conservative"
                          ? "secondary"
                          : scenario.name === "Realistic"
                            ? "default"
                            : scenario.name === "Aggressive"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {scenario.name}
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
                      <span>Team Size:</span>
                      <span className="font-medium">{scenario.teamSize} members</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Team Sales:</span>
                      <span className="font-medium">${scenario.averageTeamSales.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg mb-4">
                    <div className="text-2xl font-bold text-green-600">
                      $
                      {calculateCommissions(
                        {
                          ...inputs,
                          personalSales: scenario.personalSales,
                          teamSize: scenario.teamSize,
                          averageTeamSales: scenario.averageTeamSales,
                        },
                        inputs.currentRank,
                      ).totalCommissions.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Estimated Monthly Earnings</div>
                  </div>

                  <Button className="w-full" onClick={() => applyScenario(scenario)}>
                    Apply Scenario
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Commission Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Rank Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Rank Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ranks.map((rank) => (
                    <div
                      key={rank.id}
                      className={`p-3 border rounded-lg ${
                        rank.id === inputs.currentRank ? "bg-blue-50 border-blue-200" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{rank.name}</h5>
                        <Badge variant="outline">{Math.round(rank.commissionRate * 100)}%</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Personal Volume: ${rank.requirements.personalVolume.toLocaleString()}</div>
                        <div>Team Volume: ${rank.requirements.teamVolume.toLocaleString()}</div>
                        <div>Active Downlines: {rank.requirements.activeDownlines}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Commission Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Commission Type</th>
                      <th className="text-right p-2">Rate</th>
                      <th className="text-right p-2">Base Amount</th>
                      <th className="text-right p-2">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Direct Commissions</td>
                      <td className="text-right p-2">{Math.round(currentRankInfo.commissionRate * 100)}%</td>
                      <td className="text-right p-2">${inputs.personalSales.toLocaleString()}</td>
                      <td className="text-right p-2 font-medium">${breakdown.directCommissions.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Team Commissions</td>
                      <td className="text-right p-2">{Math.round(currentRankInfo.teamCommissionRate * 100)}%</td>
                      <td className="text-right p-2">
                        ${(inputs.teamSize * inputs.averageTeamSales).toLocaleString()}
                      </td>
                      <td className="text-right p-2 font-medium">${breakdown.teamCommissions.toLocaleString()}</td>
                    </tr>
                    {breakdown.fastStartBonus > 0 && (
                      <tr className="border-b">
                        <td className="p-2">Fast Start Bonus</td>
                        <td className="text-right p-2">10%</td>
                        <td className="text-right p-2">${inputs.personalSales.toLocaleString()}</td>
                        <td className="text-right p-2 font-medium">${breakdown.fastStartBonus.toLocaleString()}</td>
                      </tr>
                    )}
                    {breakdown.matchingBonus > 0 && (
                      <tr className="border-b">
                        <td className="p-2">Matching Bonus</td>
                        <td className="text-right p-2">25%</td>
                        <td className="text-right p-2">${breakdown.teamCommissions.toLocaleString()}</td>
                        <td className="text-right p-2 font-medium">${breakdown.matchingBonus.toLocaleString()}</td>
                      </tr>
                    )}
                    {breakdown.leadershipBonus > 0 && (
                      <tr className="border-b">
                        <td className="p-2">Leadership Bonus</td>
                        <td className="text-right p-2">2%</td>
                        <td className="text-right p-2">
                          ${(inputs.teamSize * inputs.averageTeamSales).toLocaleString()}
                        </td>
                        <td className="text-right p-2 font-medium">${breakdown.leadershipBonus.toLocaleString()}</td>
                      </tr>
                    )}
                    {breakdown.rankBonus > 0 && (
                      <tr className="border-b">
                        <td className="p-2">Rank Bonus</td>
                        <td className="text-right p-2">Fixed</td>
                        <td className="text-right p-2">-</td>
                        <td className="text-right p-2 font-medium">${breakdown.rankBonus.toLocaleString()}</td>
                      </tr>
                    )}
                    <tr className="border-t-2 font-bold">
                      <td className="p-2">Total Commissions</td>
                      <td className="text-right p-2">-</td>
                      <td className="text-right p-2">-</td>
                      <td className="text-right p-2">${breakdown.totalCommissions.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
