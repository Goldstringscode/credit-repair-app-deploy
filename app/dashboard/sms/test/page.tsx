"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TestTube,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Phone,
  MessageSquare,
  Zap,
  Target,
  AlertTriangle,
  BarChart3,
  Activity
} from "lucide-react"

interface TestResult {
  id: string
  testType: string
  templateId?: string
  phoneNumber: string
  status: 'success' | 'failed' | 'pending'
  message: string
  timestamp: string
  error?: string
  cost?: number
}

interface SMSTemplate {
  id: string
  name: string
  category: string
  body: string
  variables: string[]
}

export default function SMSTestPage() {
  const [templates, setTemplates] = useState<SMSTemplate[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("single")

  // Single SMS test form
  const [singleTest, setSingleTest] = useState({
    phoneNumber: "",
    message: "",
    templateId: ""
  })

  // Template test form
  const [templateTest, setTemplateTest] = useState({
    phoneNumber: "",
    templateId: "",
    variables: ""
  })

  // Bulk test form
  const [bulkTest, setBulkTest] = useState({
    phoneNumbers: "",
    templateId: "",
    variables: ""
  })

  // Trigger test form
  const [triggerTest, setTriggerTest] = useState({
    event: "",
    testData: ""
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/sms?action=get_templates')
      const data = await response.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const addTestResult = (result: Omit<TestResult, 'id' | 'timestamp'>) => {
    const newResult: TestResult = {
      ...result,
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }
    setTestResults(prev => [newResult, ...prev])
  }

  const testSingleSMS = async () => {
    if (!singleTest.phoneNumber || (!singleTest.message && !singleTest.templateId)) {
      alert('Please provide phone number and either message or template')
      return
    }

    setLoading(true)
    addTestResult({
      testType: 'Single SMS',
      templateId: singleTest.templateId,
      phoneNumber: singleTest.phoneNumber,
      status: 'pending',
      message: 'Sending SMS...'
    })

    try {
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: singleTest.templateId ? 'send_template' : 'send_sms',
          phoneNumber: singleTest.phoneNumber,
          message: singleTest.message,
          templateId: singleTest.templateId,
          variables: { userName: 'Test User' }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        addTestResult({
          testType: 'Single SMS',
          templateId: singleTest.templateId,
          phoneNumber: singleTest.phoneNumber,
          status: 'success',
          message: 'SMS sent successfully',
          cost: result.cost
        })
        setSingleTest({ phoneNumber: "", message: "", templateId: "" })
      } else {
        addTestResult({
          testType: 'Single SMS',
          templateId: singleTest.templateId,
          phoneNumber: singleTest.phoneNumber,
          status: 'failed',
          message: 'Failed to send SMS',
          error: result.error
        })
      }
    } catch (error) {
      addTestResult({
        testType: 'Single SMS',
        templateId: singleTest.templateId,
        phoneNumber: singleTest.phoneNumber,
        status: 'failed',
        message: 'Network error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testTemplateSMS = async () => {
    if (!templateTest.phoneNumber || !templateTest.templateId) {
      alert('Please provide phone number and template')
      return
    }

    setLoading(true)
    addTestResult({
      testType: 'Template SMS',
      templateId: templateTest.templateId,
      phoneNumber: templateTest.phoneNumber,
      status: 'pending',
      message: 'Sending template SMS...'
    })

    try {
      const variables = templateTest.variables ? JSON.parse(templateTest.variables) : {}
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_template',
          phoneNumber: templateTest.phoneNumber,
          templateId: templateTest.templateId,
          variables: { userName: 'Test User', ...variables }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        addTestResult({
          testType: 'Template SMS',
          templateId: templateTest.templateId,
          phoneNumber: templateTest.phoneNumber,
          status: 'success',
          message: 'Template SMS sent successfully',
          cost: result.cost
        })
        setTemplateTest({ phoneNumber: "", templateId: "", variables: "" })
      } else {
        addTestResult({
          testType: 'Template SMS',
          templateId: templateTest.templateId,
          phoneNumber: templateTest.phoneNumber,
          status: 'failed',
          message: 'Failed to send template SMS',
          error: result.error
        })
      }
    } catch (error) {
      addTestResult({
        testType: 'Template SMS',
        templateId: templateTest.templateId,
        phoneNumber: templateTest.phoneNumber,
        status: 'failed',
        message: 'Network error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testBulkSMS = async () => {
    if (!bulkTest.phoneNumbers || !bulkTest.templateId) {
      alert('Please provide phone numbers and template')
      return
    }

    const phoneNumbers = bulkTest.phoneNumbers.split('\n').filter(p => p.trim())
    if (phoneNumbers.length === 0) {
      alert('Please provide at least one phone number')
      return
    }

    setLoading(true)
    addTestResult({
      testType: 'Bulk SMS',
      templateId: bulkTest.templateId,
      phoneNumber: `${phoneNumbers.length} recipients`,
      status: 'pending',
      message: 'Sending bulk SMS...'
    })

    try {
      const variables = bulkTest.variables ? JSON.parse(bulkTest.variables) : {}
      const messages = phoneNumbers.map(phone => ({
        to: phone,
        body: 'Test message', // This would be replaced by template
        from: undefined
      }))

      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_bulk',
          messages
        })
      })

      const result = await response.json()
      
      if (result.success) {
        addTestResult({
          testType: 'Bulk SMS',
          templateId: bulkTest.templateId,
          phoneNumber: `${phoneNumbers.length} recipients`,
          status: 'success',
          message: `Bulk SMS sent: ${result.totalSent} successful, ${result.totalFailed} failed`
        })
        setBulkTest({ phoneNumbers: "", templateId: "", variables: "" })
      } else {
        addTestResult({
          testType: 'Bulk SMS',
          templateId: bulkTest.templateId,
          phoneNumber: `${phoneNumbers.length} recipients`,
          status: 'failed',
          message: 'Failed to send bulk SMS',
          error: result.error
        })
      }
    } catch (error) {
      addTestResult({
        testType: 'Bulk SMS',
        templateId: bulkTest.templateId,
        phoneNumber: `${phoneNumbers.length} recipients`,
        status: 'failed',
        message: 'Network error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testTrigger = async () => {
    if (!triggerTest.event) {
      alert('Please provide event name')
      return
    }

    setLoading(true)
    addTestResult({
      testType: 'Trigger Test',
      phoneNumber: 'Event Trigger',
      status: 'pending',
      message: 'Testing trigger...'
    })

    try {
      const testData = triggerTest.testData ? JSON.parse(triggerTest.testData) : {}
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger_event',
          event: triggerTest.event,
          eventData: {
            userName: 'Test User',
            phoneNumber: '+1234567890',
            ...testData
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        addTestResult({
          testType: 'Trigger Test',
          phoneNumber: 'Event Trigger',
          status: 'success',
          message: `Trigger '${triggerTest.event}' executed successfully`
        })
        setTriggerTest({ event: "", testData: "" })
      } else {
        addTestResult({
          testType: 'Trigger Test',
          phoneNumber: 'Event Trigger',
          status: 'failed',
          message: 'Failed to execute trigger',
          error: result.error
        })
      }
    } catch (error) {
      addTestResult({
        testType: 'Trigger Test',
        phoneNumber: 'Event Trigger',
        status: 'failed',
        message: 'Network error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    total: testResults.length,
    successful: testResults.filter(r => r.status === 'success').length,
    failed: testResults.filter(r => r.status === 'failed').length,
    pending: testResults.filter(r => r.status === 'pending').length
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SMS Testing Suite</h1>
        <p className="text-gray-600">Test and validate SMS functionality for credit repair and MLM systems.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <TestTube className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">
                  {stats.total > 0 ? ((stats.successful / stats.total) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single">Single SMS</TabsTrigger>
          <TabsTrigger value="template">Template SMS</TabsTrigger>
          <TabsTrigger value="bulk">Bulk SMS</TabsTrigger>
          <TabsTrigger value="trigger">Trigger Test</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Single SMS Test</CardTitle>
              <CardDescription>Test individual SMS message sending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    placeholder="+1234567890"
                    value={singleTest.phoneNumber}
                    onChange={(e) => setSingleTest({...singleTest, phoneNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Template (Optional)</label>
                  <Select onValueChange={(value) => setSingleTest({...singleTest, templateId: value})}>
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
                  value={singleTest.message}
                  onChange={(e) => setSingleTest({...singleTest, message: e.target.value})}
                  rows={3}
                />
              </div>

              <Button onClick={testSingleSMS} disabled={loading} className="w-full">
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Test SMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template SMS Test</CardTitle>
              <CardDescription>Test SMS templates with variable replacement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    placeholder="+1234567890"
                    value={templateTest.phoneNumber}
                    onChange={(e) => setTemplateTest({...templateTest, phoneNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Template</label>
                  <Select onValueChange={(value) => setTemplateTest({...templateTest, templateId: value})}>
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
                <label className="text-sm font-medium">Variables (JSON)</label>
                <Textarea
                  placeholder='{"userName": "John Doe", "amount": "99.99"}'
                  value={templateTest.variables}
                  onChange={(e) => setTemplateTest({...templateTest, variables: e.target.value})}
                  rows={3}
                />
              </div>

              <Button onClick={testTemplateSMS} disabled={loading} className="w-full">
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                Send Template SMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk SMS Test</CardTitle>
              <CardDescription>Test sending SMS to multiple recipients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Phone Numbers (one per line)</label>
                <Textarea
                  placeholder="+1234567890\n+1987654321\n+1555123456"
                  value={bulkTest.phoneNumbers}
                  onChange={(e) => setBulkTest({...bulkTest, phoneNumbers: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Template</label>
                <Select onValueChange={(value) => setBulkTest({...bulkTest, templateId: value})}>
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

              <div>
                <label className="text-sm font-medium">Variables (JSON)</label>
                <Textarea
                  placeholder='{"userName": "John Doe", "amount": "99.99"}'
                  value={bulkTest.variables}
                  onChange={(e) => setBulkTest({...bulkTest, variables: e.target.value})}
                  rows={3}
                />
              </div>

              <Button onClick={testBulkSMS} disabled={loading} className="w-full">
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Target className="h-4 w-4 mr-2" />
                )}
                Send Bulk SMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trigger" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trigger Test</CardTitle>
              <CardDescription>Test automated SMS triggers and events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Event Name</label>
                <Input
                  placeholder="credit_score_updated"
                  value={triggerTest.event}
                  onChange={(e) => setTriggerTest({...triggerTest, event: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Test Data (JSON)</label>
                <Textarea
                  placeholder='{"userName": "John Doe", "previousScore": 650, "newScore": 720, "scoreIncrease": 70}'
                  value={triggerTest.testData}
                  onChange={(e) => setTriggerTest({...triggerTest, testData: e.target.value})}
                  rows={4}
                />
              </div>

              <Button onClick={testTrigger} disabled={loading} className="w-full">
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Test Trigger
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Results */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Recent SMS test results and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No test results yet. Run some tests to see results here.</p>
            ) : (
              testResults.map(result => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.testType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                      {result.cost && (
                        <span className="text-sm text-gray-500">
                          ${result.cost.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {result.phoneNumber}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    {result.message}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(result.timestamp).toLocaleString()}
                  </p>
                  {result.error && (
                    <p className="text-xs text-red-500 mt-1">
                      Error: {result.error}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
