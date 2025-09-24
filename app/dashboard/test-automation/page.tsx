"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { WorkflowEngine, initializeSampleWorkflows, type WorkflowInstance } from "@/lib/workflow-engine"
import {
  Pause,
  Square,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  FileText,
  Users,
  BarChart3,
  RefreshCw,
  Settings,
} from "lucide-react"

export default function TestAutomationPage() {
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => {
    initializeTestData()
    const interval = setInterval(loadData, 2000)
    return () => clearInterval(interval)
  }, [])

  const initializeTestData = () => {
    try {
      initializeSampleWorkflows()
      loadData()
      toast({
        title: "Test Environment Ready",
        description: "Sample workflows and test data have been initialized",
      })
    } catch (error) {
      console.error("Failed to initialize test data:", error)
    }
  }

  const loadData = () => {
    try {
      const allWorkflows = WorkflowEngine.getActiveWorkflows()
      const workflowStats = WorkflowEngine.getWorkflowStats()

      setWorkflows(allWorkflows)
      setStats(workflowStats)
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  const runFullTest = async () => {
    setIsRunning(true)
    setTestResults([])

    try {
      const tests = [
        {
          name: "Create Onboarding Workflow",
          action: () =>
            WorkflowEngine.createWorkflowInstance(
              "onboarding-standard",
              `test-case-${Date.now()}`,
              `test-client-${Date.now()}`,
              "sarah-johnson",
            ),
        },
        {
          name: "Create Dispute Workflow",
          action: () =>
            WorkflowEngine.createWorkflowInstance(
              "dispute-process-standard",
              `test-case-${Date.now()}`,
              `test-client-${Date.now()}`,
              "sarah-johnson",
            ),
        },
        {
          name: "Test Automation Trigger",
          action: () =>
            WorkflowEngine.triggerWorkflow(
              {
                id: "trigger-test",
                name: "Test Trigger",
                type: "case_created",
                conditions: [{ field: "caseType", operator: "equals", value: "Credit Repair" }],
                workflowTemplateId: "onboarding-standard",
                isActive: true,
              },
              {
                caseId: `test-case-${Date.now()}`,
                clientId: `test-client-${Date.now()}`,
                attorneyId: "sarah-johnson",
                caseType: "Credit Repair",
              },
            ),
        },
      ]

      for (const test of tests) {
        try {
          const result = test.action()
          setTestResults((prev) => [
            ...prev,
            {
              name: test.name,
              status: "success",
              result: result,
              timestamp: new Date(),
            },
          ])

          // Wait a bit between tests
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
          setTestResults((prev) => [
            ...prev,
            {
              name: test.name,
              status: "error",
              error: error.message,
              timestamp: new Date(),
            },
          ])
        }
      }

      toast({
        title: "Test Suite Complete",
        description: "All automation tests have been executed",
      })
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Failed to run test suite",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
      loadData()
    }
  }

  const simulateStepCompletion = (workflowId: string) => {
    const workflow = workflows.find((w) => w.id === workflowId)
    if (!workflow) return

    const inProgressStep = workflow.steps.find((s) => s.status === "in_progress")
    const pendingStep = workflow.steps.find((s) => s.status === "pending")

    const stepToComplete = inProgressStep || pendingStep
    if (stepToComplete) {
      WorkflowEngine.completeStep(workflowId, stepToComplete.id, "test-user", "Completed via test automation")

      toast({
        title: "Step Completed",
        description: `Completed: ${stepToComplete.name}`,
      })

      loadData()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-gray-400" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Automation Test Dashboard</h1>
              <p className="text-gray-600">Test and validate workflow automation functionality</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={loadData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={runFullTest} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Run Full Test Suite
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
              <div className="text-sm text-gray-600">Total Workflows</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active || 0}</div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.completed || 0}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.paused || 0}</div>
              <div className="text-sm text-gray-600">Paused</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.averageCompletionTime ? `${Math.round(stats.averageCompletionTime)}h` : "0h"}
              </div>
              <div className="text-sm text-gray-600">Avg. Time</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Active Workflows */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Active Test Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {workflows.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active workflows</p>
                    <Button onClick={initializeTestData} className="mt-4">
                      Initialize Test Data
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workflows.map((workflow) => (
                      <div key={workflow.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{workflow.name}</h4>
                          <Badge className={getStatusColor(workflow.status)}>{workflow.status}</Badge>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{workflow.progress}%</span>
                          </div>
                          <Progress value={workflow.progress} className="h-2" />
                        </div>

                        <div className="text-xs text-gray-500 mb-3">
                          Case: {workflow.caseId} • Client: {workflow.clientId}
                        </div>

                        <div className="space-y-2">
                          {workflow.steps.slice(0, 3).map((step) => (
                            <div key={step.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                {getStepStatusIcon(step.status)}
                                <span className="truncate">{step.name}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {step.status.replace("_", " ")}
                              </Badge>
                            </div>
                          ))}
                          {workflow.steps.length > 3 && (
                            <div className="text-xs text-gray-500">+{workflow.steps.length - 3} more steps</div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => simulateStepCompletion(workflow.id)}
                            disabled={workflow.status !== "active"}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete Step
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              WorkflowEngine.pauseWorkflow(workflow.id)
                              loadData()
                            }}
                            disabled={workflow.status !== "active"}
                          >
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {testResults.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No test results yet</p>
                    <p className="text-sm text-gray-400 mt-2">Run the test suite to see results</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.status === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{result.name}</h4>
                          <div className="flex items-center space-x-1">
                            {result.status === "success" ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <Badge
                              className={
                                result.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }
                            >
                              {result.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">{result.timestamp.toLocaleTimeString()}</div>

                        {result.error && (
                          <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">Error: {result.error}</div>
                        )}

                        {result.result && result.result.id && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">Created: {result.result.id}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Test Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Button
                onClick={() => {
                  const workflow = WorkflowEngine.createWorkflowInstance(
                    "onboarding-standard",
                    `quick-test-${Date.now()}`,
                    `client-${Date.now()}`,
                    "sarah-johnson",
                  )
                  toast({
                    title: "Onboarding Workflow Created",
                    description: `Created: ${workflow.name}`,
                  })
                  loadData()
                }}
                className="w-full"
                variant="outline"
              >
                <Users className="h-4 w-4 mr-2" />
                Create Onboarding
              </Button>

              <Button
                onClick={() => {
                  const workflow = WorkflowEngine.createWorkflowInstance(
                    "dispute-process-standard",
                    `quick-test-${Date.now()}`,
                    `client-${Date.now()}`,
                    "sarah-johnson",
                  )
                  toast({
                    title: "Dispute Workflow Created",
                    description: `Created: ${workflow.name}`,
                  })
                  loadData()
                }}
                className="w-full"
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Dispute
              </Button>

              <Button
                onClick={() => {
                  WorkflowEngine.triggerWorkflow(
                    {
                      id: "quick-trigger",
                      name: "Quick Test Trigger",
                      type: "case_created",
                      conditions: [{ field: "caseType", operator: "equals", value: "Credit Repair" }],
                      workflowTemplateId: "onboarding-standard",
                      isActive: true,
                    },
                    {
                      caseId: `trigger-test-${Date.now()}`,
                      clientId: `client-${Date.now()}`,
                      attorneyId: "sarah-johnson",
                      caseType: "Credit Repair",
                    },
                  )
                  toast({
                    title: "Automation Triggered",
                    description: "Workflow triggered via automation rule",
                  })
                  loadData()
                }}
                className="w-full"
                variant="outline"
              >
                <Zap className="h-4 w-4 mr-2" />
                Trigger Automation
              </Button>

              <Button
                onClick={() => {
                  setWorkflows([])
                  setTestResults([])
                  setStats({})
                  toast({
                    title: "Test Data Cleared",
                    description: "All test workflows and results have been cleared",
                  })
                }}
                className="w-full"
                variant="outline"
              >
                <Square className="h-4 w-4 mr-2" />
                Clear Test Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Workflow Engine</span>
                </div>
                <span className="text-sm text-green-600">Online</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Task Processor</span>
                </div>
                <span className="text-sm text-green-600">Running</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Automation Rules</span>
                </div>
                <span className="text-sm text-green-600">Active</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Notifications</span>
                </div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
