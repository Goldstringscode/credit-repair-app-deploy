'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, CreditCard, Users, FileText, CheckCircle, XCircle } from 'lucide-react'

interface TestResult {
  success: boolean
  data?: any
  error?: string
  timestamp: string
}

export default function StripeTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [testData, setTestData] = useState({
    amount: 29.99,
    currency: 'usd',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    cardNumber: '4242424242424242',
    expMonth: 12,
    expYear: 2025,
    cvc: '123',
    address: {
      line1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postal_code: '12345',
      country: 'US'
    }
  })

  const addResult = (result: TestResult) => {
    setResults(prev => [result, ...prev].slice(0, 10)) // Keep last 10 results
  }

  const testStripeConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/test/connection')
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

  const testCreateCustomer = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testData.email,
          name: testData.name,
          phone: testData.phone,
          address: testData.address,
          metadata: { test: 'true' }
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

  const testCreatePaymentIntent = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: testData.amount,
          currency: testData.currency,
          description: 'Test payment',
          metadata: { test: 'true' }
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

  const testGetPlans = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/subscriptions')
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
      <h1 className="text-3xl font-bold mb-6">Stripe Integration Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={testStripeConnection} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Connection'}
              </Button>
              
              <Button 
                onClick={testGetPlans} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Plans'}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={testData.amount}
                  onChange={(e) => setTestData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={testData.email}
                  onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={testData.name}
                  onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={testCreateCustomer} 
                disabled={loading}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Customer'}
              </Button>
              
              <Button 
                onClick={testCreatePaymentIntent} 
                disabled={loading}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Payment Intent'}
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
              <FileText className="h-5 w-5" />
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
                      <details className="text-sm">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Response Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
