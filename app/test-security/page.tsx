'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle, Shield, Lock, Eye, EyeOff } from 'lucide-react'

interface TestResult {
  test: string
  status: 'pass' | 'fail' | 'pending'
  message: string
  details?: any
}

interface SecurityStats {
  totalTests: number
  passedTests: number
  failedTests: number
  successRate: number
}

export default function SecurityTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    successRate: 0
  })

  // Test data
  const [testData, setTestData] = useState({
    email: 'test@example.com',
    password: 'TestPassword123!',
    ssn: '1234',
    phone: '+1234567890',
    creditScore: 750,
    accountNumber: '1234567890',
    disputeReason: 'This account is not mine and should be removed from my credit report.',
    apiKey: 'test-api-key-12345',
    jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    file: null as File | null
  })

  // Security tests
  const securityTests = [
    {
      id: 'rate-limiting',
      name: 'Rate Limiting',
      description: 'Test API rate limiting functionality',
      category: 'API Security'
    },
    {
      id: 'input-validation',
      name: 'Input Validation',
      description: 'Test Zod validation schemas',
      category: 'Data Validation'
    },
    {
      id: 'cors-policy',
      name: 'CORS Policy',
      description: 'Test cross-origin resource sharing',
      category: 'Network Security'
    },
    {
      id: 'data-encryption',
      name: 'Data Encryption',
      description: 'Test field-level encryption',
      category: 'Data Protection'
    },
    {
      id: 'audit-logging',
      name: 'Audit Logging',
      description: 'Test comprehensive audit logging',
      category: 'Monitoring'
    },
    {
      id: 'authentication',
      name: 'Authentication',
      description: 'Test JWT token validation',
      category: 'Access Control'
    },
    {
      id: 'authorization',
      name: 'Authorization',
      description: 'Test role-based access control',
      category: 'Access Control'
    },
    {
      id: 'security-headers',
      name: 'Security Headers',
      description: 'Test HTTP security headers',
      category: 'Network Security'
    },
    {
      id: 'env-validation',
      name: 'Environment Validation',
      description: 'Test environment variable validation',
      category: 'Configuration'
    },
    {
      id: 'file-upload',
      name: 'File Upload Security',
      description: 'Test secure file upload validation',
      category: 'Data Validation'
    }
  ]

  // Run individual test
  const runTest = async (testId: string) => {
    const test = securityTests.find(t => t.id === testId)
    if (!test) return

    setTestResults(prev => [...prev.filter(r => r.test !== testId), {
      test: testId,
      status: 'pending',
      message: 'Running test...'
    }])

    try {
      let result: TestResult

      switch (testId) {
        case 'rate-limiting':
          result = await testRateLimiting()
          break
        case 'input-validation':
          result = await testInputValidation()
          break
        case 'cors-policy':
          result = await testCORSPolicy()
          break
        case 'data-encryption':
          result = await testDataEncryption()
          break
        case 'audit-logging':
          result = await testAuditLogging()
          break
        case 'authentication':
          result = await testAuthentication()
          break
        case 'authorization':
          result = await testAuthorization()
          break
        case 'security-headers':
          result = await testSecurityHeaders()
          break
        case 'env-validation':
          result = await testEnvironmentValidation()
          break
        case 'file-upload':
          result = await testFileUpload()
          break
        default:
          result = {
            test: testId,
            status: 'fail',
            message: 'Unknown test'
          }
      }

      setTestResults(prev => [...prev.filter(r => r.test !== testId), result])
    } catch (error) {
      setTestResults(prev => [...prev.filter(r => r.test !== testId), {
        test: testId,
        status: 'fail',
        message: `Test failed: ${error.message}`
      }])
    }
  }

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])

    for (const test of securityTests) {
      await runTest(test.id)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Delay between tests
    }

    setIsRunning(false)
  }

  // Individual test implementations
  const testRateLimiting = async (): Promise<TestResult> => {
    try {
      // Test rate limiting by making multiple rapid requests
      const promises = Array(10).fill(0).map(() => 
        fetch('/api/test/rate-limit', { method: 'POST' })
      )
      
      const responses = await Promise.all(promises)
      const rateLimited = responses.some(r => r.status === 429)
      
      return {
        test: 'rate-limiting',
        status: rateLimited ? 'pass' : 'fail',
        message: rateLimited ? 'Rate limiting working correctly' : 'Rate limiting not working',
        details: { responses: responses.map(r => r.status) }
      }
    } catch (error) {
      return {
        test: 'rate-limiting',
        status: 'fail',
        message: `Rate limiting test failed: ${error.message}`
      }
    }
  }

  const testInputValidation = async (): Promise<TestResult> => {
    try {
      // Test invalid email
      const invalidEmailResponse = await fetch('/api/test/validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid-email' })
      })

      // Test valid email
      const validEmailResponse = await fetch('/api/test/validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'valid@example.com' })
      })

      const invalidRejected = invalidEmailResponse.status === 400
      const validAccepted = validEmailResponse.status === 200

      let invalidDetails = null
      let validDetails = null

      try {
        invalidDetails = await invalidEmailResponse.json()
      } catch (e) {
        invalidDetails = { error: 'Could not parse response' }
      }

      try {
        validDetails = await validEmailResponse.json()
      } catch (e) {
        validDetails = { error: 'Could not parse response' }
      }

      return {
        test: 'input-validation',
        status: (invalidRejected && validAccepted) ? 'pass' : 'fail',
        message: (invalidRejected && validAccepted) ? 'Input validation working correctly' : 'Input validation not working',
        details: { 
          invalidStatus: invalidEmailResponse.status, 
          validStatus: validEmailResponse.status,
          invalidResponse: invalidDetails,
          validResponse: validDetails
        }
      }
    } catch (error) {
      return {
        test: 'input-validation',
        status: 'fail',
        message: `Input validation test failed: ${error.message}`
      }
    }
  }

  const testCORSPolicy = async (): Promise<TestResult> => {
    try {
      const response = await fetch('/api/test/cors', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://malicious-site.com',
          'Access-Control-Request-Method': 'POST'
        }
      })

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
      }

      const hasCorsHeaders = Object.values(corsHeaders).some(header => header !== null)

      return {
        test: 'cors-policy',
        status: hasCorsHeaders ? 'pass' : 'fail',
        message: hasCorsHeaders ? 'CORS policy configured correctly' : 'CORS policy not configured',
        details: corsHeaders
      }
    } catch (error) {
      return {
        test: 'cors-policy',
        status: 'fail',
        message: `CORS test failed: ${error.message}`
      }
    }
  }

  const testDataEncryption = async (): Promise<TestResult> => {
    try {
      const response = await fetch('/api/test/encryption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ssn: testData.ssn,
          creditScore: testData.creditScore 
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        const isEncrypted = result.isEncrypted && result.encrypted !== testData.ssn
        return {
          test: 'data-encryption',
          status: isEncrypted ? 'pass' : 'fail',
          message: isEncrypted ? 'Data encryption working correctly' : 'Data encryption not working',
          details: { 
            original: testData.ssn, 
            encrypted: result.encrypted,
            isEncrypted: result.isEncrypted,
            algorithm: result.algorithm
          }
        }
      } else {
        return {
          test: 'data-encryption',
          status: 'fail',
          message: `Data encryption test failed: ${result.message || 'Unknown error'}`,
          details: result
        }
      }
    } catch (error) {
      return {
        test: 'data-encryption',
        status: 'fail',
        message: `Data encryption test failed: ${error.message}`
      }
    }
  }

  const testAuditLogging = async (): Promise<TestResult> => {
    try {
      const response = await fetch('/api/test/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_audit_log' })
      })

      const result = await response.json()
      const hasLogId = result.logId && result.logId.length > 0

      return {
        test: 'audit-logging',
        status: hasLogId ? 'pass' : 'fail',
        message: hasLogId ? 'Audit logging working correctly' : 'Audit logging not working',
        details: { logId: result.logId }
      }
    } catch (error) {
      return {
        test: 'audit-logging',
        status: 'fail',
        message: `Audit logging test failed: ${error.message}`
      }
    }
  }

  const testAuthentication = async (): Promise<TestResult> => {
    try {
      // Test without token
      const noTokenResponse = await fetch('/api/test/auth', {
        method: 'GET'
      })

      // Test with invalid token
      const invalidTokenResponse = await fetch('/api/test/auth', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid-token' }
      })

      // Test with valid token
      const validTokenResponse = await fetch('/api/test/auth', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      const noTokenRejected = noTokenResponse.status === 401
      const invalidTokenRejected = invalidTokenResponse.status === 401
      const validTokenAccepted = validTokenResponse.status === 200

      return {
        test: 'authentication',
        status: (noTokenRejected && invalidTokenRejected && validTokenAccepted) ? 'pass' : 'fail',
        message: (noTokenRejected && invalidTokenRejected && validTokenAccepted) ? 'Authentication working correctly' : 'Authentication not working',
        details: { 
          noTokenStatus: noTokenResponse.status, 
          invalidTokenStatus: invalidTokenResponse.status,
          validTokenStatus: validTokenResponse.status
        }
      }
    } catch (error) {
      return {
        test: 'authentication',
        status: 'fail',
        message: `Authentication test failed: ${error.message}`
      }
    }
  }

  const testAuthorization = async (): Promise<TestResult> => {
    try {
      // Test user role access
      const userResponse = await fetch('/api/test/authorization', {
        method: 'GET',
        headers: { 
          'Authorization': 'Bearer valid-token',
          'X-User-Role': 'user'
        }
      })

      // Test admin role access
      const adminResponse = await fetch('/api/test/authorization', {
        method: 'GET',
        headers: { 
          'Authorization': 'Bearer valid-token',
          'X-User-Role': 'admin'
        }
      })

      // Test invalid role access
      const invalidRoleResponse = await fetch('/api/test/authorization', {
        method: 'GET',
        headers: { 
          'Authorization': 'Bearer valid-token',
          'X-User-Role': 'guest'
        }
      })

      const userAccess = userResponse.status === 200
      const adminAccess = adminResponse.status === 200
      const invalidRoleRejected = invalidRoleResponse.status === 403

      return {
        test: 'authorization',
        status: (userAccess && adminAccess && invalidRoleRejected) ? 'pass' : 'fail',
        message: (userAccess && adminAccess && invalidRoleRejected) ? 'Authorization working correctly' : 'Authorization not working',
        details: { 
          userStatus: userResponse.status, 
          adminStatus: adminResponse.status,
          invalidRoleStatus: invalidRoleResponse.status
        }
      }
    } catch (error) {
      return {
        test: 'authorization',
        status: 'fail',
        message: `Authorization test failed: ${error.message}`
      }
    }
  }

  const testSecurityHeaders = async (): Promise<TestResult> => {
    try {
      const response = await fetch('/api/test/security-headers', {
        method: 'GET'
      })

      const securityHeaders = {
        'X-Frame-Options': response.headers.get('X-Frame-Options'),
        'X-Content-Type-Options': response.headers.get('X-Content-Type-Options'),
        'X-XSS-Protection': response.headers.get('X-XSS-Protection'),
        'Strict-Transport-Security': response.headers.get('Strict-Transport-Security'),
        'Content-Security-Policy': response.headers.get('Content-Security-Policy')
      }

      const hasSecurityHeaders = Object.values(securityHeaders).some(header => header !== null)

      return {
        test: 'security-headers',
        status: hasSecurityHeaders ? 'pass' : 'fail',
        message: hasSecurityHeaders ? 'Security headers configured correctly' : 'Security headers not configured',
        details: securityHeaders
      }
    } catch (error) {
      return {
        test: 'security-headers',
        status: 'fail',
        message: `Security headers test failed: ${error.message}`
      }
    }
  }

  const testEnvironmentValidation = async (): Promise<TestResult> => {
    try {
      const response = await fetch('/api/test/env-validation', {
        method: 'GET'
      })

      const result = await response.json()
      const isValid = result.valid === true

      return {
        test: 'env-validation',
        status: isValid ? 'pass' : 'fail',
        message: isValid ? 'Environment validation passed' : 'Environment validation failed',
        details: result
      }
    } catch (error) {
      return {
        test: 'env-validation',
        status: 'fail',
        message: `Environment validation test failed: ${error.message}`
      }
    }
  }

  const testFileUpload = async (): Promise<TestResult> => {
    try {
      // Create a test file
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const formData = new FormData()
      formData.append('file', testFile)
      formData.append('bureau', 'experian')

      const response = await fetch('/api/test/file-upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      const isValid = response.status === 200 && result.success

      return {
        test: 'file-upload',
        status: isValid ? 'pass' : 'fail',
        message: isValid ? 'File upload validation working correctly' : 'File upload validation not working',
        details: { status: response.status, result }
      }
    } catch (error) {
      return {
        test: 'file-upload',
        status: 'fail',
        message: `File upload test failed: ${error.message}`
      }
    }
  }

  // Update security stats
  useEffect(() => {
    const total = testResults.length
    const passed = testResults.filter(r => r.status === 'pass').length
    const failed = testResults.filter(r => r.status === 'fail').length
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0

    setSecurityStats({ totalTests: total, passedTests: passed, failedTests: failed, successRate })
  }, [testResults])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-500">Pass</Badge>
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">Not Run</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Features Test Suite</h1>
          <p className="text-muted-foreground">
            Comprehensive testing of all implemented security features
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          <Button 
            onClick={() => setTestResults([])} 
            variant="outline"
            disabled={isRunning}
          >
            Clear Results
          </Button>
          <Link href="/test-security/status">
            <Button variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
              <Shield className="h-4 w-4 mr-2" />
              Status Monitor
            </Button>
          </Link>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Tests</p>
                <p className="text-2xl font-bold">{securityStats.totalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Passed</p>
                <p className="text-2xl font-bold text-green-500">{securityStats.passedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-500">{securityStats.failedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-purple-500">{securityStats.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">Security Tests</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="details">Test Details</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityTests.map((test) => {
              const result = testResults.find(r => r.test === test.id)
              return (
                <Card key={test.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      {getStatusIcon(result?.status || 'not-run')}
                    </div>
                    <CardDescription>{test.description}</CardDescription>
                    <Badge variant="outline" className="w-fit">{test.category}</Badge>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      onClick={() => runTest(test.id)}
                      disabled={isRunning}
                      className="w-full"
                      variant={result?.status === 'pass' ? 'default' : 'outline'}
                    >
                      {result ? getStatusBadge(result.status) : 'Run Test'}
                    </Button>
                    {result && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {result.message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {testResults.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No test results yet. Run some tests to see results here.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <h3 className="font-medium">
                            {securityTests.find(t => t.id === result.test)?.name || result.test}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {securityTests.find(t => t.id === result.test)?.description}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm mt-2">{result.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>
                Current test data and configuration used for security testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Test Email</Label>
                  <Input
                    id="email"
                    value={testData.email}
                    onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Test Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={testData.password}
                    onChange={(e) => setTestData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ssn">Test SSN (Last 4)</Label>
                  <Input
                    id="ssn"
                    value={testData.ssn}
                    onChange={(e) => setTestData(prev => ({ ...prev, ssn: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Test Phone</Label>
                  <Input
                    id="phone"
                    value={testData.phone}
                    onChange={(e) => setTestData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditScore">Test Credit Score</Label>
                  <Input
                    id="creditScore"
                    type="number"
                    value={testData.creditScore}
                    onChange={(e) => setTestData(prev => ({ ...prev, creditScore: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Test Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={testData.accountNumber}
                    onChange={(e) => setTestData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="disputeReason">Test Dispute Reason</Label>
                <Textarea
                  id="disputeReason"
                  value={testData.disputeReason}
                  onChange={(e) => setTestData(prev => ({ ...prev, disputeReason: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
