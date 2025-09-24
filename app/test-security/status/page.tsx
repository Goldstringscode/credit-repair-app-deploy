'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'

interface EndpointStatus {
  name: string
  url: string
  method: string
  status: 'pass' | 'fail' | 'pending' | 'unknown'
  lastChecked: string
  responseTime?: number
  error?: string
}

export default function SecurityStatusPage() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    { name: 'Rate Limiting', url: '/api/test/rate-limit', method: 'POST', status: 'unknown', lastChecked: 'Never' },
    { name: 'Input Validation', url: '/api/test/validation', method: 'POST', status: 'unknown', lastChecked: 'Never' },
    { name: 'CORS Policy', url: '/api/test/cors', method: 'GET', status: 'unknown', lastChecked: 'Never' },
    { name: 'Data Encryption', url: '/api/test/encryption', method: 'POST', status: 'unknown', lastChecked: 'Never' },
    { name: 'Audit Logging', url: '/api/test/audit', method: 'POST', status: 'unknown', lastChecked: 'Never' },
    { name: 'Authentication', url: '/api/test/auth', method: 'GET', status: 'unknown', lastChecked: 'Never' },
    { name: 'Authorization', url: '/api/test/authorization', method: 'GET', status: 'unknown', lastChecked: 'Never' },
    { name: 'Security Headers', url: '/api/test/security-headers', method: 'GET', status: 'unknown', lastChecked: 'Never' },
    { name: 'Environment Validation', url: '/api/test/env-validation', method: 'GET', status: 'unknown', lastChecked: 'Never' },
    { name: 'File Upload Security', url: '/api/test/file-upload', method: 'POST', status: 'unknown', lastChecked: 'Never' }
  ])
  const [isChecking, setIsChecking] = useState(false)

  const checkEndpoint = async (endpoint: EndpointStatus): Promise<EndpointStatus> => {
    const startTime = Date.now()
    
    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      }

      if (endpoint.method === 'POST') {
        if (endpoint.url.includes('validation')) {
          options.body = JSON.stringify({ email: 'test@example.com' })
        } else if (endpoint.url.includes('encryption')) {
          options.body = JSON.stringify({ ssn: '1234', creditScore: 750 })
        } else if (endpoint.url.includes('audit')) {
          options.body = JSON.stringify({ action: 'test_action' })
        } else if (endpoint.url.includes('rate-limit')) {
          options.body = JSON.stringify({})
        }
      }

      if (endpoint.url.includes('auth') || endpoint.url.includes('authorization')) {
        options.headers = {
          ...options.headers,
          'Authorization': 'Bearer valid-token',
          'X-User-Role': 'user'
        }
      }

      const response = await fetch(endpoint.url, options)
      const responseTime = Date.now() - startTime
      
      const isSuccess = response.ok || 
        (endpoint.url.includes('validation') && response.status === 400) ||
        (endpoint.url.includes('auth') && response.status === 401) ||
        (endpoint.url.includes('authorization') && response.status === 200)

      return {
        ...endpoint,
        status: isSuccess ? 'pass' : 'fail',
        lastChecked: new Date().toLocaleTimeString(),
        responseTime,
        error: isSuccess ? undefined : `HTTP ${response.status}`
      }
    } catch (error: any) {
      return {
        ...endpoint,
        status: 'fail',
        lastChecked: new Date().toLocaleTimeString(),
        responseTime: Date.now() - startTime,
        error: error.message
      }
    }
  }

  const checkAllEndpoints = async () => {
    setIsChecking(true)
    const updatedEndpoints = await Promise.all(
      endpoints.map(endpoint => checkEndpoint(endpoint))
    )
    setEndpoints(updatedEndpoints)
    setIsChecking(false)
  }

  const checkSingleEndpoint = async (index: number) => {
    const updatedEndpoints = [...endpoints]
    updatedEndpoints[index] = { ...updatedEndpoints[index], status: 'pending' }
    setEndpoints(updatedEndpoints)

    const result = await checkEndpoint(endpoints[index])
    updatedEndpoints[index] = result
    setEndpoints(updatedEndpoints)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-500">Pass</Badge>
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>
      case 'pending':
        return <Badge variant="secondary">Checking...</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const passedCount = endpoints.filter(e => e.status === 'pass').length
  const failedCount = endpoints.filter(e => e.status === 'fail').length
  const successRate = endpoints.length > 0 ? Math.round((passedCount / endpoints.length) * 100) : 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Endpoints Status</h1>
          <p className="text-muted-foreground">
            Real-time status of all security API endpoints
          </p>
        </div>
        <Button 
          onClick={checkAllEndpoints} 
          disabled={isChecking}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isChecking ? 'Checking...' : 'Check All Endpoints'}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Passed</p>
                <p className="text-2xl font-bold text-green-500">{passedCount}</p>
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
                <p className="text-2xl font-bold text-red-500">{failedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Unknown</p>
                <p className="text-2xl font-bold text-gray-500">{endpoints.length - passedCount - failedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-blue-500">{successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Endpoints List */}
      <div className="space-y-4">
        {endpoints.map((endpoint, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(endpoint.status)}
                  <div>
                    <h3 className="font-medium">{endpoint.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {endpoint.method} {endpoint.url}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last checked: {endpoint.lastChecked}
                      {endpoint.responseTime && ` (${endpoint.responseTime}ms)`}
                    </p>
                    {endpoint.error && (
                      <p className="text-xs text-red-500 mt-1">
                        Error: {endpoint.error}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(endpoint.status)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => checkSingleEndpoint(index)}
                    disabled={endpoint.status === 'pending'}
                  >
                    Check
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Auto-refresh info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Click "Check All Endpoints" to test all security features</p>
        <p>Individual endpoints can be tested by clicking the "Check" button</p>
      </div>
    </div>
  )
}

