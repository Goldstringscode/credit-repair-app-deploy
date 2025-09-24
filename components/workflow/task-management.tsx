"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { WorkflowEngine } from "@/lib/workflow-engine"
import { CheckSquare, Clock, User, Calendar, Plus, Search, MoreHorizontal, FileText, Bell } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  type: "workflow" | "manual" | "follow_up" | "document_review"
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "overdue"
  assignedTo: string
  createdBy: string
  createdAt: Date
  dueDate?: Date
  completedAt?: Date
  completedBy?: string
  caseId?: string
  clientId?: string
  workflowId?: string
  stepId?: string
  estimatedHours?: number
  actualHours?: number
  notes: string[]
  attachments: string[]
}

export function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadTasks()
    const interval = setInterval(loadTasks, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter])

  const loadTasks = () => {
    try {
      // Get workflow-based tasks
      const workflows = WorkflowEngine.getActiveWorkflows()
      const workflowTasks: Task[] = []

      workflows.forEach((workflow) => {
        workflow.steps.forEach((step) => {
          if (step.type === "task" && step.status !== "completed") {
            workflowTasks.push({
              id: `task_${step.id}`,
              title: step.name,
              description: step.config.taskDescription || "",
              type: "workflow",
              priority: (step.config.taskPriority as Task["priority"]) || "medium",
              status: step.status === "in_progress" ? "in_progress" : "pending",
              assignedTo: step.assignedTo || "unassigned",
              createdBy: "system",
              createdAt: workflow.startedAt,
              dueDate: step.dueDate,
              completedAt: step.completedAt,
              completedBy: step.completedBy,
              caseId: workflow.caseId,
              clientId: workflow.clientId,
              workflowId: workflow.id,
              stepId: step.id,
              estimatedHours: 2,
              notes: step.notes ? [step.notes] : [],
              attachments: [],
            })
          }
        })
      })

      // Add some manual tasks for demonstration
      const manualTasks: Task[] = [
        {
          id: "manual_1",
          title: "Review Client Documentation",
          description: "Review and verify all uploaded client documents for completeness",
          type: "document_review",
          priority: "high",
          status: "pending",
          assignedTo: "sarah-johnson",
          createdBy: "sarah-johnson",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
          caseId: "case-001",
          clientId: "client-123",
          estimatedHours: 1,
          notes: [],
          attachments: [],
        },
        {
          id: "manual_2",
          title: "Follow up with Experian",
          description: "Call Experian to check on dispute status for client John Doe",
          type: "follow_up",
          priority: "medium",
          status: "in_progress",
          assignedTo: "sarah-johnson",
          createdBy: "sarah-johnson",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
          caseId: "case-001",
          clientId: "client-123",
          estimatedHours: 0.5,
          notes: ["Called once, left voicemail"],
          attachments: [],
        },
      ]

      const allTasks = [...workflowTasks, ...manualTasks]

      // Update overdue status
      allTasks.forEach((task) => {
        if (task.dueDate && task.dueDate < new Date() && task.status !== "completed") {
          task.status = "overdue"
        }
      })

      setTasks(allTasks)
    } catch (error) {
      console.error("Failed to load tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = tasks

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.caseId?.toLowerCase().includes(query) ||
          task.clientId?.toLowerCase().includes(query),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter)
    }

    // Assignee filter
    if (assigneeFilter !== "all") {
      filtered = filtered.filter((task) => task.assignedTo === assigneeFilter)
    }

    // Sort by priority and due date
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const priorityA = priorityOrder[a.priority]
      const priorityB = priorityOrder[b.priority]

      if (priorityA !== priorityB) {
        return priorityB - priorityA
      }

      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime()
      }

      return 0
    })

    setFilteredTasks(filtered)
  }

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    try {
      if (task.workflowId && task.stepId) {
        // Complete workflow step
        WorkflowEngine.completeStep(task.workflowId, task.stepId, "sarah-johnson", "Completed via task management")
      }

      // Update task status
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: "completed" as const, completedAt: new Date(), completedBy: "sarah-johnson" }
            : t,
        ),
      )

      toast({
        title: "Task Completed",
        description: "The task has been marked as completed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)))

    toast({
      title: "Task Updated",
      description: "The task has been updated successfully",
    })
  }

  const handleAddNote = (taskId: string, note: string) => {
    if (!note.trim()) return

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, notes: [...t.notes, `${new Date().toLocaleString()}: ${note}`] } : t)),
    )

    toast({
      title: "Note Added",
      description: "Your note has been added to the task",
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "workflow":
        return <CheckSquare className="h-4 w-4" />
      case "document_review":
        return <FileText className="h-4 w-4" />
      case "follow_up":
        return <Bell className="h-4 w-4" />
      case "manual":
        return <User className="h-4 w-4" />
      default:
        return <CheckSquare className="h-4 w-4" />
    }
  }

  const formatDueDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 0) {
      return `Overdue by ${Math.abs(Math.round(diffInHours))}h`
    } else if (diffInHours < 24) {
      return `Due in ${Math.round(diffInHours)}h`
    } else {
      return `Due ${date.toLocaleDateString()}`
    }
  }

  const getTaskStats = () => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter((t) => t.status === "overdue").length,
    }
  }

  const stats = getTaskStats()

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
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tasks</CardTitle>
                <Button size="sm" onClick={() => setShowCreateTask(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  New Task
                </Button>
              </div>

              {/* Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {filteredTasks.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No tasks found matching your filters</div>
                ) : (
                  <div className="space-y-1">
                    {filteredTasks.map((task) => (
                      <Button
                        key={task.id}
                        variant="ghost"
                        className={`w-full justify-start p-4 h-auto ${
                          selectedTask?.id === task.id ? "bg-blue-50 border-r-2 border-blue-600" : ""
                        }`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <div className="mt-1">{getTypeIcon(task.type)}</div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                              <div className="flex items-center space-x-1">
                                <Badge className={getPriorityColor(task.priority)} variant="outline">
                                  {task.priority}
                                </Badge>
                                <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 truncate mb-2">{task.description}</p>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center space-x-2">
                                {task.caseId && <span>Case: {task.caseId}</span>}
                                <span>•</span>
                                <span>{task.assignedTo}</span>
                              </div>
                              {task.dueDate && (
                                <div
                                  className={`flex items-center space-x-1 ${
                                    task.status === "overdue" ? "text-red-600" : ""
                                  }`}
                                >
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDueDate(task.dueDate)}</span>
                                </div>
                              )}
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

        {/* Task Details */}
        <div className="lg:col-span-1">
          {selectedTask ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedTask.title}</CardTitle>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">{selectedTask.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-500">Status</p>
                    <Badge className={getStatusColor(selectedTask.status)}>
                      {selectedTask.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Priority</p>
                    <Badge className={getPriorityColor(selectedTask.priority)} variant="outline">
                      {selectedTask.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Assigned To</p>
                    <p>{selectedTask.assignedTo}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Type</p>
                    <p className="capitalize">{selectedTask.type.replace("_", " ")}</p>
                  </div>
                </div>

                {selectedTask.dueDate && (
                  <div>
                    <p className="font-medium text-gray-500 text-sm">Due Date</p>
                    <div
                      className={`flex items-center space-x-1 text-sm ${
                        selectedTask.status === "overdue" ? "text-red-600" : ""
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>{selectedTask.dueDate.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {selectedTask.caseId && (
                  <div>
                    <p className="font-medium text-gray-500 text-sm">Related Case</p>
                    <p className="text-sm">{selectedTask.caseId}</p>
                  </div>
                )}

                {selectedTask.estimatedHours && (
                  <div>
                    <p className="font-medium text-gray-500 text-sm">Estimated Hours</p>
                    <p className="text-sm">{selectedTask.estimatedHours}h</p>
                  </div>
                )}

                {selectedTask.status !== "completed" && (
                  <div className="space-y-2">
                    <Button onClick={() => handleCompleteTask(selectedTask.id)} className="w-full">
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>

                    {selectedTask.status === "pending" && (
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateTask(selectedTask.id, { status: "in_progress" })}
                        className="w-full"
                      >
                        Start Task
                      </Button>
                    )}
                  </div>
                )}

                {/* Notes Section */}
                <div>
                  <p className="font-medium text-gray-500 text-sm mb-2">Notes</p>
                  <div className="space-y-2">
                    {selectedTask.notes.map((note, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                        {note}
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 space-y-2">
                    <Textarea
                      placeholder="Add a note..."
                      className="text-sm"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          const note = e.currentTarget.value
                          if (note.trim()) {
                            handleAddNote(selectedTask.id, note)
                            e.currentTarget.value = ""
                          }
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500">Press Ctrl+Enter to add note</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Task</h3>
                  <p className="text-gray-600">Choose a task from the list to view details and take action</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
