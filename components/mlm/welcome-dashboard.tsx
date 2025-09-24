"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Rocket,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  BookOpen,
  Star,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react"

interface WelcomeStats {
  daysActive: number
  tasksCompleted: number
  totalTasks: number
  pointsEarned: number
  currentRank: string
  sponsorName: string
  welcomeBonus: number
  nextMilestone: string
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  url: string
  priority: "high" | "medium" | "low"
  estimatedTime: string
}

export function WelcomeDashboard() {
  const [stats, setStats] = useState<WelcomeStats>({
    daysActive: 2,
    tasksCompleted: 3,
    totalTasks: 12,
    pointsEarned: 250,
    currentRank: "Associate",
    sponsorName: "Sarah Johnson",
    welcomeBonus: 50,
    nextMilestone: "First Referral",
  })

  const [quickActions] = useState<QuickAction[]>([
    {
      id: "complete-training",
      title: "Complete Basic Training",
      description: "Learn MLM fundamentals",
      icon: <BookOpen className="h-5 w-5" />,
      url: "/mlm/training/basics",
      priority: "high",
      estimatedTime: "45 min",
    },
    {
      id: "setup-profile",
      title: "Complete Your Profile",
      description: "Add photo and bio",
      icon: <Users className="h-5 w-5" />,
      url: "/mlm/profile",
      priority: "high",
      estimatedTime: "10 min",
    },
    {
      id: "first-referral",
      title: "Make First Referral",
      description: "Start earning commissions",
      icon: <DollarSign className="h-5 w-5" />,
      url: "/mlm/referrals",
      priority: "high",
      estimatedTime: "30 min",
    },
    {
      id: "marketing-setup",
      title: "Set Up Marketing",
      description: "Create your landing page",
      icon: <TrendingUp className="h-5 w-5" />,
      url: "/mlm/marketing",
      priority: "medium",
      estimatedTime: "20 min",
    },
  ])

  const completionPercentage = Math.round((stats.tasksCompleted / stats.totalTasks) * 100)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Welcome to Your MLM Journey! 🎉</CardTitle>
              <CardDescription className="text-purple-100">
                You're on day {stats.daysActive} of building your financial future
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{completionPercentage}%</div>
              <div className="text-sm text-purple-100">Setup Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.pointsEarned}</div>
              <div className="text-sm text-purple-100">Points Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.tasksCompleted}</div>
              <div className="text-sm text-purple-100">Tasks Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${stats.welcomeBonus}</div>
              <div className="text-sm text-purple-100">Welcome Bonus</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.currentRank}</div>
              <div className="text-sm text-purple-100">Current Rank</div>
            </div>
          </div>
          <Progress value={completionPercentage} className="h-2 bg-purple-400" />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>Complete these tasks to accelerate your success</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <div
                key={action.id}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  action.priority === "high"
                    ? "border-red-200 bg-red-50"
                    : action.priority === "medium"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
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
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  {action.priority === "high" && <Badge className="bg-red-600">Priority</Badge>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">⏱️ {action.estimatedTime}</span>
                  <Button
                    onClick={() => (window.location.href = action.url)}
                    size="sm"
                    className={
                      action.priority === "high"
                        ? "bg-red-600 hover:bg-red-700"
                        : action.priority === "medium"
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : ""
                    }
                  >
                    Start <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sponsor Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Your Sponsor
          </CardTitle>
          <CardDescription>Stay connected with your mentor for success</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {stats.sponsorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{stats.sponsorName}</h3>
                <p className="text-sm text-gray-600">Diamond Director • 89% Success Rate</p>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Available for mentoring</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Message
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Schedule Call
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Upcoming Milestones
          </CardTitle>
          <CardDescription>Your path to the next level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Make Your First Referral</h3>
                <p className="text-sm text-gray-600">Earn your first commission and unlock bonus rewards</p>
              </div>
              <Badge className="bg-yellow-500">Next</Badge>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-600">Reach Consultant Rank</h3>
                <p className="text-sm text-gray-500">Build a team of 3 active members</p>
              </div>
              <Badge variant="outline">Future</Badge>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-600">Earn $1,000 Monthly</h3>
                <p className="text-sm text-gray-500">Achieve consistent monthly income</p>
              </div>
              <Badge variant="outline">Future</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            This Week's Training
          </CardTitle>
          <CardDescription>Stay on track with your learning schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-purple-600" />
                <div>
                  <h3 className="font-semibold">MLM Basics Course</h3>
                  <p className="text-sm text-gray-600">Module 2: Building Relationships</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">Today, 7:00 PM</div>
                <Badge className="bg-purple-600">Live Session</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-gray-600" />
                <div>
                  <h3 className="font-semibold text-gray-600">Sales Mastery Workshop</h3>
                  <p className="text-sm text-gray-500">Advanced closing techniques</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Tomorrow, 2:00 PM</div>
                <Badge variant="outline">Optional</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
