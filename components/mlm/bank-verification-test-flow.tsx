"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, AlertCircle, Building2, CreditCard, RefreshCw, Eye, Copy } from "lucide-react"
import { BankVerificationModal } from "./bank-verification-modal"
import {
  type BankVerification,
  initiateBankVerification,
  verifyMicroDeposits,
  generateMicroDepositAmounts,
} from "@/lib/bank-verification"

interface TestBankAccount {
  id: string
  accountHolderName: string
  routingNumber: string
  accountNumber: string
  bankName: string
  accountType: "checking" | "savings"
}

const testBankAccounts: TestBankAccount[] = [
  {
    id: "test_001",
    accountHolderName: "John Doe",
    routingNumber: "021000021",
    accountNumber: "1234567890",
    bankName: "Chase Bank",
    accountType: "checking",
  },
  {
    id: "test_002",
    accountHolderName: "Jane Smith",
    routingNumber: "011401533",
    accountNumber: "9876543210",
    bankName: "Wells Fargo",
    accountType: "savings",
  },
  {
    id: "test_003",
    accountHolderName: "Bob Johnson",
    routingNumber: "121000248",
    accountNumber: "5555666677",
    bankName: "Bank of America",
    accountType: "checking",
  },
]

export function BankVerificationTestFlow() {
  const [selectedAccount, setSelectedAccount] = useState<TestBankAccount | null>(null)
  const [currentVerification, setCurrentVerification] = useState<BankVerification | null>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [testResults, setTestResults] = useState<
    Array<{
      step: string
      status: "pending" | "success" | "error"
      message: string
      timestamp: Date
    }>
  >([])
  const [isRunningTest, setIsRunningTest] = useState(false)

  const addTestResult = (step: string, status: "pending" | "success" | "error", message: string) => {
    setTestResults((prev) => [
      ...prev,
      {
        step,
        status,
        message,
        timestamp: new Date(),
      },
    ])
  }

  const runFullVerificationTest = async (account: TestBankAccount) => {
    setIsRunningTest(true)
    setTestResults([])

    try {
      // Step 1: Initiate verification
      addTestResult("Initiation", "pending", "Starting bank verification process...")

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const verification = await initiateBankVerification("test_user_123", `pm_${account.id}`, {
        routingNumber: account.routingNumber,
        accountNumber: account.accountNumber,
        accountHolderName: account.accountHolderName,
      })

      setCurrentVerification(verification)
      addTestResult(
        "Initiation",
        "success",
        `Micro-deposits sent: $0.${verification.microDeposits.amount1.toString().padStart(2, "0")} and $0.${verification.microDeposits.amount2.toString().padStart(2, "0")}`,
      )

      // Step 2: Simulate deposit processing time
      addTestResult("Processing", "pending", "Waiting for deposits to appear in account...")
      await new Promise((resolve) => setTimeout(resolve, 2000))
      addTestResult("Processing", "success", "Deposits processed and available for verification")

      // Step 3: Auto-verify with correct amounts
      addTestResult("Verification", "pending", "Attempting verification with correct amounts...")
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const verificationResult = verifyMicroDeposits(
        verification,
        verification.microDeposits.amount1,
        verification.microDeposits.amount2,
      )

      if (verificationResult.success) {
        setCurrentVerification(verificationResult.verification)
        addTestResult("Verification", "success", "Bank account verified successfully!")
      } else {
        addTestResult("Verification", "error", verificationResult.message)
      }
    } catch (error) {
      addTestResult("Error", "error", `Test failed: ${error}`)
    } finally {
      setIsRunningTest(false)
    }
  }

  const runFailureTest = async (account: TestBankAccount) => {
    setIsRunningTest(true)
    setTestResults([])

    try {
      // Step 1: Initiate verification
      addTestResult("Initiation", "pending", "Starting bank verification process...")

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const verification = await initiateBankVerification("test_user_123", `pm_${account.id}`, {
        routingNumber: account.routingNumber,
        accountNumber: account.accountNumber,
        accountHolderName: account.accountHolderName,
      })

      setCurrentVerification(verification)
      addTestResult(
        "Initiation",
        "success",
        `Micro-deposits sent: $0.${verification.microDeposits.amount1.toString().padStart(2, "0")} and $0.${verification.microDeposits.amount2.toString().padStart(2, "0")}`,
      )

      // Step 2: Simulate deposit processing
      addTestResult("Processing", "pending", "Waiting for deposits to appear in account...")
      await new Promise((resolve) => setTimeout(resolve, 1500))
      addTestResult("Processing", "success", "Deposits processed and available for verification")

      // Step 3: Test with wrong amounts
      addTestResult("Verification", "pending", "Attempting verification with incorrect amounts...")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const wrongAmounts = generateMicroDepositAmounts()
      const verificationResult = verifyMicroDeposits(verification, wrongAmounts.amount1, wrongAmounts.amount2)

      setCurrentVerification(verificationResult.verification)
      addTestResult("Verification", "error", verificationResult.message)

      // Step 4: Test max attempts
      if (verificationResult.verification.attempts < verificationResult.verification.maxAttempts) {
        addTestResult("Retry", "pending", "Testing maximum attempts...")
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Simulate hitting max attempts
        let currentVerif = verificationResult.verification
        while (currentVerif.attempts < currentVerif.maxAttempts) {
          const retryResult = verifyMicroDeposits(currentVerif, 99, 98)
          currentVerif = retryResult.verification
        }

        setCurrentVerification(currentVerif)
        addTestResult("Retry", "error", "Maximum verification attempts exceeded")
      }
    } catch (error) {
      addTestResult("Error", "error", `Test failed: ${error}`)
    } finally {
      setIsRunningTest(false)
    }
  }

  const getStatusIcon = (status: "pending" | "success" | "error") => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bank Verification Test Flow</h2>
          <p className="text-gray-600">Test the complete bank verification process with sample accounts</p>
        </div>
        <Button
          onClick={() => {
            setTestResults([])
            setCurrentVerification(null)
            setSelectedAccount(null)
          }}
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset Tests
        </Button>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">Test Accounts</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="verification">Verification UI</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testBankAccounts.map((account) => (
              <Card key={account.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{account.bankName}</CardTitle>
                    <Building2 className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Account Holder:</span>
                      <span className="font-medium">{account.accountHolderName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Routing:</span>
                      <div className="flex items-center space-x-1">
                        <span className="font-mono">{account.routingNumber}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account.routingNumber)}
                          className="h-4 w-4 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Account:</span>
                      <div className="flex items-center space-x-1">
                        <span className="font-mono">****{account.accountNumber.slice(-4)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account.accountNumber)}
                          className="h-4 w-4 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <Badge variant="outline">{account.accountType}</Badge>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => runFullVerificationTest(account)}
                      disabled={isRunningTest}
                      className="flex-1"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Test Success
                    </Button>
                    <Button
                      onClick={() => runFailureTest(account)}
                      disabled={isRunningTest}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Test Failure
                    </Button>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedAccount(account)
                      setShowVerificationModal(true)
                    }}
                    variant="ghost"
                    className="w-full"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Manual Verification
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Execution Log</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tests run yet. Select a test account to begin.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{result.step}</p>
                          <span className="text-xs text-gray-500">{result.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {currentVerification && (
            <Card>
              <CardHeader>
                <CardTitle>Current Verification State</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge className="ml-2">{currentVerification.status.replace("_", " ").toUpperCase()}</Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Attempts:</span>
                    <span className="ml-2 font-medium">
                      {currentVerification.attempts} / {currentVerification.maxAttempts}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Micro-deposits:</span>
                    <span className="ml-2 font-mono">
                      $0.{currentVerification.microDeposits.amount1.toString().padStart(2, "0")}, $0.
                      {currentVerification.microDeposits.amount2.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Expires:</span>
                    <span className="ml-2">{currentVerification.microDeposits.expiresAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification UI Preview</CardTitle>
              <p className="text-sm text-gray-600">This shows how the verification modal appears to users</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    The verification modal will appear when users need to verify their bank account. Click "Open
                    Verification Modal" to see the user experience.
                  </AlertDescription>
                </Alert>

                <Button onClick={() => setShowVerificationModal(true)} className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Open Verification Modal
                </Button>

                {currentVerification && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Test Hints:</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>
                        • Correct amounts: $0.{currentVerification.microDeposits.amount1.toString().padStart(2, "0")}{" "}
                        and $0.{currentVerification.microDeposits.amount2.toString().padStart(2, "0")}
                      </p>
                      <p>• Try entering wrong amounts to test error handling</p>
                      <p>• Test with amounts outside 0.01-0.99 range</p>
                      <p>• Observe attempt counter and remaining attempts</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verification Modal */}
      <BankVerificationModal
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        verification={currentVerification}
        onVerificationComplete={(verification) => {
          setCurrentVerification(verification)
          addTestResult(
            "Manual Verification",
            verification.status === "verified" ? "success" : "error",
            verification.status === "verified"
              ? "Bank account verified successfully!"
              : `Verification ${verification.status}`,
          )
        }}
      />
    </div>
  )
}
