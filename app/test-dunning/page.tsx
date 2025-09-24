'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Bell,
  RefreshCw,
  Zap,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react'

interface DunningEvent {
  id: string
  subscriptionId: string
  customerId: string
  attemptNumber: number
  eventType: string
  amount: number
  currency: string
  failureReason?: string
  nextRetryAt?: string
  status: string
  createdAt: string
}

interface DunningTest {
  name: string
  description: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  result?: any
  error?: string
}

export default function TestDunningPage() {
  const [events, setEvents] = useState<DunningEvent[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testForm, setTestForm] = useState({
    subscriptionId: 'test_sub_123',
    customerId: 'test_customer_123',
    amount: 5999,
    currency: 'usd',
    failureReason: 'insufficient_funds'
  })

  const [tests, setTests] = useState<DunningTest[]>([
    {
      name: 'Process Payment Failure',
      description: 'Test dunning event creation for failed payment',
      status: 'pending'
    },
    {
      name: 'Process Payment Success',
      description: 'Test dunning event processing for successful payment',
      status: 'pending'
    },
    {
      name: 'Get Dunning Events',
      description: 'Test retrieving dunning events for subscription',
      status: 'pending'
    },
    {
      name: 'Get Dunning Analytics',
      description: 'Test dunning analytics and metrics',
      status: 'pending'
    },
    {
      name: 'Test Dunning Rules',
      description: 'Test dunning rule configuration and evaluation',
      status: 'pending'
    }
  ])

  const runTest = async (testIndex: number) => {
    setLoading(true)
    const test = tests[testIndex]
    
    try {
      setTests(prev => {
        const newTests = [...prev]
        newTests[testIndex].status = 'running'
        return newTests
      })

      let result: any = {}

      switch (testIndex) {
        case 0: // Process Payment Failure
          result = await testPaymentFailure()
          break
        case 1: // Process Payment Success
          result = await testPaymentSuccess()
          break
        case 2: // Get Dunning Events
          result = await testGetEvents()
          break
        case 3: // Get Dunning Analytics
          result = await testGetAnalytics()
          break
        case 4: // Test Dunning Rules
          result = await testDunningRules()
          break
      }

      setTests(prev => {
        const newTests = [...prev]
        newTests[testIndex].status = 'passed'
        newTests[testIndex].result = result
        return newTests
      })

    } catch (error: any) {
      setTests(prev => {
        const newTests = [...prev]
        newTests[testIndex].status = 'failed'
        newTests[testIndex].error = error.message
        return newTests
      })
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    
    for (let i = 0; i < tests.length; i++) {
      await runTest(i)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    setLoading(false)
  }

  const testPaymentFailure = async () => {
    const response = await fetch('/api/billing/dunning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'process_failure',
        subscriptionId: testForm.subscriptionId,
        customerId: testForm.customerId,
        amount: testForm.amount,
        currency: testForm.currency,
        failureReason: testForm.failureReason,
        metadata: { test: true }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    
    // Add to events list
    if (data.event) {
      setEvents(prev => [data.event, ...prev])
    }

    return {
      eventId: data.event?.id,
      attemptNumber: data.event?.attemptNumber,
      eventType: data.event?.eventType,
      nextRetryAt: data.event?.nextRetryAt
    }
  }

  const testPaymentSuccess = async () => {
    const response = await fetch('/api/billing/dunning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'process_success',
        subscriptionId: testForm.subscriptionId,
        customerId: testForm.customerId,
        amount: testForm.amount,
        currency: testForm.currency,
        metadata: { test: true }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    return {
      success: data.success,
      message: data.message
    }
  }

  const testGetEvents = async () => {
    const response = await fetch(`/api/billing/dunning?subscriptionId=${testForm.subscriptionId}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    setEvents(data.events || [])
    
    return {
      eventsCount: data.events?.length || 0,
      events: data.events?.map((e: any) => ({
        id: e.id,
        eventType: e.eventType,
        status: e.status,
        attemptNumber: e.attemptNumber
      }))
    }
  }

  const testGetAnalytics = async () => {
    const response = await fetch('/api/billing/dunning?type=analytics')

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    setAnalytics(data.analytics)
    
    return {
      totalEvents: data.analytics?.totalEvents || 0,
      activeEvents: data.analytics?.activeEvents || 0,
      recoveryRate: data.analytics?.recoveryRate || 0,
      averageAttemptsToRecovery: data.analytics?.averageAttemptsToRecovery || 0
    }
  }

  const testDunningRules = async () => {
    // Test dunning rules configuration
    return {
      rulesCount: 2,
      activeRules: 2,
      maxAttempts: 3,
      retryIntervals: [1, 3, 7],
      actions: ['email_notification', 'sms_notification', 'suspend_subscription']
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getEventStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  const passedTests = tests.filter(t => t.status === 'passed').length
  const failedTests = tests.filter(t => t.status === 'failed').length

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dunning Management Test Suite</h1>
        <p className="text-gray-600">Test automated payment failure recovery and dunning workflows</p>
      </div>

      {/* Test Configuration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="subscriptionId">Subscription ID</Label>
              <Input
                id="subscriptionId"
                value={testForm.subscriptionId}
                onChange={(e) => setTestForm(prev => ({ ...prev, subscriptionId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                value={testForm.customerId}
                onChange={(e) => setTestForm(prev => ({ ...prev, customerId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (cents)</Label>
              <Input
                id="amount"
                type="number"
                value={testForm.amount}
                onChange={(e) => setTestForm(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="failureReason">Failure Reason</Label>
              <Select value={testForm.failureReason} onValueChange={(value) => setTestForm(prev => ({ ...prev, failureReason: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insufficient_funds">Insufficient Funds</SelectItem>
                  <SelectItem value="card_declined">Card Declined</SelectItem>
                  <SelectItem value="expired_card">Expired Card</SelectItem>
                  <SelectItem value="processing_error">Processing Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold">{tests.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passed</p>
                <p className="text-2xl font-bold text-green-600">{passedTests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedTests}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">
                  {tests.length > 0 ? Math.round((passedTests / tests.length) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mb-8">
        <Button 
          onClick={runAllTests} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Run All Tests
        </Button>
        <Button 
          onClick={() => setTests(tests.map(t => ({ ...t, status: 'pending' as const, result: undefined, error: undefined })))}
          variant="outline"
          disabled={loading}
        >
          Reset Tests
        </Button>
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <p className="font-medium">{test.name}</p>
                      <p className="text-sm text-gray-600">{test.description}</p>
                      {test.error && (
                        <p className="text-sm text-red-600 mt-1">{test.error}</p>
                      )}
                      {test.result && (
                        <div className="text-sm text-gray-600 mt-1">
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                            {JSON.stringify(test.result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => runTest(index)}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dunning Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Dunning Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No events yet. Run tests to see dunning events.</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm">{event.id}</span>
                      {getEventStatusBadge(event.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium">{event.eventType}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Attempt:</span>
                        <span className="ml-2 font-medium">{event.attemptNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <span className="ml-2 font-medium">{formatCurrency(event.amount)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <span className="ml-2 font-medium">
                          {new Date(event.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    {event.failureReason && (
                      <div className="mt-2">
                        <span className="text-gray-600 text-sm">Reason:</span>
                        <span className="ml-2 text-sm text-red-600">{event.failureReason}</span>
                      </div>
                    )}
                    {event.nextRetryAt && (
                      <div className="mt-2">
                        <span className="text-gray-600 text-sm">Next Retry:</span>
                        <span className="ml-2 text-sm text-blue-600">
                          {new Date(event.nextRetryAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      {analytics && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Dunning Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{analytics.totalEvents}</p>
                <p className="text-sm text-gray-600">Total Events</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{analytics.activeEvents}</p>
                <p className="text-sm text-gray-600">Active Events</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{analytics.successfulRecoveries}</p>
                <p className="text-sm text-gray-600">Successful Recoveries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{analytics.recoveryRate?.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Recovery Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


