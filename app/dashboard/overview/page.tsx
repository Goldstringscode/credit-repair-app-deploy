"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Target,
  CheckCircle,
  FileText,
  BarChart3,
  ArrowRight,
  Star,
  Award,
  Zap,
  Shield,
  Mail,
  Phone,
  CreditCard,
  Activity,
} from "lucide-react"
import Link from "next/link"

export default function DashboardOverviewPage() {
  const [timeRange, setTimeRange] = useState("30d")

  const creditScoreData = {
    current: 742,
    previous: 695,
    change: 47,
    trend: "up",
    goal: 750,
    goalProgress: 88,
  }

  const keyMetrics = [
    {
      title: "Credit Score",
      value: creditScoreData.current,
      change: `+${creditScoreData.change}`,
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Active Disputes",
      value: 7,
      change: "+2",
      trend: "up",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Items Removed",
      value: 23,
      change: "+5",
      trend: "up",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Success Rate",
      value: "87%",
      change: "+12%",
      trend: "up",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: "score_increase",
      title: "Credit Score Increased",
      description: "Your Experian score increased by 12 points to 742",
      time: "2 hours ago",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: 2,
      type: "dispute_response",
      title: "Dispute Response Received",
      description: "Capital One responded to your late payment dispute",
      time: "5 hours ago",
      icon: Mail,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: 3,
      type: "letter_sent",
      title: "Certified Mail Delivered",
      description: "Your dispute letter to TransUnion was delivered",
      time: "1 day ago",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: 4,
      type: "negative_item",
      title: "Negative Item Removed",
      description: "Late payment removed from Equifax report",
      time: "2 days ago",
      icon: Award,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: 5,
      type: "course_completed",
      title: "Course Completed",
      description: "Finished 'Advanced Dispute Strategies' course",
      time: "3 days ago",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ]

  const upcomingTasks = [
    {
      id: 1,
      title: "Follow up on Experian dispute",
      description: "30-day response period ends tomorrow",
      dueDate: "Tomorrow",
      priority: "high",
      type: "dispute",
    },
    {
      id: 2,
      title: "Send goodwill letter to Chase",
      description: "Request removal of late payment",
      dueDate: "This week",
      priority: "medium",
      type: "letter",
    },
    {
      id: 3,
      title: "Review credit report updates",
      description: "Check for new changes across all bureaus",
      dueDate: "Next week",
      priority: "low",
      type: "review",
    },
    {
      id: 4,
      title: "Complete credit building course",
      description: "Finish remaining 3 lessons",
      dueDate: "Next week",
      priority: "medium",
      type: "education",
    },
  ]

  const creditGoals = [
    {
      title: "Reach 750 Credit Score",
      current: 742,
      target: 750,
      progress: 88,
      deadline: "June 2024",
      status: "on_track",
    },
    {
      title: "Remove All Collections",
      current: 2,
      target: 0,
      progress: 75,
      deadline: "May 2024",
      status: "on_track",
    },
    {
      title: "Reduce Credit Utilization",
      current: 28,
      target: 10,
      progress: 45,
      deadline: "April 2024",
      status: "behind",
    },
  ]

  const quickActions = [
    {
      title: "Generate Dispute Letter",
      description: "Create AI-powered dispute letters",
      icon: FileText,
      href: "/dashboard/letters/generate",
      color: "bg-blue-500",
    },
    {
      title: "Send Certified Mail",
      description: "Send disputes via certified mail",
      icon: Mail,
      href: "/dashboard/letters/certified-mail",
      color: "bg-green-500",
    },
    {
      title: "View Credit Reports",
      description: "Check your latest credit reports",
      icon: CreditCard,
      href: "/dashboard/reports",
      color: "bg-purple-500",
    },
    {
      title: "Training Center",
      description: "Learn credit repair strategies",
      icon: Star,
      href: "/dashboard/training",
      color: "bg-orange-500",
    },
    {
      title: "Analytics Dashboard",
      description: "Track your progress and trends",
      icon: BarChart3,
      href: "/dashboard/analytics",
      color: "bg-indigo-500",
    },
    {
      title: "Credit Monitoring",
      description: "24/7 credit monitoring alerts",
      icon: Shield,
      href: "/dashboard/monitoring",
      color: "bg-red-500",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_track":
        return "text-green-600"
      case "behind":
        return "text-red-600"
      case "ahead":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600 mt-1">Your complete credit repair command center</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800 px-3 py-1">Professional Plan</Badge>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Zap className="h-4 w-4 mr-2" />
                Quick Action
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className={`h-4 w-4 ${metric.color} mr-1`} />
                        <span className={`text-sm ${metric.color}`}>{metric.change} this month</span>
                      </div>
                    </div>
                    <div className={`${metric.bgColor} rounded-full p-3`}>
                      <Icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Credit Score Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Credit Score Progress</span>
                  <Link href="/dashboard/analytics">
                    <Button variant="ghost" size="sm">
                      View Details <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-green-600 mb-2">{creditScoreData.current}</div>
                    <div className="flex items-center justify-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-lg text-green-600">+{creditScoreData.change} points this quarter</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress to Goal (750)</span>
                      <span className="text-sm text-gray-600">{creditScoreData.goalProgress}%</span>
                    </div>
                    <Progress value={creditScoreData.goalProgress} className="h-3" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Current: {creditScoreData.current}</span>
                      <span>Goal: {creditScoreData.goal}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">🎯 You're Almost There!</h4>
                    <p className="text-sm text-blue-700">
                      Just 8 more points to reach your goal of 750. Focus on reducing credit utilization and removing
                      remaining negative items.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <Link key={index} href={action.href}>
                        <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer group">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div
                              className={`${action.color} rounded-lg p-3 group-hover:scale-110 transition-transform`}
                            >
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 text-sm">{action.title}</h3>
                              <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Goals Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Credit Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {creditGoals.map((goal, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-sm text-gray-600">Target: {goal.deadline}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getStatusColor(goal.status)}`}>
                            {goal.progress}% Complete
                          </div>
                          <div className="text-xs text-gray-500">
                            {goal.current} / {goal.target}
                          </div>
                        </div>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Activity
                  <Link href="/dashboard/notifications">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity) => {
                    const Icon = activity.icon
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`rounded-full p-2 ${activity.bgColor}`}>
                          <Icon className={`h-4 w-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <Badge className={getPriorityColor(task.priority)} variant="outline">
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{task.dueDate}</span>
                        <Button size="sm" variant="outline" className="text-xs h-6 bg-transparent">
                          Complete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>This Month's Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Letters Generated</span>
                    <span className="font-bold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Disputes Filed</span>
                    <span className="font-bold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Items Removed</span>
                    <span className="font-bold text-green-600">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-bold text-blue-600">87%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="font-bold text-green-600">Excellent</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support & Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Support & Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/training">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Star className="h-4 w-4 mr-2" />
                    Training Center
                  </Button>
                </Link>
                <Link href="/support/ai-chat">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Activity className="h-4 w-4 mr-2" />
                    AI Chat Support
                  </Button>
                </Link>
                <Link href="/support">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
