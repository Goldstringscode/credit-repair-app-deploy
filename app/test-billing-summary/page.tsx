'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  BarChart3,
  Bell,
  Zap,
  RefreshCw,
  Download,
  ExternalLink,
  FileText,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface TestCategory {
  name: string
  description: string
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  testsPassed: number
  testsTotal: number
  lastRun: string
  issues: string[]
  icon: React.ComponentType<any>
  href: string
}

export default function TestBillingSummaryPage() {
  const [categories, setCategories] = useState<TestCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    loadTestData()
  }, [])

  const loadTestData = async () => {
    setLoading(true)
    
    // Simulate loading test data
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const testCategories: TestCategory[] = [
      {
        name: 'Subscription Management',
        description: 'Core subscription lifecycle and plan management',
        status: 'healthy',
        testsPassed: 5,
        testsTotal: 5,
        lastRun: '2 minutes ago',
        issues: [],
        icon: CreditCard,
        href: '/test-advanced-billing'
      },
      {
        name: 'Dunning Management',
        description: 'Automated payment failure recovery and retry logic',
        status: 'healthy',
        testsPassed: 4,
        testsTotal: 4,
        lastRun: '3 minutes ago',
        issues: [],
        icon: Bell,
        href: '/test-dunning'
      },
      {
        name: 'Billing Analytics',
        description: 'Revenue metrics, forecasting, and business intelligence',
        status: 'healthy',
        testsPassed: 6,
        testsTotal: 6,
        lastRun: '1 minute ago',
        issues: [],
        icon: BarChart3,
        href: '/test-advanced-billing'
      },
      {
        name: 'Payment Processing',
        description: 'Stripe integration and payment workflows',
        status: 'warning',
        testsPassed: 8,
        testsTotal: 10,
        lastRun: '5 minutes ago',
        issues: ['Rate limiting test failed', 'Webhook validation pending'],
        icon: DollarSign,
        href: '/test-payment-simple'
      },
      {
        name: 'Invoice Generation',
        description: 'PDF generation and invoice management',
        status: 'healthy',
        testsPassed: 4,
        testsTotal: 4,
        lastRun: '4 minutes ago',
        issues: [],
        icon: FileText,
        href: '/test-advanced-billing'
      },
      {
        name: 'API Endpoints',
        description: 'REST API validation and error handling',
        status: 'healthy',
        testsPassed: 12,
        testsTotal: 12,
        lastRun: '1 minute ago',
        issues: [],
        icon: Zap,
        href: '/test-advanced-billing'
      },
      {
        name: 'UI Components',
        description: 'Dashboard interfaces and user interactions',
        status: 'healthy',
        testsPassed: 8,
        testsTotal: 8,
        lastRun: '2 minutes ago',
        issues: [],
        icon: Users,
        href: '/test-advanced-billing'
      },
      {
        name: 'Security & Compliance',
        description: 'Data protection and regulatory compliance',
        status: 'healthy',
        testsPassed: 15,
        testsTotal: 15,
        lastRun: '6 minutes ago',
        issues: [],
        icon: Shield,
        href: '/test-compliance'
      }
    ]
    
    setCategories(testCategories)
    setLastUpdated(new Date())
    setLoading(false)
  }

  const getStatusColor = (status: TestCategory['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: TestCategory['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestCategory['status']) => {
    const statusConfig = {
      healthy: { color: 'bg-green-100 text-green-800', text: 'Healthy' },
      warning: { color: 'bg-yellow-100 text-yellow-800', text: 'Warning' },
      error: { color: 'bg-red-100 text-red-800', text: 'Error' },
      unknown: { color: 'bg-gray-100 text-gray-800', text: 'Unknown' }
    }

    const config = statusConfig[status]
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    )
  }

  const totalTests = categories.reduce((sum, cat) => sum + cat.testsTotal, 0)
  const passedTests = categories.reduce((sum, cat) => sum + cat.testsPassed, 0)
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
  const healthyCategories = categories.filter(cat => cat.status === 'healthy').length
  const warningCategories = categories.filter(cat => cat.status === 'warning').length
  const errorCategories = categories.filter(cat => cat.status === 'error').length

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading test summary...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Billing System Health Dashboard</h1>
            <p className="text-gray-600">Comprehensive overview of all billing and payment system tests</p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={loadTestData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Health</p>
                <p className="text-2xl font-bold text-green-600">{successRate}%</p>
                <Progress value={successRate} className="mt-2" />
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tests Passed</p>
                <p className="text-2xl font-bold text-green-600">{passedTests}</p>
                <p className="text-sm text-gray-600">of {totalTests} total</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Healthy Systems</p>
                <p className="text-2xl font-bold text-green-600">{healthyCategories}</p>
                <p className="text-sm text-gray-600">of {categories.length} categories</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Issues</p>
                <p className="text-2xl font-bold text-yellow-600">{warningCategories + errorCategories}</p>
                <p className="text-sm text-gray-600">
                  {warningCategories} warnings, {errorCategories} errors
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Alerts */}
      {warningCategories > 0 || errorCategories > 0 ? (
        <Alert className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errorCategories > 0 && `${errorCategories} system(s) have errors that need immediate attention. `}
            {warningCategories > 0 && `${warningCategories} system(s) have warnings that should be reviewed. `}
            Click on individual systems below for detailed test results.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-8 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All billing systems are operating normally. All tests are passing and no issues detected.
          </AlertDescription>
        </Alert>
      )}

      {/* Test Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const Icon = category.icon
          const testPercentage = category.testsTotal > 0 
            ? Math.round((category.testsPassed / category.testsTotal) * 100) 
            : 0

          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  {getStatusIcon(category.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Test Status</span>
                    {getStatusBadge(category.status)}
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tests Passed</span>
                      <span>{category.testsPassed}/{category.testsTotal}</span>
                    </div>
                    <Progress value={testPercentage} className="h-2" />
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Last run: {category.lastRun}</p>
                    <p>Success rate: {testPercentage}%</p>
                  </div>

                  {category.issues.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-600">Issues:</p>
                      {category.issues.map((issue, issueIndex) => (
                        <p key={issueIndex} className="text-xs text-red-600">• {issue}</p>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={category.href}>
                      <Button size="sm" className="flex-1">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Tests
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/test-advanced-billing">
              <Button className="w-full justify-start">
                <Zap className="h-4 w-4 mr-2" />
                Run All Billing Tests
              </Button>
            </Link>
            <Link href="/test-dunning">
              <Button className="w-full justify-start" variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Test Dunning System
              </Button>
            </Link>
            <Link href="/test-compliance">
              <Button className="w-full justify-start" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Test Compliance
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
