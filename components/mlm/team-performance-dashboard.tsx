"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TreeMap,
} from "recharts"
import {
  Users,
  TrendingUp,
  DollarSign,
  Award,
  Target,
  Star,
  Search,
  Filter,
  Download,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Zap,
  Trophy,
  Gift,
  AlertCircle,
} from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  rank: string
  level: number
  status: "active" | "inactive" | "new"
  joinDate: string
  lastActivity: string
  personalVolume: number
  teamVolume: number
  monthlyEarnings: number
  totalEarnings: number
  directReferrals: number
  teamSize: number
  commissionsPaid: number
  performanceScore: number
  achievements: string[]
  uplineId?: string
  children: TeamMember[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

const mockTeamData: TeamMember[] = [
  {
    id: "tm_001",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    avatar: "/placeholder.svg?height=40&width=40&text=SJ",
    rank: "Director",
    level: 1,
    status: "active",
    joinDate: "2024-01-15",
    lastActivity: "2024-12-20",
    personalVolume: 3200,
    teamVolume: 18500,
    monthlyEarnings: 4250,
    totalEarnings: 51000,
    directReferrals: 8,
    teamSize: 23,
    commissionsPaid: 12750,
    performanceScore: 95,
    achievements: ["Top Recruiter Q3", "Leadership Excellence", "Diamond Achievement"],
    children: [
      {
        id: "tm_002",
        name: "Mike Rodriguez",
        email: "mike.rodriguez@email.com",
        phone: "(555) 234-5678",
        rank: "Manager",
        level: 2,
        status: "active",
        joinDate: "2024-02-20",
        lastActivity: "2024-12-19",
        personalVolume: 1800,
        teamVolume: 8900,
        monthlyEarnings: 2100,
        totalEarnings: 25200,
        directReferrals: 5,
        teamSize: 12,
        commissionsPaid: 6300,
        performanceScore: 88,
        achievements: ["Consistent Performer", "Team Builder"],
        uplineId: "tm_001",
        children: [
          {
            id: "tm_003",
            name: "Emily Chen",
            email: "emily.chen@email.com",
            phone: "(555) 345-6789",
            rank: "Consultant",
            level: 3,
            status: "active",
            joinDate: "2024-04-10",
            lastActivity: "2024-12-18",
            personalVolume: 1200,
            teamVolume: 3600,
            monthlyEarnings: 950,
            totalEarnings: 7600,
            directReferrals: 3,
            teamSize: 6,
            commissionsPaid: 2850,
            performanceScore: 82,
            achievements: ["Fast Starter", "Rising Star"],
            uplineId: "tm_002",
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: "tm_004",
    name: "David Wilson",
    email: "david.wilson@email.com",
    phone: "(555) 456-7890",
    rank: "Manager",
    level: 1,
    status: "active",
    joinDate: "2024-01-28",
    lastActivity: "2024-12-21",
    personalVolume: 2100,
    teamVolume: 12400,
    monthlyEarnings: 2850,
    totalEarnings: 34200,
    directReferrals: 6,
    teamSize: 18,
    commissionsPaid: 8550,
    performanceScore: 91,
    achievements: ["Steady Growth", "Mentor Award"],
    children: [
      {
        id: "tm_005",
        name: "Lisa Anderson",
        email: "lisa.anderson@email.com",
        phone: "(555) 567-8901",
        rank: "Consultant",
        level: 2,
        status: "active",
        joinDate: "2024-03-15",
        lastActivity: "2024-12-17",
        personalVolume: 1500,
        teamVolume: 4200,
        monthlyEarnings: 1200,
        totalEarnings: 10800,
        directReferrals: 4,
        teamSize: 8,
        commissionsPaid: 3600,
        performanceScore: 85,
        achievements: ["Team Player", "Consistent Sales"],
        uplineId: "tm_004",
        children: [],
      },
    ],
  },
  {
    id: "tm_006",
    name: "James Thompson",
    email: "james.thompson@email.com",
    phone: "(555) 678-9012",
    rank: "Associate",
    level: 1,
    status: "new",
    joinDate: "2024-11-01",
    lastActivity: "2024-12-20",
    personalVolume: 450,
    teamVolume: 450,
    monthlyEarnings: 135,
    totalEarnings: 270,
    directReferrals: 0,
    teamSize: 1,
    commissionsPaid: 0,
    performanceScore: 65,
    achievements: ["New Member"],
    children: [],
  },
  {
    id: "tm_007",
    name: "Maria Garcia",
    email: "maria.garcia@email.com",
    phone: "(555) 789-0123",
    rank: "Consultant",
    level: 1,
    status: "inactive",
    joinDate: "2024-05-20",
    lastActivity: "2024-11-15",
    personalVolume: 800,
    teamVolume: 2100,
    monthlyEarnings: 0,
    totalEarnings: 4200,
    directReferrals: 2,
    teamSize: 4,
    commissionsPaid: 1260,
    performanceScore: 45,
    achievements: ["Early Achiever"],
    children: [],
  },
]

export function TeamPerformanceDashboard() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRank, setFilterRank] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "tree" | "grid">("list")

  // Calculate team statistics
  const totalTeamSize = mockTeamData.reduce((sum, member) => sum + member.teamSize, 0)
  const totalMonthlyEarnings = mockTeamData.reduce((sum, member) => sum + member.monthlyEarnings, 0)
  const totalCommissionsPaid = mockTeamData.reduce((sum, member) => sum + member.commissionsPaid, 0)
  const activeMembers = mockTeamData.filter((member) => member.status === "active").length
  const averagePerformanceScore =
    mockTeamData.reduce((sum, member) => sum + member.performanceScore, 0) / mockTeamData.length

  // Filter team members
  const filteredMembers = mockTeamData.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRank = filterRank === "all" || member.rank.toLowerCase() === filterRank.toLowerCase()
    const matchesStatus = filterStatus === "all" || member.status === filterStatus

    return matchesSearch && matchesRank && matchesStatus
  })

  // Prepare chart data
  const rankDistribution = mockTeamData.reduce(
    (acc, member) => {
      acc[member.rank] = (acc[member.rank] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const rankChartData = Object.entries(rankDistribution).map(([rank, count]) => ({
    rank,
    count,
    percentage: ((count / mockTeamData.length) * 100).toFixed(1),
  }))

  const performanceData = mockTeamData.map((member) => ({
    name: member.name.split(" ")[0],
    earnings: member.monthlyEarnings,
    volume: member.personalVolume,
    score: member.performanceScore,
    teamSize: member.teamSize,
  }))

  const monthlyTrends = [
    { month: "Jul", earnings: 8500, volume: 42000, members: 35 },
    { month: "Aug", earnings: 9200, volume: 46000, members: 38 },
    { month: "Sep", earnings: 8800, volume: 44000, members: 41 },
    { month: "Oct", earnings: 10100, volume: 50500, members: 43 },
    { month: "Nov", earnings: 9600, volume: 48000, members: 45 },
    { month: "Dec", earnings: 10800, volume: 54000, members: 47 },
  ]

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`

  const getRankColor = (rank: string) => {
    const colors: Record<string, string> = {
      Associate: "#94A3B8",
      Consultant: "#10B981",
      Manager: "#3B82F6",
      Director: "#8B5CF6",
      "Executive Director": "#F59E0B",
      "Diamond Executive": "#EF4444",
    }
    return colors[rank] || "#94A3B8"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "new":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "text-green-600" }
    if (score >= 80) return { label: "Good", color: "text-blue-600" }
    if (score >= 70) return { label: "Average", color: "text-yellow-600" }
    return { label: "Needs Improvement", color: "text-red-600" }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Team Performance Dashboard</h2>
          <p className="text-gray-600">Monitor and manage your MLM team's success</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">List View</SelectItem>
              <SelectItem value="grid">Grid View</SelectItem>
              <SelectItem value="tree">Tree View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Team Size</p>
                <p className="text-2xl font-bold text-blue-600">{totalTeamSize}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-blue-600">{activeMembers} active members</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalMonthlyEarnings)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">+12.5% vs last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commissions Paid</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalCommissionsPaid)}</p>
              </div>
              <Gift className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 text-xs text-purple-600">Total distributed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-orange-600">{averagePerformanceScore.toFixed(0)}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 text-xs text-orange-600">Team average score</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Performer</p>
                <p className="text-lg font-bold text-yellow-600">Sarah J.</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2 text-xs text-yellow-600">95% performance score</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Growth Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Team Growth Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="earnings" stroke="#10B981" name="Earnings ($)" />
                    <Line yAxisId="right" type="monotone" dataKey="members" stroke="#3B82F6" name="Members" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Rank Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Team Rank Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={rankChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ rank, percentage }) => `${rank} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {rankChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTeamData
                  .sort((a, b) => b.performanceScore - a.performanceScore)
                  .slice(0, 5)
                  .map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-yellow-600">#{index + 1}</span>
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge
                              style={{ backgroundColor: getRankColor(member.rank) }}
                              className="text-white text-xs"
                            >
                              {member.rank}
                            </Badge>
                            <span className="text-sm text-gray-600">{member.teamSize} team members</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(member.monthlyEarnings)}</p>
                        <p className="text-sm text-gray-600">{member.performanceScore}% score</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>

                <Select value={filterRank} onValueChange={setFilterRank}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranks</SelectItem>
                    <SelectItem value="associate">Associate</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMembers.map((member) => {
                  const performance = getPerformanceLevel(member.performanceScore)

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{member.name}</h4>
                            <Badge
                              style={{ backgroundColor: getRankColor(member.rank) }}
                              className="text-white text-xs"
                            >
                              {member.rank}
                            </Badge>
                            <Badge className={getStatusColor(member.status)}>{member.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
                            <span>Team: {member.teamSize} members</span>
                            <span className={performance.color}>Performance: {performance.label}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(member.monthlyEarnings)}</p>
                        <p className="text-sm text-gray-600">Monthly earnings</p>
                        <div className="flex items-center space-x-1 mt-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedMember(member)}>
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance vs Earnings */}
            <Card>
              <CardHeader>
                <CardTitle>Performance vs Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="earnings" fill="#10B981" name="Earnings ($)" />
                    <Bar yAxisId="right" dataKey="score" fill="#3B82F6" name="Performance Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Team Size Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Team Size Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <TreeMap data={performanceData} dataKey="teamSize" aspectRatio={4 / 3} stroke="#fff" fill="#8884d8" />
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                Performance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTeamData
                  .filter((member) => member.performanceScore < 70 || member.status === "inactive")
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-gray-600">
                            {member.status === "inactive"
                              ? `Inactive since ${new Date(member.lastActivity).toLocaleDateString()}`
                              : `Low performance score: ${member.performanceScore}%`}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Volume Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Volume Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="volume" stroke="#8B5CF6" name="Team Volume ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Achievement Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Team Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTeamData
                    .filter((member) => member.achievements.length > 0)
                    .map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h5 className="font-medium">{member.name}</h5>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.achievements.map((achievement, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  <Award className="h-3 w-3 mr-1" />
                                  {achievement}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Badge style={{ backgroundColor: getRankColor(member.rank) }} className="text-white">
                          {member.rank}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Team Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Recruitment Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Referrals:</span>
                      <span className="font-medium">{mockTeamData.reduce((sum, m) => sum + m.directReferrals, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg per Member:</span>
                      <span className="font-medium">
                        {(mockTeamData.reduce((sum, m) => sum + m.directReferrals, 0) / mockTeamData.length).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Top Recruiter:</span>
                      <span className="font-medium">Sarah J. (8)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Volume Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Personal Volume:</span>
                      <span className="font-medium">
                        {formatCurrency(mockTeamData.reduce((sum, m) => sum + m.personalVolume, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Team Volume:</span>
                      <span className="font-medium">
                        {formatCurrency(mockTeamData.reduce((sum, m) => sum + m.teamVolume, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Personal Volume:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          mockTeamData.reduce((sum, m) => sum + m.personalVolume, 0) / mockTeamData.length,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Earnings Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Monthly Earnings:</span>
                      <span className="font-medium">{formatCurrency(totalMonthlyEarnings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Monthly Earnings:</span>
                      <span className="font-medium">{formatCurrency(totalMonthlyEarnings / mockTeamData.length)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Top Earner:</span>
                      <span className="font-medium">Sarah J. ({formatCurrency(4250)})</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Team Message
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Team Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Gift className="h-4 w-4 mr-2" />
                  Send Recognition
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Target className="h-4 w-4 mr-2" />
                  Set Team Goals
                </Button>
              </CardContent>
            </Card>

            {/* Training & Development */}
            <Card>
              <CardHeader>
                <CardTitle>Training & Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Launch Training Session
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Star className="h-4 w-4 mr-2" />
                  Create Mentorship Program
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Trophy className="h-4 w-4 mr-2" />
                  Setup Performance Contest
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Award className="h-4 w-4 mr-2" />
                  Assign Achievements
                </Button>
              </CardContent>
            </Card>

            {/* Reports & Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Team Report
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance Analysis
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Commission Report
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="h-4 w-4 mr-2" />
                  Team Structure Map
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Bulk Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk Team Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Communication</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email to All Active Members
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Broadcast Team Announcement
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Phone className="h-4 w-4 mr-2" />
                      Schedule Group Call
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Management</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Target className="h-4 w-4 mr-2" />
                      Update Team Goals
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Award className="h-4 w-4 mr-2" />
                      Bulk Rank Updates
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Gift className="h-4 w-4 mr-2" />
                      Distribute Bonuses
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Member Details Modal */}
      {selectedMember && (
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedMember.avatar || "/placeholder.svg"} alt={selectedMember.name} />
                  <AvatarFallback>
                    {selectedMember.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span>{selectedMember.name}</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge style={{ backgroundColor: getRankColor(selectedMember.rank) }} className="text-white">
                      {selectedMember.rank}
                    </Badge>
                    <Badge className={getStatusColor(selectedMember.status)}>{selectedMember.status}</Badge>
                  </div>
                </div>
              </DialogTitle>
              <DialogDescription>Detailed performance overview and team member information</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedMember.monthlyEarnings)}</p>
                  <p className="text-sm text-green-700">Monthly Earnings</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedMember.teamSize}</p>
                  <p className="text-sm text-blue-700">Team Size</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{selectedMember.performanceScore}%</p>
                  <p className="text-sm text-purple-700">Performance Score</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{selectedMember.directReferrals}</p>
                  <p className="text-sm text-orange-700">Direct Referrals</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedMember.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedMember.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Joined: {new Date(selectedMember.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-gray-400" />
                      <span>Last Active: {new Date(selectedMember.lastActivity).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Personal Volume:</span>
                      <span className="font-medium">{formatCurrency(selectedMember.personalVolume)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Team Volume:</span>
                      <span className="font-medium">{formatCurrency(selectedMember.teamVolume)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Earnings:</span>
                      <span className="font-medium">{formatCurrency(selectedMember.totalEarnings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commissions Paid:</span>
                      <span className="font-medium">{formatCurrency(selectedMember.commissionsPaid)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h4 className="font-semibold mb-3">Achievements & Recognition</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.achievements.map((achievement, index) => (
                    <Badge key={index} variant="outline" className="flex items-center space-x-1">
                      <Award className="h-3 w-3" />
                      <span>{achievement}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Schedule Call
                </Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline">
                  <Gift className="h-4 w-4 mr-2" />
                  Send Recognition
                </Button>
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Set Goals
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
