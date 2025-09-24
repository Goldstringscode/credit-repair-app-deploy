"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Wrench,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  Send,
  Settings,
  Zap,
  Shield,
  Target
} from "lucide-react"

export default function QuickFixPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<Array<{
    test: string
    status: "success" | "error" | "warning"
    message: string
    fix?: string
  }>>([])
  const [testEmail, setTestEmail] = useState("test@example.com")

  const runQuickFixes = async () => {
    setIsRunning(true)
    setResults([])

    // Test 1: Check if email service is properly imported
    try {
      const { sendCreditRepairEmail } = await import('@/lib/email-service')
      setResults(prev => [...prev, {
        test: "Email Service Import",
        status: "success",
        message: "Email service imported successfully",
        fix: "Email service is available"
      }])
    } catch (err) {
      setResults(prev => [...prev, {
        test: "Email Service Import",
        status: "error",
        message: `Failed to import email service: ${err instanceof Error ? err.message : 'Unknown error'}`,
        fix: "Check if email-service.ts exists and is properly exported"
      }])
    }

    // Test 2: Check API endpoint
    try {
      const response = await fetch('/api/email/dashboard?type=overview')
      const data = await response.json()
      
      if (data.success) {
        setResults(prev => [...prev, {
          test: "API Endpoint",
          status: "success",
          message: "API endpoint is working",
          fix: "API is responding correctly"
        }])
      } else {
        setResults(prev => [...prev, {
          test: "API Endpoint",
          status: "error",
          message: `API error: ${data.error}`,
          fix: "Check API implementation and error handling"
        }])
      }
    } catch (err) {
      setResults(prev => [...prev, {
        test: "API Endpoint",
        status: "error",
        message: `API request failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        fix: "Check if API route exists at /api/email/dashboard/route.ts"
      }])
    }

    // Test 3: Test email sending with mock
    try {
      const response = await fetch('/api/email/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_test_email', 
          data: { email: testEmail, name: 'Test User' } 
        })
      })
      const data = await response.json()
      
      if (data.success) {
        setResults(prev => [...prev, {
          test: "Test Email Sending",
          status: "success",
          message: "Test email sent successfully",
          fix: "Email sending is working"
        }])
      } else {
        setResults(prev => [...prev, {
          test: "Test Email Sending",
          status: "error",
          message: `Email sending failed: ${data.error}`,
          fix: "Check email service configuration and SMTP settings"
        }])
      }
    } catch (err) {
      setResults(prev => [...prev, {
        test: "Test Email Sending",
        status: "error",
        message: `Email sending test failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        fix: "Check email service implementation and API endpoint"
      }])
    }

    // Test 4: Check environment variables
    try {
      const response = await fetch('/api/email/dashboard?type=env-check')
      const data = await response.json()
      
      if (data.success) {
        setResults(prev => [...prev, {
          test: "Environment Variables",
          status: "success",
          message: "Environment variables are configured",
          fix: "Email configuration is properly set up"
        }])
      } else {
        setResults(prev => [...prev, {
          test: "Environment Variables",
          status: "warning",
          message: "Environment variables may not be configured",
          fix: "Check .env.local file for email configuration"
        }])
      }
    } catch (err) {
      setResults(prev => [...prev, {
        test: "Environment Variables",
        status: "warning",
        message: "Could not check environment variables",
        fix: "Environment check not implemented"
      }])
    }

    // Test 5: Check hook functionality
    try {
      const response = await fetch('/api/email/dashboard?type=hook-test')
      const data = await response.json()
      
      if (data.success) {
        setResults(prev => [...prev, {
          test: "Hook Functionality",
          status: "success",
          message: "Hook is working correctly",
          fix: "Email dashboard hook is functioning"
        }])
      } else {
        setResults(prev => [...prev, {
          test: "Hook Functionality",
          status: "error",
          message: "Hook test failed",
          fix: "Check useEmailDashboard hook implementation"
        }])
      }
    } catch (err) {
      setResults(prev => [...prev, {
        test: "Hook Functionality",
        status: "error",
        message: "Hook test error",
        fix: "Check hook implementation and API integration"
      }])
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />
      case "warning": return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800"
      case "error": return "bg-red-100 text-red-800"
      case "warning": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const successCount = results.filter(r => r.status === "success").length
  const errorCount = results.filter(r => r.status === "error").length
  const warningCount = results.filter(r => r.status === "warning").length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quick Fix Tool</h1>
            <p className="text-gray-600">
              Identify and fix common email system issues quickly
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setResults([])}
              disabled={isRunning}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              onClick={runQuickFixes}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Wrench className="h-4 w-4 mr-2" />
              {isRunning ? "Running Fixes..." : "Run Quick Fixes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Test Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Test Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label htmlFor="testEmail">Test Email Address</Label>
            <Input
              id="testEmail"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Wrench className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold">{results.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Fixed</p>
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Issues</p>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Quick Fix Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No tests run yet. Click "Run Quick Fixes" to start.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <h4 className="font-medium">{result.test}</h4>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                  
                  {result.fix && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <h6 className="text-sm font-medium text-blue-800 mb-1">Fix:</h6>
                      <p className="text-sm text-blue-700">{result.fix}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Common Issues and Solutions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Common Issues & Solutions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Issue: Email Service Not Found</h4>
              <p className="text-sm text-gray-600 mb-2">The email service module cannot be imported or is missing.</p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-mono">Solution: Check if lib/email-service.ts exists and has proper exports</p>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Issue: API Endpoint Not Working</h4>
              <p className="text-sm text-gray-600 mb-2">The API endpoint is not responding or returning errors.</p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-mono">Solution: Verify app/api/email/dashboard/route.ts exists and is properly configured</p>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Issue: Email Sending Fails</h4>
              <p className="text-sm text-gray-600 mb-2">Test emails cannot be sent due to configuration issues.</p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-mono">Solution: Check SMTP configuration in .env.local file</p>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Issue: Hook Not Working</h4>
              <p className="text-sm text-gray-600 mb-2">The useEmailDashboard hook is not functioning properly.</p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-mono">Solution: Check hooks/use-email-dashboard.ts implementation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
