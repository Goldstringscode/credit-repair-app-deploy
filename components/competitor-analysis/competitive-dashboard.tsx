"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  RefreshCw,
  Download,
  Shield,
} from "lucide-react"
import {
  competitors,
  industryBenchmarks,
  marketIntelligence,
  calculateCompetitivePosition,
  calculateMarketOpportunity,
} from "@/lib/competitor-analysis"

interface CompetitiveDashboardProps {
  affiliateId: string
}

export function CompetitiveDashboard({ affiliateId }: CompetitiveDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedMetric, setSelectedMetric] = useState<string>("conversion_rate")
  const [loading, setLoading] = useState(false)

  // Mock your performance data - in real app, fetch from API
  const yourPerformance = {
    conversion_rate: 3.8,
    commission_rate: 45,
    cookie_duration: 60,
    customer_retention: 75,
    average_order_value: 89,
    monthly_traffic: 450000,
    affiliate_support_rating: 8.8,
  }

  const filteredCompetitors =
    selectedCategory === "all" ? competitors : competitors.filter((c) => c.category === selectedCategory)

  const competitivePositions = industryBenchmarks.map((benchmark) =>
    calculateCompetitivePosition(yourPerformance[benchmark.metric as keyof typeof yourPerformance], benchmark),
  )

  const marketOpportunity = calculateMarketOpportunity(yourPerformance, competitors)

  const radarData = [
    { metric: "Conversion Rate", your: 75, industry: 50, topCompetitor: 85 },
    { metric: "Commission Rate", your: 85, industry: 60, topCompetitor: 70 },
    { metric: "Cookie Duration", your: 80, industry: 65, topCompetitor: 90 },
    { metric: "Customer Retention", your: 88, industry: 70, topCompetitor: 82 },
    { metric: "Support Quality", your: 92, industry: 75, topCompetitor: 95 },
    { metric: "Brand Strength", your: 65, industry: 75, topCompetitor: 95 },
  ]

  const marketShareData = [
    { name: "Credit Karma", value: 35.2, color: "#3B82F6" },
    { name: "Lexington Law", value: 25.3, color: "#10B981" },
    { name: "Credit Saint", value: 18.7, color: "#F59E0B" },
    { name: "Sky Blue", value: 12.4, color: "#EF4444" },
    { name: "Your Company", value: 3.2, color: "#8B5CF6" },
    { name: "Others", value: 5.2, color: "#6B7280" },
  ]

  const seasonalTrendData = marketIntelligence.seasonalPatterns.map((pattern) => ({
    month: pattern.month.substring(0, 3),
    multiplier: pattern.multiplier,
    reason: pattern.reason,
  }))

  const getPerformanceColor = (percentileRank: number) => {
    if (percentileRank >= 90) return "text-green-600 bg-green-50"
    if (percentileRank >= 75) return "text-blue-600 bg-blue-50"
    if (percentileRank >= 50) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Target className="h-4 w-4 text-gray-600" />
    }
  }

  const refreshData = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
  }

  const exportData = () => {
    const data = {
      competitivePositions,
      competitors: filteredCompetitors,
      marketIntelligence,
      yourPerformance,
    }

    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `competitive-analysis-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Competitive Intelligence</h1>
          <p className="text-gray-600">Benchmark your performance against industry leaders</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Competitors</SelectItem>
              <SelectItem value="direct">Direct Competitors</SelectItem>
              <SelectItem value="indirect">Indirect Competitors</SelectItem>
              <SelectItem value="adjacent">Adjacent Markets</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Market Position</p>
                <p className="text-2xl font-bold text-blue-600">Top 25%</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">+2 positions this quarter</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Market Share</p>
                <p className="text-2xl font-bold text-green-600">3.2%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">+0.8% growth YoY</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Competitive Score</p>
                <p className="text-2xl font-bold text-purple-600">78/100</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">+5 points vs last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Growth Potential</p>
                <p className="text-2xl font-bold text-orange-600">$357M</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">8.5% market growth rate</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="benchmarks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="positioning">Positioning</TabsTrigger>
          <TabsTrigger value="market">Market Intel</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
        </TabsList>

        <TabsContent value="benchmarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Performance Benchmarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {competitivePositions.map((position, index) => (
                  <div key={position.metric} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium capitalize">{position.metric.replace("_", " ")}</h4>
                        {getTrendIcon(position.trend)}
                        <Badge className={getPerformanceColor(position.percentileRank)}>
                          {position.percentileRank}th percentile
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {position.yourValue}
                          {industryBenchmarks[index]?.unit}
                        </p>
                        <p className="text-sm text-gray-600">
                          vs {position.industryAverage}
                          {industryBenchmarks[index]?.unit} avg
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-600">Your Performance</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={(position.yourValue / position.topPerformer) * 100} className="flex-1 h-2" />
                          <span className="text-sm font-medium">
                            {((position.yourValue / position.topPerformer) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Industry Average</p>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={(position.industryAverage / position.topPerformer) * 100}
                            className="flex-1 h-2"
                          />
                          <span className="text-sm font-medium">
                            {((position.industryAverage / position.topPerformer) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Top Performer</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={100} className="flex-1 h-2" />
                          <span className="text-sm font-medium">100%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Lightbulb className="h-4 w-4 inline mr-1" />
                        {position.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Competitor Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCompetitors.map((competitor) => (
                    <div key={competitor.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold">{competitor.name.substring(0, 2).toUpperCase()}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{competitor.name}</h4>
                            <p className="text-sm text-gray-600 capitalize">{competitor.category} competitor</p>
                          </div>
                        </div>
                        <Badge variant="outline">{competitor.marketShare}% market share</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Commission</p>
                          <p className="font-medium">{competitor.affiliateProgram.commissionRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Cookie</p>
                          <p className="font-medium">{competitor.affiliateProgram.cookieDuration}d</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Conv. Rate</p>
                          <p className="font-medium">{competitor.performance.conversionRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">AOV</p>
                          <p className="font-medium">${competitor.performance.averageOrderValue}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="font-medium text-green-600 mb-1">Strengths:</p>
                          <ul className="space-y-1">
                            {competitor.strengths.slice(0, 2).map((strength, idx) => (
                              <li key={idx}>• {strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-red-600 mb-1">Weaknesses:</p>
                          <ul className="space-y-1">
                            {competitor.weaknesses.slice(0, 2).map((weakness, idx) => (
                              <li key={idx}>• {weakness}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Share Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={marketShareData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} (${value}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {marketShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Market Size:</span>
                    <span className="font-medium">${(marketIntelligence.marketSize / 1000000000).toFixed(1)}B</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Annual Growth Rate:</span>
                    <span className="font-medium text-green-600">+{marketIntelligence.growthRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Your Growth Potential:</span>
                    <span className="font-medium text-blue-600">
                      ${(marketOpportunity.growthPotential / 1000000).toFixed(0)}M
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positioning" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Competitive Positioning Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Your Performance" dataKey="your" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    <Radar
                      name="Industry Average"
                      dataKey="industry"
                      stroke="#6B7280"
                      fill="#6B7280"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="Top Competitor"
                      dataKey="topCompetitor"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.1}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitive Advantages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Award className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-medium text-green-800">Your Strengths</h4>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Higher commission rates than 75% of competitors</li>
                      <li>• Excellent affiliate support rating (8.8/10)</li>
                      <li>• Strong customer retention (75% vs 69% average)</li>
                      <li>• Longer cookie duration (60 days vs 48 average)</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      <h4 className="font-medium text-yellow-800">Areas for Improvement</h4>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Brand strength below major competitors</li>
                      <li>• Lower monthly traffic than top performers</li>
                      <li>• Market share growth opportunity</li>
                      <li>• Mobile experience optimization needed</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-blue-800">Strategic Recommendations</h4>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Leverage high commission rates in affiliate recruitment</li>
                      <li>• Invest in brand awareness campaigns</li>
                      <li>• Develop mobile-first customer experience</li>
                      <li>• Create content marketing strategy</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Market Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={seasonalTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [value, "Demand Multiplier"]}
                      labelFormatter={(label) => {
                        const data = seasonalTrendData.find((d) => d.month === label)
                        return data ? `${label}: ${data.reason}` : label
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="multiplier"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    <strong>Peak Seasons:</strong> January (New Year resolutions), November (Black Friday)
                  </p>
                  <p>
                    <strong>Low Seasons:</strong> July-August (vacation season)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                      Key Market Trends
                    </h4>
                    <ul className="text-sm space-y-1">
                      {marketIntelligence.keyTrends.slice(0, 4).map((trend, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {trend}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-blue-600" />
                      Regulatory Changes
                    </h4>
                    <ul className="text-sm space-y-1">
                      {marketIntelligence.regulatoryChanges.slice(0, 3).map((change, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        ${(marketIntelligence.marketSize / 1000000000).toFixed(1)}B
                      </p>
                      <p className="text-sm text-gray-600">Market Size</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">+{marketIntelligence.growthRate}%</p>
                      <p className="text-sm text-gray-600">Annual Growth</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-green-600" />
                  Market Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketIntelligence.opportunities.map((opportunity, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-green-600 text-sm font-bold">{idx + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{opportunity}</p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <span>Impact: High</span>
                            <span>Effort: Medium</span>
                            <span>Timeline: 3-6 months</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitive Gaps Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketOpportunity.competitiveGaps.map((gap, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{gap}</h4>
                        <Badge variant="outline" className="text-blue-600">
                          Opportunity
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Market demand: High • Competition: Low • Implementation: Medium</p>
                      </div>
                      <div className="mt-2">
                        <Progress value={75} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">75% market opportunity score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Strategic Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Short-term Actions (0-3 months)</h4>
                  <div className="space-y-2">
                    {marketOpportunity.recommendations.slice(0, 3).map((rec, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Long-term Strategy (3-12 months)</h4>
                  <div className="space-y-2">
                    {marketOpportunity.recommendations.slice(3).map((rec, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Market Threats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketIntelligence.threats.map((threat, idx) => (
                    <div key={idx} className="p-3 border border-red-200 bg-red-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800">{threat}</p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-red-600">
                            <span>Risk Level: {idx < 2 ? "High" : idx < 4 ? "Medium" : "Low"}</span>
                            <span>Probability: {idx < 3 ? "High" : "Medium"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Mitigation Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">Regulatory Compliance</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Implement automated compliance monitoring</li>
                      <li>• Regular legal review of marketing materials</li>
                      <li>• Enhanced disclosure and transparency</li>
                    </ul>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">Competitive Defense</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Strengthen affiliate relationships</li>
                      <li>• Invest in technology differentiation</li>
                      <li>• Build customer loyalty programs</li>
                    </ul>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">Market Diversification</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Expand into adjacent markets</li>
                      <li>• Develop multiple revenue streams</li>
                      <li>• Geographic market expansion</li>
                    </ul>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">Economic Resilience</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Flexible pricing models</li>
                      <li>• Cost structure optimization</li>
                      <li>• Emergency response planning</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
