"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Clock, AlertCircle, Target, TrendingUp, Calendar, FileText, ArrowRight, Star, Zap } from 'lucide-react'

interface ActionStep {
  id: number
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "blocked"
  priority: "low" | "medium" | "high" | "critical"
  estimatedDays: number
  actions: string[]
  completedAt?: string
  dueDate?: string
}

interface ActionPlan {
  steps: ActionStep[]
  estimatedTimeframe: string
  priority: string
  goals: {
    currentScore: string
    targetScore: string
    primaryGoal: string
  }
  progress: {
    completed: number
    total: number
    percentage: number
  }
}

export default function ActionPlanPage() {
  const { toast } = useToast()
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchActionPlan()
  }, [])

  const fetchActionPlan = async () => {
    try {
      const response = await fetch("/api/action-plan")
      if (!response.ok) throw new Error("Failed to fetch action plan")
      
      const data = await response.json()
      setActionPlan(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your action plan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const markStepComplete = async (stepId: number) => {
    try {
      const response = await fetch("/api/action-plan/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId }),
      })

      if (!response.ok) throw new Error("Failed to update step")

      // Update local state
      setActionPlan((prev) => {
        if (!prev) return prev
        
        const updatedSteps = prev.steps.map((step) =>
          step.id === stepId
            ? { ...step, status: "completed" as const, completedAt: new Date().toISOString() }
            : step
        )
        
        const completed = updatedSteps.filter((s) => s.status === "completed").length
        const percentage = (completed / updatedSteps.length) * 100

        return {
          ...prev,
          steps: updatedSteps,
          progress: {
            completed,
            total: updatedSteps.length,
            percentage,
          },
        }
      })

      toast({
        title: "Step Completed!",
        description: "Great progress on your credit repair journey!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update step status",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200"
      case "high": return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-5 w-5 text-green-600" />
      case "in_progress": return <Clock className="h-5 w-5 text-blue-600" />
      case "blocked": return <AlertCircle className="h-5 w-5 text-red-600" />
      default: return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!actionPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Action Plan Found</h3>
            <p className="text-gray-600 mb-6">Complete your onboarding to get a personalized action plan.</p>
            <Button onClick={() => window.location.href = "/onboarding"}>
              Complete Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Action Plan</h1>
          <p className="text-gray-600">Personalized roadmap to achieve your credit goals</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
          <Target className="h-4 w-4 mr-1" />
          {actionPlan.goals.primaryGoal}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="steps">Action Steps</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {actionPlan.progress.completed}
                  </div>
                  <p className="text-sm text-gray-600">Steps Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {actionPlan.progress.total}
                  </div>
                  <p className="text-sm text-gray-600">Total Steps</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.round(actionPlan.progress.percentage)}%
                  </div>
                  <p className="text-sm text-gray-600">Complete</p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(actionPlan.progress.percentage)}%</span>
                </div>
                <Progress value={actionPlan.progress.percentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Goals Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Your Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Score</p>
                  <p className="text-lg font-semibold">
                    {actionPlan.goals.currentScore || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Target Score</p>
                  <p className="text-lg font-semibold text-green-600">
                    {actionPlan.goals.targetScore}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Timeframe</p>
                  <p className="text-lg font-semibold">
                    {actionPlan.estimatedTimeframe.replace("-", " ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-orange-500" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actionPlan.steps
                  .filter((step) => step.status === "pending" || step.status === "in_progress")
                  .slice(0, 3)
                  .map((step) => (
                    <div key={step.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="mt-0.5">{getStatusIcon(step.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{step.title}</h4>
                          <Badge className={getPriorityColor(step.priority)}>
                            {step.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                        <Button
                          size="sm"
                          onClick={() => markStepComplete(step.id)}
                          disabled={step.status === "completed"}
                        >
                          {step.status === "completed" ? "Completed" : "Mark Complete"}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps" className="space-y-6">
          <div className="space-y-4">
            {actionPlan.steps.map((step, index) => (
              <Card key={step.id} className={step.status === "completed" ? "bg-green-50 border-green-200" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                        <p className="text-gray-600 mb-3">{step.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {step.estimatedDays} days
                          </span>
                          <Badge className={getPriorityColor(step.priority)}>
                            {step.priority} priority
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(step.status)}
                      <span className="text-sm font-medium capitalize">{step.status.replace("_", " ")}</span>
                    </div>
                  </div>

                  <div className="ml-12">
                    <h4 className="font-medium mb-2">Action Items:</h4>
                    <ul className="space-y-1">
                      {step.actions.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-start text-sm text-gray-600">
                          <ArrowRight className="h-3 w-3 mr-2 mt-1 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>

                    {step.status !== "completed" && (
                      <Button
                        className="mt-4"
                        size="sm"
                        onClick={() => markStepComplete(step.id)}
                      >
                        Mark as Complete
                      </Button>
                    )}

                    {step.completedAt && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ Completed on {new Date(step.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {actionPlan.steps.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${
                        step.status === "completed" ? "bg-green-500" : 
                        step.status === "in_progress" ? "bg-blue-500" : "bg-gray-300"
                      }`}></div>
                      {index < actionPlan.steps.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{step.title}</h4>
                        <span className="text-sm text-gray-500">
                          {step.estimatedDays} days
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      {step.completedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Completed {new Date(step.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
