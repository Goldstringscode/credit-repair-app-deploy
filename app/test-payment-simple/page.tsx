'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, CreditCard, CheckCircle, XCircle, DollarSign } from 'lucide-react'

interface TestResult {
  success: boolean
  data?: any
  error?: string
  timestamp: string
}

export default function SimplePaymentTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [amount, setAmount] = useState(29.99)

  const addResult = (result: TestResult) => {
    setResults(prev => [result, ...prev].slice(0, 5)) // Keep last 5 results
  }

  const testPaymentStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-payment')
      const data = await response.json()
      
      addResult({
        success: response.ok,
        data: data,
        error: response.ok ? undefined : data.error,
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      addResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const testPayment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          currency: 'usd',
          description: 'Test payment',
          customerEmail: 'test@example.com'
        })
      })
      const data = await response.json()
      
      addResult({
        success: response.ok,
        data: data,
        error: response.ok ? undefined : data.error,
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      addResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <CreditCard className="h-8 w-8" />
        Simple Payment Test
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={testPaymentStatus} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Status'}
              </Button>
              
              <Button 
                onClick={testPayment} 
                disabled={loading}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Payment'}
              </Button>
            </div>

            <Button 
              onClick={clearResults} 
              variant="outline"
              className="w-full"
            >
              Clear Results
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tests run yet. Click a button to test.</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? 'Success' : 'Failed'}
                        </Badge>
                        <Badge variant="outline">
                          Test Mode
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {result.error && (
                      <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                        <p className="text-sm text-red-800 font-medium">Error:</p>
                        <p className="text-sm text-red-700">{result.error}</p>
                      </div>
                    )}
                    
                    {result.data && (
                      <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                        <p className="text-sm text-green-800 font-medium">Response:</p>
                        <p className="text-sm text-green-700">{result.data.message}</p>
                        {result.data.data && (
                          <div className="mt-2 text-xs">
                            <p><strong>Payment ID:</strong> {result.data.data.paymentId}</p>
                            <p><strong>Amount:</strong> ${result.data.data.amount}</p>
                            <p><strong>Status:</strong> {result.data.data.status}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. <strong>Test Status</strong> - Checks if the payment system is operational</p>
            <p>2. <strong>Test Payment</strong> - Simulates a payment with the specified amount</p>
            <p>3. <strong>Results</strong> - View the test results and responses</p>
            <p className="text-blue-600 font-medium">This is a test endpoint that doesn't require Stripe keys!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
