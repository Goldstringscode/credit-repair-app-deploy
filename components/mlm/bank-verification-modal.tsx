"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, Building2 } from "lucide-react"
import { type BankVerification, verifyMicroDeposits } from "@/lib/bank-verification"

interface BankVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  verification: BankVerification | null
  onVerificationComplete: (verification: BankVerification) => void
}

export function BankVerificationModal({
  open,
  onOpenChange,
  verification,
  onVerificationComplete,
}: BankVerificationModalProps) {
  const [amount1, setAmount1] = useState("")
  const [amount2, setAmount2] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  if (!verification) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const submittedAmount1 = Math.round(Number.parseFloat(amount1) * 100) // Convert to cents
      const submittedAmount2 = Math.round(Number.parseFloat(amount2) * 100) // Convert to cents

      if (isNaN(submittedAmount1) || isNaN(submittedAmount2)) {
        setError("Please enter valid amounts")
        return
      }

      if (submittedAmount1 < 1 || submittedAmount1 > 99 || submittedAmount2 < 1 || submittedAmount2 > 99) {
        setError("Amounts must be between $0.01 and $0.99")
        return
      }

      const result = verifyMicroDeposits(verification, submittedAmount1, submittedAmount2)

      if (result.success) {
        setSuccess(result.message)
        onVerificationComplete(result.verification)
        setTimeout(() => {
          onOpenChange(false)
          setAmount1("")
          setAmount2("")
        }, 2000)
      } else {
        setError(result.message)
        onVerificationComplete(result.verification)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = () => {
    switch (verification.status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "deposits_sent":
      case "verification_pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Building2 className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = () => {
    switch (verification.status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "deposits_sent":
      case "verification_pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const remainingAttempts = verification.maxAttempts - verification.attempts
  const isExpired = new Date() > verification.microDeposits.expiresAt
  const canSubmit = verification.status === "verification_pending" && !isExpired && remainingAttempts > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Bank Account Verification</span>
          </DialogTitle>
          <DialogDescription>Verify your bank account by entering the micro-deposit amounts</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Status:</span>
            <Badge className={getStatusColor()}>{verification.status.replace("_", " ").toUpperCase()}</Badge>
          </div>

          {verification.status === "verified" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your bank account has been successfully verified and is ready for payouts!
              </AlertDescription>
            </Alert>
          )}

          {verification.status === "failed" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Bank verification failed: {verification.failureReason}</AlertDescription>
            </Alert>
          )}

          {(verification.status === "deposits_sent" || verification.status === "verification_pending") && (
            <>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Verification Instructions</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Check your bank account for two small deposits</li>
                    <li>2. Deposits may take 1-2 business days to appear</li>
                    <li>3. Enter the exact amounts below</li>
                    <li>4. You have {verification.maxAttempts} attempts to verify</li>
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Deposits sent:</span>
                    <p className="font-medium">{verification.microDeposits.sentAt.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Expires:</span>
                    <p className="font-medium">{verification.microDeposits.expiresAt.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Attempts used:</span>
                    <p className="font-medium">
                      {verification.attempts} of {verification.maxAttempts}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Remaining:</span>
                    <p className="font-medium">{remainingAttempts}</p>
                  </div>
                </div>
              </div>

              {canSubmit && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount1">First Deposit Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="amount1"
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="0.99"
                          placeholder="0.00"
                          value={amount1}
                          onChange={(e) => setAmount1(e.target.value)}
                          className="pl-8"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount2">Second Deposit Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="amount2"
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="0.99"
                          placeholder="0.00"
                          value={amount2}
                          onChange={(e) => setAmount2(e.target.value)}
                          className="pl-8"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Verifying..." : "Verify Amounts"}
                  </Button>
                </form>
              )}

              {isExpired && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Verification period has expired. Please request new micro-deposits.
                  </AlertDescription>
                </Alert>
              )}

              {!canSubmit && !isExpired && remainingAttempts === 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Maximum verification attempts exceeded. Please add a new bank account.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
