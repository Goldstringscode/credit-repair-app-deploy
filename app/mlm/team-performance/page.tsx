"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
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
  AreaChart,
  Area,
} from "recharts"
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Award,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react"

interface PerformanceData {
  month: string
  teamSize: number
  activeMembers: number
  newJoins: number
  volume: number
  earnings: number
  retention: number
}

interface TeamMemberPerformance {
  id: string
  name: string
  rank: string
  personalVolume: number
  teamVolume: number
  recruits: number
  status: "excellent" | "good" | "needs_attention" | "inactive"
  trend: "up" | "down" | "stable"
  monthlyGrowth: number
}

const performanceData: PerformanceData[] = [
  { month: "Jan", teamSize: 32, activeMembers: 28, newJoins: 5, volume: 85000, earnings: 12500, retention: 87 },
  { month: "Feb", teamSize: 35, activeMembers: 31, newJoins: 4, volume: 92000, earnings: 14200, retention: 89 },
  { month: "Mar", teamSize: 38, activeMembers: 34, newJoins: 6, volume: 98000, earnings: 15800, retention: 91 },
  { month: "Apr", teamSize: 42, activeMembers: 37, newJoins: 7, volume: 105000, earnings: 18200, retention: 88 },
  { month: "May", teamSize: 45, activeMembers: 40, newJoins: 5, volume: 112000, earnings: 19500, retention: 92 },
  { month: "Jun", teamSize: 47, activeMembers: 42, newJoins: 3, volume: 125500, earnings: 21800, retention: 94 },
]

const teamPerformance: TeamMemberPerformance[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    rank: "Director",
    personalVolume: 2500,
    teamVolume: 12500,
    recruits: 8,
    status: "excellent",
    trend: "up",
    monthlyGrowth: 18.5,
  },
  {
    id: "2",
    name: "Mike Rodriguez",
    rank: "Manager",
    personalVolume: 1800,
    teamVolume: 6500,
    recruits: 5,
    status: "good",
    trend: "up",
    monthlyGrowth: 12.3,
  },
  {
    id: "3",
    name: "Emily Chen",
    rank: "Consultant",
    personalVolume: 1200,
    teamVolume: 3200,
    recruits: 3,
    status: "good",
    trend: "stable",
    monthlyGrowth: 5.2,
  },
  {
    id: "4",
    name: "David Wilson",
    rank: "Manager",
    personalVolume: 1600,
    teamVolume: 8200,
    recruits: 6,
    status: "excellent",
    trend: "up",
    monthlyGrowth: 22.1,
  },
  {
    id: "5",
    name: "Lisa Anderson",
    rank: "Consultant",
    personalVolume: 950,
    teamVolume: 2800,
    recruits: 4,
    status: "needs_attention",
    trend: "down",
    monthlyGrowth: -3.2,
  },
]

const rankDistribution = [
  { name: "Associate", value: 15, color: "#94A3B8" },
  { name: "Consultant", value: 18, color: "#10B981" },
  { name: "Manager", value: 10, color: "#3B82F6" },
  { name: "Director", value: 3, color: "#8B5CF6" },
  { name: "Executive", value: 1, color: "#F59E0B" },
]

export default function TeamPerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [selectedMetric, setSelectedMetric] = useState("volume")
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-50"
      case "good":
        return "text-blue-600 bg-blue-50"
      case "needs_attention":
        return "text-orange-600 bg-orange-50"
      case "inactive":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="h-4 w-4" />
      case "good":
        return <Star className="h-4 w-4" />
      case "needs_attention":
        return <AlertTriangle className="h-4 w-4" />
      case "inactive":
        return <Clock className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const currentData = performanceData[performanceData.length - 1]
  const previousData = performanceData[performanceData.length - 2]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Performance</h1>
          <p className="text-gray-600">Monitor your team's activity and growth metrics</p>
        </div>

        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Size</p>
                <p className="text-2xl font-bold text-blue-600">{currentData.teamSize}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">
              +{currentData.teamSize - previousData.teamSize} from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-green-600">{currentData.activeMembers}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">
              {Math.round((currentData.activeMembers / currentData.teamSize) * 100)}% activity rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Volume</p>
                <p className="text-2xl font-bold text-purple-600">${(currentData.volume / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">
              +{Math.round(((currentData.volume - previousData.volume) / previousData.volume) * 100)}% growth
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                <p className="text-2xl font-bold text-orange-600">{currentData.retention}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">
              +{currentData.retention - previousData.retention}% improvement
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
          <TabsTrigger value="goals">Goals & Targets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Team Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Team Growth Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="teamSize"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      name="Team Size"
                    />
                    <Area
                      type="monotone"
                      dataKey="activeMembers"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                      name="Active Members"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Rank Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Rank Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={rankDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {rankDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Volume & Earnings Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Volume & Earnings Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="volume" fill="#8B5CF6" name="Volume ($)" />
                  <Bar yAxisId="right" dataKey="earnings" fill="#F59E0B" name="Earnings ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Individual Team Member Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamPerformance.map((member) => (
                  <div key={member.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-lg">{member.name}</span>
                            <Badge variant="outline">{member.rank}</Badge>
                            <Badge className={`text-xs ${getStatusColor(member.status)}`}>
                              {getStatusIcon(member.status)}
                              <span className="ml-1 capitalize">{member.status.replace("_", " ")}</span>
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Personal: ${member.personalVolume.toLocaleString()}</span>
                            <span>Team: ${member.teamVolume.toLocaleString()}</span>
                            <span>Recruits: {member.recruits}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          {getTrendIcon(member.trend)}
                          <span
                            className={`font-semibold ${
                              member.monthlyGrowth > 0
                                ? "text-green-600"
                                : member.monthlyGrowth < 0
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {member.monthlyGrowth > 0 ? "+" : ""}
                            {member.monthlyGrowth.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">Monthly Growth</div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance Score</span>
                        <span>
                          {member.status === "excellent"
                            ? "95%"
                            : member.status === "good"
                              ? "80%"
                              : member.status === "needs_attention"
                                ? "60%"
                                : "30%"}
                        </span>
                      </div>
                      <Progress
                        value={
                          member.status === "excellent"
                            ? 95
                            : member.status === "good"
                              ? 80
                              : member.status === "needs_attention"
                                ? 60
                                : 30
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Retention Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Retention Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="retention" stroke="#10B981" strokeWidth={3} name="Retention %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* New Joins Trend */}
            <Card>
              <CardHeader>
                <CardTitle>New Member Acquisitions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="newJoins" fill="#3B82F6" name="New Members" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Strong Growth</span>
                  </div>
                  <p className="text-sm text-green-700">Team volume increased by 12% this month, exceeding targets.</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-800">High Retention</span>
                  </div>
                  <p className="text-sm text-blue-700">94% retention rate is well above industry average of 85%.</p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="font-semibold text-orange-800">Focus Area</span>
                  </div>
                  <p className="text-sm text-orange-700">3 members need attention to improve their performance.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Monthly Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Monthly Goals Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Team Volume Target</span>
                    <span>$125,500 / $150,000</span>
                  </div>
                  <Progress value={83.7} className="h-3" />
                  <p className="text-xs text-gray-600 mt-1">83.7% complete</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>New Member Target</span>
                    <span>3 / 5</span>
                  </div>
                  <Progress value={60} className="h-3" />
                  <p className="text-xs text-gray-600 mt-1">60% complete</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Retention Target</span>
                    <span>94% / 90%</span>
                  </div>
                  <Progress value={100} className="h-3" />
                  <p className="text-xs text-green-600 mt-1">Target exceeded!</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Team Earnings Target</span>
                    <span>$21,800 / $25,000</span>
                  </div>
                  <Progress value={87.2} className="h-3" />
                  <p className="text-xs text-gray-600 mt-1">87.2% complete</p>
                </div>
              </CardContent>
            </Card>

            {/* Quarterly Objectives */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Quarterly Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Reach 50 team members</p>
                      <p className="text-sm text-gray-600">47/50 members (94% complete)</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Achieve $400K quarterly volume</p>
                      <p className="text-sm text-gray-600">$295K/400K (74% complete)</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Promote 2 members to Director</p>
                      <p className="text-sm text-gray-600">1/2 promotions (50% complete)</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Maintain 90%+ retention rate</p>
                      <p className="text-sm text-gray-600">94% retention (Target exceeded)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Follow up with Lisa Anderson</p>
                    <p className="text-sm text-red-700">Performance declining - schedule 1:1 meeting</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Schedule
                  </Button>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Star className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Recognize top performers</p>
                    <p className="text-sm text-blue-700">Sarah and David exceeded targets - send recognition</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Send
                  </Button>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Recruit 2 more members</p>
                    <p className="text-sm text-green-700">Need 2 more to reach monthly goal of 5 new members</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
