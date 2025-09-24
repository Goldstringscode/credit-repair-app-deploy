"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "recharts"
import {
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Target,
  Crown,
  Star,
  Gift,
  Zap,
  Calendar,
  Share2,
  Download,
} from "lucide-react"
import { mockMLMUser, mlmRanks, incomeStreams } from "@/lib/mlm-system"

interface MLMDashboardProps {
  userId: string
}

export function MLMDashboard({ userId }: MLMDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("30")
  const [copied, setCopied] = useState(false)

  const user = mockMLMUser
  const currentRank = user.rank
  const nextRankIndex = mlmRanks.findIndex((rank) => rank.id === currentRank.id) + 1
  const nextRank = mlmRanks[nextRankIndex]

  // Mock data for charts
  const earningsData = [
    { month: "Jan", direct: 1200, team: 800, bonuses: 400 },
    { month: "Feb", direct: 1400, team: 950, bonuses: 600 },
    { month: "Mar", direct: 1100, team: 1200, bonuses: 500 },
    { month: "Apr", direct: 1600, team: 1400, bonuses: 800 },
    { month: "May", direct: 1800, team: 1600, bonuses: 900 },
    { month: "Jun", direct: 2100, team: 1800, bonuses: 1200 },
  ]

  const teamGrowthData = [
    { month: "Jan", active: 15, total: 18 },
    { month: "Feb", active: 18, total: 22 },
    { month: "Mar", active: 16, total: 25 },
    { month: "Apr", active: 22, total: 28 },
    { month: "May", active: 25, total: 32 },
    { month: "Jun", active: 28, total: 35 },
  ]

  const incomeBreakdown = [
    { name: "Direct Commissions", value: 45, color: "#3B82F6" },
    { name: "Team Commissions", value: 30, color: "#10B981" },
    { name: "Bonuses", value: 20, color: "#F59E0B" },
    { name: "Rank Bonuses", value: 5, color: "#EF4444" },
  ]

  const topPerformers = [
    { name: "Sarah Johnson", rank: "Director", volume: 12500, earnings: 3200 },
    { name: "Mike Rodriguez", rank: "Manager", volume: 8900, earnings: 2100 },
    { name: "Emily Chen", rank: "Consultant", volume: 6700, earnings: 1800 },
    { name: "David Wilson", rank: "Manager", volume: 7200, earnings: 1950 },
    { name: "Lisa Anderson", rank: "Consultant", volume: 5400, earnings: 1400 },
  ]

  const recentActivities = [
    { type: "referral", description: "New customer referral - John Smith", amount: 75, time: "2 hours ago" },
    { type: "commission", description: "Team commission from Sarah Johnson", amount: 45, time: "4 hours ago" },
    { type: "bonus", description: "Fast Start Bonus earned", amount: 150, time: "1 day ago" },
    { type: "rank", description: "Team member promoted to Consultant", amount: 0, time: "2 days ago" },
    { type: "commission", description: "Unilevel commission - Level 3", amount: 28, time: "3 days ago" },
  ]

  const copyMLMLink = () => {
    const mlmLink = `https://creditrepair.com/join/${user.mlmCode}`
    navigator.clipboard.writeText(mlmLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getRankColor = (rankId: string) => {
    const rank = mlmRanks.find((r) => r.id === rankId)
    return rank?.color || "#94A3B8"
  }

  const getRankIcon = (rankId: string) => {
    const rank = mlmRanks.find((r) => r.id === rankId)
    switch (rank?.icon) {
      case "crown":
        return Crown
      case "star":
        return Star
      case "diamond":
        return Award
      case "users":
        return Users
      case "briefcase":
        return Target
      default:
        return Users
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "referral":
        return Users
      case "commission":
        return DollarSign
      case "bonus":
        return Gift
      case "rank":
        return Award
      default:
        return TrendingUp
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Earnings</p>
                <p className="text-2xl font-bold text-green-600">${user.currentMonthEarnings.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">+18.2% vs last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Volume</p>
                <p className="text-2xl font-bold text-blue-600">${user.teamVolume.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-blue-600">+12.5% vs last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Downlines</p>
                <p className="text-2xl font-bold text-purple-600">{user.activeDownlines}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 text-xs text-purple-600">{user.totalDownlines} total</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Rank</p>
                <div className="flex items-center space-x-2">
                  <Badge style={{ backgroundColor: currentRank.color }} className="text-white">
                    {currentRank.name}
                  </Badge>
                </div>
              </div>
              {(() => {
                const Icon = getRankIcon(currentRank.id)
                return <Icon className="h-8 w-8" style={{ color: currentRank.color }} />
              })()}
            </div>
            <div className="mt-2 text-xs text-gray-600">Level {currentRank.level}</div>
          </CardContent>
        </Card>
      </div>

      {/* Rank Progress */}
      {nextRank && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Rank Advancement Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Next Rank: {nextRank.name}</h4>
                  <p className="text-sm text-gray-600">Unlock higher commissions and exclusive benefits</p>
                </div>
                <Badge style={{ backgroundColor: nextRank.color }} className="text-white">
                  Level {nextRank.level}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Personal Volume</span>
                    <span>
                      ${user.personalVolume.toLocaleString()} / ${nextRank.requirements.personalVolume.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={(user.personalVolume / nextRank.requirements.personalVolume) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Team Volume</span>
                    <span>
                      ${user.teamVolume.toLocaleString()} / ${nextRank.requirements.teamVolume.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(user.teamVolume / nextRank.requirements.teamVolume) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Downlines</span>
                    <span>
                      {user.activeDownlines} / {nextRank.requirements.activeDownlines}
                    </span>
                  </div>
                  <Progress
                    value={(user.activeDownlines / nextRank.requirements.activeDownlines) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Qualified Legs</span>
                    <span>
                      {user.qualifiedLegs} / {nextRank.requirements.qualifiedLegs}
                    </span>
                  </div>
                  <Progress value={(user.qualifiedLegs / nextRank.requirements.qualifiedLegs) * 100} className="h-2" />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Next Rank Benefits:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  {nextRank.benefits.map((benefit, index) => (
                    <li key={index}>
                      • {benefit.description}: {benefit.value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="genealogy">Genealogy</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Earnings Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="direct" stroke="#3B82F6" strokeWidth={2} name="Direct" />
                    <Line type="monotone" dataKey="team" stroke="#10B981" strokeWidth={2} name="Team" />
                    <Line type="monotone" dataKey="bonuses" stroke="#F59E0B" strokeWidth={2} name="Bonuses" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Income Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Income Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incomeBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} (${value}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-gray-600">{activity.time}</p>
                        </div>
                      </div>
                      {activity.amount > 0 && (
                        <Badge className="bg-green-100 text-green-800">+${activity.amount}</Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Income Streams */}
          <Card>
            <CardHeader>
              <CardTitle>7 Income Streams Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {incomeStreams.map((stream, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{stream.name}</h5>
                      <Badge variant="outline">{stream.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{stream.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">{stream.potential}</span>
                      <Zap className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Team Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Team Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="active" fill="#10B981" name="Active" />
                    <Bar dataKey="total" fill="#3B82F6" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Team Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Team Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{user.totalDownlines}</p>
                    <p className="text-sm text-gray-600">Total Team Members</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{user.activeDownlines}</p>
                    <p className="text-sm text-gray-600">Active This Month</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{user.qualifiedLegs}</p>
                    <p className="text-sm text-gray-600">Qualified Legs</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.round((user.activeDownlines / user.totalDownlines) * 100)}%
                    </p>
                    <p className="text-sm text-gray-600">Activity Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Team Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{performer.name}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{performer.rank}</Badge>
                          <span className="text-sm text-gray-600">${performer.volume.toLocaleString()} volume</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">${performer.earnings.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">This month</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-3xl font-bold text-green-600">${user.lifetimeEarnings.toLocaleString()}</p>
                <p className="text-gray-600">Lifetime Earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className="text-3xl font-bold text-blue-600">${user.currentMonthEarnings.toLocaleString()}</p>
                <p className="text-gray-600">This Month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <p className="text-3xl font-bold text-purple-600">
                  ${Math.round(user.lifetimeEarnings / 12).toLocaleString()}
                </p>
                <p className="text-gray-600">Monthly Average</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Earnings Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Earnings Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-medium">Commission Sources</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Direct Referrals (40%)</span>
                        <span className="font-medium">${(user.currentMonthEarnings * 0.4).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Team Commissions (30%)</span>
                        <span className="font-medium">${(user.currentMonthEarnings * 0.3).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Matching Bonuses (15%)</span>
                        <span className="font-medium">${(user.currentMonthEarnings * 0.15).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Leadership Bonuses (10%)</span>
                        <span className="font-medium">${(user.currentMonthEarnings * 0.1).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Other Bonuses (5%)</span>
                        <span className="font-medium">${(user.currentMonthEarnings * 0.05).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium">Payout Schedule</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 border rounded">
                        <span>Next Payout Date:</span>
                        <span className="font-medium">January 31st</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>Pending Amount:</span>
                        <span className="font-medium text-green-600">
                          ${user.currentMonthEarnings.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>Payment Method:</span>
                        <span className="font-medium">Direct Deposit</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>Tax Documents:</span>
                        <Button variant="outline" size="sm">
                          Download 1099
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="genealogy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Genealogy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Interactive Genealogy Tree</h3>
                <p className="text-gray-600 mb-4">
                  View your complete organization structure with detailed member information
                </p>
                <Button>Launch Genealogy Viewer</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          {/* MLM Link Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                MLM Recruitment Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your MLM Recruitment Link</label>
                <div className="flex space-x-2">
                  <input
                    value={`https://creditrepair.com/join/${user.mlmCode}`}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
                  />
                  <Button onClick={copyMLMLink} variant="outline">
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Marketing Materials
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Share2 className="h-4 w-4 mr-2" />
                  Social Media Kit
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Target className="h-4 w-4 mr-2" />
                  Lead Capture Pages
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Invite Team Member
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Gift className="h-6 w-6 mb-2" />
                  Send Incentive
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Calendar className="h-6 w-6 mb-2" />
                  Schedule Training
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Download className="h-6 w-6 mb-2" />
                  Export Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>MLM Training Center</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Comprehensive Training Program</h3>
                <p className="text-gray-600 mb-4">Access our complete MLM training curriculum designed for success</p>
                <Button>Access Training Portal</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
