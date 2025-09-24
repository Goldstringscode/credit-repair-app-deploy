'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function DebugCompliancePage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testEndpoints = [
    {
      name: 'Health Check',
      url: '/api/compliance/health',
      method: 'GET',
      data: null
    },
    {
      name: 'PCI Add Card',
      url: '/api/compliance/pci',
      method: 'POST',
      data: {
        action: 'add_card',
        data: {
          userId: 'test-user-123',
          cardNumber: '4111111111111111',
          expiryMonth: 12,
          expiryYear: 2025,
          cardholderName: 'Test User',
          cvv: '123'
        }
      }
    },
    {
      name: 'Retention Process Expired',
      url: '/api/compliance/retention',
      method: 'PUT',
      data: {
        action: 'process_expired'
      }
    }
  ]

  const runTest = async (test: any) => {
    setLoading(true)
    const startTime = Date.now()
    
    try {
      console.log(`🧪 Testing ${test.name}...`)
      console.log(`URL: ${test.url}`)
      console.log(`Method: ${test.method}`)
      console.log(`Data:`, test.data)

      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: test.data ? JSON.stringify(test.data) : undefined
      })

      const responseData = await response.json()
      const duration = Date.now() - startTime

      const result = {
        name: test.name,
        status: response.status,
        success: response.ok,
        duration,
        data: responseData,
        timestamp: new Date().toISOString()
      }

      setResults(prev => [result, ...prev])

      console.log(`✅ ${test.name}: ${response.status} (${duration}ms)`)
      console.log('Response:', responseData)

    } catch (error: any) {
      const duration = Date.now() - startTime
      const result = {
        name: test.name,
        status: 'ERROR',
        success: false,
        duration,
        error: error.message,
        timestamp: new Date().toISOString()
      }

      setResults(prev => [result, ...prev])

      console.error(`❌ ${test.name}: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    for (const test of testEndpoints) {
      await runTest(test)
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between tests
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug Compliance Endpoints</h1>
        <p className="text-gray-600">Debug compliance API endpoints from the browser</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>Run compliance endpoint tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runAllTests} 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <div className="grid grid-cols-1 gap-2">
              {testEndpoints.map((test, index) => (
                <Button 
                  key={index}
                  onClick={() => runTest(test)} 
                  variant="outline"
                  disabled={loading}
                >
                  {test.name}
                </Button>
              ))}
            </div>

            <Button 
              onClick={clearResults} 
              variant="destructive"
              className="w-full"
            >
              Clear Results
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Real-time test execution results</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tests run yet. Click "Run All Tests" to start.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{result.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{result.duration}ms</span>
                      </div>
                    </div>
                    
                    {result.error && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                        <p className="text-sm text-red-800 font-medium">Error:</p>
                        <p className="text-sm text-red-700">{result.error}</p>
                      </div>
                    )}

                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        View Response
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>

                    <div className="text-xs text-gray-400 mt-2">
                      {result.timestamp}
                    </div>
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
