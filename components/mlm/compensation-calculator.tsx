"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { DollarSign, Calculator, Users, Target, Award, Zap, Info, Download, Share2 } from "lucide-react"
import { mlmRanks, compensationPlan, incomeStreams } from "@/lib/mlm-system"

interface CompensationCalculatorProps {
  userId: string
}

export function CompensationCalculator({ userId }: CompensationCalculatorProps) {
  const [personalSales, setPersonalSales] = useState(5)
  const [teamSize, setTeamSize] = useState(10)
  const [avgSaleAmount, setAvgSaleAmount] = useState(75)
  const [selectedRank, setSelectedRank] = useState("consultant")
  const [timeframe, setTimeframe] = useState("monthly")

  const calculateEarnings = () => {
    const rank = mlmRanks.find((r) => r.id === selectedRank) || mlmRanks[0]

    // Direct commissions
    const directCommissions = personalSales * avgSaleAmount * rank.commissionRate

    // Team commissions (simplified calculation)
    const teamVolume = teamSize * avgSaleAmount * 0.6 // Assume 60% activity rate
    const teamCommissions = teamVolume * 0.08 // Average 8% on team volume

    // Bonuses (estimated based on performance)
    let bonuses = 0
    if (rank.level >= 2) bonuses += 200 // Fast start bonuses
    if (rank.level >= 3) bonuses += 500 // Leadership bonuses
    if (rank.level >= 4) bonuses += 1000 // Rank bonuses
    if (rank.level >= 5) bonuses += 2000 // Executive bonuses

    const totalMonthly = directCommissions + teamCommissions + bonuses
    const totalAnnual = totalMonthly * 12

    return {
      direct: directCommissions,
      team: teamCommissions,
      bonuses: bonuses,
      monthly: totalMonthly,
      annual: totalAnnual,
    }
  }

  const earnings = calculateEarnings()
  const selectedRankData = mlmRanks.find((r) => r.id === selectedRank) || mlmRanks[0]

  const scenarioData = [
    {
      name: "Conservative",
      personalSales: 3,
      teamSize: 5,
      earnings: 1250,
      description: "Part-time effort, minimal team building",
    },
    {
      name: "Moderate",
      personalSales: 8,
      teamSize: 15,
      earnings: 3200,
      description: "Consistent effort, active team building",
    },
    {
      name: "Aggressive",
      personalSales: 15,
      teamSize: 30,
      earnings: 7500,
      description: "Full-time focus, rapid team expansion",
    },
    {
      name: "Top Performer",
      personalSales: 25,
      teamSize: 75,
      earnings: 18000,
      description: "Maximum effort, large organization",
    },
  ]

  const comparisonData = [
    { rank: "Associate", monthly: 450, annual: 5400 },
    { rank: "Consultant", monthly: 1200, annual: 14400 },
    { rank: "Manager", monthly: 3200, annual: 38400 },
    { rank: "Director", monthly: 7500, annual: 90000 },
    { rank: "Executive", monthly: 15000, annual: 180000 },
    { rank: "Presidential", monthly: 35000, annual: 420000 },
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="comparison">Rank Comparison</TabsTrigger>
          <TabsTrigger value="plan">Comp Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Income Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Target Rank</Label>
                  <Select value={selectedRank} onValueChange={setSelectedRank}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mlmRanks.map((rank) => (
                        <SelectItem key={rank.id} value={rank.id}>
                          {rank.name} (Level {rank.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge style={{ backgroundColor: selectedRankData.color }} className="text-white">
                    {selectedRankData.commissionRate * 100}% Commission Rate
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>Personal Sales per Month: {personalSales}</Label>
                  <Slider
                    value={[personalSales]}
                    onValueChange={(value) => setPersonalSales(value[0])}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 sale</span>
                    <span>50 sales</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Team Size: {teamSize} members</Label>
                  <Slider
                    value={[teamSize]}
                    onValueChange={(value) => setTeamSize(value[0])}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0 members</span>
                    <span>100 members</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Average Sale Amount</Label>
                  <div className="flex items-center space-x-2">
                    <span>$</span>
                    <Input
                      type="number"
                      value={avgSaleAmount}
                      onChange={(e) => setAvgSaleAmount(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Timeframe</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Projected Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600">
                    ${timeframe === "monthly" ? earnings.monthly.toLocaleString() : earnings.annual.toLocaleString()}
                  </p>
                  <p className="text-gray-600">{timeframe === "monthly" ? "Per Month" : "Per Year"}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Direct Commissions</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      $
                      {timeframe === "monthly"
                        ? earnings.direct.toLocaleString()
                        : (earnings.direct * 12).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Team Commissions</span>
                    </div>
                    <span className="font-bold text-green-600">
                      $
                      {timeframe === "monthly" ? earnings.team.toLocaleString() : (earnings.team * 12).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Bonuses & Incentives</span>
                    </div>
                    <span className="font-bold text-purple-600">
                      $
                      {timeframe === "monthly"
                        ? earnings.bonuses.toLocaleString()
                        : (earnings.bonuses * 12).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex items-start space-x-2">
                    <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Disclaimer</p>
                      <p className="text-yellow-700">
                        These are projected earnings based on your inputs. Actual results may vary based on effort,
                        market conditions, and individual performance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Results
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Income Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>7 Income Streams Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomeStreams.map((stream, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm">{stream.name}</h5>
                      <Zap className="h-4 w-4 text-yellow-500" />
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{stream.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {stream.difficulty}
                      </Badge>
                      <span className="text-xs font-medium text-green-600">{stream.potential}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Income Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {scenarioData.map((scenario, index) => (
                  <div key={index} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">{scenario.name}</h4>
                      <Badge variant="outline">{scenario.description}</Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Personal Sales:</span>
                        <span className="font-medium">{scenario.personalSales}/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Team Size:</span>
                        <span className="font-medium">{scenario.teamSize} members</span>
                      </div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">${scenario.earnings.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Monthly Income</p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4 bg-transparent"
                      onClick={() => {
                        setPersonalSales(scenario.personalSales)
                        setTeamSize(scenario.teamSize)
                      }}
                    >
                      Use This Scenario
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rank Income Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparisonData.map((rank, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${mlmRanks[index]?.color || "#94A3B8"}20` }}
                      >
                        <span className="font-bold" style={{ color: mlmRanks[index]?.color || "#94A3B8" }}>
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{rank.rank}</h4>
                        <p className="text-sm text-gray-600">Level {index + 1}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${rank.monthly.toLocaleString()}/mo</p>
                      <p className="text-sm text-gray-600">${rank.annual.toLocaleString()}/yr</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compensation Plan Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Plan Structure</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Plan Type:</span>
                        <span className="font-medium">{compensationPlan.structure.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Levels:</span>
                        <span className="font-medium">{compensationPlan.maxLevels}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commission Rates:</span>
                        <span className="font-medium">30% - 55%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonus Types:</span>
                        <span className="font-medium">{compensationPlan.bonuses.length} Different</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Unilevel Rates</h4>
                    <div className="space-y-1 text-sm">
                      {compensationPlan.commissionRates.map((rate, index) => (
                        <div key={index} className="flex justify-between">
                          <span>Level {index + 1}:</span>
                          <span className="font-medium">{(rate * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Bonus Structure</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {compensationPlan.bonuses.map((bonus, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-2">{bonus.name}</h5>
                        <p className="text-sm text-gray-600 mb-2">{bonus.trigger}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{bonus.frequency}</Badge>
                          <span className="font-medium text-green-600">
                            {bonus.type === "percentage" ? `${(bonus.amount * 100).toFixed(0)}%` : `$${bonus.amount}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Key Benefits</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• No monthly fees or quotas</li>
                    <li>• Multiple income streams for maximum earning potential</li>
                    <li>• Fast start bonuses for immediate income</li>
                    <li>• Lifetime commissions on qualified levels</li>
                    <li>• Rank advancement bonuses up to $25,000</li>
                    <li>• Car bonuses and luxury incentives</li>
                    <li>• Equity participation at highest levels</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
