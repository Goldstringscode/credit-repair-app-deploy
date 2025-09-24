"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Database, Mail, CreditCard, Server, Globe, Brain } from "lucide-react"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
  details?: any
}

export default function TestSetupPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Environment Variables", status: "pending", message: "Not tested" },
    { name: "Neon Database", status: "pending", message: "Not tested" },
    { name: "Supabase Connection", status: "pending", message: "Not tested" },
    { name: "OpenAI API", status: "pending", message: "Not tested" },
    { name: "Email Service", status: "pending", message: "Not tested" },
    { name: "Stripe Configuration", status: "pending", message: "Not tested" },
  ])
  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (name: string, status: TestResult["status"], message: string, details?: any) => {
    setTests((prev) => prev.map((test) => (test.name === name ? { ...test, status, message, details } : test)))
  }

  const runTest = async (testName: string, endpoint: string) => {
    updateTest(testName, "pending", "Testing...")
    try {
      const response = await fetch(endpoint)
      const data = await response.json()

      if (data.success) {
        updateTest(testName, "success", data.message, data.details)
      } else {
        updateTest(testName, "error", data.error || "Test failed", data.details)
      }
    } catch (error) {
      updateTest(testName, "error", `Connection failed: ${error}`)
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)

    // Reset all tests
    setTests((prev) => prev.map((test) => ({ ...test, status: "pending", message: "Testing..." })))

    // Run tests sequentially
    await runTest("Environment Variables", "/api/test/env")
    await runTest("Neon Database", "/api/test/neon")
    await runTest("Supabase Connection", "/api/test/supabase")
    await runTest("OpenAI API", "/api/test/openai")
    await runTest("Email Service", "/api/test/email")
    await runTest("Stripe Configuration", "/api/test/stripe")

    setIsRunning(false)
  }

  const getIcon = (testName: string) => {
    switch (testName) {
      case "Environment Variables":
        return <Server className="h-5 w-5" />
      case "Neon Database":
        return <Database className="h-5 w-5" />
      case "Supabase Connection":
        return <Globe className="h-5 w-5" />
      case "OpenAI API":
        return <Brain className="h-5 w-5" />
      case "Email Service":
        return <Mail className="h-5 w-5" />
      case "Stripe Configuration":
        return <CreditCard className="h-5 w-5" />
      default:
        return <Server className="h-5 w-5" />
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
    }
  }

  const allTestsPassed = tests.every((test) => test.status === "success")
  const hasErrors = tests.some((test) => test.status === "error")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Setup Test</h1>
          <p className="text-gray-600">
            Test all integrations and services to ensure your credit repair app is properly configured
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Tests</CardTitle>
              <CardDescription>
                Run these tests to verify all services are connected and working properly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runAllTests} disabled={isRunning} className="w-full" size="lg">
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  "Run All Tests"
                )}
              </Button>

              <div className="space-y-3">
                {tests.map((test) => (
                  <div key={test.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getIcon(test.name)}
                      <div>
                        <h3 className="font-medium">{test.name}</h3>
                        <p className="text-sm text-gray-600">{test.message}</p>
                        {test.details && (
                          <div className="text-xs text-gray-500 mt-1">
                            {typeof test.details === "object" ? JSON.stringify(test.details, null, 2) : test.details}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(test.status)}
                      <Badge
                        variant={
                          test.status === "success" ? "default" : test.status === "error" ? "destructive" : "secondary"
                        }
                      >
                        {test.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {allTestsPassed && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <h3 className="font-semibold">All Tests Passed!</h3>
                </div>
                <p className="text-green-600 mt-2">
                  Your credit repair app is properly configured and ready to use. You can now:
                </p>
                <ul className="list-disc list-inside text-green-600 mt-2 space-y-1">
                  <li>Upload and analyze credit reports</li>
                  <li>Generate dispute letters</li>
                  <li>Send emails to users</li>
                  <li>Process payments</li>
                </ul>
                <div className="mt-4">
                  <Button asChild>
                    <a href="/dashboard/reports/upload">Start Uploading Credit Reports</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {hasErrors && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-700">
                  <XCircle className="h-5 w-5" />
                  <h3 className="font-semibold">Some Tests Failed</h3>
                </div>
                <p className="text-red-600 mt-2">
                  Please fix the failing tests before using the application. Check your environment variables and
                  service configurations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
