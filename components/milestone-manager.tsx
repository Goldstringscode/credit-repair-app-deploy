"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Target, Award, Clock, MousePointer, Eye, Zap } from "lucide-react"
import MilestoneTracker, { type CustomMilestone, type MilestoneAnalytics } from "@/lib/milestone-tracker"

interface MilestoneManagerProps {
  className?: string
}

export default function MilestoneManager({ className }: MilestoneManagerProps) {
  const [milestones, setMilestones] = useState<CustomMilestone[]>([])
  const [analytics, setAnalytics] = useState<MilestoneAnalytics[]>([])
  const [selectedMilestone, setSelectedMilestone] = useState<CustomMilestone | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [tracker] = useState(() => MilestoneTracker.getInstance())

  // Form state
  const [formData, setFormData] = useState<Partial<CustomMilestone>>({
    name: "",
    description: "",
    journeyId: "",
    stepId: "",
    triggerType: "page_view",
    triggerConditions: {},
    points: 10,
    isRequired: false,
    category: "custom",
  })

  useEffect(() => {
    loadMilestones()
    loadAnalytics()
  }, [])

  const loadMilestones = () => {
    const allMilestones = tracker.getAllMilestones()
    setMilestones(allMilestones)
  }

  const loadAnalytics = () => {
    const allAnalytics = tracker.getAllAnalytics()
    setAnalytics(allAnalytics)
  }

  const handleCreateMilestone = () => {
    if (!formData.name || !formData.journeyId || !formData.triggerType) return

    const milestoneData = {
      ...formData,
      triggerConditions: formData.triggerConditions || {},
      points: formData.points || 10,
      isRequired: formData.isRequired || false,
      category: formData.category || "custom",
    } as Omit<CustomMilestone, "id" | "createdAt" | "updatedAt">

    tracker.createMilestone(milestoneData)
    loadMilestones()
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleUpdateMilestone = () => {
    if (!selectedMilestone || !formData.name) return

    tracker.updateMilestone(selectedMilestone.id, formData)
    loadMilestones()
    setIsEditDialogOpen(false)
    setSelectedMilestone(null)
    resetForm()
  }

  const handleDeleteMilestone = (milestone: CustomMilestone) => {
    if (confirm(`Are you sure you want to delete "${milestone.name}"?`)) {
      tracker.deleteMilestone(milestone.id)
      loadMilestones()
    }
  }

  const handleEditMilestone = (milestone: CustomMilestone) => {
    setSelectedMilestone(milestone)
    setFormData(milestone)
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      journeyId: "",
      stepId: "",
      triggerType: "page_view",
      triggerConditions: {},
      points: 10,
      isRequired: false,
      category: "custom",
    })
  }

  const updateTriggerCondition = (key: string, value: string | number) => {
    setFormData({
      ...formData,
      triggerConditions: {
        ...formData.triggerConditions,
        [key]: value,
      },
    })
  }

  const getTriggerIcon = (triggerType: CustomMilestone["triggerType"]) => {
    switch (triggerType) {
      case "page_view":
        return <Eye className="h-4 w-4" />
      case "button_click":
        return <MousePointer className="h-4 w-4" />
      case "form_submit":
        return <Target className="h-4 w-4" />
      case "time_spent":
        return <Clock className="h-4 w-4" />
      case "custom_event":
        return <Zap className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: CustomMilestone["category"]) => {
    switch (category) {
      case "onboarding":
        return "bg-blue-100 text-blue-800"
      case "engagement":
        return "bg-green-100 text-green-800"
      case "conversion":
        return "bg-purple-100 text-purple-800"
      case "retention":
        return "bg-orange-100 text-orange-800"
      case "custom":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderTriggerConditionsForm = () => {
    switch (formData.triggerType) {
      case "page_view":
        return (
          <div className="space-y-2">
            <Label htmlFor="url">URL Pattern</Label>
            <Input
              id="url"
              placeholder="/mlm/dashboard"
              value={formData.triggerConditions?.url || ""}
              onChange={(e) => updateTriggerCondition("url", e.target.value)}
            />
          </div>
        )
      case "button_click":
      case "form_submit":
        return (
          <div className="space-y-2">
            <Label htmlFor="selector">CSS Selector</Label>
            <Input
              id="selector"
              placeholder="button[data-action='submit']"
              value={formData.triggerConditions?.selector || ""}
              onChange={(e) => updateTriggerCondition("selector", e.target.value)}
            />
          </div>
        )
      case "time_spent":
        return (
          <div className="space-y-2">
            <Label htmlFor="timeThreshold">Time Threshold (seconds)</Label>
            <Input
              id="timeThreshold"
              type="number"
              placeholder="300"
              value={formData.triggerConditions?.timeThreshold || ""}
              onChange={(e) => updateTriggerCondition("timeThreshold", Number.parseInt(e.target.value))}
            />
          </div>
        )
      case "custom_event":
        return (
          <div className="space-y-2">
            <Label htmlFor="customEventName">Custom Event Name</Label>
            <Input
              id="customEventName"
              placeholder="referral_sent"
              value={formData.triggerConditions?.customEventName || ""}
              onChange={(e) => updateTriggerCondition("customEventName", e.target.value)}
            />
          </div>
        )
      default:
        return null
    }
  }

  const getMilestoneAnalytics = (milestoneId: string) => {
    return analytics.find((a) => a.milestoneId === milestoneId)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Milestone Manager</h2>
          <p className="text-gray-600">Create and manage custom journey milestones</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Milestone
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Milestone</DialogTitle>
              <DialogDescription>Define a custom milestone to track user progress</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Milestone Name</Label>
                  <Input
                    id="name"
                    placeholder="First Dashboard Visit"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    placeholder="10"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="User visited the dashboard for the first time"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="journeyId">Journey ID</Label>
                  <Select
                    value={formData.journeyId}
                    onValueChange={(value) => setFormData({ ...formData, journeyId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select journey" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mlm_onboarding">MLM Onboarding</SelectItem>
                      <SelectItem value="mlm_engagement">MLM Engagement</SelectItem>
                      <SelectItem value="mlm_conversion">MLM Conversion</SelectItem>
                      <SelectItem value="mlm_retention">MLM Retention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value as CustomMilestone["category"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="conversion">Conversion</SelectItem>
                      <SelectItem value="retention">Retention</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="triggerType">Trigger Type</Label>
                <Select
                  value={formData.triggerType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, triggerType: value as CustomMilestone["triggerType"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page_view">Page View</SelectItem>
                    <SelectItem value="button_click">Button Click</SelectItem>
                    <SelectItem value="form_submit">Form Submit</SelectItem>
                    <SelectItem value="time_spent">Time Spent</SelectItem>
                    <SelectItem value="custom_event">Custom Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderTriggerConditionsForm()}

              <div className="flex items-center space-x-2">
                <Switch
                  id="isRequired"
                  checked={formData.isRequired}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
                />
                <Label htmlFor="isRequired">Required Milestone</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMilestone}>Create Milestone</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="milestones" className="space-y-4">
        <TabsList>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {milestones.map((milestone) => {
              const milestoneAnalytics = getMilestoneAnalytics(milestone.id)
              return (
                <Card key={milestone.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTriggerIcon(milestone.triggerType)}
                        <span className="truncate">{milestone.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditMilestone(milestone)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteMilestone(milestone)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>{milestone.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getCategoryColor(milestone.category)}>{milestone.category}</Badge>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">{milestone.points} pts</span>
                        </div>
                      </div>

                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Journey:</strong> {milestone.journeyId}
                        </div>
                        <div>
                          <strong>Trigger:</strong> {milestone.triggerType.replace(/_/g, " ")}
                        </div>
                        {milestone.isRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>

                      {milestoneAnalytics && (
                        <div className="pt-2 border-t space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Completion Rate:</span>
                            <span className="font-medium">{milestoneAnalytics.completionRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Completions:</span>
                            <span className="font-medium">{milestoneAnalytics.completions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Points Awarded:</span>
                            <span className="font-medium">{milestoneAnalytics.pointsAwarded}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {analytics.map((analytic) => {
              const milestone = milestones.find((m) => m.id === analytic.milestoneId)
              if (!milestone) return null

              return (
                <Card key={analytic.milestoneId}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getTriggerIcon(milestone.triggerType)}
                      <span className="truncate">{milestone.name}</span>
                    </CardTitle>
                    <CardDescription>Performance Analytics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Total Attempts</div>
                          <div className="text-2xl font-bold">{analytic.totalAttempts}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Completions</div>
                          <div className="text-2xl font-bold text-green-600">{analytic.completions}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Completion Rate</span>
                          <span className="font-medium">{analytic.completionRate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${Math.min(analytic.completionRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-2 border-t space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Points Awarded:</span>
                          <span className="font-medium text-yellow-600">{analytic.pointsAwarded}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg. Time:</span>
                          <span className="font-medium">{analytic.averageTimeToComplete.toFixed(1)}s</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription>Update milestone configuration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Milestone Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-points">Points</Label>
                <Input
                  id="edit-points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {renderTriggerConditionsForm()}

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isRequired"
                checked={formData.isRequired}
                onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
              />
              <Label htmlFor="edit-isRequired">Required Milestone</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateMilestone}>Update Milestone</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
