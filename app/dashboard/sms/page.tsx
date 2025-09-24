"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageSquare,
  Send,
  Settings,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  AlertTriangle,
  TrendingUp,
  Activity,
  Zap,
  Target,
  TestTube,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw
} from "lucide-react"

interface SMSTemplate {
  id: string
  name: string
  category: string
  variables: string[]
  isActive: boolean
  usageCount: number
}

interface SMSTrigger {
  id: string
  name: string
  event: string
  templateId: string
  isActive: boolean
  triggerCount: number
  lastTriggered?: string
}

interface SMSLog {
  id: string
  triggerId: string
  recipient: string
  templateId: string
  status: 'sent' | 'failed' | 'pending'
  sentAt: string
  error?: string
  cost?: number
}

interface SMSStats {
  totalSent: number
  totalFailed: number
  totalCost: number
  successRate: number
  triggersCount: number
  activeTriggersCount: number
}

export default function SMSDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [templates, setTemplates] = useState<SMSTemplate[]>([])
  const [triggers, setTriggers] = useState<SMSTrigger[]>([])
  const [logs, setLogs] = useState<SMSLog[]>([])
  const [stats, setStats] = useState<SMSStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Send SMS form state
  const [sendForm, setSendForm] = useState({
    phoneNumber: "",
    message: "",
    templateId: ""
  })

  // Test trigger form state
  const [testForm, setTestForm] = useState({
    triggerId: "",
    testData: ""
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [templatesRes, triggersRes, logsRes, statsRes] = await Promise.all([
        fetch('/api/sms?action=get_templates'),
        fetch('/api/sms/triggers'),
        fetch('/api/sms?action=get_logs&limit=50'),
        fetch('/api/sms?action=get_stats')
      ])

      const templatesData = await templatesRes.json()
      const triggersData = await triggersRes.json()
      const logsData = await logsRes.json()
      const statsData = await statsRes.json()

      if (templatesData.success) setTemplates(templatesData.templates)
      if (triggersData.success) setTriggers(triggersData.triggers)
      if (logsData.success) setLogs(logsData.logs)
      if (statsData.success) setStats(statsData.stats)
    } catch (error) {
      console.error('Failed to load SMS data:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendSMS = async () => {
    if (!sendForm.phoneNumber || (!sendForm.message && !sendForm.templateId)) {
      alert('Please provide phone number and either message or template')
      return
    }

    try {
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: sendForm.templateId ? 'send_template' : 'send_sms',
          phoneNumber: sendForm.phoneNumber,
          message: sendForm.message,
          templateId: sendForm.templateId,
          variables: { userName: 'Test User' }
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('SMS sent successfully!')
        setSendForm({ phoneNumber: "", message: "", templateId: "" })
        loadData()
      } else {
        alert(`Failed to send SMS: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to send SMS:', error)
      alert('Failed to send SMS')
    }
  }

  const testTrigger = async () => {
    if (!testForm.triggerId) {
      alert('Please select a trigger to test')
      return
    }

    try {
      const response = await fetch('/api/sms/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_trigger',
          testTriggerId: testForm.triggerId,
          testData: {
            userName: 'Test User',
            phoneNumber: '+1234567890',
            ...JSON.parse(testForm.testData || '{}')
          }
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('Trigger test executed successfully!')
        loadData()
      } else {
        alert(`Failed to test trigger: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to test trigger:', error)
      alert('Failed to test trigger')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading SMS Dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SMS Dashboard</h1>
        <p className="text-gray-600">Manage SMS notifications and automated texting for credit repair and MLM systems.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="send">Send SMS</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSent || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalFailed || 0} failed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.successRate?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  SMS delivery rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.totalCost?.toFixed(2) || 0}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Triggers</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeTriggersCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  of {stats?.triggersCount || 0} total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Send SMS
                </CardTitle>
                <CardDescription>Send individual SMS messages</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => setActiveTab("send")}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Manage Triggers
                </CardTitle>
                <CardDescription>Configure automated SMS triggers</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setActiveTab("triggers")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Triggers
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  View Logs
                </CardTitle>
                <CardDescription>Monitor SMS delivery and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setActiveTab("logs")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send SMS Message</CardTitle>
              <CardDescription>Send individual SMS messages or use templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    placeholder="+1234567890"
                    value={sendForm.phoneNumber}
                    onChange={(e) => setSendForm({...sendForm, phoneNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Template (Optional)</label>
                  <Select onValueChange={(value) => setSendForm({...sendForm, templateId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Enter your message here..."
                  value={sendForm.message}
                  onChange={(e) => setSendForm({...sendForm, message: e.target.value})}
                  rows={4}
                />
              </div>

              <Button onClick={sendSMS} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send SMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMS Templates</CardTitle>
              <CardDescription>Manage SMS message templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map(template => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.category}
                        </Badge>
                        <Badge variant="outline">
                          {template.usageCount} uses
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      Variables: {template.variables.join(', ')}
                    </p>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <TestTube className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test SMS Trigger</CardTitle>
              <CardDescription>Test automated SMS triggers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Select Trigger</label>
                  <Select onValueChange={(value) => setTestForm({...testForm, triggerId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger to test" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggers.map(trigger => (
                        <SelectItem key={trigger.id} value={trigger.id}>
                          {trigger.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Test Data (JSON)</label>
                  <Input
                    placeholder='{"userName": "Test User", "amount": "100"}'
                    value={testForm.testData}
                    onChange={(e) => setTestForm({...testForm, testData: e.target.value})}
                  />
                </div>
              </div>
              
              <Button onClick={testTrigger} className="w-full">
                <TestTube className="h-4 w-4 mr-2" />
                Test Trigger
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Triggers</CardTitle>
              <CardDescription>Manage automated SMS triggers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {triggers.map(trigger => (
                  <div key={trigger.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{trigger.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={trigger.isActive ? "default" : "secondary"}>
                          {trigger.event}
                        </Badge>
                        <Badge variant="outline">
                          {trigger.triggerCount} triggers
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      Template: {trigger.templateId}
                    </p>
                    {trigger.lastTriggered && (
                      <p className="text-xs text-gray-400">
                        Last triggered: {new Date(trigger.lastTriggered).toLocaleString()}
                      </p>
                    )}
                    <div className="flex space-x-2 mt-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMS Logs</CardTitle>
              <CardDescription>Recent SMS delivery logs and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.map(log => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className="font-medium">{log.recipient}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                        {log.cost && (
                          <span className="text-sm text-gray-500">
                            ${log.cost.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      Template: {log.templateId}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      {log.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.sentAt).toLocaleString()}
                    </p>
                    {log.error && (
                      <p className="text-xs text-red-500 mt-1">
                        Error: {log.error}
                      </p>
                    )}
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
