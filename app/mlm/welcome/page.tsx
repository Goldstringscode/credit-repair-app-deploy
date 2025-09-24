"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  Users,
  DollarSign,
  TrendingUp,
  Gift,
  BookOpen,
  Target,
  Phone,
  MessageCircle,
  Calendar,
  Award,
  Zap,
  ArrowRight,
} from "lucide-react"

interface WelcomeData {
  user: {
    firstName: string
    lastName: string
    joinDate: string
    welcomeBonus: number
    currentRank: string
    nextRank: string
  }
  progress: {
    completionPercentage: number
    tasksCompleted: number
    totalTasks: number
    pointsEarned: number
    totalPoints: number
  }
  sponsor: {
    name: string
    rank: string
    avatar: string
    nextCallScheduled: boolean
  }
  quickActions: Array<{
    id: string
    title: string
    description: string
    icon: React.ReactNode
    url: string
    priority: "high" | "medium" | "low"
    estimatedTime: string
  }>
}

export default function MLMWelcomePage() {
  const [welcomeData, setWelcomeData] = useState<WelcomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Track page view
    trackPageView("mlm_welcome")

    // Load welcome data
    loadWelcomeData()
  }, [])

  const loadWelcomeData = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockData: WelcomeData = {
        user: {
          firstName: "John",
          lastName: "Doe",
          joinDate: new Date().toISOString(),
          welcomeBonus: 50,
          currentRank: "Associate",
          nextRank: "Consultant",
        },
        progress: {
          completionPercentage: 25,
          tasksCompleted: 3,
          totalTasks: 12,
          pointsEarned: 225,
          totalPoints: 1000,
        },
        sponsor: {
          name: "Sarah Johnson",
          rank: "Diamond Director",
          avatar: "/placeholder.svg?height=64&width=64&text=SJ",
          nextCallScheduled: false,
        },
        quickActions: [
          {
            id: "basic-training",
            title: "Complete Basic Training",
            description: "Learn the fundamentals of MLM success",
            icon: <BookOpen className="h-5 w-5" />,
            url: "/mlm/training/basics",
            priority: "high",
            estimatedTime: "45 min",
          },
          {
            id: "first-referral",
            title: "Make Your First Referral",
            description: "Earn your first commission",
            icon: <Users className="h-5 w-5" />,
            url: "/mlm/referrals",
            priority: "high",
            estimatedTime: "30 min",
          },
          {
            id: "sponsor-call",
            title: "Schedule Sponsor Call",
            description: "Connect with your mentor",
            icon: <Phone className="h-5 w-5" />,
            url: "/mlm/sponsor-connect",
            priority: "high",
            estimatedTime: "15 min",
          },
          {
            id: "marketing-setup",
            title: "Set Up Marketing Materials",
            description: "Customize your business tools",
            icon: <Target className="h-5 w-5" />,
            url: "/mlm/marketing",
            priority: "medium",
            estimatedTime: "20 min",
          },
        ],
      }

      setWelcomeData(mockData)
    } catch (error) {
      console.error("Failed to load welcome data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const trackPageView = async (page: string) => {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "page_view",
          page,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error("Analytics tracking error:", error)
    }
  }

  const trackActionClick = async (actionId: string) => {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "quick_action_click",
          actionId,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error("Analytics tracking error:", error)
    }
  }

  if (isLoading || !welcomeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your welcome dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full">
              <Star className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Your MLM Journey, {welcomeData.user.firstName}!
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            You're now part of an exclusive network of successful entrepreneurs
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Gift className="h-4 w-4 mr-1" />${welcomeData.user.welcomeBonus} Welcome Bonus
            </Badge>
            <Badge variant="outline">Current Rank: {welcomeData.user.currentRank}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Progress Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Your Progress
              </CardTitle>
              <CardDescription>Complete your onboarding to unlock all features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Completion</span>
                    <span className="text-sm text-gray-600">{welcomeData.progress.completionPercentage}%</span>
                  </div>
                  <Progress value={welcomeData.progress.completionPercentage} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {welcomeData.progress.tasksCompleted}/{welcomeData.progress.totalTasks}
                    </div>
                    <div className="text-sm text-gray-600">Tasks Completed</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{welcomeData.progress.pointsEarned}</div>
                    <div className="text-sm text-gray-600">Points Earned</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Next Milestone</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Complete 3 more tasks to reach {welcomeData.user.nextRank} rank
                  </p>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sponsor Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Your Sponsor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white text-xl font-bold">
                  SJ
                </div>
                <div>
                  <h3 className="font-semibold">{welcomeData.sponsor.name}</h3>
                  <p className="text-sm text-gray-600">{welcomeData.sponsor.rank}</p>
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-transparent"
                    variant="outline"
                    onClick={() => trackActionClick("message-sponsor")}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button className="w-full" onClick={() => trackActionClick("schedule-call")}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Priority Actions
            </CardTitle>
            <CardDescription>Complete these tasks to accelerate your success</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {welcomeData.quickActions.map((action) => (
                <div
                  key={action.id}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                    action.priority === "high"
                      ? "border-red-200 bg-red-50 hover:border-red-300"
                      : action.priority === "medium"
                        ? "border-yellow-200 bg-yellow-50 hover:border-yellow-300"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    trackActionClick(action.id)
                    window.location.href = action.url
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        action.priority === "high"
                          ? "bg-red-100 text-red-600"
                          : action.priority === "medium"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{action.title}</h3>
                        {action.priority === "high" && (
                          <Badge variant="destructive" className="text-xs">
                            High Priority
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Est. {action.estimatedTime}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Success Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Success Tips for Your First Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="bg-green-100 text-green-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Learn the Basics</h3>
                <p className="text-sm text-gray-600">Complete your training modules to understand the business model</p>
              </div>
              <div className="text-center p-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Connect with Your Team</h3>
                <p className="text-sm text-gray-600">Build relationships with your sponsor and team members</p>
              </div>
              <div className="text-center p-4">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Make Your First Sale</h3>
                <p className="text-sm text-gray-600">Focus on helping one person improve their credit score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
