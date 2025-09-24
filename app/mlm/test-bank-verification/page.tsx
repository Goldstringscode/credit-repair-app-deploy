"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, AlertTriangle, CreditCard } from "lucide-react"

interface BankVerificationTest {
  id: string
  testName: string
  status: "pending" | "success" | "failed" | "warning"
  accountNumber: string
  routingNumber: string
  bankName: string
  accountType: "checking" | "savings"
  verificationMethod: "micro-deposits" | "instant" | "manual"
  result?: {
    isValid: boolean
    message: string
    details: string[]
    processingTime: number
  }
}

export default function TestBankVerificationPage() {
  const [tests, setTests] = useState<BankVerificationTest[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [customTest, setCustomTest] = useState({
    accountNumber: "",
    routingNumber: "",
    bankName: "",
    accountType: "checking" as const,
  })

  const predefinedTests: Omit<BankVerificationTest, "id" | "status" | "result">[] = [
    {
      testName: "Valid Chase Checking Account",
      accountNumber: "1234567890",
      routingNumber: "021000021",
      bankName: "JPMorgan Chase Bank",
      accountType: "checking",
      verificationMethod: "instant",
    },
    {
      testName: "Valid Bank of America Savings",
      accountNumber: "9876543210",
      routingNumber: "026009593",
      bankName: "Bank of America",
      accountType: "savings",
      verificationMethod: "micro-deposits",
    },
    {
      testName: "Invalid Routing Number Test",
      accountNumber: "1111111111",
      routingNumber: "000000000",
      bankName: "Test Bank",
      accountType: "checking",
      verificationMethod: "instant",
    },
    {
      testName: "Closed Account Test",
      accountNumber: "5555555555",
      routingNumber: "111000025",
      bankName: "Wells Fargo Bank",
      accountType: "checking",
      verificationMethod: "manual",
    },
    {
      testName: "Credit Union Account",
      accountNumber: "7777777777",
      routingNumber: "321174851",
      bankName: "Navy Federal Credit Union",
      accountType: "savings",
      verificationMethod: "micro-deposits",
    },
  ]

  const runBankVerification = async (test: Omit<BankVerificationTest, "id" | "status" | "result">) => {
    const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newTest: BankVerificationTest = {
      ...test,
      id: testId,
      status: "pending",
    }

    setTests((prev) => [...prev, newTest])

    // Simulate verification process
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000))

    // Simulate different verification outcomes
    let result: BankVerificationTest["result"]
    const processingTime = Math.floor(1500 + Math.random() * 3500)

    if (test.routingNumber === "000000000") {
      result = {
        isValid: false,
        message: "Invalid routing number",
        details: [
          "Routing number format is invalid",
          "Bank not found in Federal Reserve database",
          "Unable to process ACH transactions",
        ],
        processingTime,
      }
    } else if (test.accountNumber === "5555555555") {
      result = {
        isValid: false,
        message: "Account closed or restricted",
        details: [
          "Account has been closed by the bank",
          "No ACH transactions allowed",
          "Contact bank for account status",
        ],
        processingTime,
      }
    } else if (test.verificationMethod === "micro-deposits") {
      result = {
        isValid: true,
        message: "Micro-deposits initiated",
        details: [
          "Two small deposits will appear in 1-2 business days",
          "Amounts will be between $0.01 and $0.99",
          "User must verify amounts to complete setup",
          "Deposits will be automatically withdrawn",
        ],
        processingTime,
      }
    } else if (Math.random() > 0.8) {
      result = {
        isValid: false,
        message: "Verification temporarily unavailable",
        details: [
          "Bank's verification service is currently down",
          "Please try again in a few minutes",
          "Consider using micro-deposit verification",
        ],
        processingTime,
      }
    } else {
      result = {
        isValid: true,
        message: "Account verified successfully",
        details: [
          "Account is active and in good standing",
          "ACH transactions are enabled",
          "Ready for payout processing",
          `Verification completed in ${processingTime}ms`,
        ],
        processingTime,
      }
    }

    setTests((prev) =>
      prev.map((t) =>
        t.id === testId
          ? {
              ...t,
              status: result.isValid ? "success" : "failed",
              result,
            }
          : t,
      ),
    )
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTests([])

    for (const test of predefinedTests) {
      await runBankVerification(test)
      await new Promise((resolve) => setTimeout(resolve, 500)) // Small delay between tests
    }

    setIsRunning(false)
  }

  const runCustomTest = async () => {
    if (!customTest.accountNumber || !customTest.routingNumber || !customTest.bankName) {
      return
    }

    await runBankVerification({
      testName: `Custom Test - ${customTest.bankName}`,
      accountNumber: customTest.accountNumber,
      routingNumber: customTest.routingNumber,
      bankName: customTest.bankName,
      accountType: customTest.accountType,
      verificationMethod: "instant",
    })

    setCustomTest({
      accountNumber: "",
      routingNumber: "",
      bankName: "",
      accountType: "checking",
    })
  }

  const getStatusIcon = (status: BankVerificationTest["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
    }
  }

  const getStatusBadge = (status: BankVerificationTest["status"]) => {
    const variants = {
      pending: "secondary",
      success: "default",
      failed: "destructive",
      warning: "secondary",
    } as const

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bank Verification Testing</h1>
        <p className="text-gray-600">
          Test bank account verification flows with various scenarios including valid accounts, invalid routing numbers,
          and closed accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Automated Tests</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={runAllTests} disabled={isRunning} className="w-full">
                {isRunning ? "Running Tests..." : "Run All Verification Tests"}
              </Button>
              <p className="text-sm text-gray-600 mt-2">Runs {predefinedTests.length} predefined test scenarios</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={customTest.bankName}
                  onChange={(e) => setCustomTest((prev) => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g., Chase Bank"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  value={customTest.routingNumber}
                  onChange={(e) => setCustomTest((prev) => ({ ...prev, routingNumber: e.target.value }))}
                  placeholder="9-digit routing number"
                  maxLength={9}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={customTest.accountNumber}
                  onChange={(e) => setCustomTest((prev) => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="Account number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <select
                  id="accountType"
                  value={customTest.accountType}
                  onChange={(e) =>
                    setCustomTest((prev) => ({ ...prev, accountType: e.target.value as "checking" | "savings" }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <Button onClick={runCustomTest} className="w-full bg-transparent" variant="outline">
                Run Custom Test
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <p className="text-sm text-gray-600">
                {tests.length > 0 ? `${tests.length} tests completed` : "No tests run yet"}
              </p>
            </CardHeader>
            <CardContent>
              {tests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Run tests to see verification results</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tests.map((test) => (
                    <div key={test.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(test.status)}
                          <h3 className="font-semibold">{test.testName}</h3>
                        </div>
                        {getStatusBadge(test.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p>
                            <strong>Bank:</strong> {test.bankName}
                          </p>
                          <p>
                            <strong>Account Type:</strong> {test.accountType}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Routing:</strong> {test.routingNumber}
                          </p>
                          <p>
                            <strong>Method:</strong> {test.verificationMethod}
                          </p>
                        </div>
                      </div>

                      {test.result && (
                        <Alert
                          className={test.result.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                        >
                          <AlertDescription>
                            <p className="font-medium mb-2">{test.result.message}</p>
                            <ul className="text-sm space-y-1">
                              {test.result.details.map((detail, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  {detail}
                                </li>
                              ))}
                            </ul>
                            <p className="text-xs text-gray-500 mt-2">
                              Processing time: {test.result.processingTime}ms
                            </p>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
