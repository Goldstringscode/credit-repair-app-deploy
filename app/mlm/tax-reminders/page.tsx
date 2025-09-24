"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Calendar, Bell, DollarSign, FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react"

interface TaxReminder {
  id: string
  title: string
  description: string
  dueDate: Date
  type: "quarterly" | "annual" | "monthly" | "deadline"
  priority: "high" | "medium" | "low"
  status: "upcoming" | "due" | "overdue" | "completed"
  estimatedAmount?: number
  formRequired?: string
  reminderDays: number[]
  isEnabled: boolean
}

interface ReminderSettings {
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  advanceDays: number
  businessHoursOnly: boolean
}

export default function TaxRemindersPage() {
  const [reminders, setReminders] = useState<TaxReminder[]>([])
  const [settings, setSettings] = useState<ReminderSettings>({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    advanceDays: 7,
    businessHoursOnly: true,
  })
  const [customReminder, setCustomReminder] = useState({
    title: "",
    description: "",
    dueDate: "",
    type: "quarterly" as const,
    estimatedAmount: "",
  })

  useEffect(() => {
    // Generate tax reminders for 2024
    const currentYear = new Date().getFullYear()
    const defaultReminders: TaxReminder[] = [
      {
        id: "q1-2024",
        title: "Q1 2024 Estimated Tax Payment",
        description: "First quarter estimated tax payment for 2024 tax year",
        dueDate: new Date(currentYear, 3, 15), // April 15
        type: "quarterly",
        priority: "high",
        status: "upcoming",
        estimatedAmount: 3500,
        formRequired: "Form 1040ES",
        reminderDays: [30, 14, 7, 3, 1],
        isEnabled: true,
      },
      {
        id: "q2-2024",
        title: "Q2 2024 Estimated Tax Payment",
        description: "Second quarter estimated tax payment for 2024 tax year",
        dueDate: new Date(currentYear, 5, 17), // June 17 (15th falls on Saturday)
        type: "quarterly",
        priority: "high",
        status: "upcoming",
        estimatedAmount: 3500,
        formRequired: "Form 1040ES",
        reminderDays: [30, 14, 7, 3, 1],
        isEnabled: true,
      },
      {
        id: "q3-2024",
        title: "Q3 2024 Estimated Tax Payment",
        description: "Third quarter estimated tax payment for 2024 tax year",
        dueDate: new Date(currentYear, 8, 16), // September 16
        type: "quarterly",
        priority: "high",
        status: "upcoming",
        estimatedAmount: 3500,
        formRequired: "Form 1040ES",
        reminderDays: [30, 14, 7, 3, 1],
        isEnabled: true,
      },
      {
        id: "q4-2024",
        title: "Q4 2024 Estimated Tax Payment",
        description: "Fourth quarter estimated tax payment for 2024 tax year",
        dueDate: new Date(currentYear + 1, 0, 15), // January 15, 2025
        type: "quarterly",
        priority: "high",
        status: "upcoming",
        estimatedAmount: 3500,
        formRequired: "Form 1040ES",
        reminderDays: [30, 14, 7, 3, 1],
        isEnabled: true,
      },
      {
        id: "annual-2023",
        title: "2023 Tax Return Filing",
        description: "File annual tax return for 2023 tax year",
        dueDate: new Date(currentYear, 3, 15), // April 15
        type: "annual",
        priority: "high",
        status: "upcoming",
        formRequired: "Form 1040, Schedule C, Schedule SE",
        reminderDays: [60, 30, 14, 7, 3, 1],
        isEnabled: true,
      },
      {
        id: "extension-2023",
        title: "2023 Tax Extension Deadline",
        description: "Final deadline for filing 2023 tax return (if extension was filed)",
        dueDate: new Date(currentYear, 9, 15), // October 15
        type: "deadline",
        priority: "medium",
        status: "upcoming",
        formRequired: "Form 1040",
        reminderDays: [30, 14, 7, 3, 1],
        isEnabled: false,
      },
      {
        id: "1099-deadline",
        title: "1099-NEC Forms Due",
        description: "Deadline to send 1099-NEC forms to contractors",
        dueDate: new Date(currentYear + 1, 0, 31), // January 31, 2025
        type: "deadline",
        priority: "medium",
        status: "upcoming",
        formRequired: "Form 1099-NEC",
        reminderDays: [45, 30, 14, 7, 3, 1],
        isEnabled: true,
      },
      {
        id: "sales-tax-monthly",
        title: "Monthly Sales Tax Filing",
        description: "File monthly sales tax return (if applicable)",
        dueDate: new Date(currentYear, new Date().getMonth() + 1, 20), // 20th of next month
        type: "monthly",
        priority: "low",
        status: "upcoming",
        reminderDays: [7, 3, 1],
        isEnabled: false,
      },
    ]

    // Update status based on current date
    const now = new Date()
    const updatedReminders = defaultReminders.map((reminder) => {
      const daysDiff = Math.ceil((reminder.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff < 0) {
        return { ...reminder, status: "overdue" as const }
      } else if (daysDiff <= 7) {
        return { ...reminder, status: "due" as const }
      } else {
        return { ...reminder, status: "upcoming" as const }
      }
    })

    setReminders(updatedReminders)
  }, [])

  const getStatusIcon = (status: TaxReminder["status"]) => {
    switch (status) {
      case "upcoming":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "due":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getStatusBadge = (status: TaxReminder["status"]) => {
    const variants = {
      upcoming: "secondary",
      due: "secondary",
      overdue: "destructive",
      completed: "default",
    } as const

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    )
  }

  const getPriorityColor = (priority: TaxReminder["priority"]) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-yellow-200 bg-yellow-50"
      case "low":
        return "border-blue-200 bg-blue-50"
    }
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date()
    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff
  }

  const toggleReminderStatus = (id: string) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id
          ? {
              ...reminder,
              status: reminder.status === "completed" ? "upcoming" : "completed",
            }
          : reminder,
      ),
    )
  }

  const toggleReminderEnabled = (id: string) => {
    setReminders((prev) =>
      prev.map((reminder) => (reminder.id === id ? { ...reminder, isEnabled: !reminder.isEnabled } : reminder)),
    )
  }

  const addCustomReminder = () => {
    if (!customReminder.title || !customReminder.dueDate) return

    const newReminder: TaxReminder = {
      id: `custom-${Date.now()}`,
      title: customReminder.title,
      description: customReminder.description,
      dueDate: new Date(customReminder.dueDate),
      type: customReminder.type,
      priority: "medium",
      status: "upcoming",
      estimatedAmount: customReminder.estimatedAmount ? Number.parseInt(customReminder.estimatedAmount) : undefined,
      reminderDays: [7, 3, 1],
      isEnabled: true,
    }

    setReminders((prev) => [...prev, newReminder])
    setCustomReminder({
      title: "",
      description: "",
      dueDate: "",
      type: "quarterly",
      estimatedAmount: "",
    })
  }

  const testNotification = async () => {
    // Simulate sending test notification
    alert("Test notification sent! Check your email, SMS, and push notifications.")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tax Reminders & Deadlines</h1>
        <p className="text-gray-600">
          Stay on top of your tax obligations with automated reminders for quarterly payments, annual filings, and
          important deadlines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings & Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email">Email Notifications</Label>
                <Switch
                  id="email"
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailEnabled: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms">SMS Notifications</Label>
                <Switch
                  id="sms"
                  checked={settings.smsEnabled}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, smsEnabled: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push">Push Notifications</Label>
                <Switch
                  id="push"
                  checked={settings.pushEnabled}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, pushEnabled: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="business">Business Hours Only</Label>
                <Switch
                  id="business"
                  checked={settings.businessHoursOnly}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, businessHoursOnly: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advance">Default Advance Days</Label>
                <Input
                  id="advance"
                  type="number"
                  value={settings.advanceDays}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, advanceDays: Number.parseInt(e.target.value) || 7 }))
                  }
                  min="1"
                  max="90"
                />
              </div>
              <Button onClick={testNotification} variant="outline" className="w-full bg-transparent">
                Test Notifications
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Custom Reminder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={customReminder.title}
                  onChange={(e) => setCustomReminder((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., State Tax Filing"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={customReminder.description}
                  onChange={(e) => setCustomReminder((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={customReminder.dueDate}
                  onChange={(e) => setCustomReminder((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={customReminder.type}
                  onChange={(e) => setCustomReminder((prev) => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                  <option value="monthly">Monthly</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Estimated Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={customReminder.estimatedAmount}
                  onChange={(e) => setCustomReminder((prev) => ({ ...prev, estimatedAmount: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <Button onClick={addCustomReminder} className="w-full">
                Add Reminder
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Reminders List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Tax Reminders</span>
                </div>
                <Badge variant="secondary">{reminders.filter((r) => r.isEnabled).length} active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reminders
                  .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                  .map((reminder) => {
                    const daysUntil = getDaysUntilDue(reminder.dueDate)
                    return (
                      <div
                        key={reminder.id}
                        className={`border rounded-lg p-4 ${getPriorityColor(reminder.priority)} ${
                          !reminder.isEnabled ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(reminder.status)}
                            <h3 className="font-semibold">{reminder.title}</h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(reminder.status)}
                            <Switch
                              checked={reminder.isEnabled}
                              onCheckedChange={() => toggleReminderEnabled(reminder.id)}
                              size="sm"
                            />
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{reminder.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p>
                              <strong>Due Date:</strong> {reminder.dueDate.toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Type:</strong> {reminder.type}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Days Until Due:</strong>{" "}
                              <span
                                className={
                                  daysUntil < 0 ? "text-red-600" : daysUntil <= 7 ? "text-yellow-600" : "text-green-600"
                                }
                              >
                                {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days`}
                              </span>
                            </p>
                            <p>
                              <strong>Priority:</strong> {reminder.priority}
                            </p>
                          </div>
                        </div>

                        {reminder.estimatedAmount && (
                          <div className="flex items-center space-x-2 mb-3">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-sm">
                              <strong>Estimated Amount:</strong> {formatCurrency(reminder.estimatedAmount)}
                            </span>
                          </div>
                        )}

                        {reminder.formRequired && (
                          <div className="flex items-center space-x-2 mb-3">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">
                              <strong>Forms Required:</strong> {reminder.formRequired}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Reminders: {reminder.reminderDays.join(", ")} days before
                          </div>
                          <Button
                            onClick={() => toggleReminderStatus(reminder.id)}
                            size="sm"
                            variant={reminder.status === "completed" ? "outline" : "default"}
                          >
                            {reminder.status === "completed" ? "Mark Incomplete" : "Mark Complete"}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
