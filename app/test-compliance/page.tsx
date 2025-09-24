'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Shield, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye,
  Trash2,
  Settings,
  BarChart3,
  Lock,
  Heart,
  CreditCard,
  Activity,
  TestTube,
  Play,
  RefreshCw,
  X
} from 'lucide-react'

interface TestResult {
  id: string
  testName: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  duration?: number
  error?: string
  result?: any
  timestamp: Date
}

interface ComplianceTest {
  id: string
  name: string
  description: string
  category: 'gdpr' | 'fcra' | 'ccpa' | 'hipaa' | 'pci' | 'retention' | 'audit'
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  payload?: any
  expectedStatus: number
}

export default function ComplianceTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set())
  const [testData, setTestData] = useState({
    userId: 'test-user-123',
    email: 'test@example.com',
    cardNumber: '4111111111111111',
    expiryMonth: 12,
    expiryYear: 2025,
    cvv: '123',
    cardholderName: 'Test User',
    amount: 100.00,
    currency: 'USD',
    merchantId: 'merchant-123'
  })

  const complianceTests: ComplianceTest[] = React.useMemo(() => [
    // GDPR Tests
    {
      id: 'gdpr-data-export',
      name: 'GDPR Data Export',
      description: 'Test data export functionality under GDPR',
      category: 'gdpr',
      endpoint: '/api/compliance/gdpr',
      method: 'POST',
      payload: { userId: testData.userId, requestType: 'data_export' },
      expectedStatus: 200
    },
    {
      id: 'gdpr-data-deletion',
      name: 'GDPR Data Deletion',
      description: 'Test data deletion functionality under GDPR',
      category: 'gdpr',
      endpoint: '/api/compliance/gdpr',
      method: 'POST',
      payload: { userId: testData.userId, requestType: 'data_deletion' },
      expectedStatus: 200
    },
    {
      id: 'gdpr-consent-withdrawal',
      name: 'GDPR Consent Withdrawal',
      description: 'Test consent withdrawal functionality',
      category: 'gdpr',
      endpoint: '/api/compliance/gdpr',
      method: 'POST',
      payload: { userId: testData.userId, requestType: 'consent_withdrawal' },
      expectedStatus: 200
    },
    {
      id: 'gdpr-get-requests',
      name: 'GDPR Get Requests',
      description: 'Test retrieving GDPR requests',
      category: 'gdpr',
      endpoint: `/api/compliance/gdpr?userId=${testData.userId}`,
      method: 'GET',
      expectedStatus: 200
    },

    // FCRA Tests
    {
      id: 'fcra-dispute-submission',
      name: 'FCRA Dispute Submission',
      description: 'Test dispute submission under FCRA',
      category: 'fcra',
      endpoint: '/api/compliance/fcra',
      method: 'POST',
      payload: { 
        userId: testData.userId, 
        action: 'dispute',
        data: {
          bureau: 'experian',
          description: 'Test dispute for inaccurate information'
        }
      },
      expectedStatus: 200
    },
    {
      id: 'fcra-free-report',
      name: 'FCRA Free Report Request',
      description: 'Test free credit report request',
      category: 'fcra',
      endpoint: '/api/compliance/fcra',
      method: 'POST',
      payload: { 
        userId: testData.userId, 
        action: 'free_report',
        data: { bureau: 'experian' }
      },
      expectedStatus: 200
    },
    {
      id: 'fcra-rights-info',
      name: 'FCRA Rights Information',
      description: 'Test FCRA rights information retrieval',
      category: 'fcra',
      endpoint: '/api/compliance/fcra?action=rights',
      method: 'GET',
      expectedStatus: 200
    },

    // CCPA Tests
    {
      id: 'ccpa-right-to-know',
      name: 'CCPA Right to Know',
      description: 'Test CCPA right to know functionality',
      category: 'ccpa',
      endpoint: '/api/compliance/ccpa',
      method: 'POST',
      payload: { userId: testData.userId, requestType: 'know' },
      expectedStatus: 200
    },
    {
      id: 'ccpa-right-to-delete',
      name: 'CCPA Right to Delete',
      description: 'Test CCPA right to delete functionality',
      category: 'ccpa',
      endpoint: '/api/compliance/ccpa',
      method: 'POST',
      payload: { userId: testData.userId, requestType: 'delete' },
      expectedStatus: 200
    },
    {
      id: 'ccpa-data-categories',
      name: 'CCPA Data Categories',
      description: 'Test CCPA data categories retrieval',
      category: 'ccpa',
      endpoint: '/api/compliance/ccpa?action=data-categories',
      method: 'GET',
      expectedStatus: 200
    },

    // HIPAA Tests
    {
      id: 'hipaa-data-access',
      name: 'HIPAA Data Access',
      description: 'Test HIPAA data access functionality',
      category: 'hipaa',
      endpoint: '/api/compliance/hipaa',
      method: 'POST',
      payload: { 
        userId: testData.userId, 
        requestType: 'access',
        healthData: {
          id: 'health_data_123',
          userId: testData.userId,
          dataType: 'medical_record',
          description: 'Test health data',
          sensitivity: 'high',
          accessLevel: 'view',
          encrypted: true,
          lastAccessed: new Date(),
          accessedBy: []
        }
      },
      expectedStatus: 200
    },
    {
      id: 'hipaa-data-amendment',
      name: 'HIPAA Data Amendment',
      description: 'Test HIPAA data amendment functionality',
      category: 'hipaa',
      endpoint: '/api/compliance/hipaa',
      method: 'POST',
      payload: { 
        userId: testData.userId, 
        requestType: 'amendment',
        healthData: {
          id: 'health_data_123',
          userId: testData.userId,
          dataType: 'medical_record',
          description: 'Test health data',
          sensitivity: 'high',
          accessLevel: 'view',
          encrypted: true,
          lastAccessed: new Date(),
          accessedBy: []
        }
      },
      expectedStatus: 200
    },
    {
      id: 'hipaa-rights-info',
      name: 'HIPAA Rights Information',
      description: 'Test HIPAA rights information retrieval',
      category: 'hipaa',
      endpoint: '/api/compliance/hipaa?action=rights',
      method: 'GET',
      expectedStatus: 200
    },

    // PCI DSS Tests
    {
      id: 'pci-add-card',
      name: 'PCI Add Card',
      description: 'Test PCI-compliant card addition',
      category: 'pci',
      endpoint: '/api/compliance/pci',
      method: 'POST',
      payload: { 
        action: 'add_card',
        data: {
          userId: testData.userId,
          cardNumber: testData.cardNumber,
          expiryMonth: testData.expiryMonth,
          expiryYear: testData.expiryYear,
          cardholderName: testData.cardholderName,
          cvv: testData.cvv
        }
      },
      expectedStatus: 200
    },
    {
      id: 'pci-process-transaction',
      name: 'PCI Process Transaction',
      description: 'Test PCI-compliant transaction processing',
      category: 'pci',
      endpoint: '/api/compliance/pci',
      method: 'POST',
      payload: { 
        action: 'process_transaction',
        data: {
          userId: testData.userId,
          cardId: 'test-card-id',
          amount: testData.amount,
          currency: testData.currency,
          merchantId: testData.merchantId,
          transactionType: 'sale'
        }
      },
      expectedStatus: 500 // Expected to fail because card doesn't exist
    },
    {
      id: 'pci-compliance-info',
      name: 'PCI Compliance Information',
      description: 'Test PCI compliance information retrieval',
      category: 'pci',
      endpoint: '/api/compliance/pci?action=compliance',
      method: 'GET',
      expectedStatus: 200
    },

    // Data Retention Tests
    {
      id: 'retention-create-record',
      name: 'Create Retention Record',
      description: 'Test data retention record creation',
      category: 'retention',
      endpoint: '/api/compliance/retention',
      method: 'POST',
      payload: { 
        userId: testData.userId, 
        dataType: 'personal_info',
        metadata: { source: 'test' }
      },
      expectedStatus: 200
    },
    {
      id: 'retention-get-policies',
      name: 'Get Retention Policies',
      description: 'Test retention policies retrieval',
      category: 'retention',
      endpoint: '/api/compliance/retention?action=policies',
      method: 'GET',
      expectedStatus: 200
    },
    {
      id: 'retention-process-expired',
      name: 'Process Expired Data',
      description: 'Test expired data processing',
      category: 'retention',
      endpoint: '/api/compliance/retention',
      method: 'PUT',
      payload: { action: 'process_expired' },
      expectedStatus: 200
    }
  ], [testData])

  const runTest = async (test: ComplianceTest) => {
    const testId = `${test.id}_${Date.now()}`
    const startTime = Date.now()

    // Add test to running tests
    setRunningTests(prev => new Set([...prev, testId]))

    // Create test result
    const testResult: TestResult = {
      id: testId,
      testName: test.name,
      status: 'running',
      timestamp: new Date()
    }

    setTestResults(prev => [testResult, ...prev])

    try {
      const url = test.endpoint.startsWith('http') ? test.endpoint : `http://localhost:3000${test.endpoint}`
      
      const options: RequestInit = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        }
      }

      if (test.payload) {
        options.body = JSON.stringify(test.payload)
      }

      const response = await fetch(url, options)
      const responseData = await response.json()
      const duration = Date.now() - startTime

      const success = response.status === test.expectedStatus

      setTestResults(prev => prev.map(result => 
        result.id === testId 
          ? {
              ...result,
              status: success ? 'passed' : 'failed',
              duration,
              result: responseData,
              error: success ? undefined : `Expected status ${test.expectedStatus}, got ${response.status}`
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
              error: error.message,
              result: null
            }
          : result
      ))
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev)
        newSet.delete(testId)
        return newSet
      })
    }
  }

  const runAllTests = async () => {
    for (const test of complianceTests) {
      await runTest(test)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const runCategoryTests = async (category: string) => {
    const categoryTests = complianceTests.filter(test => test.category === category)
    for (const test of categoryTests) {
      await runTest(test)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const clearResults = () => {
    setTestResults([])
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gdpr':
        return <Shield className="h-4 w-4" />
      case 'fcra':
        return <FileText className="h-4 w-4" />
      case 'ccpa':
        return <Users className="h-4 w-4" />
      case 'hipaa':
        return <Heart className="h-4 w-4" />
      case 'pci':
        return <CreditCard className="h-4 w-4" />
      case 'retention':
        return <Clock className="h-4 w-4" />
      case 'audit':
        return <Activity className="h-4 w-4" />
      default:
        return <TestTube className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'gdpr':
        return 'text-blue-600'
      case 'fcra':
        return 'text-green-600'
      case 'ccpa':
        return 'text-purple-600'
      case 'hipaa':
        return 'text-red-600'
      case 'pci':
        return 'text-orange-600'
      case 'retention':
        return 'text-gray-600'
      case 'audit':
        return 'text-indigo-600'
      default:
        return 'text-gray-600'
    }
  }

  const testStats = {
    total: testResults.length,
    passed: testResults.filter(r => r.status === 'passed').length,
    failed: testResults.filter(r => r.status === 'failed').length,
    running: testResults.filter(r => r.status === 'running').length,
    pending: testResults.filter(r => r.status === 'pending').length
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Test Suite</h1>
        <p className="text-gray-600">Test all compliance features and API endpoints</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {complianceTests.length} available tests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{testStats.passed}</div>
            <p className="text-xs text-muted-foreground">
              {testStats.total > 0 ? Math.round((testStats.passed / testStats.total) * 100) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{testStats.failed}</div>
            <p className="text-xs text-muted-foreground">
              {testStats.total > 0 ? Math.round((testStats.failed / testStats.total) * 100) : 0}% failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{testStats.running}</div>
            <p className="text-xs text-muted-foreground">
              Currently executing
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Configure test parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={testData.userId}
                onChange={(e) => setTestData(prev => ({ ...prev, userId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={testData.email}
                onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={testData.cardNumber}
                onChange={(e) => setTestData(prev => ({ ...prev, cardNumber: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="expiryMonth">Expiry Month</Label>
                <Input
                  id="expiryMonth"
                  type="number"
                  value={testData.expiryMonth}
                  onChange={(e) => setTestData(prev => ({ ...prev, expiryMonth: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="expiryYear">Expiry Year</Label>
                <Input
                  id="expiryYear"
                  type="number"
                  value={testData.expiryYear}
                  onChange={(e) => setTestData(prev => ({ ...prev, expiryYear: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>Run compliance tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runAllTests} 
              className="w-full"
              disabled={testStats.running > 0}
            >
              <Play className="mr-2 h-4 w-4" />
              Run All Tests
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => runCategoryTests('gdpr')} 
                variant="outline"
                disabled={testStats.running > 0}
              >
                <Shield className="mr-2 h-4 w-4" />
                GDPR
              </Button>
              <Button 
                onClick={() => runCategoryTests('fcra')} 
                variant="outline"
                disabled={testStats.running > 0}
              >
                <FileText className="mr-2 h-4 w-4" />
                FCRA
              </Button>
              <Button 
                onClick={() => runCategoryTests('ccpa')} 
                variant="outline"
                disabled={testStats.running > 0}
              >
                <Users className="mr-2 h-4 w-4" />
                CCPA
              </Button>
              <Button 
                onClick={() => runCategoryTests('hipaa')} 
                variant="outline"
                disabled={testStats.running > 0}
              >
                <Heart className="mr-2 h-4 w-4" />
                HIPAA
              </Button>
              <Button 
                onClick={() => runCategoryTests('pci')} 
                variant="outline"
                disabled={testStats.running > 0}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                PCI DSS
              </Button>
              <Button 
                onClick={() => runCategoryTests('retention')} 
                variant="outline"
                disabled={testStats.running > 0}
              >
                <Clock className="mr-2 h-4 w-4" />
                Retention
              </Button>
            </div>

            <Button 
              onClick={clearResults} 
              variant="destructive"
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Results
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Tests</CardTitle>
            <CardDescription>Compliance test inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(
                complianceTests.reduce((acc, test) => {
                  acc[test.category] = (acc[test.category] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(category)}
                    <span className="capitalize">{category.toUpperCase()}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Real-time test execution results</CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No tests run yet. Click "Run All Tests" to start testing.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <h3 className="font-medium">{result.testName}</h3>
                      {getStatusBadge(result.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.duration && `${result.duration}ms`}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {complianceTests.find(t => t.name === result.testName)?.description}
                  </div>

                  {result.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                      <p className="text-sm text-red-800 font-medium">Error:</p>
                      <p className="text-sm text-red-700">{result.error}</p>
                    </div>
                  )}

                  {result.result && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        View Response
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    </details>
                  )}

                  <div className="text-xs text-gray-400 mt-2">
                    {result.timestamp.toLocaleString()}
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



