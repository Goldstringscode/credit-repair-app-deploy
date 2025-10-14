"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  Calculator,
  TrendingUp,
  Users,
  Target,
  Award,
  Zap,
  Save,
  Share2,
  Download,
  RefreshCw,
  Info,
  Crown,
  Star,
} from "lucide-react"

interface CommissionCalculation {
  directCommissions: number
  teamCommissions: number
  matchingBonuses: number
  leadershipBonuses: number
  rankBonuses: number
  totalEarnings: number
}

interface ScenarioData {
  name: string
  personalSales: number
  teamSize: number
  teamVolume: number
  rank: string
  earnings: number
}

const rankData = [
  { name: "Associate", level: 1, directRate: 0.3, requirements: { personal: 0, team: 0, downlines: 0 } },
  { name: "Consultant", level: 2, directRate: 0.35, requirements: { personal: 500, team: 1000, downlines: 2 } },
  { name: "Manager", level: 3, directRate: 0.4, requirements: { personal: 1000, team: 5000, downlines: 5 } },
  { name: "Director", level: 4, directRate: 0.45, requirements: { personal: 2000, team: 15000, downlines: 10 } },
  { name: "Executive", level: 5, directRate: 0.5, requirements: { personal: 3000, team: 50000, downlines: 25 } },
  { name: "Presidential", level: 6, directRate: 0.55, requirements: { personal: 5000, team: 150000, downlines: 50 } },
]

export default function CommissionCalculatorPage() {
  const [personalSales, setPersonalSales] = useState(1500)
  const [teamSize, setTeamSize] = useState(25)
  const [teamVolume, setTeamVolume] = useState(12500)
  const [currentRank, setCurrentRank] = useState("Manager")
  const [calculation, setCalculation] = useState<CommissionCalculation>({
    directCommissions: 0,
    teamCommissions: 0,
    matchingBonuses: 0,
    leadershipBonuses: 0,
    rankBonuses: 0,
    totalEarnings: 0,
  })
  const [scenarios, setScenarios] = useState<ScenarioData[]>([])
  const [savedCalculations, setSavedCalculations] = useState<any[]>([])

  useEffect(() => {
    calculateCommissions()
    generateScenarios()
  }, [personalSales, teamSize, teamVolume, currentRank])

  const calculateCommissions = () => {
    const rank = rankData.find((r) => r.name === currentRank) || rankData[2]

    // Direct commissions (personal sales)
    const directCommissions = personalSales * rank.directRate

    // Team commissions (unilevel structure)
    const teamCommissions = teamVolume * 0.05 // 5% average on team volume

    // Matching bonuses (25% of direct recruits' earnings)
    const directRecruits = Math.min(teamSize, 10) // Assume max 10 direct recruits
    const avgRecruitsEarnings = (teamVolume / teamSize) * 0.3 // Estimate
    const matchingBonuses = directRecruits * avgRecruitsEarnings * 0.25

    // Leadership bonuses (based on rank and team performance)
    let leadershipBonuses = 0
    if (rank.level >= 3) leadershipBonuses = Math.min(teamVolume * 0.02, 2000)
    if (rank.level >= 4) leadershipBonuses = Math.min(teamVolume * 0.03, 5000)
    if (rank.level >= 5) leadershipBonuses = Math.min(teamVolume * 0.04, 10000)

    // Rank advancement bonuses
    const rankBonuses = rank.level >= 4 ? 500 : 0

    const totalEarnings = directCommissions + teamCommissions + matchingBonuses + leadershipBonuses + rankBonuses

    setCalculation({
      directCommissions,
      teamCommissions,
      matchingBonuses,
      leadershipBonuses,
      rankBonuses,
      totalEarnings,
    })
  }

  const generateScenarios = () => {
    const baseScenarios = [
      { name: "Conservative", multiplier: 0.7 },
      { name: "Current", multiplier: 1.0 },
      { name: "Optimistic", multiplier: 1.5 },
      { name: "Aggressive", multiplier: 2.0 },
    ]

    const newScenarios = baseScenarios.map((scenario) => {
      const scenarioPersonalSales = personalSales * scenario.multiplier
      const scenarioTeamSize = Math.round(teamSize * scenario.multiplier)
      const scenarioTeamVolume = teamVolume * scenario.multiplier

      // Calculate earnings for this scenario
      const rank = rankData.find((r) => r.name === currentRank) || rankData[2]
      const directComm = scenarioPersonalSales * rank.directRate
      const teamComm = scenarioTeamVolume * 0.05
      const matchingBonus = Math.min(scenarioTeamSize, 10) * ((scenarioTeamVolume / scenarioTeamSize) * 0.3) * 0.25
      const leadershipBonus = rank.level >= 3 ? Math.min(scenarioTeamVolume * 0.02, 2000) : 0
      const earnings = directComm + teamComm + matchingBonus + leadershipBonus

      return {
        name: scenario.name,
        personalSales: Math.round(scenarioPersonalSales),
        teamSize: scenarioTeamSize,
        teamVolume: Math.round(scenarioTeamVolume),
        rank: currentRank,
        earnings: Math.round(earnings),
      }
    })

    setScenarios(newScenarios)
  }

  const saveCalculation = () => {
    const newCalculation = {
      id: Date.now(),
      name: `Calculation ${new Date().toLocaleDateString()}`,
      personalSales,
      teamSize,
      teamVolume,
      currentRank,
      calculation,
      createdAt: new Date(),
    }
    setSavedCalculations((prev) => [newCalculation, ...prev.slice(0, 4)])
  }

  const loadCalculation = (saved: any) => {
    setPersonalSales(saved.personalSales)
    setTeamSize(saved.teamSize)
    setTeamVolume(saved.teamVolume)
    setCurrentRank(saved.currentRank)
  }

  const earningsBreakdown = [
    { name: "Direct Sales", value: calculation.directCommissions, color: "#3B82F6" },
    { name: "Team Commissions", value: calculation.teamCommissions, color: "#10B981" },
    { name: "Matching Bonuses", value: calculation.matchingBonuses, color: "#F59E0B" },
    { name: "Leadership Bonuses", value: calculation.leadershipBonuses, color: "#8B5CF6" },
    { name: "Rank Bonuses", value: calculation.rankBonuses, color: "#EF4444" },
  ].filter((item) => item.value > 0)

  const projectionData = Array.from({ length: 12 }, (_, i) => ({
    month: `Month ${i + 1}`,
    earnings: calculation.totalEarnings * (1 + i * 0.05), // 5% growth per month
    cumulative: calculation.totalEarnings * (i + 1) * (1 + i * 0.025),
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commission Calculator</h1>
          <p className="text-gray-600">Calculate your potential MLM earnings and commissions</p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={saveCalculation}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Input Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="personalSales">Personal Sales Volume</Label>
                <div className="mt-2">
                  <Input
                    id="personalSales"
                    type="number"
                    value={personalSales}
                    onChange={(e) => setPersonalSales(Number(e.target.value))}
                    className="mb-2"
                  />
                  <Slider
                    value={[personalSales]}
                    onValueChange={(value) => setPersonalSales(value[0])}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$0</span>
                    <span>$10,000</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="teamSize">Team Size</Label>
                <div className="mt-2">
                  <Input
                    id="teamSize"
                    type="number"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="mb-2"
                  />
                  <Slider
                    value={[teamSize]}
                    onValueChange={(value) => setTeamSize(value[0])}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="teamVolume">Team Volume</Label>
                <div className="mt-2">
                  <Input
                    id="teamVolume"
                    type="number"
                    value={teamVolume}
                    onChange={(e) => setTeamVolume(Number(e.target.value))}
                    className="mb-2"
                  />
                  <Slider
                    value={[teamVolume]}
                    onValueChange={(value) => setTeamVolume(value[0])}
                    max={200000}
                    min={0}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$0</span>
                    <span>$200K</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="currentRank">Current Rank</Label>
                <Select value={currentRank} onValueChange={setCurrentRank}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rankData.map((rank) => (
                      <SelectItem key={rank.name} value={rank.name}>
                        <div className="flex items-center space-x-2">
                          {rank.name === "Presidential" && <Crown className="h-4 w-4" />}
                          {rank.name === "Executive" && <Star className="h-4 w-4" />}
                          {rank.name === "Director" && <Award className="h-4 w-4" />}
                          {rank.name === "Manager" && <Target className="h-4 w-4" />}
                          {rank.name === "Consultant" && <Users className="h-4 w-4" />}
                          <span>{rank.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {(rank.directRate * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={calculateCommissions} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recalculate
              </Button>
            </CardContent>
          </Card>

          {/* Saved Calculations */}
          {savedCalculations.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Saved Calculations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {savedCalculations.map((saved) => (
                    <div
                      key={saved.id}
                      className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => loadCalculation(saved)}
                    >
                      <div className="font-medium text-sm">{saved.name}</div>
                      <div className="text-xs text-gray-500">${saved.calculation.totalEarnings.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="results" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-6">
              {/* Total Earnings */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      ${calculation.totalEarnings.toLocaleString()}
                    </div>
                    <div className="text-gray-600 mb-4">Estimated Monthly Earnings</div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          ${calculation.directCommissions.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Direct Sales</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          ${calculation.teamCommissions.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Team Commissions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-orange-600">
                          ${calculation.matchingBonuses.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Matching Bonuses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          ${calculation.leadershipBonuses.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Leadership</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-600">
                          ${calculation.rankBonuses.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Rank Bonuses</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Annual Projections */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${(calculation.totalEarnings * 12).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Annual Earnings</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${(calculation.totalEarnings * 12 * 1.2).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">With 20% Growth</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${(calculation.totalEarnings * 12 * 1.5).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">With 50% Growth</div>
                  </CardContent>
                </Card>
              </div>

              {/* Rank Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Rank Requirements & Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {rankData.map((rank) => (
                      <div
                        key={rank.name}
                        className={`p-4 border rounded-lg ${
                          rank.name === currentRank ? "border-blue-500 bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {rank.name === "Presidential" && <Crown className="h-5 w-5 text-red-500" />}
                            {rank.name === "Executive" && <Star className="h-5 w-5 text-orange-500" />}
                            {rank.name === "Director" && <Award className="h-5 w-5 text-purple-500" />}
                            {rank.name === "Manager" && <Target className="h-5 w-5 text-blue-500" />}
                            {rank.name === "Consultant" && <Users className="h-5 w-5 text-green-500" />}
                            <span className="font-semibold">{rank.name}</span>
                          </div>
                          <Badge variant={rank.name === currentRank ? "default" : "outline"}>
                            {(rank.directRate * 100).toFixed(0)}% Commission
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Personal Volume: ${rank.requirements.personal.toLocaleString()}</div>
                          <div>Team Volume: ${rank.requirements.team.toLocaleString()}</div>
                          <div>Downlines: {rank.requirements.downlines}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Earnings Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={earningsBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: $${Number(value).toLocaleString()}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {earningsBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Detailed Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Commission Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                          <div className="font-medium">Direct Sales Commissions</div>
                          <div className="text-sm text-gray-600">
                            ${personalSales.toLocaleString()} ×{" "}
                            {((rankData.find((r) => r.name === currentRank)?.directRate || 0.4) * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          ${calculation.directCommissions.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <div className="font-medium">Team Commissions</div>
                          <div className="text-sm text-gray-600">${teamVolume.toLocaleString()} × 5% (avg)</div>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          ${calculation.teamCommissions.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <div>
                          <div className="font-medium">Matching Bonuses</div>
                          <div className="text-sm text-gray-600">25% of direct recruits' earnings</div>
                        </div>
                        <div className="text-lg font-bold text-orange-600">
                          ${calculation.matchingBonuses.toLocaleString()}
                        </div>
                      </div>

                      {calculation.leadershipBonuses > 0 && (
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <div>
                            <div className="font-medium">Leadership Bonuses</div>
                            <div className="text-sm text-gray-600">Based on rank and team performance</div>
                          </div>
                          <div className="text-lg font-bold text-purple-600">
                            ${calculation.leadershipBonuses.toLocaleString()}
                          </div>
                        </div>
                      )}

                      {calculation.rankBonuses > 0 && (
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <div>
                            <div className="font-medium">Rank Bonuses</div>
                            <div className="text-sm text-gray-600">Monthly rank achievement bonus</div>
                          </div>
                          <div className="text-lg font-bold text-red-600">
                            ${calculation.rankBonuses.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Scenario Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {scenarios.map((scenario) => (
                      <div
                        key={scenario.name}
                        className={`p-4 border rounded-lg ${
                          scenario.name === "Current" ? "border-blue-500 bg-blue-50" : ""
                        }`}
                      >
                        <div className="text-center mb-3">
                          <div className="font-semibold text-lg">{scenario.name}</div>
                          <div className="text-2xl font-bold text-green-600">${scenario.earnings.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Monthly</div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Personal Sales:</span>
                            <span>${scenario.personalSales.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Team Size:</span>
                            <span>{scenario.teamSize}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Team Volume:</span>
                            <span>${scenario.teamVolume.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              ${(scenario.earnings * 12).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Annual</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scenario Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scenarios}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="earnings" fill="#10B981" name="Monthly Earnings" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projections" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    12-Month Earnings Projection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="earnings"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="Monthly Earnings"
                      />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Cumulative Earnings"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${projectionData[11]?.earnings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Month 12 Earnings</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${projectionData[11]?.cumulative.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Year 1</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${(projectionData[11]?.cumulative * 2).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Projected Year 2</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Projection Assumptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="font-medium">Growth Assumptions:</div>
                      <ul className="space-y-1 text-gray-600">
                        <li>• 5% monthly earnings growth</li>
                        <li>• 2.5% cumulative growth rate</li>
                        <li>• Consistent team performance</li>
                        <li>• No rank changes included</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium">Important Notes:</div>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Results are estimates only</li>
                        <li>• Actual results may vary</li>
                        <li>• Market conditions may change</li>
                        <li>• Individual effort affects outcomes</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
