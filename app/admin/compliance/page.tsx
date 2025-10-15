'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { complianceService } from '@/lib/compliance-service'
import { 
  Shield, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye,
  Trash2,
  Settings,
  BarChart3,
  Lock,
  Heart,
  CreditCard,
  FileCheck,
  Activity
} from 'lucide-react'

interface ComplianceStatus {
  gdpr: {
    requests: number
    completed: number
    pending: number
    complianceRate: number
  }
  fcra: {
    disputes: number
    freeReports: number
    resolved: number
    complianceRate: number
  }
  ccpa: {
    requests: number
    completed: number
    pending: number
    complianceRate: number
  }
  hipaa: {
    requests: number
    completed: number
    breaches: number
    complianceRate: number
  }
  pci: {
    cards: number
    transactions: number
    vulnerabilities: number
    complianceRate: number
  }
  retention: {
    totalRecords: number
    expired: number
    deleted: number
    exempt: number
    complianceRate: number
  }
  audit: {
    totalEvents: number
    criticalEvents: number
    highRiskEvents: number
    complianceRate: number
  }
}

export default function ComplianceDashboard() {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadComplianceStatus()
  }, [])

  const loadComplianceStatus = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/compliance')
      const result = await response.json()
      
      if (result.success) {
        setComplianceStatus(result.data)
      } else {
        console.error('Failed to load compliance status:', result.error)
        alert(`Compliance system error: ${result.error}. ${result.details || 'Please check your database configuration.'}`)
        
        // Fallback to mock data if API fails
        const mockStatus: ComplianceStatus = {
          gdpr: {
            requests: 45,
            completed: 42,
            pending: 3,
            complianceRate: 93
          },
          fcra: {
            disputes: 128,
            freeReports: 67,
            resolved: 115,
            complianceRate: 90
          },
          ccpa: {
            requests: 23,
            completed: 21,
            pending: 2,
            complianceRate: 91
          },
          hipaa: {
            requests: 12,
            completed: 11,
            breaches: 0,
            complianceRate: 100
          },
          pci: {
            cards: 89,
            transactions: 1247,
            vulnerabilities: 2,
            complianceRate: 95
          },
          retention: {
            totalRecords: 1250,
            expired: 45,
            deleted: 38,
            exempt: 7,
            complianceRate: 95
          },
          audit: {
            totalEvents: 15420,
            criticalEvents: 3,
            highRiskEvents: 12,
            complianceRate: 98
          }
        }
        setComplianceStatus(mockStatus)
      }
    } catch (error) {
      console.error('Failed to load compliance status:', error)
      alert('Failed to connect to compliance system. Please check your database configuration.')
      
      // Fallback to mock data if service fails
      const mockStatus: ComplianceStatus = {
        gdpr: {
          requests: 45,
          completed: 42,
          pending: 3,
          complianceRate: 93
        },
        fcra: {
          disputes: 128,
          freeReports: 67,
          resolved: 115,
          complianceRate: 90
        },
        ccpa: {
          requests: 23,
          completed: 21,
          pending: 2,
          complianceRate: 91
        },
        hipaa: {
          requests: 12,
          completed: 11,
          breaches: 0,
          complianceRate: 100
        },
        pci: {
          cards: 89,
          transactions: 1247,
          vulnerabilities: 2,
          complianceRate: 95
        },
        retention: {
          totalRecords: 1250,
          expired: 45,
          deleted: 38,
          exempt: 7,
          complianceRate: 95
        },
        audit: {
          totalEvents: 15420,
          criticalEvents: 3,
          highRiskEvents: 12,
          complianceRate: 98
        }
      }
      setComplianceStatus(mockStatus)
    } finally {
      setLoading(false)
    }
  }

  const handleGDPRRequest = async (requestType: string) => {
    try {
      const response = await fetch('/api/compliance/gdpr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123',
          requestType,
          reason: 'User requested data access',
          requestedData: {
            categories: ['personal_info', 'contact_info', 'account_data'],
            purposes: ['service_provision', 'marketing', 'analytics']
          }
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert(`${requestType.replace('_', ' ')} request submitted successfully`)
        loadComplianceStatus()
      } else {
        alert(`Failed to submit request: ${result.error}`)
      }
    } catch (error) {
      console.error('GDPR request error:', error)
      alert('Error submitting request. Please check your database configuration.')
    }
  }

  const handleFCRARequest = async (action: string) => {
    try {
      const data = action === 'dispute' ? {
        bureau: 'experian',
        accountName: 'Chase Credit Card',
        accountNumber: '****1234',
        description: 'Inaccurate account information',
        documents: ['credit_report.pdf', 'dispute_letter.pdf']
      } : { 
        bureau: 'experian',
        accountName: 'Chase Credit Card',
        accountNumber: '****1234'
      }

      const response = await fetch('/api/compliance/fcra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123',
          action,
          data
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert(`${action} request submitted successfully`)
        loadComplianceStatus()
      } else {
        alert(`Failed to submit request: ${result.error}`)
      }
    } catch (error) {
      console.error('FCRA request error:', error)
      alert('Error submitting request. Please check your database configuration.')
    }
  }

  const handleCCPARequest = async (requestType: string) => {
    try {
      const response = await fetch('/api/compliance/ccpa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123',
          requestType,
          businessPurpose: 'Service provision and marketing',
          thirdParties: ['marketing_partners', 'analytics_providers']
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert(`${requestType.replace('_', ' ')} request submitted successfully`)
        loadComplianceStatus()
      } else {
        alert(`Failed to submit request: ${result.error}`)
      }
    } catch (error) {
      console.error('CCPA request error:', error)
      alert('Error submitting request. Please check your database configuration.')
    }
  }

  const handleHIPAARequest = async (requestType: string) => {
    try {
      const response = await fetch('/api/compliance/hipaa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123',
          requestType,
          healthData: {
            id: 'health_data_123',
            userId: 'user-123',
            dataType: 'medical_record',
            description: 'Sample health data',
            sensitivity: 'high',
            accessLevel: 'view',
            encrypted: true,
            lastAccessed: new Date(),
            accessedBy: []
          }
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert(`${requestType} request submitted successfully`)
        loadComplianceStatus()
      } else {
        alert(`Failed to submit request: ${result.error}`)
      }
    } catch (error) {
      console.error('HIPAA request error:', error)
      alert('Error submitting request. Please check your database configuration.')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading compliance status...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Dashboard</h1>
        <p className="text-gray-600">Monitor and manage regulatory compliance across all frameworks</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
          <TabsTrigger value="fcra">FCRA</TabsTrigger>
          <TabsTrigger value="ccpa">CCPA</TabsTrigger>
          <TabsTrigger value="hipaa">HIPAA</TabsTrigger>
          <TabsTrigger value="pci">PCI DSS</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">GDPR Compliance</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceStatus?.gdpr.complianceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {complianceStatus?.gdpr.completed} of {complianceStatus?.gdpr.requests} requests completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">FCRA Compliance</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceStatus?.fcra.complianceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {complianceStatus?.fcra.resolved} of {complianceStatus?.fcra.disputes} disputes resolved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CCPA Compliance</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceStatus?.ccpa.complianceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {complianceStatus?.ccpa.completed} of {complianceStatus?.ccpa.requests} requests completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">HIPAA Compliance</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceStatus?.hipaa.complianceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {complianceStatus?.hipaa.breaches} breaches, {complianceStatus?.hipaa.completed} requests completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PCI DSS Compliance</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceStatus?.pci.complianceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {complianceStatus?.pci.cards} cards, {complianceStatus?.pci.vulnerabilities} vulnerabilities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Retention</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceStatus?.retention.complianceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {complianceStatus?.retention.deleted} of {complianceStatus?.retention.totalRecords} records processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audit Trail</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceStatus?.audit.complianceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {complianceStatus?.audit.totalEvents} events, {complianceStatus?.audit.criticalEvents} critical
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Compliance Activities</CardTitle>
                <CardDescription>Latest compliance-related actions and requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">GDPR data export completed</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">FCRA dispute resolved</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Data retention review due</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Alerts</CardTitle>
                <CardDescription>Important compliance notifications and reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Warning
                    </Badge>
                    <p className="text-sm">3 GDPR requests pending review</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Good
                    </Badge>
                    <p className="text-sm">All FCRA disputes within SLA</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      Info
                    </Badge>
                    <p className="text-sm">Data retention audit scheduled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gdpr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>GDPR Rights Management</CardTitle>
              <CardDescription>Manage user data rights under GDPR</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  onClick={() => handleGDPRRequest('data_export')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Download className="h-6 w-6" />
                  <span>Data Export</span>
                </Button>
                <Button 
                  onClick={() => handleGDPRRequest('data_deletion')}
                  variant="destructive"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Trash2 className="h-6 w-6" />
                  <span>Data Deletion</span>
                </Button>
                <Button 
                  onClick={() => handleGDPRRequest('data_rectification')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Settings className="h-6 w-6" />
                  <span>Data Rectification</span>
                </Button>
                <Button 
                  onClick={() => handleGDPRRequest('data_portability')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <FileText className="h-6 w-6" />
                  <span>Data Portability</span>
                </Button>
                <Button 
                  onClick={() => handleGDPRRequest('consent_withdrawal')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Lock className="h-6 w-6" />
                  <span>Consent Withdrawal</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fcra" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FCRA Dispute Management</CardTitle>
              <CardDescription>Manage credit report disputes and free report requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleFCRARequest('dispute')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <FileText className="h-6 w-6" />
                  <span>Submit Dispute</span>
                </Button>
                <Button 
                  onClick={() => handleFCRARequest('free_report')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Eye className="h-6 w-6" />
                  <span>Request Free Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ccpa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CCPA Rights Management</CardTitle>
              <CardDescription>Manage consumer rights under CCPA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  onClick={() => handleCCPARequest('know')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Eye className="h-6 w-6" />
                  <span>Right to Know</span>
                </Button>
                <Button 
                  onClick={() => handleCCPARequest('delete')}
                  variant="destructive"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Trash2 className="h-6 w-6" />
                  <span>Right to Delete</span>
                </Button>
                <Button 
                  onClick={() => handleCCPARequest('opt_out')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Lock className="h-6 w-6" />
                  <span>Right to Opt-Out</span>
                </Button>
                <Button 
                  onClick={() => handleCCPARequest('non_discrimination')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Users className="h-6 w-6" />
                  <span>Non-Discrimination</span>
                </Button>
                <Button 
                  onClick={() => handleCCPARequest('data_portability')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Download className="h-6 w-6" />
                  <span>Data Portability</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hipaa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>HIPAA Compliance Management</CardTitle>
              <CardDescription>Manage health data protection and patient rights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  onClick={() => handleHIPAARequest('access')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Eye className="h-6 w-6" />
                  <span>Data Access</span>
                </Button>
                <Button 
                  onClick={() => handleHIPAARequest('amendment')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Settings className="h-6 w-6" />
                  <span>Data Amendment</span>
                </Button>
                <Button 
                  onClick={() => handleHIPAARequest('disclosure')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <FileText className="h-6 w-6" />
                  <span>Data Disclosure</span>
                </Button>
                <Button 
                  onClick={() => handleHIPAARequest('restriction')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Lock className="h-6 w-6" />
                  <span>Data Restriction</span>
                </Button>
                <Button 
                  onClick={() => handleHIPAARequest('accounting')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span>Disclosure Accounting</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pci" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PCI DSS Compliance Management</CardTitle>
              <CardDescription>Manage payment card data security and compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Payment Cards</h3>
                    <p className="text-2xl font-bold text-blue-600">{complianceStatus?.pci.cards}</p>
                    <p className="text-sm text-gray-500">Active cards</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Transactions</h3>
                    <p className="text-2xl font-bold text-green-600">{complianceStatus?.pci.transactions}</p>
                    <p className="text-sm text-gray-500">Processed this month</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Security Vulnerabilities</h3>
                    <p className="text-sm text-gray-500">{complianceStatus?.pci.vulnerabilities} open vulnerabilities</p>
                  </div>
                  <Button variant="outline">View Details</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">PCI Audit Status</h3>
                    <p className="text-sm text-gray-500">Last audit: 3 months ago</p>
                  </div>
                  <Button variant="outline">Schedule Audit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Retention Management</CardTitle>
              <CardDescription>Manage data retention policies and automated cleanup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Retention Policies</h3>
                    <p className="text-sm text-gray-500">8 active policies configured</p>
                  </div>
                  <Button variant="outline">View Policies</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Expired Records</h3>
                    <p className="text-sm text-gray-500">{complianceStatus?.retention.expired} records ready for deletion</p>
                  </div>
                  <Button variant="outline">Process Expired</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Audit History</h3>
                    <p className="text-sm text-gray-500">Last audit completed 2 days ago</p>
                  </div>
                  <Button variant="outline">View Audits</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

