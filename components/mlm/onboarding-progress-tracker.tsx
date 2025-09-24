"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, ArrowRight, Star, Gift, BookOpen, Users, Target } from "lucide-react"

interface OnboardingTask {
  id: string
  title: string
  description: string
  category: "setup" | "training" | "social" | "earning"
  status: "completed" | "in_progress" | "pending"
  points: number
  estimatedTime: string
  url: string
  icon: React.ReactNode
  priority: "high" | "medium" | "low"
}

interface OnboardingProgress {
  totalTasks: number
  completedTasks: number
  totalPoints: number
  earnedPoints: number
  currentLevel: string
  nextLevel: string
  daysActive: number
  completionPercentage: number
}

export function OnboardingProgressTracker() {
  const [progress, setProgress] = useState<OnboardingProgress>({
    totalTasks: 12,
    completedTasks: 3,
    totalPoints: 1000,
    earnedPoints: 250,
    currentLevel: "Beginner",
    nextLevel: "Apprentice",
    daysActive: 2,
    completionPercentage: 25,
  })

  const [tasks, setTasks] = useState<OnboardingTask[]>([
    {
      id: "profile-setup",
      title: "Complete Your Profile",
      description: "Add your photo, bio, and contact information",
      category: "setup",
      status: "completed",
      points: 50,
      estimatedTime: "5 min",
      url: "/mlm/profile",
      icon: <Users className="h-4 w-4" />,
      priority: "high",
    },
    {
      id: "sponsor-connect",
      title: "Connect with Your Sponsor",
      description: "Schedule your first mentoring call",
      category: "social",
      status: "completed",
      points: 75,
      estimatedTime: "15 min",
      url: "/mlm/sponsor-connect",
      icon: <Users className="h-4 w-4" />,
      priority: "high",
    },
    {
      id: "welcome-bonus",
      title: "Claim Welcome Bonus",
      description: "Activate your $50 welcome bonus",
      category: "earning",
      status: "completed",
      points: 100,
      estimatedTime: "2 min",
      url: "/mlm/bonuses",
      icon: <Gift className="h-4 w-4" />,
      priority: "high",
    },
    {
      id: "basic-training",
      title: "Complete Basic Training",
      description: "Learn the fundamentals of MLM success",
      category: "training",
      status: "in_progress",
      points: 150,
      estimatedTime: "45 min",
      url: "/mlm/training/basics",
      icon: <BookOpen className="h-4 w-4" />,
      priority: "high",
    },
    {
      id: "marketing-materials",
      title: "Set Up Marketing Materials",
      description: "Customize your landing pages and business cards",
      category: "setup",
      status: "pending",
      points: 100,
      estimatedTime: "20 min",
      url: "/mlm/marketing",
      icon: <Target className="h-4 w-4" />,
      priority: "medium",
    },
    {
      id: "first-referral",
      title: "Make Your First Referral",
      description: "Earn your first commission",
      category: "earning",
      status: "pending",
      points: 200,
      estimatedTime: "30 min",
      url: "/mlm/referrals",
      icon: <Star className="h-4 w-4" />,
      priority: "high",
    },
    {
      id: "social-media",
      title: "Set Up Social Media Presence",
      description: "Create professional social media profiles",
      category: "setup",
      status: "pending",
      points: 75,
      estimatedTime: "25 min",
      url: "/mlm/social-media",
      icon: <Users className="h-4 w-4" />,
      priority: "medium",
    },
    {
      id: "advanced-training",
      title: "Advanced Sales Training",
      description: "Master advanced selling techniques",
      category: "training",
      status: "pending",
      points: 150,
      estimatedTime: "60 min",
      url: "/mlm/training/advanced",
      icon: <BookOpen className="h-4 w-4" />,
      priority: "medium",
    },
    {
      id: "team-building",
      title: "Team Building Workshop",
      description: "Learn to build and manage your team",
      category: "training",
      status: "pending",
      points: 125,
      estimatedTime: "40 min",
      url: "/mlm/training/team-building",
      icon: <Users className="h-4 w-4" />,
      priority: "low",
    },
    {
      id: "goal-setting",
      title: "Set 90-Day Goals",
      description: "Create your success roadmap",
      category: "setup",
      status: "pending",
      points: 50,
      estimatedTime: "15 min",
      url: "/mlm/goals",
      icon: <Target className="h-4 w-4" />,
      priority: "medium",
    },
    {
      id: "mentor-match",
      title: "Find a Mentor",
      description: "Connect with an experienced leader",
      category: "social",
      status: "pending",
      points: 75,
      estimatedTime: "10 min",
      url: "/mlm/mentors",
      icon: <Users className="h-4 w-4" />,
      priority: "low",
    },
    {
      id: "first-sale",
      title: "Make Your First Sale",
      description: "Complete your first product sale",
      category: "earning",
      status: "pending",
      points: 250,
      estimatedTime: "Variable",
      url: "/mlm/sales",
      icon: <Star className="h-4 w-4" />,
      priority: "high",
    },
  ])

  const completeTask = async (taskId: string) => {
    try {
      const response = await fetch("/api/mlm/onboarding/complete-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      })

      if (response.ok) {
        setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: "completed" as const } : task)))

        // Update progress
        const completedCount = tasks.filter((t) => t.status === "completed").length + 1
        const earnedPoints = tasks
          .filter((t) => t.status === "completed" || t.id === taskId)
          .reduce((sum, t) => sum + t.points, 0)

        setProgress((prev) => ({
          ...prev,
          completedTasks: completedCount,
          earnedPoints,
          completionPercentage: Math.round((completedCount / prev.totalTasks) * 100),
        }))
      }
    } catch (error) {
      console.error("Failed to complete task:", error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "setup":
        return "bg-blue-100 text-blue-800"
      case "training":
        return "bg-green-100 text-green-800"
      case "social":
        return "bg-purple-100 text-purple-800"
      case "earning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const highPriorityTasks = tasks.filter((t) => t.priority === "high" && t.status !== "completed")
  const otherTasks = tasks.filter((t) => t.priority !== "high" || t.status === "completed")

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Your MLM Journey Progress
          </CardTitle>
          <CardDescription>Complete these tasks to unlock your full earning potential</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{progress.completionPercentage}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">
                {progress.earnedPoints} / {progress.totalPoints}
              </div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </div>
          </div>
          <Progress value={progress.completionPercentage} className="h-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{progress.completedTasks}</div>
              <div className="text-xs text-gray-600">Tasks Done</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{progress.daysActive}</div>
              <div className="text-xs text-gray-600">Days Active</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">{progress.currentLevel}</div>
              <div className="text-xs text-gray-600">Current Level</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">{progress.nextLevel}</div>
              <div className="text-xs text-gray-600">Next Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Priority Tasks */}
      {highPriorityTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">🔥 Priority Tasks</CardTitle>
            <CardDescription>Complete these first to maximize your success</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {highPriorityTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(task.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{task.title}</h3>
                      <Badge className={getCategoryColor(task.category)} variant="secondary">
                        {task.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +{task.points} pts
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <p className="text-xs text-gray-500 mt-1">⏱️ {task.estimatedTime}</p>
                  </div>
                </div>
                <Button
                  onClick={() => (window.location.href = task.url)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Start <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>All Onboarding Tasks</CardTitle>
          <CardDescription>Your complete roadmap to MLM success</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {otherTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                task.status === "completed"
                  ? "bg-green-50 border-green-200"
                  : task.status === "in_progress"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(task.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
                      {task.title}
                    </h3>
                    <Badge className={getCategoryColor(task.category)} variant="secondary">
                      {task.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      +{task.points} pts
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <p className="text-xs text-gray-500 mt-1">⏱️ {task.estimatedTime}</p>
                </div>
              </div>
              {task.status !== "completed" && (
                <Button onClick={() => (window.location.href = task.url)} size="sm" variant="outline">
                  {task.status === "in_progress" ? "Continue" : "Start"}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
