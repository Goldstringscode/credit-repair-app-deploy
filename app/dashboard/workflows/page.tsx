"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { WorkflowDashboard } from "@/components/workflow/workflow-dashboard"
import { TaskManagement } from "@/components/workflow/task-management"
import { WorkflowEngine, initializeSampleWorkflows } from "@/lib/workflow-engine"
import { Play, Users, CheckCircle, Clock, BarChart3, Settings, Zap, FileText, Mail } from "lucide-react"

export default function WorkflowsPage() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [stats, setStats] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => {
    initializeWorkflows()
    loadStats()
    const interval = setInterval(loadStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const initializeWorkflows = () => {
    try {
      // Initialize sample workflows for testing
      initializeSampleWorkflows()
      setIsInitialized(true)

      toast({
        title: "Workflows Initialized",
        description: "Sample workflows have been created for testing",
      })
    } catch (error) {
      console.error("Failed to initialize workflows:", error)
      toast({
        title: "Initialization Error",
        description: "Failed to initialize sample workflows",
        variant: "destructive",
      })
    }
  }

  const loadStats = () => {
    try {
      const workflowStats = WorkflowEngine.getWorkflowStats()
      setStats(workflowStats)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const handleCreateTestWorkflow = () => {
    try {
      // Create a new test workflow instance
      const workflow = WorkflowEngine.createWorkflowInstance(
        "onboarding-standard",
        `case-${Date.now()}`,
        `client-${Date.now()}`,
        "sarah-johnson",
      )

      toast({
        title: "Test Workflow Created",
        description: `Created workflow: ${workflow.name}`,
      })

      loadStats()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test workflow",
        variant: "destructive",
      })
    }
  }

  const handleCreateDisputeWorkflow = () => {
    try {
      const workflow = WorkflowEngine.createWorkflowInstance(
        "dispute-process-standard",
        `case-${Date.now()}`,
        `client-${Date.now()}`,
        "sarah-johnson",
      )

      toast({
        title: "Dispute Workflow Created",
        description: `Created dispute workflow: ${workflow.name}`,
      })

      loadStats()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create dispute workflow",
        variant: "destructive",
      })
    }
  }

  const handleTriggerAutomation = () => {
    try {
      // Simulate triggering automation based on case creation
      WorkflowEngine.triggerWorkflow(
        {
          id: "trigger-new-client",
          name: "New Client Signup",
          type: "case_created",
          conditions: [{ field: "caseType", operator: "equals", value: "Credit Repair" }],
          workflowTemplateId: "onboarding-standard",
          isActive: true,
        },
        {
          caseId: `case-${Date.now()}`,
          clientId: `client-${Date.now()}`,
          attorneyId: "sarah-johnson",
          caseType: "Credit Repair",
        },
      )

      toast({
        title: "Automation Triggered",
        description: "New client onboarding workflow has been automatically started",
      })

      loadStats()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger automation",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow Automation</h1>
              <p className="text-gray-600">Automated case management and client onboarding system</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={handleCreateTestWorkflow} variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Test Onboarding
              </Button>
              <Button onClick={handleCreateDisputeWorkflow} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Test Dispute
              </Button>
              <Button onClick={handleTriggerAutomation} className="bg-blue-600 hover:bg-blue-700">
                <Zap className="h-4 w-4 mr-2" />
                Trigger Automation
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
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
              <div className="text-2xl font-bold text-red-600">{stats.cancelled || 0}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
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

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <WorkflowDashboard />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManagement />
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Onboarding Template */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Standard Client Onboarding
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium text-green-600">95%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Avg. Duration</span>
                      <span className="font-medium">48 hours</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Times Used</span>
                      <span className="font-medium">156</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Workflow Steps:</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3 text-blue-500" />
                          <span>Send Welcome Email</span>
                          <span className="text-gray-500">(Auto)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-3 w-3 text-orange-500" />
                          <span>Request Documents</span>
                          <span className="text-gray-500">(Manual)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-green-500" />
                          <span>Schedule Consultation</span>
                          <span className="text-gray-500">(Manual)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-3 w-3 text-purple-500" />
                          <span>Create Case File</span>
                          <span className="text-gray-500">(Manual)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-3 w-3 text-red-500" />
                          <span>Credit Analysis</span>
                          <span className="text-gray-500">(Manual)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3 text-blue-500" />
                          <span>Send Strategy</span>
                          <span className="text-gray-500">(Auto)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Settings className="h-3 w-3 text-gray-500" />
                          <span>Update Status</span>
                          <span className="text-gray-500">(Auto)</span>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleCreateTestWorkflow} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Start Test Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Dispute Process Template */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                    Standard Dispute Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium text-green-600">87%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Avg. Duration</span>
                      <span className="font-medium">7 days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Times Used</span>
                      <span className="font-medium">89</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Workflow Steps:</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-3 w-3 text-blue-500" />
                          <span>Prepare Disputes</span>
                          <span className="text-gray-500">(Manual)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3 text-orange-500" />
                          <span>Client Review</span>
                          <span className="text-gray-500">(Auto)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-3 w-3 text-red-500" />
                          <span>File Disputes</span>
                          <span className="text-gray-500">(Manual)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3 text-green-500" />
                          <span>Send Confirmation</span>
                          <span className="text-gray-500">(Auto)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-purple-500" />
                          <span>30-Day Wait</span>
                          <span className="text-gray-500">(Auto)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-blue-500" />
                          <span>Check Responses</span>
                          <span className="text-gray-500">(Manual)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3 text-green-500" />
                          <span>Send Results</span>
                          <span className="text-gray-500">(Auto)</span>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleCreateDisputeWorkflow} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Start Test Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="automation">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Automation Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                    Automation Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">New Client Trigger</h4>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Automatically start onboarding workflow when new credit repair case is created
                      </p>
                      <div className="text-xs text-gray-500">
                        Trigger: Case Created • Condition: caseType = "Credit Repair"
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Analysis Complete</h4>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Start dispute process when credit analysis is marked complete
                      </p>
                      <div className="text-xs text-gray-500">
                        Trigger: Status Changed • Condition: status = "analysis_complete"
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Document Upload</h4>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Create review task when client uploads documents</p>
                      <div className="text-xs text-gray-500">
                        Trigger: Document Uploaded • Action: Create Review Task
                      </div>
                    </div>

                    <Button onClick={handleTriggerAutomation} className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Test Automation Trigger
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-gray-600" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                        <span className="font-medium">Email Service</span>
                      </div>
                      <span className="text-sm text-green-600">Connected</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Notifications</span>
                      </div>
                      <span className="text-sm text-green-600">Active</span>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Workflows Processed Today:</span>
                          <span className="font-medium">{stats.total || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tasks Completed:</span>
                          <span className="font-medium">{stats.completed || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Automation Success Rate:</span>
                          <span className="font-medium text-green-600">98.5%</span>
                        </div>
                      </div>
                    </div>

                    {!isInitialized && (
                      <Button onClick={initializeWorkflows} className="w-full bg-transparent" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Initialize Test Data
                      </Button>
                    )}
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
