"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { WorkflowEngine, type WorkflowInstance } from "@/lib/workflow-engine"
import {
  Play,
  Pause,
  Square,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  BarChart3,
  Settings,
  Plus,
  Calendar,
  FileText,
  Mail,
  Bell,
  Timer,
} from "lucide-react"

export function WorkflowDashboard() {
  const [activeWorkflows, setActiveWorkflows] = useState<WorkflowInstance[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null)
  const [workflowStats, setWorkflowStats] = useState<any>({})
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadWorkflowData()
    const interval = setInterval(loadWorkflowData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadWorkflowData = () => {
    try {
      const workflows = WorkflowEngine.getActiveWorkflows()
      const stats = WorkflowEngine.getWorkflowStats()

      setActiveWorkflows(workflows)
      setWorkflowStats(stats)

      if (selectedWorkflow) {
        const updated = WorkflowEngine.getWorkflowInstance(selectedWorkflow.id)
        setSelectedWorkflow(updated || null)
      }
    } catch (error) {
      console.error("Failed to load workflow data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteStep = (workflowId: string, stepId: string) => {
    try {
      WorkflowEngine.completeStep(workflowId, stepId, "attorney", "Completed manually")
      toast({
        title: "Step Completed",
        description: "The workflow step has been marked as completed",
      })
      loadWorkflowData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete step",
        variant: "destructive",
      })
    }
  }

  const handlePauseWorkflow = (workflowId: string) => {
    try {
      WorkflowEngine.pauseWorkflow(workflowId)
      toast({
        title: "Workflow Paused",
        description: "The workflow has been paused",
      })
      loadWorkflowData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pause workflow",
        variant: "destructive",
      })
    }
  }

  const handleResumeWorkflow = (workflowId: string) => {
    try {
      WorkflowEngine.resumeWorkflow(workflowId)
      toast({
        title: "Workflow Resumed",
        description: "The workflow has been resumed",
      })
      loadWorkflowData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resume workflow",
        variant: "destructive",
      })
    }
  }

  const handleCancelWorkflow = (workflowId: string) => {
    try {
      WorkflowEngine.cancelWorkflow(workflowId, "Cancelled by attorney")
      toast({
        title: "Workflow Cancelled",
        description: "The workflow has been cancelled",
      })
      loadWorkflowData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel workflow",
        variant: "destructive",
      })
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
        return <Timer className="h-4 w-4 text-gray-400" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "task":
        return <FileText className="h-4 w-4" />
      case "notification":
        return <Bell className="h-4 w-4" />
      case "document_request":
        return <FileText className="h-4 w-4" />
      case "delay":
        return <Timer className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`
    } else if (hours < 24) {
      return `${Math.round(hours)}h`
    } else {
      return `${Math.round(hours / 24)}d`
    }
  }

  const filteredWorkflows = activeWorkflows.filter((workflow) => {
    if (filterStatus === "all") return true
    return workflow.status === filterStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                <p className="text-2xl font-bold text-blue-600">{workflowStats.active || 0}</p>
              </div>
              <Play className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{workflowStats.completed || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatDuration(workflowStats.averageCompletionTime || 0)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{workflowStats.total || 0}</p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Workflow List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Workflows</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {filteredWorkflows.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No workflows found</div>
                ) : (
                  <div className="space-y-1">
                    {filteredWorkflows.map((workflow) => (
                      <Button
                        key={workflow.id}
                        variant="ghost"
                        className={`w-full justify-start p-4 h-auto ${
                          selectedWorkflow?.id === workflow.id ? "bg-blue-50 border-r-2 border-blue-600" : ""
                        }`}
                        onClick={() => setSelectedWorkflow(workflow)}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900 truncate">{workflow.name}</h4>
                              <Badge className={getStatusColor(workflow.status)}>{workflow.status}</Badge>
                            </div>

                            <p className="text-sm text-gray-600 mb-2">Case: {workflow.caseId}</p>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-medium">{workflow.progress}%</span>
                              </div>
                              <Progress value={workflow.progress} className="h-1" />
                            </div>

                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                              <span>Started: {workflow.startedAt.toLocaleDateString()}</span>
                              <span>{workflow.currentStep ? "In Progress" : "Waiting"}</span>
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Details */}
        <div className="lg:col-span-2">
          {selectedWorkflow ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedWorkflow.name}</CardTitle>
                    <p className="text-gray-600 mt-1">
                      Case: {selectedWorkflow.caseId} • Client: {selectedWorkflow.clientId}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedWorkflow.status === "active" && (
                      <Button variant="outline" size="sm" onClick={() => handlePauseWorkflow(selectedWorkflow.id)}>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    {selectedWorkflow.status === "paused" && (
                      <Button variant="outline" size="sm" onClick={() => handleResumeWorkflow(selectedWorkflow.id)}>
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleCancelWorkflow(selectedWorkflow.id)}>
                      <Square className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="steps" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="steps">Steps</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="steps">
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {selectedWorkflow.steps.map((step, index) => (
                          <div
                            key={step.id}
                            className={`p-4 border rounded-lg ${
                              step.status === "completed"
                                ? "bg-green-50 border-green-200"
                                : step.status === "in_progress"
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                                  {getStepStatusIcon(step.status)}
                                  {getStepTypeIcon(step.type)}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{step.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {step.config.taskDescription || step.config.emailSubject || "No description"}
                                  </p>

                                  {step.dueDate && (
                                    <div className="flex items-center mt-2 text-xs text-gray-500">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Due: {step.dueDate.toLocaleDateString()}
                                    </div>
                                  )}

                                  {step.assignedTo && (
                                    <div className="flex items-center mt-1 text-xs text-gray-500">
                                      <Users className="h-3 w-3 mr-1" />
                                      Assigned to: {step.assignedTo}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(step.status)}>{step.status.replace("_", " ")}</Badge>
                                {step.status === "in_progress" && !step.autoComplete && (
                                  <Button size="sm" onClick={() => handleCompleteStep(selectedWorkflow.id, step.id)}>
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>

                            {step.notes && (
                              <div className="mt-3 p-2 bg-white rounded border">
                                <p className="text-sm text-gray-700">{step.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="timeline">
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                          <Play className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Workflow Started</p>
                            <p className="text-sm text-gray-600">{selectedWorkflow.startedAt.toLocaleString()}</p>
                          </div>
                        </div>

                        {selectedWorkflow.steps
                          .filter((step) => step.completedAt)
                          .sort((a, b) => a.completedAt!.getTime() - b.completedAt!.getTime())
                          .map((step) => (
                            <div key={step.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium">{step.name} Completed</p>
                                <p className="text-sm text-gray-600">
                                  {step.completedAt!.toLocaleString()} by {step.completedBy}
                                </p>
                                {step.notes && <p className="text-sm text-gray-500 mt-1">{step.notes}</p>}
                              </div>
                            </div>
                          ))}

                        {selectedWorkflow.status === "completed" && selectedWorkflow.completedAt && (
                          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="font-medium">Workflow Completed</p>
                              <p className="text-sm text-gray-600">{selectedWorkflow.completedAt.toLocaleString()}</p>
                              <p className="text-sm text-gray-500">
                                Duration: {formatDuration(selectedWorkflow.actualDuration || 0)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="details">
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Template</p>
                            <p className="text-sm text-gray-900">{selectedWorkflow.templateId}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <Badge className={getStatusColor(selectedWorkflow.status)}>{selectedWorkflow.status}</Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Progress</p>
                            <div className="flex items-center space-x-2">
                              <Progress value={selectedWorkflow.progress} className="flex-1" />
                              <span className="text-sm font-medium">{selectedWorkflow.progress}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Started</p>
                            <p className="text-sm text-gray-900">{selectedWorkflow.startedAt.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Estimated Completion</p>
                            <p className="text-sm text-gray-900">
                              {selectedWorkflow.estimatedCompletionDate.toLocaleString()}
                            </p>
                          </div>
                          {selectedWorkflow.completedAt && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Completed</p>
                              <p className="text-sm text-gray-900">{selectedWorkflow.completedAt.toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedWorkflow.notes.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                          <div className="space-y-2">
                            {selectedWorkflow.notes.map((note, index) => (
                              <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                                {note}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Workflow</h3>
                  <p className="text-gray-600">Choose a workflow from the list to view details and manage steps</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
