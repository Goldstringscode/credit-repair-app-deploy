"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  ExternalLink,
  RefreshCw,
} from "lucide-react"
import {
  type TaxReminder,
  type TaxReminderSettings,
  generateTaxReminders,
  markReminderCompleted,
  mockTaxReminders,
  defaultTaxReminderSettings,
} from "@/lib/tax-reminder-system"

interface TaxReminderDashboardProps {
  userId: string
}

export function TaxReminderDashboard({ userId }: TaxReminderDashboardProps) {
  const [reminders, setReminders] = useState<TaxReminder[]>(mockTaxReminders)
  const [settings, setSettings] = useState<TaxReminderSettings>({
    ...defaultTaxReminderSettings,
    userId,
  })
  const [showSettings, setShowSettings] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState<TaxReminder | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "completed">("all")

  // Filter reminders based on selected filter
  const filteredReminders = reminders.filter((reminder) => {
    if (filter === "all") return true
    if (filter === "pending") return reminder.status === "pending"
    if (filter === "overdue") return reminder.status === "pending" && new Date() > reminder.dueDate
    if (filter === "completed") return reminder.status === "completed"
    return true
  })

  // Get upcoming reminders (next 30 days)
  const upcomingReminders = reminders.filter((reminder) => {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return reminder.status === "pending" && reminder.dueDate <= thirtyDaysFromNow
  })

  // Get overdue reminders
  const overdueReminders = reminders.filter(
    (reminder) => reminder.status === "pending" && new Date() > reminder.dueDate,
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const handleCompleteReminder = (reminderId: string) => {
    setReminders((prev) =>
      prev.map((reminder) => (reminder.id === reminderId ? markReminderCompleted(reminder) : reminder)),
    )
  }

  const generateNewReminders = () => {
    const currentYear = new Date().getFullYear()
    const newReminders = generateTaxReminders(userId, settings, currentYear, 31250) // $312.50 quarterly
    setReminders((prev) => [...prev, ...newReminders])
  }

  const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tax Reminders</h2>
          <p className="text-gray-600">Stay on top of your tax obligations and deadlines</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={generateNewReminders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Reminders
          </Button>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Reminder Settings</DialogTitle>
                <DialogDescription>Configure your tax reminder preferences</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Channels</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <Label>Email Notifications</Label>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <Label>SMS Notifications</Label>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, smsNotifications: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4 text-gray-500" />
                        <Label>Push Notifications</Label>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, pushNotifications: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Business Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Business Type</Label>
                      <Select
                        value={settings.businessType}
                        onValueChange={(value: any) => setSettings((prev) => ({ ...prev, businessType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                          <SelectItem value="llc">LLC</SelectItem>
                          <SelectItem value="corporation">Corporation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Estimated Tax Required</Label>
                      <Switch
                        checked={settings.estimatedTaxRequired}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({ ...prev, estimatedTaxRequired: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto-generate Reminders</Label>
                      <Switch
                        checked={settings.autoGenerateReminders}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({ ...prev, autoGenerateReminders: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button className="w-full">Save Settings</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{upcomingReminders.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-gray-600">Next 30 days</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueReminders.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2 text-xs text-red-600">Needs attention</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {reminders.filter((r) => r.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">This year</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{reminders.length}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-600" />
            </div>
            <div className="mt-2 text-xs text-gray-600">All reminders</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingReminders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Reminders</h3>
                <p className="text-gray-600">You're all caught up! Check back later for new reminders.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingReminders.map((reminder) => (
                <Card key={reminder.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(reminder.status)}
                          <h3 className="font-medium">{reminder.title}</h3>
                          <Badge className={getPriorityColor(reminder.priority)}>{reminder.priority}</Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{reminder.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Due: {reminder.dueDate.toLocaleDateString()}</span>
                          {reminder.metadata.estimatedAmount && (
                            <span>Amount: {formatCurrency(reminder.metadata.estimatedAmount)}</span>
                          )}
                        </div>
                        {reminder.metadata.links && reminder.metadata.links.length > 0 && (
                          <div className="flex items-center space-x-2 mt-3">
                            {reminder.metadata.links.map((link, index) => (
                              <Button key={index} variant="outline" size="sm" asChild>
                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                  {link.text}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button onClick={() => handleCompleteReminder(reminder.id)} size="sm">
                          Mark Complete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {overdueReminders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Overdue Items</h3>
                <p className="text-gray-600">Great job staying on top of your tax obligations!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have {overdueReminders.length} overdue tax reminder{overdueReminders.length !== 1 ? "s" : ""}.
                  Please address these items as soon as possible to avoid penalties.
                </AlertDescription>
              </Alert>
              {overdueReminders.map((reminder) => (
                <Card key={reminder.id} className="border-red-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <h3 className="font-medium text-red-900">{reminder.title}</h3>
                          <Badge className="bg-red-100 text-red-800">OVERDUE</Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{reminder.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-red-600 font-medium">Due: {reminder.dueDate.toLocaleDateString()}</span>
                          {reminder.metadata.estimatedAmount && (
                            <span>Amount: {formatCurrency(reminder.metadata.estimatedAmount)}</span>
                          )}
                        </div>
                        {reminder.metadata.links && reminder.metadata.links.length > 0 && (
                          <div className="flex items-center space-x-2 mt-3">
                            {reminder.metadata.links.map((link, index) => (
                              <Button key={index} variant="outline" size="sm" asChild>
                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                  {link.text}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button onClick={() => handleCompleteReminder(reminder.id)} size="sm" variant="destructive">
                          Mark Complete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {filteredReminders.map((reminder) => (
              <Card key={reminder.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(reminder.status)}
                        <h3 className="font-medium">{reminder.title}</h3>
                        <Badge className={getPriorityColor(reminder.priority)}>{reminder.priority}</Badge>
                        {reminder.status === "completed" && (
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{reminder.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Due: {reminder.dueDate.toLocaleDateString()}</span>
                        {reminder.metadata.estimatedAmount && (
                          <span>Amount: {formatCurrency(reminder.metadata.estimatedAmount)}</span>
                        )}
                        {reminder.completedAt && (
                          <span className="text-green-600">Completed: {reminder.completedAt.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    {reminder.status === "pending" && (
                      <Button onClick={() => handleCompleteReminder(reminder.id)} size="sm">
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {reminders.filter((r) => r.status === "completed").length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Items</h3>
                <p className="text-gray-600">Completed reminders will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reminders
                .filter((r) => r.status === "completed")
                .map((reminder) => (
                  <Card key={reminder.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <h3 className="font-medium">{reminder.title}</h3>
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{reminder.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Due: {reminder.dueDate.toLocaleDateString()}</span>
                            <span className="text-green-600">
                              Completed: {reminder.completedAt?.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
