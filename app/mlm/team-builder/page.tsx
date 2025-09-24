"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  UserPlus,
  Users,
  MessageSquare,
  Target,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  Share2,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Award,
  BookOpen,
  BarChart3,
  Search,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"

interface Prospect {
  id: string
  name: string
  email: string
  phone: string
  status: "new" | "contacted" | "interested" | "meeting" | "closed" | "lost"
  source: string
  addedDate: string
  lastContact: string
  notes: string
  score: number
  avatar: string
}

interface Template {
  id: string
  name: string
  subject: string
  content: string
  type: "email" | "sms" | "social"
  successRate: number
  category: "introduction" | "follow-up" | "invitation" | "training"
}

interface Goal {
  id: string
  title: string
  target: number
  current: number
  deadline: string
  type: "prospects" | "meetings" | "recruits"
}

export default function TeamBuilderPage() {
  const [selectedTab, setSelectedTab] = useState("prospects")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const prospects: Prospect[] = [
    {
      id: "1",
      name: "Emily Rodriguez",
      email: "emily.r@email.com",
      phone: "+1 (555) 123-4567",
      status: "interested",
      source: "Facebook",
      addedDate: "2024-01-15",
      lastContact: "2024-01-20",
      notes: "Interested in part-time opportunity. Has sales background.",
      score: 85,
      avatar: "/placeholder.svg?height=40&width=40&text=ER",
    },
    {
      id: "2",
      name: "Marcus Johnson",
      email: "marcus.j@email.com",
      phone: "+1 (555) 234-5678",
      status: "meeting",
      source: "LinkedIn",
      addedDate: "2024-01-18",
      lastContact: "2024-01-22",
      notes: "Scheduled for coffee meeting Thursday 2pm. Very motivated.",
      score: 92,
      avatar: "/placeholder.svg?height=40&width=40&text=MJ",
    },
    {
      id: "3",
      name: "Sarah Chen",
      email: "sarah.c@email.com",
      phone: "+1 (555) 345-6789",
      status: "contacted",
      source: "Referral",
      addedDate: "2024-01-20",
      lastContact: "2024-01-21",
      notes: "Referred by Lisa. Looking for additional income stream.",
      score: 78,
      avatar: "/placeholder.svg?height=40&width=40&text=SC",
    },
    {
      id: "4",
      name: "David Kim",
      email: "david.k@email.com",
      phone: "+1 (555) 456-7890",
      status: "new",
      source: "Instagram",
      addedDate: "2024-01-23",
      lastContact: "Never",
      notes: "Showed interest in business opportunity post.",
      score: 65,
      avatar: "/placeholder.svg?height=40&width=40&text=DK",
    },
    {
      id: "5",
      name: "Jennifer Adams",
      email: "jen.a@email.com",
      phone: "+1 (555) 567-8901",
      status: "closed",
      source: "Event",
      addedDate: "2024-01-10",
      lastContact: "2024-01-25",
      notes: "Successfully recruited! Started training program.",
      score: 95,
      avatar: "/placeholder.svg?height=40&width=40&text=JA",
    },
  ]

  const templates: Template[] = [
    {
      id: "1",
      name: "Initial Introduction",
      subject: "Exciting Business Opportunity",
      content:
        "Hi {name}, I hope this message finds you well! I came across your profile and was impressed by your background. I'd love to share an exciting business opportunity that might interest you. Would you be open to a brief conversation this week?",
      type: "email",
      successRate: 23,
      category: "introduction",
    },
    {
      id: "2",
      name: "Follow-up Message",
      subject: "Following up on our conversation",
      content:
        "Hi {name}, Thanks for taking the time to chat yesterday! As promised, I'm sending you more information about the opportunity we discussed. I think this could be a perfect fit for your goals. Let me know if you have any questions!",
      type: "email",
      successRate: 45,
      category: "follow-up",
    },
    {
      id: "3",
      name: "Meeting Invitation",
      subject: "Coffee meeting invitation",
      content:
        "Hi {name}, I'd love to meet in person to discuss this opportunity further. Are you available for coffee this week? I can work around your schedule. Looking forward to hearing from you!",
      type: "email",
      successRate: 67,
      category: "invitation",
    },
    {
      id: "4",
      name: "Social Media Outreach",
      subject: "",
      content:
        "Hey {name}! Loved your recent post about {topic}. I'm working with a company that aligns perfectly with your interests. Would you be open to learning more? 🚀",
      type: "social",
      successRate: 31,
      category: "introduction",
    },
  ]

  const goals: Goal[] = [
    {
      id: "1",
      title: "Weekly Prospects",
      target: 10,
      current: 7,
      deadline: "End of Week",
      type: "prospects",
    },
    {
      id: "2",
      title: "Monthly Meetings",
      target: 15,
      current: 8,
      deadline: "End of Month",
      type: "meetings",
    },
    {
      id: "3",
      title: "Quarterly Recruits",
      target: 5,
      current: 2,
      deadline: "End of Quarter",
      type: "recruits",
    },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-yellow-100 text-yellow-800",
      interested: "bg-green-100 text-green-800",
      meeting: "bg-purple-100 text-purple-800",
      closed: "bg-emerald-100 text-emerald-800",
      lost: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <UserPlus className="h-3 w-3" />
      case "contacted":
        return <MessageSquare className="h-3 w-3" />
      case "interested":
        return <Star className="h-3 w-3" />
      case "meeting":
        return <Calendar className="h-3 w-3" />
      case "closed":
        return <CheckCircle className="h-3 w-3" />
      case "lost":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredProspects = prospects.filter((prospect) => {
    const matchesSearch =
      prospect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || prospect.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Builder</h1>
          <p className="text-lg text-gray-600">Manage prospects, track goals, and grow your team</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Prospects</p>
                  <p className="text-2xl font-bold">{prospects.length}</p>
                </div>
                <Users className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Active Prospects</p>
                  <p className="text-2xl font-bold">
                    {prospects.filter((p) => ["interested", "meeting"].includes(p.status)).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Conversion Rate</p>
                  <p className="text-2xl font-bold">
                    {Math.round((prospects.filter((p) => p.status === "closed").length / prospects.length) * 100)}%
                  </p>
                </div>
                <Target className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">This Month</p>
                  <p className="text-2xl font-bold">
                    {
                      prospects.filter(
                        (p) =>
                          p.status === "closed" &&
                          new Date(p.addedDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      ).length
                    }
                  </p>
                </div>
                <Award className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="prospects">
              <Users className="h-4 w-4 mr-1" />
              Prospects
            </TabsTrigger>
            <TabsTrigger value="templates">
              <MessageSquare className="h-4 w-4 mr-1" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="h-4 w-4 mr-1" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="training">
              <BookOpen className="h-4 w-4 mr-1" />
              Training
            </TabsTrigger>
          </TabsList>

          {/* Prospects Tab */}
          <TabsContent value="prospects" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-1 gap-4 items-center">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search prospects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="interested">Interested</option>
                      <option value="meeting">Meeting</option>
                      <option value="closed">Closed</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Prospect
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Prospects List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredProspects.map((prospect) => (
                <Card key={prospect.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <img src={prospect.avatar || "/placeholder.svg"} alt={prospect.name} />
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{prospect.name}</h3>
                            <Badge className={getStatusColor(prospect.status)}>
                              {getStatusIcon(prospect.status)}
                              <span className="ml-1 capitalize">{prospect.status}</span>
                            </Badge>
                            <div className={`text-sm font-medium ${getScoreColor(prospect.score)}`}>
                              Score: {prospect.score}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {prospect.email}
                              </span>
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {prospect.phone}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span>Source: {prospect.source}</span>
                              <span>Added: {prospect.addedDate}</span>
                              <span>Last Contact: {prospect.lastContact}</span>
                            </div>
                          </div>
                          {prospect.notes && (
                            <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">{prospect.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Message Templates</h2>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.subject}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={`${
                            template.successRate >= 50
                              ? "bg-green-100 text-green-800"
                              : template.successRate >= 30
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {template.successRate}% success
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {template.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">{template.content}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">
                        {template.category}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm">
                          <Share2 className="h-3 w-3 mr-1" />
                          Use
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recruitment Goals</h2>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Set New Goal
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{goal.title}</span>
                      <Target className="h-5 w-5 text-blue-500" />
                    </CardTitle>
                    <CardDescription>{goal.deadline}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">
                          {goal.current}/{goal.target}
                        </span>
                      </div>
                      <Progress value={(goal.current / goal.target) * 100} className="h-3" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.round((goal.current / goal.target) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Complete</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Goal Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-gray-600">Goal Completion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">Average Days to Close</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">3.2</div>
                    <div className="text-sm text-gray-600">Contacts per Conversion</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Recruitment Training
                  </CardTitle>
                  <CardDescription>Master the art of team building</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Prospecting Fundamentals</h4>
                        <p className="text-sm text-gray-600">Learn to identify quality prospects</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Effective Communication</h4>
                        <p className="text-sm text-gray-600">Master your messaging and follow-up</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" />
                        In Progress
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Closing Techniques</h4>
                        <p className="text-sm text-gray-600">Turn prospects into team members</p>
                      </div>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Not Started
                      </Badge>
                    </div>
                  </div>
                  <Button className="w-full">Continue Training</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Resources & Tools
                  </CardTitle>
                  <CardDescription>Everything you need to succeed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Share2 className="h-4 w-4 mr-2" />
                      Social Media Templates
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Email Scripts Library
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Calendar className="h-4 w-4 mr-2" />
                      Meeting Scheduler
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Performance Tracker
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
