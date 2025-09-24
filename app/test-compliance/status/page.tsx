'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X,
  RefreshCw,
  Activity,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Info,
  TestTube,
  Play,
  Pause,
  Square
} from 'lucide-react'

interface ComplianceStatus {
  gdpr: {
    enabled: boolean
    requests: number
    completed: number
    pending: number
    complianceRate: number
    lastAudit: string
    nextAudit: string
  }
  fcra: {
    enabled: boolean
    disputes: number
    freeReports: number
    resolved: number
    complianceRate: number
    lastAudit: string
    nextAudit: string
  }
  ccpa: {
    enabled: boolean
    requests: number
    completed: number
    pending: number
    complianceRate: number
    lastAudit: string
    nextAudit: string
  }
  hipaa: {
    enabled: boolean
    requests: number
    completed: number
    breaches: number
    complianceRate: number
    lastAudit: string
    nextAudit: string
  }
  pci: {
    enabled: boolean
    cards: number
    transactions: number
    vulnerabilities: number
    complianceRate: number
    lastAudit: string
    nextAudit: string
  }
  retention: {
    enabled: boolean
    totalRecords: number
    expired: number
    deleted: number
    exempt: number
    complianceRate: number
    lastAudit: string
    nextAudit: string
  }
  audit: {
    enabled: boolean
    totalEvents: number
    criticalEvents: number
    highRiskEvents: number
    complianceRate: number
    lastAudit: string
    nextAudit: string
  }
}

interface TestResult {
  id: string
  testName: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  duration?: number
  error?: string
  result?: any
  timestamp: Date
  category: string
}

export default function ComplianceStatusPage() {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Mock compliance status data
  const mockComplianceStatus: ComplianceStatus = {
    gdpr: {
      enabled: true,
      requests: 45,
      completed: 42,
      pending: 3,
      complianceRate: 93.3,
      lastAudit: '2024-01-15T10:30:00Z',
      nextAudit: '2024-02-15T10:30:00Z'
    },
    fcra: {
      enabled: true,
      disputes: 128,
      freeReports: 89,
      resolved: 115,
      complianceRate: 89.8,
      lastAudit: '2024-01-10T14:20:00Z',
      nextAudit: '2024-02-10T14:20:00Z'
    },
    ccpa: {
      enabled: true,
      requests: 23,
      completed: 21,
      pending: 2,
      complianceRate: 91.3,
      lastAudit: '2024-01-12T09:15:00Z',
      nextAudit: '2024-02-12T09:15:00Z'
    },
    hipaa: {
      enabled: true,
      requests: 12,
      completed: 11,
      breaches: 0,
      complianceRate: 100,
      lastAudit: '2024-01-08T16:45:00Z',
      nextAudit: '2024-02-08T16:45:00Z'
    },
    pci: {
      enabled: true,
      cards: 156,
      transactions: 2847,
      vulnerabilities: 2,
      complianceRate: 95.2,
      lastAudit: '2024-01-05T11:00:00Z',
      nextAudit: '2024-02-05T11:00:00Z'
    },
    retention: {
      enabled: true,
      totalRecords: 15420,
      expired: 234,
      deleted: 198,
      exempt: 36,
      complianceRate: 97.1,
      lastAudit: '2024-01-20T13:30:00Z',
      nextAudit: '2024-02-20T13:30:00Z'
    },
    audit: {
      enabled: true,
      totalEvents: 8947,
      criticalEvents: 3,
      highRiskEvents: 12,
      complianceRate: 99.8,
      lastAudit: '2024-01-18T08:00:00Z',
      nextAudit: '2024-02-18T08:00:00Z'
    }
  }

  // Load compliance status
  useEffect(() => {
    loadComplianceStatus()
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadComplianceStatus()
        runQuickTests()
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadComplianceStatus = async () => {
    try {
      // In a real app, this would fetch from an API
      setComplianceStatus(mockComplianceStatus)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to load compliance status:', error)
    }
  }

  const runQuickTests = async () => {
    const quickTests = [
      { name: 'GDPR API Health', category: 'gdpr', endpoint: '/api/compliance/gdpr' },
      { name: 'FCRA API Health', category: 'fcra', endpoint: '/api/compliance/fcra' },
      { name: 'CCPA API Health', category: 'ccpa', endpoint: '/api/compliance/ccpa' },
      { name: 'HIPAA API Health', category: 'hipaa', endpoint: '/api/compliance/hipaa' },
      { name: 'PCI API Health', category: 'pci', endpoint: '/api/compliance/pci' },
      { name: 'Retention API Health', category: 'retention', endpoint: '/api/compliance/retention' }
    ]

    for (const test of quickTests) {
      await runSingleTest(test)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const runSingleTest = async (test: { name: string; category: string; endpoint: string }) => {
    const testId = `${test.category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()

    const testResult: TestResult = {
      id: testId,
      testName: test.name,
      status: 'running',
      timestamp: new Date(),
      category: test.category
    }

    setTestResults(prev => [testResult, ...prev.slice(0, 49)]) // Keep last 50 results

    try {
      const response = await fetch(`http://localhost:3000${test.endpoint}?action=health`)
      const duration = Date.now() - startTime

      setTestResults(prev => prev.map(result => 
        result.id === testId 
          ? {
              ...result,
              status: response.ok ? 'passed' : 'failed',
              duration,
              error: response.ok ? undefined : `HTTP ${response.status}`
            }
          : result
      ))
    } catch (error: any) {
      const duration = Date.now() - startTime
      
      setTestResults(prev => prev.map(result => 
        result.id === testId 
          ? {
              ...result,
              status: 'failed',
              duration,
              error: error.message
            }
          : result
      ))
    }
  }

  const runFullTestSuite = async () => {
    setIsRunning(true)
    try {
      await runQuickTests()
    } finally {
      setIsRunning(false)
    }
  }

  const getComplianceIcon = (category: string) => {
    switch (category) {
      case 'gdpr':
        return <Shield className="h-5 w-5" />
      case 'fcra':
        return <FileText className="h-5 w-5" />
      case 'ccpa':
        return <Users className="h-5 w-5" />
      case 'hipaa':
        return <Activity className="h-5 w-5" />
      case 'pci':
        return <BarChart3 className="h-5 w-5" />
      case 'retention':
        return <Clock className="h-5 w-5" />
      case 'audit':
        return <TrendingUp className="h-5 w-5" />
      default:
        return <TestTube className="h-5 w-5" />
    }
  }

  const getComplianceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600'
    if (rate >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <X className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'running':
        return <Badge variant="outline" className="text-blue-600">Running</Badge>
      case 'passed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Passed</Badge>
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-600">Failed</Badge>
    }
  }

  const recentResults = testResults.slice(0, 10)
  const testStats = {
    total: testResults.length,
    passed: testResults.filter(r => r.status === 'passed').length,
    failed: testResults.filter(r => r.status === 'failed').length,
    running: testResults.filter(r => r.status === 'running').length
  }

  if (!complianceStatus) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading compliance status...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Status Dashboard</h1>
            <p className="text-gray-600">Real-time compliance monitoring and testing</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
            >
              {autoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {autoRefresh ? 'Pause Auto-Refresh' : 'Enable Auto-Refresh'}
            </Button>
            <Button
              onClick={runFullTestSuite}
              disabled={isRunning}
              size="sm"
            >
              {isRunning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <TestTube className="h-4 w-4 mr-2" />}
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </Button>
          </div>
        </div>
        {lastUpdate && (
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {lastUpdate.toLocaleString()}
          </p>
        )}
      </div>

      {/* Overall Compliance Score */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Overall Compliance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {Math.round(Object.values(complianceStatus).reduce((acc, status) => acc + status.complianceRate, 0) / 7)}%
              </div>
              <p className="text-sm text-gray-600">Overall Score</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{testStats.passed}</div>
              <p className="text-sm text-gray-600">Tests Passed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">{testStats.failed}</p>
              <p className="text-sm text-gray-600">Tests Failed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 mb-2">{testStats.total}</div>
              <p className="text-sm text-gray-600">Total Tests</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Frameworks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Object.entries(complianceStatus).map(([framework, status]) => (
          <Card key={framework}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  {getComplianceIcon(framework)}
                  <span className="ml-2 capitalize">{framework.toUpperCase()}</span>
                </div>
                <Badge variant={status.enabled ? "default" : "outline"}>
                  {status.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Compliance Rate</span>
                    <span className={getComplianceColor(status.complianceRate)}>
                      {status.complianceRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={status.complianceRate} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(status).filter(([key]) => 
                    !['enabled', 'complianceRate', 'lastAudit', 'nextAudit'].includes(key)
                  ).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <div className="font-medium">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-500 pt-2 border-t">
                  <div>Last Audit: {new Date(status.lastAudit).toLocaleDateString()}</div>
                  <div>Next Audit: {new Date(status.nextAudit).toLocaleDateString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="h-6 w-6 mr-2" />
            Recent Test Results
          </CardTitle>
          <CardDescription>Latest compliance test executions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No tests run yet. Click "Run Tests" to start testing.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.testName}</div>
                      <div className="text-sm text-gray-500 capitalize">{result.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(result.status)}
                    {result.duration && (
                      <span className="text-sm text-gray-500">{result.duration}ms</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
